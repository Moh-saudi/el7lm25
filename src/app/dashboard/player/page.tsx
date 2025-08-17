'use client';

import React from 'react';
import Link from 'next/link';
import { 
  User, 
  FileText, 
  Video, 
  Search, 
  BarChart3, 
  MessageSquare, 
  CreditCard, 
  CheckCircle 
} from 'lucide-react';
import { useAccountTypeAuth } from '@/hooks/useAccountTypeAuth';

export default function PlayerDashboard() {
  // التحقق من نوع الحساب - السماح فقط للاعبين وأولياء الأمور
  const { isAuthorized, isCheckingAuth } = useAccountTypeAuth({
    allowedTypes: ['player', 'parent'],
    redirectTo: '/dashboard'
  });

  // عرض شاشة التحميل أثناء التحقق
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن مصرح له، سيتم التوجيه تلقائياً
  if (!isAuthorized) {
    return null;
  }

  const quickActions = [
    {
      title: 'الملف الشخصي',
      description: 'إدارة معلوماتك الشخصية',
      icon: User,
      href: '/dashboard/player/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'التقارير',
      description: 'عرض تقارير الأداء والتقدم',
      icon: FileText,
      href: '/dashboard/player/reports',
      color: 'bg-green-500'
    },
    {
      title: 'البحث عن الفرص',
      description: 'البحث عن فرص جديدة',
      icon: Search,
      href: '/dashboard/player/search',
      color: 'bg-purple-500'
    },
    {
      title: 'الرسائل',
      description: 'إدارة المحادثات والرسائل',
      icon: MessageSquare,
      href: '/dashboard/player/messages',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                مرحباً بك في لوحة تحكم اللاعب
              </h1>
              <p className="mt-2 text-gray-600">
                إدارة ملفك الشخصي وتتبع تقدمك الرياضي
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            الوصول السريع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            النشاط الأخير
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">تم تحديث ملفك الشخصي</p>
                  <p className="text-xs text-gray-500">منذ ساعتين</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">رسالة جديدة من مدربك</p>
                  <p className="text-xs text-gray-500">منذ 3 ساعات</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">التقييم العام</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">الفيديوهات المرفوعة</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">الفرص المتاحة</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
