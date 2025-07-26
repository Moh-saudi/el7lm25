'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Eye,
  Search,
  Users,
  Trophy,
  TrendingUp,
  Filter,
  Check,
  Star,
  Zap,
  Heart,
  Target,
  Rocket,
  Crown,
  Diamond,
  ArrowLeft,
  Settings,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

interface SmartNotification {
  id: string;
  userId: string;
  viewerId: string;
  viewerName: string;
  viewerType: string;
  type: 'profile_view' | 'search_result' | 'connection_request' | 'achievement' | 'trending';
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    viewCount?: number;
    searchTerm?: string;
    achievementType?: string;
    trendingRank?: number;
  };
  createdAt: any;
  expiresAt?: any;
}

const getNotificationIcon = (type: string, emoji: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'profile_view': <Eye className="h-6 w-6 text-blue-600" />,
    'search_result': <Search className="h-6 w-6 text-green-600" />,
    'connection_request': <Users className="h-6 w-6 text-purple-600" />,
    'achievement': <Trophy className="h-6 w-6 text-yellow-600" />,
    'trending': <TrendingUp className="h-6 w-6 text-red-600" />
  };

  return iconMap[type] || <Bell className="h-6 w-6 text-gray-600" />;
};

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-800 border-gray-200',
    'medium': 'bg-blue-100 text-blue-800 border-blue-200',
    'high': 'bg-orange-100 text-orange-800 border-orange-200',
    'urgent': 'bg-red-100 text-red-800 border-red-200'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'profile_view': 'bg-blue-50 border-blue-200',
    'search_result': 'bg-green-50 border-green-200',
    'connection_request': 'bg-purple-50 border-purple-200',
    'achievement': 'bg-yellow-50 border-yellow-200',
    'trending': 'bg-red-50 border-red-200'
  };
  return colorMap[type] || 'bg-gray-50 border-gray-200';
};

const getTypeName = (type: string) => {
  const typeNames: Record<string, string> = {
    'profile_view': 'مشاهدة الملف',
    'search_result': 'نتيجة البحث',
    'connection_request': 'طلب تواصل',
    'achievement': 'إنجاز',
    'trending': 'ترند'
  };
  return typeNames[type] || 'إشعار';
};

export default function NotificationsPage() {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // جلب الإشعارات
  useEffect(() => {
    if (!user || !userData) return;

    // استخدام استعلام بسيط لتجنب مشكلة الـ Index
    const notificationsQuery = query(
      collection(db, 'smart_notifications'),
      where('userId', '==', user.uid),
      limit(100)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SmartNotification[];
      
      // ترتيب البيانات محلياً بدلاً من ترتيبها في الاستعلام
      const sortedNotifications = notificationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setNotifications(sortedNotifications);
      setLoading(false);
    }, (error) => {
      console.error('خطأ في جلب الإشعارات:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.viewerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesReadStatus = !showUnreadOnly || !notification.isRead;
    
    return matchesSearch && matchesType && matchesReadStatus;
  });

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'smart_notifications', notificationId), {
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
      const batch = writeBatch(db);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'smart_notifications', notification.id);
        batch.update(notificationRef, { isRead: true });
      });
      
      await batch.commit();
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
      toast.error('حدث خطأ في تحديث الإشعارات');
    }
  };

  const formatNotificationTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return 'الآن';
    }
  };

  const getNotificationEmoji = (emoji: string) => {
    return emoji || '🔔';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">يرجى تسجيل الدخول لعرض الإشعارات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإشعارات الذكية</h1>
            <p className="text-gray-600">تابع اهتمام الآخرين بك وتقدمك نحو النجاح</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              تحديد الكل كمقروء
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">المشاهدات</p>
                <p className="text-xl font-bold text-blue-900">
                  {notifications.filter(n => n.type === 'profile_view').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600">نتائج البحث</p>
                <p className="text-xl font-bold text-green-900">
                  {notifications.filter(n => n.type === 'search_result').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600">طلبات التواصل</p>
                <p className="text-xl font-bold text-purple-900">
                  {notifications.filter(n => n.type === 'connection_request').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">الإنجازات</p>
                <p className="text-xl font-bold text-yellow-900">
                  {notifications.filter(n => n.type === 'achievement').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات التصفية */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="البحث في الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">جميع الأنواع</option>
            <option value="profile_view">مشاهدات الملف</option>
            <option value="search_result">نتائج البحث</option>
            <option value="connection_request">طلبات التواصل</option>
            <option value="achievement">الإنجازات</option>
            <option value="trending">الترند</option>
          </select>
          
          <Button
            variant={showUnreadOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Filter className="h-4 w-4 mr-2" />
            غير المقروءة فقط
          </Button>
        </div>
      </div>

      {/* قائمة الإشعارات */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل الإشعارات...</p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType !== 'all' || showUnreadOnly 
                ? 'لا توجد إشعارات تطابق معايير البحث'
                : 'ستظهر هنا عندما يهتم بك أحد أو تحقق إنجازاً'
              }
            </p>
            {(searchTerm || selectedType !== 'all' || showUnreadOnly) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setShowUnreadOnly(false);
                }}
              >
                إعادة تعيين الفلاتر
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 hover:shadow-md ${getTypeColor(notification.type)} ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* أيقونة الإشعار */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border-2 border-gray-100">
                      <span className="text-2xl">{getNotificationEmoji(notification.emoji)}</span>
                    </div>
                  </div>
                  
                  {/* محتوى الإشعار */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority === 'urgent' ? 'مهم' : 
                           notification.priority === 'high' ? 'عالي' : 
                           notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTypeName(notification.type)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${!notification.isRead ? 'text-blue-700' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{notification.viewerName}</span>
                          {notification.viewerType !== 'system' && (
                            <>
                              <span>•</span>
                              <span>{notification.viewerType}</span>
                            </>
                          )}
                        </div>
                        
                        {notification.metadata?.viewCount && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{notification.metadata.viewCount} مشاهدة</span>
                          </div>
                        )}
                        
                        {notification.metadata?.trendingRank && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>المرتبة {notification.metadata.trendingRank}</span>
                          </div>
                        )}
                      </div>
                      
                      <span className="text-xs text-gray-400">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 