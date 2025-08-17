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
  Trash2
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

export default function PlayerNotificationsPage() {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<InteractionNotification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<InteractionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');

  // جلب الإشعارات
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

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'interaction_notifications', notificationId), {
        isRead: true
      });
      toast.success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
      toast.error('حدث خطأ في تحديث الإشعار');
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'interaction_notifications', notification.id!), {
          isRead: true
        })
      );
      
      await Promise.all(updatePromises);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
      toast.error('حدث خطأ في تحديث الإشعارات');
    }
  };

  // الحصول على أيقونة الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_view':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'search_result':
        return <Search className="w-5 h-5 text-green-600" />;
      case 'connection_request':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'message_sent':
        return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case 'follow':
        return <Heart className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // الحصول على لون الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // تنسيق الوقت
  const formatNotificationTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return 'الآن';
    }
  };

  // الحصول على أيقونة نوع الحساب
  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'club':
        return <Building2 className="w-4 h-4" />;
      case 'academy':
        return <GraduationCap className="w-4 h-4" />;
      case 'agent':
        return <Phone className="w-4 h-4" />;
      case 'trainer':
        return <UserCheck className="w-4 h-4" />;
      case 'player':
        return <Users className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  // الحصول على تسمية نوع الإشعار
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'profile_view':
        return 'مشاهدة الملف الشخصي';
      case 'search_result':
        return 'نتيجة البحث';
      case 'connection_request':
        return 'طلب اتصال';
      case 'message_sent':
        return 'رسالة جديدة';
      case 'follow':
        return 'متابعة';
      default:
        return 'إشعار';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">الإشعارات التفاعلية</h1>
          <p className="text-gray-600">تابع جميع التفاعلات مع ملفك الشخصي</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">إجمالي الإشعارات</p>
                  <p className="text-2xl font-bold text-blue-800">{notifications.length}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">غير مقروءة</p>
                  <p className="text-2xl font-bold text-green-800">
                    {notifications.filter(n => !n.isRead).length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">مشاهدات الملف</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {notifications.filter(n => n.type === 'profile_view').length}
                  </p>
                </div>
                <Search className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">رسائل جديدة</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {notifications.filter(n => n.type === 'message_sent').length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الفلاتر */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الإشعار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="profile_view">مشاهدات الملف الشخصي</SelectItem>
                <SelectItem value="search_result">نتائج البحث</SelectItem>
                <SelectItem value="connection_request">طلبات الاتصال</SelectItem>
                <SelectItem value="message_sent">الرسائل</SelectItem>
                <SelectItem value="follow">المتابعات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger>
                <SelectValue placeholder="حالة القراءة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الإشعارات</SelectItem>
                <SelectItem value="unread">غير مقروءة</SelectItem>
                <SelectItem value="read">مقروءة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={markAllAsRead}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            تحديد الكل كمقروء
          </Button>
        </div>

        {/* قائمة الإشعارات */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد إشعارات</h3>
                <p className="text-gray-500">
                  {filterType !== 'all' || filterRead !== 'all' 
                    ? 'لا توجد إشعارات تطابق الفلتر المحدد'
                    : 'ستظهر هنا الإشعارات الجديدة عند تفاعل الآخرين مع ملفك الشخصي'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 ${getPriorityColor(notification.priority)} ${
                  !notification.isRead ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{notification.emoji}</span>
                        <h4 className="font-semibold text-lg">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            جديد
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getAccountTypeIcon(notification.viewerAccountType)}
                          <span className="font-medium">{notification.viewerName}</span>
                          <span className="text-gray-400">•</span>
                          <span>{formatNotificationTime(notification.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id!)}
                              className="flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              تحديد كمقروء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 