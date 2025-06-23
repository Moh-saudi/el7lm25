"use client";

import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithRedirect, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './config';
import { debugFirebaseConfig } from './debug';
import { debugSystem, checkCommonIssues, diagnoseAuthIssues, checkFirestoreConnection } from '../debug-system';
import { executeWithRetry } from './connection-handler';
import { secureConsole } from '../utils/secure-console';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import SimpleLoader from '@/components/shared/SimpleLoader';

interface UserData {
  accountType: 'club' | 'player' | 'agent' | 'academy' | 'trainer';
  clubId?: string;
  playerId?: string;
  agentId?: string;
  academyId?: string;
  trainerId?: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string | any; // يمكن أن يكون serverTimestamp
  updatedAt: string | any; // يمكن أن يكون serverTimestamp
  isNewUser?: boolean; // للمستخدمين الجدد
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  registerUser: (email: string, password: string, userData: any) => Promise<void>;
  loginUser: (phone: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: FirebaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userDataUnsubscribe, setUserDataUnsubscribe] = useState<(() => void) | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Timeout عام للتحميل - في حالة فشل كامل لنظام المصادقة
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (loading) {
        secureConsole.warn('🚨 Emergency timeout - stopping loading state');
        setLoading(false);
        // إذا كان هناك مستخدم، نحاول المتابعة بدون بيانات المستخدم
        if (user) {
          secureConsole.log('User exists, continuing without user data');
          setError(null); // مسح أي أخطاء سابقة
        } else {
          setError('انتهت مهلة التحميل - يرجى إعادة تحديث الصفحة');
        }
      }
    }, 10000); // تقليل المهلة إلى 10 ثواني

    return () => clearTimeout(emergencyTimeout);
  }, [loading, user]);

  // فحص مبكر للتأكد من أن Firebase يعمل - مع فحص أوسع
  useEffect(() => {
    const quickCheck = setTimeout(() => {
      if (loading && !hasInitialized) {
        secureConsole.log('🔍 Quick check: Firebase auth state check...');
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            secureConsole.log('✅ No user signed in - stopping loading');
            setLoading(false);
            setHasInitialized(true);
          } else {
            secureConsole.log('✅ User found but auth state listener may not have triggered yet...');
          }
        } catch (error) {
          secureConsole.error('❌ Firebase auth check failed:', error);
          setLoading(false);
          setHasInitialized(true);
          setError('خطأ في تهيئة النظام - يرجى إعادة تحديث الصفحة');
        }
      } else if (loading && hasInitialized && user && !userData) {
        // إذا تم التهيئة ولكن البيانات لم تحمل بعد
        secureConsole.log('✅ Auth initialized but user data still loading...');
        const extendedCheck = setTimeout(() => {
          if (loading && !userData) {
            secureConsole.warn('⚠️ Extended timeout - user data loading is taking too long');
            setLoading(false);
            setError('فشل في تحميل بيانات المستخدم - يرجى إعادة تحديث الصفحة');
          }
        }, 3000); // 3 ثوان إضافية للمستخدمين المسجلين
        
        return () => clearTimeout(extendedCheck);
      }
    }, 2000); // 2 ثانية للفحص الأولي

    return () => clearTimeout(quickCheck);
  }, [loading, userData, hasInitialized, user]);

  // وظيفة لإنشاء مستند مستخدم أساسي إذا لم يكن موجوداً
  const createBasicUserDocument = async (currentUser: User) => {
    return executeWithRetry(async () => {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        secureConsole.sensitive('Creating basic user document for:', currentUser.uid);
        
        // إنشاء مستند أساسي للمستخدم
        const basicUserData = {
          accountType: 'player' as const, // نوع افتراضي
          name: currentUser.displayName || 'مستخدم جديد',
          email: currentUser.email || '',
          phone: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isNewUser: true // علامة للتمييز بين المستخدمين الجدد والموجودين
        };
        
        await setDoc(userDocRef, basicUserData);
        secureConsole.log('Basic user document created successfully');
        
        return basicUserData;
      }
      
      return userDoc.data();
    });
  };

  // تشخيص Firebase عند بدء التطبيق
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // تحميل فلتر الكونسول لإخفاء أخطاء Geidea CORS
      import('@/utils/console-filter').then(() => {
        secureConsole.log('Console filter imported successfully');
      }).catch((error) => {
        secureConsole.warn('Failed to load console filter:', error);
      });
      
      // تشغيل أدوات التشخيص فقط في التطوير
      if (secureConsole.isDev()) {
        debugFirebaseConfig();
        debugSystem();
        checkCommonIssues();
        
        // فحص اتصال Firestore
        checkFirestoreConnection().then((connected) => {
          if (!connected) {
            secureConsole.error('🔥 Firestore connection failed - this may cause loading issues');
          }
        });
      }
    }
  }, []);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      // إيقاف مراقبة بيانات المستخدم قبل تسجيل الخروج
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
        setUserDataUnsubscribe(null);
      }
      
      // مسح البيانات المحلية أولاً
      setUserData(null);
      setUser(null);
      
      // ثم تسجيل الخروج من Firebase
      await signOut(auth);
      
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      window.location.href = '/auth/login';
    } catch (error) {
      secureConsole.error('Error signing out:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    secureConsole.log('🔥 Setting up auth state listener...');
    
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      secureConsole.sensitive('🔥 Auth state changed:', {
        userId: currentUser?.uid,
        email: currentUser?.email,
        isAnonymous: currentUser?.isAnonymous,
        hasUser: !!currentUser,
        hasInitialized
      });
      
      // تعيين علامة التهيئة في أول استدعاء
      if (!hasInitialized) {
        setHasInitialized(true);
      }
      
      if (currentUser) {
        setUser(currentUser);
        setError(null); // مسح أي أخطاء سابقة
        setLoading(true); // بدء التحميل فقط عند وجود مستخدم
        
        try {
          // إيقاف المراقبة السابقة إذا كانت موجودة
          if (userDataUnsubscribe) {
            userDataUnsubscribe();
            setUserDataUnsubscribe(null);
          }
          
          // بدء مراقبة جديدة لبيانات المستخدم مع timeout
          const timeoutId = setTimeout(() => {
            secureConsole.warn('User data loading timeout - proceeding without user data');
            setUserData(null);
            setLoading(false);
            setError('انتهت مهلة تحميل البيانات - يرجى إعادة المحاولة');
          }, 5000); // 5 ثواني timeout
          
          const unsubscribeSnapshot = onSnapshot(
            doc(db, 'users', currentUser.uid),
            async (docSnapshot) => {
              clearTimeout(timeoutId); // إلغاء الـ timeout
              
              if (docSnapshot.exists()) {
                setUserData(docSnapshot.data() as UserData);
                secureConsole.log('✅ User data loaded successfully - stopping loading');
                setLoading(false); // التأكد من إيقاف التحميل
              } else {
                secureConsole.warn('User document does not exist, creating basic document...');
                
                try {
                  // محاولة إنشاء مستند أساسي للمستخدم
                  const basicUserData = await createBasicUserDocument(currentUser);
                  setUserData(basicUserData as UserData);
                  secureConsole.log('✅ Basic user document created and loaded - stopping loading');
                  setLoading(false); // التأكد من إيقاف التحميل
                } catch (error) {
                  secureConsole.error('Failed to create basic user document:', error);
                  setUserData(null);
                  setError('فشل في إنشاء بيانات المستخدم - يرجى المحاولة مرة أخرى');
                  setLoading(false); // إيقاف التحميل حتى في حالة الخطأ
                }
              }
            },
            (error) => {
              clearTimeout(timeoutId); // إلغاء الـ timeout
              secureConsole.error('Error fetching user data:', error);
              setError('خطأ في جلب بيانات المستخدم - يرجى إعادة تحديث الصفحة');
              setUserData(null);
              setLoading(false);
            }
          );
          
          setUserDataUnsubscribe(() => unsubscribeSnapshot);
        } catch (error) {
          secureConsole.error('Error setting up user data listener:', error);
          setError(error instanceof Error ? error.message : 'حدث خطأ في جلب بيانات المستخدم');
          setUserData(null);
          setLoading(false);
        }
      } else {
        // إيقاف مراقبة بيانات المستخدم عند تسجيل الخروج
        if (userDataUnsubscribe) {
          userDataUnsubscribe();
          setUserDataUnsubscribe(null);
        }
        setUser(null);
        setUserData(null);
        setError(null);
        setLoading(false);
      }
    }, (error) => {
      secureConsole.error('Auth state change error:', error);
      setError(error.message);
      setLoading(false);
    });

      return () => {
        unsubscribe();
        if (userDataUnsubscribe) {
          userDataUnsubscribe();
        }
      };
      
    } catch (error) {
      secureConsole.error('❌ Failed to set up auth listener:', error);
      setError('خطأ في تهيئة نظام المصادقة - يرجى إعادة تحديث الصفحة');
      setLoading(false);
      
      // لا نستطيع return unsubscribe في catch، لذا نعود دالة فارغة
      return () => {};
    }
  }, []);

  // إضافة سجلات تصحيح إضافية مع تشخيص المشاكل
  useEffect(() => {
    secureConsole.debug('🔄 AuthProvider State Update:', {
      hasUser: !!user,
      userId: user?.uid || 'none',
      hasUserData: !!userData,
      userDataType: userData?.accountType || 'none',
      isLoading: loading,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });
    
    // إذا كان هناك مستخدم وبيانات ولكن لا يزال يحمل، فهناك مشكلة
    if (user && userData && loading) {
      secureConsole.warn('⚠️ User and data loaded but still in loading state - forcing stop');
      setLoading(false);
    }
    
    // تشخيص مشاكل المصادقة إذا كان هناك مشكلة
    if (user && !userData && !loading) {
      secureConsole.warn('⚠️ User exists but no user data found');
      if (secureConsole.isDev()) {
        diagnoseAuthIssues(user, userData, loading);
      }
    }
  }, [user, userData, loading, error]);

  const registerUser = async (email: string, password: string, userData: any) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...userData,
          email,
          createdAt: new Date().toISOString(),
        });
        secureConsole.sensitive('User document created in Firestore:', user.uid);
      } catch (firestoreError) {
        secureConsole.error('Error creating user document in Firestore:', firestoreError);
        throw new Error('فشل إنشاء بيانات المستخدم في قاعدة البيانات. يرجى المحاولة لاحقاً.');
      }

      setUser(user);
    } catch (error: any) {
      secureConsole.error('Registration error:', error);
      let errorMessage = 'حدث خطأ أثناء التسجيل';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'كلمة المرور ضعيفة جداً';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginUser = async (phone: string, password: string) => {
    try {
      setError(null);
      
      // تنظيف رقم الهاتف من أي أحرف غير رقمية
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      
      // التحقق من صحة رقم الهاتف
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        throw new Error('يرجى إدخال رقم هاتف صحيح مكون من 10 أرقام');
      }

      // استخدم نفس الدومين الذي سجلت به المستخدمين
      const email = `${cleanPhone}@hagzzgo.com`;
      
      secureConsole.sensitive('Attempting login with:', { email, phone: cleanPhone });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      secureConsole.sensitive('Login successful, fetching user data for:', user.uid);

      // جلب بيانات المستخدم باستخدام UID
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        secureConsole.error('User document not found for:', user.uid);
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      secureConsole.log('User data retrieved successfully');
      setUser(user);
    } catch (error: any) {
      secureConsole.sensitive('Login error details:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'رقم الهاتف غير صالح';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'بيانات الدخول غير صحيحة. يرجى التأكد من رقم الهاتف وكلمة المرور';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logoutUser = async () => {
    try {
      setError(null);
      await handleSignOut();
      setUser(null);
    } catch (error: any) {
      secureConsole.error('Logout error:', error);
      setError('حدث خطأ أثناء تسجيل الخروج');
      throw new Error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // تحقق أو أنشئ مستند Firestore للمستخدم
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        try {
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName || '',
            createdAt: new Date().toISOString(),
            accountType: 'player', // أو أي نوع افتراضي مناسب
          });
        } catch (firestoreError) {
          setError('فشل إنشاء بيانات المستخدم في قاعدة البيانات.');
          secureConsole.error('Firestore error:', firestoreError);
        }
      }
      setUser(user);
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء تسجيل الدخول بجوجل');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    signOut: handleSignOut,
    registerUser,
    loginUser,
    logoutUser: handleSignOut,
    loginWithGoogle,
  };

  // إظهار المحتوى دائماً مع إظهار حالة التحميل إذا لزم الأمر
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <SimpleLoader 
          size="medium"
          color="blue"
        />
              ) : error ? (
        <ErrorScreen 
          title="حدث خطأ"
          message={error}
          type="error"
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