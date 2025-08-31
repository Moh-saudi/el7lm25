'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة تحميل الإشعارات
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'مرحباً بك في النظام',
          message: 'تم تسجيل دخولك بنجاح إلى منصة الحلم',
          type: 'success',
          timestamp: new Date(),
          read: false,
        },
        {
          id: '2',
          title: 'تحديث النظام',
          message: 'تم تحديث النظام بنجاح. استمتع بالميزات الجديدة!',
          type: 'info',
          timestamp: new Date(Date.now() - 3600000), // ساعة مضت
          read: true,
        },
      ];
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الإشعارات
          </h1>
          <p className="text-gray-600">
            تابع آخر التحديثات والإشعارات
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {notifications.filter(n => !n.read).length} غير مقروءة
            </span>
          </div>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تحديد الكل كمقروء
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600">
                ستظهر هنا الإشعارات الجديدة عند وصولها
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-all ${
                  getNotificationColor(notification.type)
                } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {notification.timestamp.toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      تحديد كمقروء
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

