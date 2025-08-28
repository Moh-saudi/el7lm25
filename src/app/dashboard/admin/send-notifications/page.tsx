'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { 
  Bell, 
  Send, 
  Users, 
  MessageSquare, 
  Smartphone, 
  Mail,
  Target,
  Calendar,
  Clock,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  Search,
  Filter,
  User,
  Building,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Crown,
  Phone,
  Mail as MailIcon,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  accountType: string;
  isActive: boolean;
  avatar?: string;
}

interface NotificationForm {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetType: 'all' | 'specific' | 'account_type' | 'custom_numbers';
  accountTypes: string[];
  customNumbers: string;
  selectedUsers: string[];
  sendMethods: {
    inApp: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  scheduleType: 'immediate' | 'scheduled';
  scheduledDate?: string;
  scheduledTime?: string;
}

interface MessageTemplate {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
}

export default function SendNotificationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    targetType: 'all',
    accountTypes: [],
    customNumbers: '',
    selectedUsers: [],
    sendMethods: {
      inApp: true,
      sms: false,
      whatsapp: false
    },
    scheduleType: 'immediate'
  });

  // جلب المستخدمين
  useEffect(() => {
    fetchUsers();
  }, []);

  // فلترة المستخدمين حسب البحث ونوع الحساب
  useEffect(() => {
    let filtered = users;

    // فلترة حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    // فلترة حسب نوع الحساب
    if (selectedAccountType !== 'all') {
      filtered = filtered.filter(user => user.accountType === selectedAccountType);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedAccountType]);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      toast.error('فشل في جلب المستخدمين');
    }
  };

  const handleFormChange = (field: keyof NotificationForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendMethodChange = (method: keyof NotificationForm['sendMethods'], value: boolean) => {
    setForm(prev => ({
      ...prev,
      sendMethods: {
        ...prev.sendMethods,
        [method]: value
      }
    }));
  };

  const handleAccountTypeChange = (accountType: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      accountTypes: checked 
        ? [...prev.accountTypes, accountType]
        : prev.accountTypes.filter(type => type !== accountType)
    }));
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      selectedUsers: checked 
        ? [...prev.selectedUsers, userId]
        : prev.selectedUsers.filter(id => id !== userId)
    }));
  };

  const selectAllUsers = () => {
    setForm(prev => ({
      ...prev,
      selectedUsers: filteredUsers.map(user => user.id)
    }));
  };

  const deselectAllUsers = () => {
    setForm(prev => ({
      ...prev,
      selectedUsers: []
    }));
  };

  const getTargetUsers = () => {
    switch (form.targetType) {
      case 'all':
        return users;
      case 'account_type':
        return users.filter(user => form.accountTypes.includes(user.accountType));
      case 'specific':
        return users.filter(user => form.selectedUsers.includes(user.id));
      case 'custom_numbers':
        const numbers = form.customNumbers.split('\n').map(n => n.trim()).filter(n => n);
        return users.filter(user => user.phone && numbers.includes(user.phone));
      default:
        return [];
    }
  };

     const sendNotification = async () => {
     if (!form.title || !form.message) {
       toast.error('يرجى ملء العنوان والرسالة');
       return;
     }

     if (form.message.length > 70) {
       toast.error('الرسالة تتجاوز الحد الأقصى للحروف (70 حرف)');
       return;
     }

    const targetUsers = getTargetUsers();
    if (targetUsers.length === 0) {
      toast.error('لا يوجد مستخدمين مستهدفين');
      return;
    }

    setLoading(true);
    try {
      const notificationData = {
        title: form.title,
        message: form.message,
        type: form.type,
        priority: form.priority,
        isRead: false,
        scope: 'system',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        metadata: {
          senderId: user?.uid,
          senderName: 'الإدارة',
          targetType: form.targetType,
          accountTypes: form.accountTypes,
          sendMethods: form.sendMethods,
          scheduledFor: form.scheduleType === 'scheduled' 
            ? new Date(`${form.scheduledDate}T${form.scheduledTime}`)
            : null
        }
      };

      // إرسال الإشعارات للمستخدمين المستهدفين
      const notificationPromises = targetUsers.map(async (targetUser) => {
        const notification = {
          ...notificationData,
          userId: targetUser.id,
          userEmail: targetUser.email,
          userPhone: targetUser.phone
        };

        // حفظ في Firebase
        await addDoc(collection(db, 'notifications'), notification);

        // إرسال SMS إذا كان مفعلاً
        if (form.sendMethods.sms && targetUser.phone) {
          try {
            await fetch('/api/notifications/sms/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phoneNumber: targetUser.phone,
                message: `${form.title}\n\n${form.message}`,
                type: 'notification'
              })
            });
          } catch (error) {
            console.error('خطأ في إرسال SMS:', error);
          }
        }

        // إرسال WhatsApp إذا كان مفعلاً
        if (form.sendMethods.whatsapp && targetUser.phone) {
          try {
            await fetch('/api/notifications/whatsapp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phoneNumber: targetUser.phone,
                message: `${form.title}\n\n${form.message}`,
                type: 'notification'
              })
            });
          } catch (error) {
            console.error('خطأ في إرسال WhatsApp:', error);
          }
        }
      });

      await Promise.all(notificationPromises);

      toast.success(`تم إرسال الإشعار بنجاح إلى ${targetUsers.length} مستخدم`);
      
      // إعادة تعيين النموذج
      setForm({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        targetType: 'all',
        accountTypes: [],
        customNumbers: '',
        selectedUsers: [],
        sendMethods: {
          inApp: true,
          sms: false,
          whatsapp: false
        },
        scheduleType: 'immediate'
      });

    } catch (error) {
      console.error('خطأ في إرسال الإشعارات:', error);
      toast.error('فشل في إرسال الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'player': return <User className="w-4 h-4 text-blue-600" />;
      case 'trainer': return <Target className="w-4 h-4 text-green-600" />;
      case 'club': return <Building className="w-4 h-4 text-purple-600" />;
      case 'academy': return <GraduationCap className="w-4 h-4 text-orange-600" />;
      case 'agent': return <Briefcase className="w-4 h-4 text-indigo-600" />;
      case 'marketer': return <TrendingUp className="w-4 h-4 text-pink-600" />;
      case 'admin': return <Crown className="w-4 h-4 text-yellow-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAccountTypeLabel = (accountType: string) => {
    switch (accountType) {
      case 'player': return 'لاعب';
      case 'trainer': return 'مدرب';
      case 'club': return 'نادي';
      case 'academy': return 'أكاديمية';
      case 'agent': return 'وكيل';
      case 'marketer': return 'مسوق';
      case 'admin': return 'مدير';
      default: return accountType;
    }
  };

           // نماذج الرسائل الجاهزة
    const messageTemplates: MessageTemplate[] = [
      // نماذج الدفع والاشتراكات
      {
        id: 'payment-confirmation',
        title: 'تأكيد دفع الإيصال',
        message: 'تم تأكيد دفع إيصال الاشتراك بنجاح! شكراً لك على ثقتك في منصة الحلم. اضغط هنا للتجديد.',
        type: 'success',
        priority: 'medium',
        category: 'دفع واشتراكات',
        description: 'تأكيد دفع إيصال الاشتراك'
      },
      {
        id: 'subscription-renewal',
        title: 'تجديد الاشتراك',
        message: 'حان موعد تجديد اشتراكك! احرص على التجديد للاستمرار في الاستمتاع بجميع المميزات. اضغط هنا للتجديد.',
        type: 'warning',
        priority: 'high',
        category: 'دفع واشتراكات',
        description: 'تذكير بتجديد الاشتراك'
      },
      {
        id: 'payment-failed',
        title: 'فشل في الدفع',
        message: 'عذراً، حدث خطأ في عملية الدفع. يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى. اضغط هنا للمحاولة.',
        type: 'error',
        priority: 'high',
        category: 'دفع واشتراكات',
        description: 'إشعار فشل الدفع'
      },

      // نماذج الملف الشخصي
      {
        id: 'profile-views',
        title: 'مشاهدات الملف الشخصي',
        message: '🎉 تم مشاهدة ملفك الشخصي من قبل مدربين وأندية! ملفك يلفت الانتباه. اضغط هنا لتحسين ملفك.',
        type: 'success',
        priority: 'medium',
        category: 'الملف الشخصي',
        description: 'إشعار مشاهدات الملف الشخصي'
      },
      {
        id: 'profile-ranking',
        title: 'الترتيب الحالي للملف',
        message: '📊 ترتيب ملفك الشخصي: {ranking} من أصل {total}. استمر في تطوير مهاراتك! اضغط هنا للتحسين.',
        type: 'info',
        priority: 'medium',
        category: 'الملف الشخصي',
        description: 'إشعار الترتيب الحالي'
      },
      {
        id: 'incomplete-profile',
        title: 'استكمال بيانات الملف الشخصي',
        message: '⚠️ ملفك الشخصي غير مكتمل! استكمل بياناتك للحصول على فرص أفضل. اضغط هنا للإكمال.',
        type: 'warning',
        priority: 'high',
        category: 'الملف الشخصي',
        description: 'تذكير باستكمال البيانات'
      },
      {
        id: 'profile-updated',
        title: 'تم تحديث الملف الشخصي',
        message: '✅ تم تحديث ملفك الشخصي بنجاح! البيانات الجديدة ستظهر للمدربين والأندية. اضغط هنا للمراجعة.',
        type: 'success',
        priority: 'low',
        category: 'الملف الشخصي',
        description: 'تأكيد تحديث الملف'
      },

      // نماذج الاختبارات
      {
        id: 'test-invitation',
        title: 'دعوة للاختبارات - منصة الحلم',
        message: '🏆 تم إرسال دعوة لك للمشاركة في اختبارات منصة الحلم! فرصة رائعة لإظهار مهاراتك. اضغط هنا للمشاركة.',
        type: 'success',
        priority: 'high',
        category: 'الاختبارات',
        description: 'دعوة للمشاركة في الاختبارات'
      },
      {
        id: 'test-reminder',
        title: 'تذكير بالاختبار',
        message: '⏰ تذكير: لديك اختبار غداً في الساعة {time}. تأكد من الاستعداد الجيد! اضغط هنا للتفاصيل.',
        type: 'warning',
        priority: 'high',
        category: 'الاختبارات',
        description: 'تذكير بموعد الاختبار'
      },
      {
        id: 'test-results',
        title: 'نتائج الاختبار',
        message: '📋 نتائج اختبارك جاهزة! يمكنك الاطلاع عليها في ملفك الشخصي. اضغط هنا للمراجعة.',
        type: 'info',
        priority: 'medium',
        category: 'الاختبارات',
        description: 'إشعار جاهزية النتائج'
      },

      // نماذج رسائل تشجيعية
      {
        id: 'motivational-1',
        title: 'رسالة تشجيعية',
        message: '💪 أنت تمتلك موهبة رائعة! استمر في التدريب والعمل الجاد، وستحقق أحلامك قريباً. اضغط هنا للتقدم.',
        type: 'success',
        priority: 'medium',
        category: 'رسائل تشجيعية',
        description: 'رسالة تحفيزية عامة'
      },
      {
        id: 'motivational-2',
        title: 'تطوير المهارات',
        message: '🌟 كل يوم تدريب هو خطوة نحو التميز! استمر في تطوير مهاراتك وستصبح لاعباً استثنائياً. اضغط هنا للتحسين.',
        type: 'success',
        priority: 'medium',
        category: 'رسائل تشجيعية',
        description: 'تشجيع على تطوير المهارات'
      },
      {
        id: 'motivational-3',
        title: 'النجاح قريب',
        message: '🎯 النجاح ليس بعيداً! استمر في العمل الجاد والتدريب المستمر، وستحقق أهدافك. اضغط هنا للأهداف.',
        type: 'success',
        priority: 'medium',
        category: 'رسائل تشجيعية',
        description: 'تشجيع على الاستمرار'
      },

      // نماذج الدعوة للأصدقاء
      {
        id: 'referral-program',
        title: 'احصل على عائد مالي - دعوة الأصدقاء',
        message: '💰 احصل على عائد مالي من خلال دعوة أصدقائك! لكل صديق تدعوه، تحصل على {amount} ريال. اضغط هنا للدعوة.',
        type: 'success',
        priority: 'medium',
        category: 'دعوة الأصدقاء',
        description: 'برنامج الدعوة والعائد المالي'
      },
      {
        id: 'referral-success',
        title: 'تم تسجيل صديقك بنجاح',
        message: '🎉 تم تسجيل صديقك بنجاح! سيتم إضافة {amount} ريال إلى رصيدك قريباً. اضغط هنا للرصيد.',
        type: 'success',
        priority: 'medium',
        category: 'دعوة الأصدقاء',
        description: 'تأكيد تسجيل صديق'
      },
      {
        id: 'referral-bonus',
        title: 'تم إضافة المكافأة',
        message: '💵 تم إضافة مكافأة دعوة الأصدقاء إلى رصيدك! استمر في دعوة المزيد من الأصدقاء. اضغط هنا للمزيد.',
        type: 'success',
        priority: 'medium',
        category: 'دعوة الأصدقاء',
        description: 'إشعار إضافة المكافأة'
      },

      // نماذج عامة
      {
        id: 'welcome-message',
        title: 'مرحباً بك في منصة الحلم',
        message: '🌟 مرحباً بك في منصة الحلم! نحن سعداء بانضمامك إلينا. نتمنى لك رحلة تدريبية ممتعة. اضغط هنا للاستكشاف.',
        type: 'success',
        priority: 'medium',
        category: 'رسائل عامة',
        description: 'رسالة ترحيب للمستخدمين الجدد'
      },
      {
        id: 'maintenance-notice',
        title: 'إشعار صيانة النظام',
        message: '🔧 سيتم إجراء صيانة للنظام يوم {date} من الساعة {start} إلى {end}. نعتذر عن الإزعاج. اضغط هنا للتفاصيل.',
        type: 'warning',
        priority: 'high',
        category: 'رسائل عامة',
        description: 'إشعار صيانة النظام'
      },
      {
        id: 'new-feature',
        title: 'ميزة جديدة متاحة',
        message: '✨ ميزة جديدة متاحة الآن! {feature_name}. جربها الآن واستمتع بالتجربة المحسنة. اضغط هنا للتجربة.',
        type: 'info',
        priority: 'medium',
        category: 'رسائل عامة',
        description: 'إشعار ميزة جديدة'
      },
      {
        id: 'achievement-unlocked',
        title: 'إنجاز جديد!',
        message: '🏆 مبروك! لقد حققت إنجاز {achievement_name}! استمر في التقدم. اضغط هنا للإنجازات.',
        type: 'success',
        priority: 'medium',
        category: 'رسائل عامة',
        description: 'إشعار إنجاز جديد'
      },

      // نماذج التدريب والتطوير
      {
        id: 'training-schedule',
        title: 'جدول التدريب الأسبوعي',
        message: '📅 جدول تدريبك الأسبوعي جاهز! تحقق من المواعيد الجديدة وكن مستعداً للتدريب. اضغط هنا للجدول.',
        type: 'info',
        priority: 'medium',
        category: 'التدريب والتطوير',
        description: 'إشعار جدول التدريب'
      },
      {
        id: 'training-reminder',
        title: 'تذكير بموعد التدريب',
        message: '⏰ تذكير: لديك تدريب غداً في الساعة {time} مع المدرب {coach_name}. كن مستعداً! اضغط هنا للتفاصيل.',
        type: 'warning',
        priority: 'high',
        category: 'التدريب والتطوير',
        description: 'تذكير بموعد التدريب'
      },
      {
        id: 'training-cancelled',
        title: 'إلغاء موعد التدريب',
        message: '❌ تم إلغاء موعد التدريب المقرر يوم {date}. سيتم إعادة جدولته قريباً. اضغط هنا للجدولة.',
        type: 'warning',
        priority: 'high',
        category: 'التدريب والتطوير',
        description: 'إشعار إلغاء التدريب'
      },
      {
        id: 'training-completed',
        title: 'تم إكمال التدريب',
        message: '✅ تم إكمال جلسة التدريب بنجاح! استمر في العمل الجاد لتطوير مهاراتك. اضغط هنا للتقدم.',
        type: 'success',
        priority: 'medium',
        category: 'التدريب والتطوير',
        description: 'تأكيد إكمال التدريب'
      },

      // نماذج المسابقات والبطولات
      {
        id: 'competition-invitation',
        title: 'دعوة للمسابقة',
        message: '🏆 تم إرسال دعوة لك للمشاركة في مسابقة {competition_name}! فرصة رائعة لإظهار مهاراتك. اضغط هنا للمشاركة.',
        type: 'success',
        priority: 'high',
        category: 'المسابقات والبطولات',
        description: 'دعوة للمشاركة في مسابقة'
      },
      {
        id: 'competition-reminder',
        title: 'تذكير بالمسابقة',
        message: '⏰ تذكير: المسابقة {competition_name} غداً! تأكد من الاستعداد الجيد. اضغط هنا للتفاصيل.',
        type: 'warning',
        priority: 'high',
        category: 'المسابقات والبطولات',
        description: 'تذكير بموعد المسابقة'
      },
      {
        id: 'competition-results',
        title: 'نتائج المسابقة',
        message: '📊 نتائج مسابقة {competition_name} جاهزة! تحقق من ترتيبك في الموقع. اضغط هنا للنتائج.',
        type: 'info',
        priority: 'medium',
        category: 'المسابقات والبطولات',
        description: 'إشعار نتائج المسابقة'
      },

      // نماذج العروض والخصومات
      {
        id: 'special-offer',
        title: 'عرض خاص!',
        message: '🎉 عرض خاص! احصل على خصم {discount}% على جميع الاشتراكات لمدة محدودة فقط. اضغط هنا للاستفادة.',
        type: 'success',
        priority: 'high',
        category: 'العروض والخصومات',
        description: 'عرض خاص وخصومات'
      },
      {
        id: 'limited-offer',
        title: 'عرض محدود',
        message: '⏰ عرض محدود! احصل على {offer_description} بسعر مخفض. العرض ينتهي قريباً! اضغط هنا للاستفادة.',
        type: 'warning',
        priority: 'high',
        category: 'العروض والخصومات',
        description: 'عرض محدود الوقت'
      },
      {
        id: 'loyalty-reward',
        title: 'مكافأة الولاء',
        message: '💎 مكافأة خاصة للعملاء المخلصين! احصل على {reward_description} مجاناً. اضغط هنا للاستلام.',
        type: 'success',
        priority: 'medium',
        category: 'العروض والخصومات',
        description: 'مكافأة الولاء'
      },

      // نماذج الدعم والمساعدة
      {
        id: 'support-ticket',
        title: 'تم فتح تذكرة الدعم',
        message: '🎫 تم فتح تذكرة الدعم رقم #{ticket_number}. سنقوم بالرد عليك في أقرب وقت ممكن. اضغط هنا للمتابعة.',
        type: 'info',
        priority: 'medium',
        category: 'الدعم والمساعدة',
        description: 'تأكيد فتح تذكرة الدعم'
      },
      {
        id: 'support-response',
        title: 'رد على تذكرة الدعم',
        message: '📧 تم الرد على تذكرة الدعم رقم #{ticket_number}. تحقق من الرد الجديد. اضغط هنا للرد.',
        type: 'info',
        priority: 'medium',
        category: 'الدعم والمساعدة',
        description: 'إشعار رد الدعم'
      },
      {
        id: 'support-resolved',
        title: 'تم حل المشكلة',
        message: '✅ تم حل مشكلتك بنجاح! إذا كنت بحاجة لمزيد من المساعدة، لا تتردد في التواصل معنا. اضغط هنا للتواصل.',
        type: 'success',
        priority: 'medium',
        category: 'الدعم والمساعدة',
        description: 'تأكيد حل المشكلة'
      },

      // نماذج الأمان والحماية
      {
        id: 'login-alert',
        title: 'تنبيه تسجيل الدخول',
        message: '🔒 تم تسجيل الدخول إلى حسابك من جهاز جديد. إذا لم تكن أنت، يرجى تغيير كلمة المرور. اضغط هنا للتغيير.',
        type: 'warning',
        priority: 'high',
        category: 'الأمان والحماية',
        description: 'تنبيه تسجيل دخول جديد'
      },
      {
        id: 'password-changed',
        title: 'تم تغيير كلمة المرور',
        message: '🔐 تم تغيير كلمة المرور بنجاح! إذا لم تقم بهذا التغيير، يرجى التواصل مع الدعم. اضغط هنا للتواصل.',
        type: 'warning',
        priority: 'high',
        category: 'الأمان والحماية',
        description: 'إشعار تغيير كلمة المرور'
      },
      {
        id: 'account-verified',
        title: 'تم التحقق من الحساب',
        message: '✅ تم التحقق من حسابك بنجاح! يمكنك الآن الاستمتاع بجميع المميزات. اضغط هنا للاستكشاف.',
        type: 'success',
        priority: 'medium',
        category: 'الأمان والحماية',
        description: 'تأكيد التحقق من الحساب'
      }
    ];

  const filteredTemplates = selectedCategory === 'all' 
    ? messageTemplates 
    : messageTemplates.filter(template => template.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(messageTemplates.map(t => t.category)))];

     const handleTemplateSelect = (template: MessageTemplate) => {
     if (template.message.length > 70) {
       toast.warning(`هذا النموذج يتجاوز الحد الأقصى للحروف (${template.message.length}/70). سيتم اختياره ولكن يرجى تعديله.`);
     }
     
     setForm(prev => ({
       ...prev,
       title: template.title,
       message: template.message,
       type: template.type,
       priority: template.priority
     }));
     setShowTemplates(false);
   };

  const targetUsers = getTargetUsers();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إرسال الإشعارات</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">إرسال إشعارات مخصصة للمستخدمين عبر طرق متعددة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Form */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
                         {/* Message Templates */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <MessageSquare className="w-5 h-5 text-green-600" />
                   نماذج الرسائل الجاهزة
                 </CardTitle>
                 <CardDescription>
                   اختر من نماذج الرسائل الجاهزة أو أنشئ رسالة مخصصة
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                                   <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 flex-1 sm:flex-none"
                    >
                      {showTemplates ? 'إخفاء النماذج' : 'عرض النماذج الجاهزة'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setForm(prev => ({
                          ...prev,
                          title: '',
                          message: '',
                          type: 'info',
                          priority: 'medium'
                        }));
                      }}
                      className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 flex-1 sm:flex-none"
                    >
                      رسالة مخصصة
                    </Button>
                  </div>

                 {showTemplates && (
                   <div className="space-y-4">
                     {/* Category Filter */}
                     <div>
                       <label className="text-sm font-medium text-gray-700 mb-2 block">
                         تصفية حسب الفئة
                       </label>
                       <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {categories.map((category) => (
                             <SelectItem key={category} value={category}>
                               {category === 'all' ? 'جميع الفئات' : category}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>

                                           {/* Templates Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 sm:max-h-96 overflow-y-auto">
                       {filteredTemplates.map((template) => (
                         <div
                           key={template.id}
                           className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           onClick={() => handleTemplateSelect(template)}
                         >
                           <div className="flex items-start justify-between mb-2">
                             <div className="flex items-center gap-2">
                               {getTypeIcon(template.type)}
                               <span className="font-medium text-sm">{template.title}</span>
                             </div>
                             <Badge className={getPriorityColor(template.priority)}>
                               {template.priority === 'critical' ? 'حرج' :
                                template.priority === 'high' ? 'عالية' :
                                template.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                             </Badge>
                           </div>
                           <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                                                       <div className="space-y-1">
                              <p className="text-xs text-gray-500 line-clamp-2">{template.message}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {template.message.length} حرف
                                </span>
                                <span className={`text-xs ${template.message.length > 70 ? 'text-red-500' : 'text-green-500'}`}>
                                  {template.message.length > 70 ? 'تجاوز الحد' : 'ضمن الحد'}
                                </span>
                              </div>
                            </div>
                           <div className="mt-2">
                             <Badge variant="outline" className="text-xs">
                               {template.category}
                             </Badge>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* Basic Info */}
             <Card>
               <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    معلومات الإشعار
                  </CardTitle>
                 <CardDescription>
                   أدخل تفاصيل الإشعار الذي تريد إرساله
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    عنوان الإشعار *
                  </label>
                  <Input
                    placeholder="أدخل عنوان الإشعار"
                    value={form.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                  />
                </div>

                                 <div>
                   <div className="flex items-center justify-between mb-2">
                     <label className="text-sm font-medium text-gray-700">
                       رسالة الإشعار *
                     </label>
                     <span className={`text-xs ${form.message.length > 70 ? 'text-red-600' : 'text-gray-500'}`}>
                       {form.message.length}/70 حرف
                     </span>
                   </div>
                   <Textarea
                     placeholder="أدخل رسالة الإشعار (الحد الأقصى 70 حرف)"
                     value={form.message}
                     onChange={(e) => {
                       if (e.target.value.length <= 70) {
                         handleFormChange('message', e.target.value);
                       }
                     }}
                     rows={4}
                     className={form.message.length > 70 ? 'border-red-500' : ''}
                   />
                   {form.message.length > 70 && (
                     <p className="text-xs text-red-600 mt-1">
                       تجاوزت الحد الأقصى للحروف. يرجى تقصير الرسالة.
                     </p>
                   )}
                 </div>

                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      نوع الإشعار
                    </label>
                    <Select value={form.type} onValueChange={(value) => handleFormChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">معلومات</SelectItem>
                        <SelectItem value="success">نجاح</SelectItem>
                        <SelectItem value="warning">تحذير</SelectItem>
                        <SelectItem value="error">خطأ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      الأولوية
                    </label>
                    <Select value={form.priority} onValueChange={(value) => handleFormChange('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة</SelectItem>
                        <SelectItem value="medium">متوسطة</SelectItem>
                        <SelectItem value="high">عالية</SelectItem>
                        <SelectItem value="critical">حرجة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Selection */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <Target className="w-5 h-5 text-purple-600" />
                   تحديد المستهدفين
                 </CardTitle>
                <CardDescription>
                  اختر المستخدمين الذين تريد إرسال الإشعار إليهم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    نوع الاستهداف
                  </label>
                  <Select value={form.targetType} onValueChange={(value) => handleFormChange('targetType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="account_type">حسب نوع الحساب</SelectItem>
                      <SelectItem value="specific">مستخدمين محددين</SelectItem>
                      <SelectItem value="custom_numbers">أرقام هاتف مخصصة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.targetType === 'account_type' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      أنواع الحسابات
                    </label>
                                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {['player', 'trainer', 'club', 'academy', 'agent', 'marketer', 'admin'].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={form.accountTypes.includes(type)}
                            onCheckedChange={(checked) => handleAccountTypeChange(type, checked as boolean)}
                          />
                          <label htmlFor={type} className="text-sm flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                            {getAccountTypeIcon(type)}
                            {getAccountTypeLabel(type)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.targetType === 'specific' && (
                  <div>
                                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                       <label className="text-sm font-medium text-gray-700">
                         اختيار المستخدمين
                       </label>
                                              <div className="flex flex-col sm:flex-row gap-2">
                         <Button
                           variant="default"
                           size="sm"
                           onClick={selectAllUsers}
                           className="text-xs bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                         >
                           <Check className="w-3 h-3 ml-1 text-white" />
                           تحديد الكل
                         </Button>
                         <Button
                           variant="destructive"
                           size="sm"
                           onClick={deselectAllUsers}
                           className="text-xs bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none"
                         >
                           <X className="w-3 h-3 ml-1 text-white" />
                           إلغاء الكل
                         </Button>
                       </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="space-y-3 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <Input
                          placeholder="البحث في المستخدمين..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      <div>
                        <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                          <SelectTrigger>
                            <SelectValue placeholder="فلترة حسب نوع الحساب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الأنواع</SelectItem>
                            <SelectItem value="player">لاعب</SelectItem>
                            <SelectItem value="trainer">مدرب</SelectItem>
                            <SelectItem value="club">نادي</SelectItem>
                            <SelectItem value="academy">أكاديمية</SelectItem>
                            <SelectItem value="agent">وكيل</SelectItem>
                            <SelectItem value="marketer">مسوق</SelectItem>
                            <SelectItem value="admin">مدير</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                                         {/* Users List */}
                     <div className="border rounded-lg max-h-80 sm:max-h-96 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          لا يوجد مستخدمين
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="p-3 hover:bg-gray-50 transition-colors"
                            >
                                                             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                 <div className="flex items-center gap-3 flex-1">
                                  <Checkbox
                                    checked={form.selectedUsers.includes(user.id)}
                                    onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                                  />
                                  <div className="flex items-center gap-2">
                                    {getAccountTypeIcon(user.accountType)}
                                    <div>
                                      <div className="font-medium text-sm">
                                        {user.displayName || 'بدون اسم'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                                          <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                          {getAccountTypeLabel(user.accountType)}
                        </Badge>
                                                                     {user.phone && (
                                     <div className="flex items-center gap-1 text-xs text-gray-500">
                                       <Phone className="w-3 h-3 text-green-600" />
                                       {user.phone}
                                     </div>
                                   )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {form.selectedUsers.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">
                          تم تحديد {form.selectedUsers.length} مستخدم
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {form.targetType === 'custom_numbers' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      أرقام الهاتف (سطر واحد لكل رقم)
                    </label>
                    <Textarea
                      placeholder="+201234567890&#10;+201234567891&#10;+201234567892"
                      value={form.customNumbers}
                      onChange={(e) => handleFormChange('customNumbers', e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Send Methods */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <Settings className="w-5 h-5 text-orange-600" />
                   طرق الإرسال
                 </CardTitle>
                <CardDescription>
                  اختر طرق إرسال الإشعار
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inApp"
                      checked={form.sendMethods.inApp}
                      onCheckedChange={(checked) => handleSendMethodChange('inApp', checked as boolean)}
                    />
                                         <label htmlFor="inApp" className="text-sm flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                       <Bell className="w-4 h-4 text-blue-600" />
                       في التطبيق
                     </label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Checkbox
                       id="sms"
                       checked={form.sendMethods.sms}
                       onCheckedChange={(checked) => handleSendMethodChange('sms', checked as boolean)}
                     />
                     <label htmlFor="sms" className="text-sm flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                       <Smartphone className="w-4 h-4 text-green-600" />
                       SMS
                     </label>
                   </div>

                   <div className="flex items-center space-x-2">
                     <Checkbox
                       id="whatsapp"
                       checked={form.sendMethods.whatsapp}
                       onCheckedChange={(checked) => handleSendMethodChange('whatsapp', checked as boolean)}
                     />
                     <label htmlFor="whatsapp" className="text-sm flex items-center gap-2 hover:text-blue-600 cursor-pointer transition-colors">
                       <MessageSquare className="w-4 h-4 text-green-600" />
                       WhatsApp
                     </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Button */}
            <Card>
              <CardContent className="pt-6">
                                 <Button
                   onClick={sendNotification}
                   disabled={loading || !form.title || !form.message || form.message.length > 70}
                   className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                   size="lg"
                 >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </div>
                  ) : (
                                       <div className="flex items-center gap-2">
                     <Send className="w-4 h-4 text-white" />
                     إرسال الإشعار
                   </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Stats */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <Eye className="w-5 h-5 text-indigo-600" />
                   معاينة الإشعار
                 </CardTitle>
              </CardHeader>
              <CardContent>
                {form.title && form.message ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(form.type)}
                        <span className="font-medium text-sm">{form.title}</span>
                      </div>
                      <Badge className={getPriorityColor(form.priority)}>
                        {form.priority === 'critical' ? 'حرج' :
                         form.priority === 'high' ? 'عالية' :
                         form.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                      </Badge>
                    </div>
                                         <p className="text-xs sm:text-sm text-gray-600">{form.message}</p>
                     <div className="flex items-center justify-between text-xs text-gray-500">
                       <div className="flex items-center gap-2">
                         <Clock className="w-3 h-3 text-orange-600" />
                         {form.scheduleType === 'immediate' ? 'إرسال فوري' : 'إرسال مجدول'}
                       </div>
                       <span className={`${form.message.length > 70 ? 'text-red-500' : 'text-green-500'}`}>
                         {form.message.length}/70 حرف
                       </span>
                     </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">أدخل العنوان والرسالة لمعاينة الإشعار</p>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                                 <CardTitle className="flex items-center gap-2">
                   <Zap className="w-5 h-5 text-yellow-600" />
                   إحصائيات الإرسال
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm text-gray-600">المستخدمين المستهدفين:</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs">{targetUsers.length}</Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm text-gray-600">الإرسال في التطبيق:</span>
                  <Badge className={`text-xs ${form.sendMethods.inApp ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {form.sendMethods.inApp ? 'مفعل' : 'معطل'}
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm text-gray-600">إرسال SMS:</span>
                  <Badge className={`text-xs ${form.sendMethods.sms ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {form.sendMethods.sms ? 'مفعل' : 'معطل'}
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm text-gray-600">إرسال WhatsApp:</span>
                  <Badge className={`text-xs ${form.sendMethods.whatsapp ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {form.sendMethods.whatsapp ? 'مفعل' : 'معطل'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

                         {/* Templates Stats */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <MessageSquare className="w-5 h-5 text-green-600" />
                   إحصائيات النماذج
                 </CardTitle>
               </CardHeader>
                               <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600">إجمالي النماذج:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200 font-semibold text-xs">
                      {messageTemplates.length}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs sm:text-sm text-gray-600">عدد الفئات:</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs">
                      {categories.length - 1}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">النماذج حسب الفئة:</span>
                    {categories.slice(1).map((category) => {
                      const count = messageTemplates.filter(t => t.category === category).length;
                      return (
                        <div key={category} className="flex justify-between text-xs">
                          <span className="text-gray-600 truncate">{category}:</span>
                          <span className="font-medium mr-2">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
             </Card>

             {/* Target Users List */}
             {targetUsers.length > 0 && (
               <Card>
                 <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-pink-600" />
                      المستخدمين المستهدفين ({targetUsers.length})
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                                       <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
                     {targetUsers.slice(0, 10).map((user) => (
                       <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm p-2 bg-gray-50 rounded gap-1">
                         <div className="flex items-center gap-2">
                           {getAccountTypeIcon(user.accountType)}
                           <span className="truncate">{user.displayName || user.email}</span>
                         </div>
                         <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                           {getAccountTypeLabel(user.accountType)}
                         </Badge>
                       </div>
                     ))}
                     {targetUsers.length > 10 && (
                       <p className="text-xs text-gray-500 text-center">
                         +{targetUsers.length - 10} مستخدم آخر
                       </p>
                     )}
                   </div>
                 </CardContent>
               </Card>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
