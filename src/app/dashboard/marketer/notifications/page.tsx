'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  Eye,
  Search,
  Users,
  MessageSquare,
  X,
  Check,
  Star,
  Zap,
  Heart,
  Target,
  Rocket,
  Crown,
  Diamond,
  TrendingUp,
  UserCheck,
  Building2,
  GraduationCap,
  Phone,
  Shield,
  Filter,
  Trash2,
  CreditCard,
  Trophy
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { InteractionNotification } from '@/lib/notifications/interaction-notifications';

export default function MarketerNotificationsPage() {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<InteractionNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<InteractionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  // جلب الإشعارات الخاصة بالمسوق
  useEffect(() => {
    if (!user || !userData) return;

    const notificationsQuery = query(
      collection(db, 'interaction_notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InteractionNotification[];
      
      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error('خطأ في جلب الإشعارات:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // تطبيق الفلاتر
  useEffect(() => {
    let filtered = [...notifications];

    // فلتر النوع
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // فلتر حالة القراءة
    if (filterRead === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filterRead === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filterType, filterRead]);

  // تحديث حالة القراءة
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'interaction_notifications', notificationId), {
        isRead: true
      });
      toast.success('تم تحديث حالة الإشعار');
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
      toast.error('حدث خطأ في تحديث الإشعار');
    }
  };

  // حذف الإشعار
  const deleteNotification = async (notificationId: string) => {
    try {
      // TODO: إضافة منطق حذف الإشعار
      toast.success('تم حذف الإشعار');
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
      toast.error('حدث خطأ في حذف الإشعار');
    }
  };

  // الحصول على أيقونة النوع
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'player_joined': return <UserCheck className="w-5 h-5" />;
      case 'payment': return <CreditCard className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'achievement': return <Trophy className="w-5 h-5" />;
      case 'system': return <Shield className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  // الحصول على لون النوع
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player_joined': return 'text-green-600 bg-green-100';
      case 'payment': return 'text-blue-600 bg-blue-100';
      case 'message': return 'text-purple-600 bg-purple-100';
      case 'achievement': return 'text-yellow-600 bg-yellow-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          الإشعارات
        </h1>
        <p className="text-gray-600">
          إدارة إشعاراتك والتفاعلات
        </p>
      </div>

      {/* الفلاتر */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="نوع الإشعار" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="player_joined">انضمام لاعب</SelectItem>
            <SelectItem value="payment">مدفوعات</SelectItem>
            <SelectItem value="message">رسائل</SelectItem>
            <SelectItem value="achievement">إنجازات</SelectItem>
            <SelectItem value="system">النظام</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRead} onValueChange={setFilterRead}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="حالة القراءة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الإشعارات</SelectItem>
            <SelectItem value="unread">غير مقروءة</SelectItem>
            <SelectItem value="read">مقروءة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* قائمة الإشعارات */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                لا توجد إشعارات
              </h3>
              <p className="text-gray-600">
                {filterType !== 'all' || filterRead !== 'all' 
                  ? 'لا توجد إشعارات تطابق المعايير المحددة.'
                  : 'لا توجد إشعارات جديدة.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`transition-all duration-200 ${!notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            جديد
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                        <span>
                          {formatDistanceToNow(notification.createdAt?.toDate?.() || new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
