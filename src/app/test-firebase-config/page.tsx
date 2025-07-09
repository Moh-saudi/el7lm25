'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';

export default function TestFirebaseConfig() {
  const [status, setStatus] = useState<string>('جاري الفحص...');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    const checkFirebase = async () => {
      const results: string[] = [];
      
      try {
        // فحص Firebase Auth
        results.push('🔧 فحص Firebase Auth...');
        if (auth) {
          results.push('✅ Firebase Auth متاح');
        } else {
          results.push('❌ Firebase Auth غير متاح');
        }

        // فحص Firestore
        results.push('🔧 فحص Firestore...');
        if (db) {
          results.push('✅ Firestore متاح');
        } else {
          results.push('❌ Firestore غير متاح');
        }

        // فحص متغيرات البيئة
        results.push('🔧 فحص متغيرات البيئة...');
        const envVars = [
          'NEXT_PUBLIC_FIREBASE_API_KEY',
          'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
          'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
          'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
          'NEXT_PUBLIC_FIREBASE_APP_ID'
        ];

        envVars.forEach(varName => {
          const value = process.env[varName];
          if (value && value !== 'your_firebase_api_key_here') {
            results.push(`✅ ${varName}: متاح`);
          } else {
            results.push(`❌ ${varName}: مفقود أو غير صحيح`);
          }
        });

        setStatus('✅ فحص Firebase مكتمل');
      } catch (error: any) {
        results.push(`❌ خطأ في فحص Firebase: ${error.message}`);
        setStatus('❌ فشل في فحص Firebase');
      }

      setDetails(results);
    };

    checkFirebase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            اختبار تكوين Firebase
          </h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              الحالة: {status}
            </h2>
          </div>

          <div className="space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                {detail}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">معلومات إضافية:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• تأكد من أن جميع متغيرات Firebase Config صحيحة</li>
              <li>• تأكد من أن Firebase Project مفعل</li>
              <li>• تأكد من أن Firestore مفعل في المشروع</li>
              <li>• تأكد من أن Authentication مفعل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 