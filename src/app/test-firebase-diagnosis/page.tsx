'use client';

import React, { useState, useEffect } from 'react';
import { auth, db, firebaseConfig, hasValidConfig } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Settings, Trash2, TestTube2 } from 'lucide-react';

export default function FirebaseDiagnosisPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [testEmail] = useState(`test-${Date.now()}@example.com`);
  const [testPassword] = useState('test123456789');

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {};

    // 1. Check Firebase Configuration
    diagnostics.config = {
      hasValidConfig,
      firebaseConfig: {
        apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing',
        authDomain: firebaseConfig.authDomain ? '✅ Set' : '❌ Missing',
        projectId: firebaseConfig.projectId ? '✅ Set' : '❌ Missing',
        storageBucket: firebaseConfig.storageBucket ? '✅ Set' : '❌ Missing',
        messagingSenderId: firebaseConfig.messagingSenderId ? '✅ Set' : '❌ Missing',
        appId: firebaseConfig.appId ? '✅ Set' : '❌ Missing',
        measurementId: firebaseConfig.measurementId ? '✅ Set' : '❌ Missing'
      }
    };

    // 2. Test Firebase Auth Connection
    try {
      diagnostics.auth = {
        status: '✅ Connected',
        currentUser: auth.currentUser ? auth.currentUser.email : 'No user signed in',
        authDomain: auth.config.authDomain
      };
    } catch (error: any) {
      diagnostics.auth = {
        status: '❌ Failed',
        error: error.message
      };
    }

    // 3. Test Firestore Connection
    try {
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { timestamp: new Date(), test: true });
      await getDoc(testDoc);
      await deleteDoc(testDoc);
      diagnostics.firestore = {
        status: '✅ Connected',
        canWrite: true,
        canRead: true,
        canDelete: true
      };
    } catch (error: any) {
      diagnostics.firestore = {
        status: '❌ Failed',
        error: error.message
      };
    }

    // 4. Test Environment Variables
    diagnostics.env = {
      NODE_ENV: process.env.NODE_ENV,
      hasEmailJSConfig: !!(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )
    };

    setResults(diagnostics);
    setLoading(false);
  };

  const testRegistration = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing user registration...');
      
      // Create test user
      const result = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = result.user;
      
      console.log('✅ Test user created:', user.uid);

      // Test Firestore write
      const userData = {
        uid: user.uid,
        email: user.email,
        accountType: 'player',
        full_name: 'Test User',
        phone: '1234567890',
        isNewUser: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, userData);
      
      console.log('✅ Test user data saved to Firestore');

      // Clean up - delete test user
      await deleteDoc(userRef);
      await deleteUser(user);
      
      console.log('✅ Test user cleaned up');

      setResults(prev => ({
        ...prev,
        registrationTest: {
          status: '✅ Success',
          message: 'Full registration flow working correctly'
        }
      }));

    } catch (error: any) {
      console.error('❌ Registration test failed:', error);
      
      setResults(prev => ({
        ...prev,
        registrationTest: {
          status: '❌ Failed',
          error: error.message,
          code: error.code
        }
      }));
    }
    setLoading(false);
  };

  const DiagnosticSection = ({ title, data, icon: Icon }: any) => (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-2">
        {Object.entries(data || {}).map(([key, value]: any) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-600">{key}:</span>
            <span className={`font-mono text-sm ${
              typeof value === 'string' && value.includes('✅') 
                ? 'text-green-600' 
                : typeof value === 'string' && value.includes('❌')
                ? 'text-red-600'
                : 'text-gray-800'
            }`}>
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-6">
            <TestTube2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">تشخيص Firebase</h1>
            <p className="text-gray-600">فحص شامل لجميع إعدادات Firebase والاتصالات</p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'جاري الفحص...' : 'إعادة فحص الإعدادات'}
            </button>
            <button
              onClick={testRegistration}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'جاري الاختبار...' : 'اختبار التسجيل'}
            </button>
          </div>

          {/* Overall Status */}
          {results.config && (
            <div className={`p-4 rounded-lg mb-6 ${
              results.config.hasValidConfig 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {results.config.hasValidConfig ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  results.config.hasValidConfig ? 'text-green-800' : 'text-red-800'
                }`}>
                  {results.config.hasValidConfig 
                    ? 'إعدادات Firebase صحيحة' 
                    : 'إعدادات Firebase غير مكتملة'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Results */}
        <div className="grid gap-6">
          {results.config && (
            <DiagnosticSection 
              title="إعدادات Firebase" 
              data={results.config.firebaseConfig}
              icon={Settings}
            />
          )}

          {results.auth && (
            <DiagnosticSection 
              title="Firebase Authentication" 
              data={results.auth}
              icon={CheckCircle}
            />
          )}

          {results.firestore && (
            <DiagnosticSection 
              title="Firestore Database" 
              data={results.firestore}
              icon={CheckCircle}
            />
          )}

          {results.env && (
            <DiagnosticSection 
              title="متغيرات البيئة" 
              data={results.env}
              icon={Settings}
            />
          )}

          {results.registrationTest && (
            <DiagnosticSection 
              title="اختبار التسجيل" 
              data={results.registrationTest}
              icon={TestTube2}
            />
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-800 text-green-400 rounded-lg p-4 font-mono text-sm">
          <h3 className="text-white mb-2">معلومات التشخيص:</h3>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
} 