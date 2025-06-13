"use client";

import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithRedirect, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './config';

interface UserData {
  accountType: 'club' | 'player' | 'agent';
  clubId?: string;
  playerId?: string;
  agentId?: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
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
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تسجيل الخروج');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.uid);
      
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);
        
        try {
          // إيقاف المراقبة السابقة إذا كانت موجودة
          if (userDataUnsubscribe) {
            userDataUnsubscribe();
            setUserDataUnsubscribe(null);
          }
          
          // بدء مراقبة جديدة لبيانات المستخدم
          const unsubscribe = onSnapshot(
            doc(db, 'users', currentUser.uid),
            (doc) => {
              if (doc.exists()) {
                setUserData(doc.data() as UserData);
              } else {
                setUserData(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching user data:', error);
              setError(error.message);
              setLoading(false);
            }
          );
          
          setUserDataUnsubscribe(() => unsubscribe);
        } catch (error) {
          console.error('Error setting up user data listener:', error);
          setError(error instanceof Error ? error.message : 'حدث خطأ في جلب بيانات المستخدم');
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
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userDataUnsubscribe) {
        userDataUnsubscribe();
      }
    };
  }, []);

  // إضافة سجلات تصحيح إضافية
  useEffect(() => {
    console.log('AuthProvider: State updated', {
      user: user?.uid,
      userData: userData ? {
        accountType: userData.accountType,
        name: userData.name,
        clubId: userData.clubId,
        playerId: userData.playerId,
        agentId: userData.agentId
      } : null,
      loading
    });
  }, [user, userData, loading]);

  const registerUser = async (email: string, password: string, userData: any) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email,
        createdAt: new Date().toISOString(),
      });

      setUser(user);
    } catch (error: any) {
      console.error('Registration error:', error);
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
      // استخدم نفس الدومين الذي سجلت به المستخدمين
      const email = `${phone}@hagzzgo.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // جلب بيانات المستخدم باستخدام UID
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('لم يتم العثور على بيانات المستخدم');
      }

      setUser(user);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'رقم الهاتف غير صالح';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة لاحقاً';
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
      console.error('Logout error:', error);
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
          console.error('Firestore error:', firestoreError);
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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