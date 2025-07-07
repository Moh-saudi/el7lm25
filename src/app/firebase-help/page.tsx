'use client';

import React from 'react';
import { ExternalLink, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

export default function FirebaseHelpPage() {
  const projectId = 'hagzzgo-87884';
  
  const links = {
    console: `https://console.firebase.google.com/project/${projectId}`,
    auth: `https://console.firebase.google.com/project/${projectId}/authentication/providers`,
    settings: `https://console.firebase.google.com/project/${projectId}/authentication/settings`,
    firestore: `https://console.firebase.google.com/project/${projectId}/firestore/rules`
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-red-800">مشكلة Firebase Authentication</h1>
              <p className="text-red-600">خطأ 400 Bad Request - تسجيل الدخول والتسجيل لا يعملان</p>
            </div>
          </div>
        </div>

        {/* Quick Fix */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">الحل السريع - اتبع هذه الخطوات:</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
              <div className="flex-1">
                <h3 className="font-bold text-blue-800 mb-2">افتح Firebase Console</h3>
                <p className="text-blue-700 mb-3">اذهب إلى إعدادات Authentication</p>
                <a 
                  href={links.auth}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  فتح Authentication Settings
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
              <span className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
              <div className="flex-1">
                <h3 className="font-bold text-green-800 mb-2">فعّل Email/Password</h3>
                <div className="text-green-700 space-y-2">
                  <p>• ابحث عن "Email/Password" في قائمة Sign-in providers</p>
                  <p>• اضغط على "Email/Password"</p>
                  <p>• فعّل الخيار الأول "Email/Password"</p>
                  <p>• اضغط "Save"</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
              <div className="flex-1">
                <h3 className="font-bold text-orange-800 mb-2">تحقق من Authorized Domains</h3>
                <p className="text-orange-700 mb-3">تأكد من إضافة localhost في القائمة المسموحة</p>
                <a 
                  href={links.settings}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  فتح Authentication Settings
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
              <div className="flex-1">
                <h3 className="font-bold text-purple-800 mb-2">اختبر النظام</h3>
                <p className="text-purple-700 mb-3">بعد التفعيل، جرب التسجيل أو تسجيل الدخول مرة أخرى</p>
                <div className="flex gap-2">
                  <a 
                    href="/auth/register"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    صفحة التسجيل
                  </a>
                  <a 
                    href="/auth/login"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    صفحة تسجيل الدخول
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">روابط إضافية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href={links.console}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium">Firebase Console</div>
                <div className="text-sm text-gray-600">الصفحة الرئيسية للمشروع</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>

            <a 
              href={links.firestore}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium">Firestore Rules</div>
                <div className="text-sm text-gray-600">قواعد قاعدة البيانات</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-800">بعد تطبيق الحلول</h3>
              <p className="text-green-700">إذا نجحت الخطوات، ستتمكن من التسجيل وتسجيل الدخول بشكل طبيعي</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 