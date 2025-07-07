"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  writeBatch,
  serverTimestamp,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { auth, db } from './config';
import { secureConsole } from '../utils/secure-console';
import { checkAccountStatus, updateLastLogin } from './account-status-checker';
import { logInfo, logError, logWarn, logSuccess } from '../utils/debug-logger';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import SimpleLoader from '@/components/shared/SimpleLoader';
import { useRouter } from 'next/navigation';

// Define user role types
type UserRole = 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin' | 'marketer' | 'parent';

// User data interface
interface UserData {
  uid: string;
  email: string;
  accountType: UserRole;
  full_name?: string;
  phone?: string;
  profile_image?: string;
  isNewUser?: boolean;
  created_at?: any;
  updated_at?: any;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; userData: UserData }>;
  register: (email: string, password: string, role: UserRole, additionalData?: any) => Promise<UserData>;
  logout: () => Promise<void>;
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

// Initialize Firestore with better settings
const initializeFirestoreWithSettings = async () => {
  try {
    if (typeof window !== 'undefined') {
      // Enable offline persistence with better settings
      await enableIndexedDbPersistence(db, {
        synchronizeTabs: true
      }).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence disabled');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser does not support persistence');
        }
      });
    }
  } catch (error) {
    console.warn('Failed to enable persistence:', error);
  }
};

// Call initialization
initializeFirestoreWithSettings();

export function AuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const router = useRouter();

  // Enhanced loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !hasInitialized) {
        if (user) {
          setLoading(false);
          setHasInitialized(true);
          setError(null); // Clear any previous errors
        } else {
          setError('Loading timeout - please refresh the page');
        }
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [loading, hasInitialized, user]);

  // Check for data loading issues
  useEffect(() => {
    if (loading && hasInitialized && user && !userData) {
      const dataTimer = setTimeout(() => {
        if (!userData) {
          setLoading(false);
          setHasInitialized(true);
          setError('System initialization error - please refresh the page');
        }
      }, 10000); // 10 second timeout for user data

      return () => clearTimeout(dataTimer);
    }
  }, [loading, hasInitialized, user, userData]);

  // If initialized and have user but no data after timeout
  useEffect(() => {
    if (hasInitialized && user && !userData && !loading) {
      const missingDataTimer = setTimeout(() => {
        if (!userData) {
          setError('Failed to load user data - please refresh the page');
        }
      }, 5000);

      return () => clearTimeout(missingDataTimer);
    }
  }, [hasInitialized, user, userData, loading]);

  // Helper function to create basic user document if it doesn't exist
  const createBasicUserDocument = async (user: User, role: UserRole = 'player', additionalData: any = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        const basicUserData = {
          uid: user.uid,
          email: user.email || '',
          accountType: role, // Use accountType instead of role for consistency
          full_name: additionalData.full_name || additionalData.name || user.displayName || '',
          phone: additionalData.phone || '',
          profile_image: additionalData.profile_image || additionalData.profileImage || user.photoURL || '',
          isNewUser: false, // Since we found data in role collection, not actually new
          created_at: additionalData.created_at || additionalData.createdAt || new Date(),
          updated_at: new Date(),
          ...additionalData
        };
        await setDoc(userRef, basicUserData);
        console.log(`✅ Created user document for ${role} with UID: ${user.uid}`);
        return basicUserData;
      } else {
        console.log('User document already exists; skipping creation to avoid ID conflict');
        return userDoc.data() as UserData;  // Return existing data if it exists
      }
    } catch (error) {
      console.error('Error creating basic user document:', error);
      throw error;
    }
  };

  // Enhanced authentication state listener
  useEffect(() => {
    let isSubscribed = true;
    let userDocUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && isSubscribed) {
          setUser(user);
          setError(null);
          
          try {
            // Check if user document exists
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data() as UserData;
              console.log('📋 AuthProvider - User document found:', {
                uid: user.uid,
                email: data.email,
                accountType: data.accountType,
                isActive: data.isActive,
                hasAllRequiredFields: !!(data.uid && data.email && data.accountType)
              });
              
              if (isSubscribed) {
                setUserData(data);
                console.log('✅ AuthProvider - User data set in state successfully');
              }
            } else {
              // Handle new or admin users
              const adminEmails = ['admin@el7lm.com', 'admin@el7hm-go.com', 'admin@el7lm-go.com'];
              if (adminEmails.includes(user.email || '')) {
                const adminData: UserData = {
                  uid: user.uid,
                  email: user.email || '',
                  accountType: 'admin',
                  full_name: 'System Administrator',
                  phone: '',
                  profile_image: '',
                  isNewUser: false,
                  created_at: serverTimestamp(),
                  updated_at: serverTimestamp()
                };
                
                if (isSubscribed) {
                await setDoc(userRef, adminData);
                setUserData(adminData);
                }
              } else {
                // Handle other users
                try {
                  const accountTypes = ['clubs', 'academies', 'trainers', 'agents', 'players'];
                  let userAccountType: UserRole = 'player';
                  let foundData = null;
                  
                  // Use Promise.all for parallel queries
                  const queries = accountTypes.map(collection => 
                    getDoc(doc(db, collection, user.uid))
                  );
                  
                  const results = await Promise.all(queries);
                    
                  for (let i = 0; i < results.length; i++) {
                    if (results[i].exists()) {
                      foundData = results[i].data();
                      userAccountType = accountTypes[i].slice(0, -1) as UserRole;
                      break;
                    }
                  }
                  
                  if (isSubscribed) {
                    const basicData = await createBasicUserDocument(user, userAccountType, foundData || {});
                    setUserData(basicData);
                  }
                } catch (createError) {
                  console.error('Failed to create user document:', createError);
                  if (isSubscribed) {
                    setError('Failed to create user data - please try again later');
                  }
                }
              }
            }
          } catch (firestoreError) {
            console.error('Error fetching user data:', firestoreError);
            if (isSubscribed) {
              setError('Error fetching user data - please refresh');
            }
          }
        } else if (isSubscribed) {
          setUser(null);
          setUserData(null);
        }
      } catch (authError) {
        console.error('Auth state change error:', authError);
        if (isSubscribed) {
          setError('Authentication error - please refresh');
        }
      } finally {
        if (isSubscribed) {
        setLoading(false);
        setHasInitialized(true);
      }
      }
    });

    return () => {
      isSubscribed = false;
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
      unsubscribe();
    };
  }, []);

  // Enhanced login function
  const login = async (email: string, password: string): Promise<{ user: User; userData: UserData }> => {
    try {
      console.log('🔐 AuthProvider - Login attempt started:', {
        email: email,
        timestamp: new Date().toISOString()
      });
      
      setError(null);

      // تحقق أساسي من صيغة البريد الإلكتروني
      if (!email.includes('@')) {
        console.log('❌ AuthProvider - Invalid email format:', email);
        throw new Error('صيغة البريد الإلكتروني غير صحيحة');
      }

      // محاولة تسجيل الدخول
      console.log('🔑 AuthProvider - Attempting Firebase Auth login...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('✅ AuthProvider - Firebase Auth login successful:', {
        uid: user.uid,
        email: user.email
      });

      // جلب بيانات المستخدم من Firestore
      console.log('📋 AuthProvider - Fetching user data from Firestore...');
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // البحث في المجموعات الخاصة بالأدوار إذا لم يكن لدى المستخدم وثيقة
        const accountTypes = ['clubs', 'academies', 'trainers', 'agents', 'players'];
        let foundData = null;
        let userAccountType: UserRole = 'player';

        // استخدام Promise.all للبحث المتوازي
        const queries = accountTypes.map(collection => 
          getDoc(doc(db, collection, user.uid))
        );
        
        const results = await Promise.all(queries);
        
        for (let i = 0; i < results.length; i++) {
          if (results[i].exists()) {
            foundData = results[i].data();
            userAccountType = accountTypes[i].slice(0, -1) as UserRole;
            break;
          }
        }

        // إنشاء وثيقة المستخدم إذا لم يتم العثور عليها
        const userData = await createBasicUserDocument(user, userAccountType, foundData || {});
        setUserData(userData);
        return { user, userData };
      }

      const userData = userDoc.data() as UserData;

      // فحص حالة الحساب
      const accountStatus = await checkAccountStatus(user.uid);
      
      if (!accountStatus.canLogin) {
        // إذا كان الحساب غير مفعل أو محذوف، قم بتسجيل الخروج ورمي خطأ
        await signOut(auth);
        throw new Error(accountStatus.message);
      }

      // تحديث آخر دخول
      try {
        await updateLastLogin(user.uid);
      } catch (updateError) {
        console.warn('Failed to update last login:', updateError);
        // لا نرمي خطأ هنا لأن تسجيل الدخول نجح
      }

      console.log('✅ Login successful for user:', userData.accountType);

      setUser(user);
      setUserData(userData);

      // عرض رسالة الحالة للمستخدم
      if (accountStatus.messageType === 'warning') {
        // يمكن إضافة toast أو notification هنا
        console.warn('Account status warning:', accountStatus.message);
      }

      return { user, userData };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // إعادة رمي الخطأ الأصلي مع الاحتفاظ بـ error.code
      // هذا يسمح لصفحة تسجيل الدخول بالتعرف على نوع الخطأ
      throw error;
    }
  };

  // Enhanced registration function
  const register = async (
    email: string, 
    password: string, 
    role: UserRole, 
    additionalData: any = {}
  ): Promise<UserData> => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!email || !password || !role) {
        throw new Error('Email, password, and role are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      console.log('🔐 Starting user registration...', {
        email,
        role,
        hasAdditionalData: Object.keys(additionalData).length > 0
      });

      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      console.log('✅ Firebase Auth user created:', user.uid);

      // Prepare user data
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        accountType: role,
        full_name: additionalData.full_name || additionalData.name || '',
        phone: additionalData.phone || '',
        profile_image: additionalData.profile_image || additionalData.profileImage || '',
        isNewUser: true,
        created_at: new Date(),
        updated_at: new Date(),
        ...additionalData
      };

      console.log('📝 Saving user data to Firestore...', {
        uid: userData.uid,
        email: userData.email,
        accountType: userData.accountType
      });

      // Save to main users collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData);

      console.log('✅ User data saved to main collection');

      // Also save to role-specific collection
      if (role !== 'admin') {
        const roleRef = doc(db, role + 's', user.uid);
        await setDoc(roleRef, {
          ...userData,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log(`✅ User data saved to ${role}s collection`);
      }

      setUser(user);
      setUserData(userData);

      console.log('🎉 Registration completed successfully');
      return userData;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registration failed';
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 8 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
          break;
      }

      // If user was created in Auth but Firestore failed, we should handle cleanup
      // لا نقوم بتعيين error في الحالة العامة، بل نرمي الخطأ فقط
      // if (error.message && error.message.includes('database')) {
      //   setError('Failed to create user profile. Please contact support.');
      // } else {
      //   setError(errorMessage);
      // }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setError(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // لا نقوم بتعيين error في الحالة العامة للـ logout
      // setError('Error during logout');
    }
  };

  // Update user data function
  const updateUserData = async (updates: Partial<UserData>): Promise<void> => {
    if (!user || !userData) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedData = {
        ...updates,
        updated_at: new Date()
      };

      await updateDoc(userRef, updatedData);
      setUserData({ ...userData, ...updatedData });

      // Also update role-specific collection
      if (userData.accountType !== 'admin') {
        const roleRef = doc(db, userData.accountType + 's', user.uid);
        await updateDoc(roleRef, updatedData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user || !user.email) throw new Error('User not authenticated');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  // Refresh user data function
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Clear error function
  const clearError = () => setError(null);

  // Context value
  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    updateUserData,
    resetPassword,
    changePassword,
    clearError,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && hasInitialized && user ? (
        <SimpleLoader 
          size="medium"
          color="blue"
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


