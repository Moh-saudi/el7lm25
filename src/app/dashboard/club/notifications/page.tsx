'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  MessageSquare,
  Calendar,
  Settings,
  Trash2,
  Filter,
  Search,
  BellOff,
  BellRing,
  ArrowLeft
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'player' | 'contract' | 'marketing' | 'analysis';
  read: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (!user || !userData || !userData.clubId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToNotifications();
    return () => unsubscribe();
  }, [user, userData]);

  const subscribeToNotifications = () => {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('clubId', '==', userData?.clubId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      toast.error('حدث خطأ أثناء جلب الإشعارات');
      setLoading(false);
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'player':
        return <Star className="w-4 h-4" />;
      case 'contract':
        return <Calendar className="w-4 h-4" />;
      case 'marketing':
        return <MessageSquare className="w-4 h-4" />;
      case 'analysis':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'system':
        return 'النظام';
      case 'player':
        return 'اللاعبين';
      case 'contract':
        return 'العقود';
      case 'marketing':
        return 'التسويق';
      case 'analysis':
        return 'التحليل';
      default:
        return category;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory.length === 0 || selectedCategory.includes(notification.category);
    const matchesReadStatus = !showUnreadOnly || !notification.read;
    return matchesSearch && matchesCategory && matchesReadStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للوحة التحكم
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">الإشعارات</h1>
        <p className="text-gray-600">إدارة وتتبع جميع الإشعارات</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الإشعارات</p>
                <h3 className="text-2xl font-bold mt-1">{notifications.length}</h3>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">غير مقروءة</p>
                <h3 className="text-2xl font-bold mt-1">
                  {notifications.filter(n => !n.read).length}
                </h3>
              </div>
              <BellRing className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مقروءة</p>
                <h3 className="text-2xl font-bold mt-1">
                  {notifications.filter(n => n.read).length}
                </h3>
              </div>
              <BellOff className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الفئات</p>
                <h3 className="text-2xl font-bold mt-1">5</h3>
              </div>
              <Filter className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث في الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12"
          />
        </div>
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className="flex items-center gap-2"
        >
          {showUnreadOnly ? <BellOff className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
          {showUnreadOnly ? 'عرض الكل' : 'غير مقروءة فقط'}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Card className={notification.read ? 'opacity-75' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <Badge className="flex items-center gap-1">
                        {getCategoryIcon(notification.category)}
                        {getCategoryLabel(notification.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                      <div className="flex gap-2">
                        {notification.link && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(notification.link!)}
                          >
                            عرض التفاصيل
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-600">لا توجد إشعارات تطابق معايير البحث المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
} 
