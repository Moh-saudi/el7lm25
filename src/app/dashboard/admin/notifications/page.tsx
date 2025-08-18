'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  Bell, Search, RefreshCw, CheckCircle, XCircle, Clock, Trash2,
  Users, Trophy, TrendingUp, Eye, Filter, AlertTriangle, Plus,
  Send, Calendar, Download, Settings, MessageCircle, Smartphone,
  Target, Globe, UserCheck, Building, GraduationCap, Key, Zap,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartNotification {
  id: string;
  userId: string;
  viewerId: string;
  viewerName: string;
  viewerType: string;
  type: 'profile_view' | 'search_result' | 'connection_request' | 'achievement' | 'trending' | 'custom';
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
    sentVia?: 'whatsapp' | 'sms' | 'both' | 'in_app';
    scheduledFor?: any;
    targetAudience?: string[];
  };
  createdAt: any;
  expiresAt?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  accountType: string;
  phone?: string;
  country?: string;
}

export default function NotificationsManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // حالات النوافذ المنبثقة
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOTPTestModal, setShowOTPTestModal] = useState(false);
  const [externalNotificationsEnabled, setExternalNotificationsEnabled] = useState(true);

  // بيانات النوافذ المنبثقة
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    priority: 'medium' as const,
    type: 'custom' as const,
    targetAudience: [] as string[],
    sendVia: 'in_app' as 'whatsapp' | 'sms' | 'both' | 'in_app',
    scheduledFor: null as Date | null,
    customPhoneNumbers: [] as string[],
    targetType: 'audience' as 'audience' | 'custom_numbers' | 'both'
  });

  // بيانات اختبار OTP
  const [otpTestData, setOtpTestData] = useState({
    phoneNumber: '+201017799580',
    testType: 'sms' as 'sms' | 'whatsapp' | 'both',
    reference: `test_${Date.now()}`,
    message: 'اختبار OTP - رسالة تأكيد'
  });

  // أرقام اختبار سريع
  const quickTestNumbers = [
    '+201017799580', // رقمك الأساسي
    '+201234567890', // رقم اختبار 1
    '+201098765432', // رقم اختبار 2
    '+201112223334', // رقم اختبار 3
    '+201445556667'  // رقم اختبار 4
  ];

  // إحصائيات
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
    profileViews: 0,
    searchResults: 0,
    connections: 0,
    achievements: 0,
    trending: 0,
    custom: 0,
    whatsappSent: 0,
    smsSent: 0
  });

  // جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      if (!user?.uid) return;

      // استعلام Firebase
      const notificationsRef = collection(db, 'smart_notifications');
      const q = query(
        notificationsRef,
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const fetchedNotifications: SmartNotification[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedNotifications.push({
          id: doc.id,
          ...data
        } as SmartNotification);
      });

      setNotifications(fetchedNotifications);
      updateStats(fetchedNotifications);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('حدث خطأ في جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  // جلب المستخدمين
  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const fetchedUsers: User[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedUsers.push({
          id: doc.id,
          name: data.name || data.displayName || 'مستخدم',
          email: data.email || '',
          accountType: data.accountType || 'user',
          phone: data.phone || '',
          country: data.country || ''
        });
      });
      
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // تحديث الإحصائيات
  const updateStats = (notificationsList: SmartNotification[]) => {
    const newStats = {
      total: notificationsList.length,
      unread: notificationsList.filter(n => !n.isRead).length,
      urgent: notificationsList.filter(n => n.priority === 'urgent').length,
      high: notificationsList.filter(n => n.priority === 'high').length,
      medium: notificationsList.filter(n => n.priority === 'medium').length,
      low: notificationsList.filter(n => n.priority === 'low').length,
      profileViews: notificationsList.filter(n => n.type === 'profile_view').length,
      searchResults: notificationsList.filter(n => n.type === 'search_result').length,
      connections: notificationsList.filter(n => n.type === 'connection_request').length,
      achievements: notificationsList.filter(n => n.type === 'achievement').length,
      trending: notificationsList.filter(n => n.type === 'trending').length,
      custom: notificationsList.filter(n => n.type === 'custom').length,
      whatsappSent: notificationsList.filter(n => n.metadata?.sentVia === 'whatsapp').length,
      smsSent: notificationsList.filter(n => n.metadata?.sentVia === 'sms').length
    };
    setStats(newStats);
  };

    // إنشاء إشعار جديد
  const createNotification = async () => {
    try {
      console.log('🚀 === بدء إنشاء الإشعار ===');
      console.log('📋 بيانات الإشعار الجديد:', newNotification);
      console.log('⚙️ حالة الإرسال الخارجي:', {
        externalNotificationsEnabled,
        sendVia: newNotification.sendVia,
        isExternal: newNotification.sendVia !== 'in_app'
      });
      
      setActionLoading('create');
      
      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        isRead: false,
        createdAt: serverTimestamp(),
        metadata: {
          sentVia: newNotification.sendVia,
          targetAudience: newNotification.targetAudience,
          scheduledFor: newNotification.scheduledFor
        }
      };

      console.log('📋 بيانات الإشعار المُعدة:', notificationData);
      console.log('⚙️ إعدادات الإرسال الخارجي:', {
        sendVia: newNotification.sendVia,
        externalNotificationsEnabled,
        shouldSendExternal: newNotification.sendVia !== 'in_app' && externalNotificationsEnabled
      });

      // إرسال الإشعار الخارجي (مع معالجة الأخطاء)
      if (newNotification.sendVia !== 'in_app' && externalNotificationsEnabled) {
        console.log('📱 بدء الإرسال الخارجي...');
        try {
          await sendExternalNotification(notificationData);
          console.log('✅ الإرسال الخارجي مكتمل');
        } catch (externalError) {
          console.error('❌ خطأ في الإرسال الخارجي:', externalError);
          // لا نوقف العملية إذا فشل الإرسال الخارجي
          toast.warning('تم إنشاء الإشعار في التطبيق، لكن فشل الإرسال الخارجي');
        }
      } else if (newNotification.sendVia !== 'in_app' && !externalNotificationsEnabled) {
        console.log('⚠️ الإرسال الخارجي معطل');
        toast.info('تم حفظ الإشعار في التطبيق فقط (الإرسال الخارجي معطل)');
      } else {
        console.log('📱 إشعار داخلي فقط (لا إرسال خارجي)');
      }

      console.log('💾 حفظ الإشعار في Firebase...');
      // حفظ في Firebase
      await addDoc(collection(db, 'smart_notifications'), notificationData);
      console.log('✅ تم حفظ الإشعار في Firebase');
      
      toast.success('تم إنشاء الإشعار بنجاح');
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        priority: 'medium',
        type: 'custom',
        targetAudience: [],
        sendVia: 'in_app',
        scheduledFor: null,
        customPhoneNumbers: [],
        targetType: 'audience'
      });
      
      console.log('🔄 تحديث قائمة الإشعارات...');
      fetchNotifications();
      console.log('✅ === انتهاء إنشاء الإشعار ===');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الإشعار:', error);
      toast.error('حدث خطأ في إنشاء الإشعار');
    } finally {
      setActionLoading(null);
    }
  };

  // تنسيق رقم الهاتف المصري
  const formatEgyptianPhone = (phone: string): string => {
    // إزالة جميع المسافات والرموز
    let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // إذا كان الرقم يبدأ بـ 0 (مصري محلي)
    if (cleaned.startsWith('0')) {
      return '+20' + cleaned.substring(1);
    }
    
    // إذا كان الرقم يبدأ بـ 20 (مصري بدون +)
    if (cleaned.startsWith('20')) {
      return '+' + cleaned;
    }
    
    // إذا كان الرقم يبدأ بـ +20 (مصري صحيح)
    if (cleaned.startsWith('+20')) {
      return cleaned;
    }
    
    // إذا كان الرقم 11 رقم (مصري بدون رمز الدولة)
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return '+20' + cleaned.substring(1);
    }
    
    // إذا كان الرقم 10 أرقام (مصري بدون 0)
    if (cleaned.length === 10 && cleaned.startsWith('1')) {
      return '+20' + cleaned;
    }
    
    // إذا لم يكن مصري، نعيده كما هو
    return cleaned;
  };

  // إرسال إشعار خارجي (WhatsApp/SMS)
  const sendExternalNotification = async (notificationData: any) => {
    try {
      console.log('🚀 === بدء إرسال الإشعارات الخارجية ===');
      console.log('📋 بيانات الإشعار:', notificationData);
      console.log('⚙️ إعدادات الإرسال:', {
        sendVia: newNotification.sendVia,
        targetType: newNotification.targetType,
        targetAudience: newNotification.targetAudience,
        customPhoneNumbers: newNotification.customPhoneNumbers
      });

      const phoneNumbersToSend: string[] = [];

      // إضافة أرقام المستخدمين المستهدفين
      if (newNotification.targetType === 'audience' || newNotification.targetType === 'both') {
        console.log('👥 معالجة المستخدمين المستهدفين...');
        const targetUsers = users.filter(user => 
          newNotification.targetAudience.length === 0 || 
          newNotification.targetAudience.includes(user.accountType)
        );
        console.log('👥 المستخدمين المطابقين:', targetUsers.length);

        targetUsers.forEach(user => {
          if (user.phone && !phoneNumbersToSend.includes(user.phone)) {
            const formattedPhone = formatEgyptianPhone(user.phone);
            phoneNumbersToSend.push(formattedPhone);
            console.log('📱 إضافة رقم مستخدم:', { original: user.phone, formatted: formattedPhone });
          }
        });
      }

      // إضافة الأرقام المخصصة
      if (newNotification.targetType === 'custom_numbers' || newNotification.targetType === 'both') {
        console.log('📱 معالجة الأرقام المخصصة...');
        newNotification.customPhoneNumbers.forEach(phone => {
          if (phone && !phoneNumbersToSend.includes(phone)) {
            const formattedPhone = formatEgyptianPhone(phone);
            phoneNumbersToSend.push(formattedPhone);
            console.log('📱 إضافة رقم مخصص:', { original: phone, formatted: formattedPhone });
          }
        });
      }

      // التحقق من وجود أرقام للإرسال
      if (phoneNumbersToSend.length === 0) {
        console.log('⚠️ لا توجد أرقام هاتف للإرسال');
        toast.warning('لا توجد أرقام هاتف للإرسال');
        return;
      }

      console.log(`📱 إرسال الإشعارات إلى ${phoneNumbersToSend.length} رقم هاتف`);
      console.log('📱 أرقام الهاتف:', phoneNumbersToSend);

      // إرسال الإشعارات مع معالجة أفضل للأخطاء
      const results = [];
      console.log('🔄 بدء حلقة الإرسال...');
      
      for (const phoneNumber of phoneNumbersToSend) {
        console.log(`📱 معالجة الرقم: ${phoneNumber}`);
        
        try {
          if (newNotification.sendVia === 'whatsapp' || newNotification.sendVia === 'both') {
            console.log(`📱 إرسال WhatsApp إلى: ${phoneNumber}`);
            const whatsappResult = await sendWhatsAppNotification(phoneNumber, notificationData);
            console.log(`📱 نتيجة WhatsApp: ${whatsappResult ? 'نجح' : 'فشل'}`);
            results.push({ phoneNumber, method: 'whatsapp', success: whatsappResult });
          }
          
          if (newNotification.sendVia === 'sms' || newNotification.sendVia === 'both') {
            console.log(`📱 إرسال SMS إلى: ${phoneNumber}`);
            const smsResult = await sendSMSNotification(phoneNumber, notificationData);
            console.log(`📱 نتيجة SMS: ${smsResult ? 'نجح' : 'فشل'}`);
            results.push({ phoneNumber, method: 'sms', success: smsResult });
          }
        } catch (error) {
          console.error(`❌ فشل في إرسال الإشعار إلى ${phoneNumber}:`, error);
          results.push({ phoneNumber, method: 'unknown', success: false, error });
        }
      }

      console.log('📊 نتائج الإرسال:', results);

      // عرض نتائج الإرسال
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      console.log(`📊 ملخص النتائج: نجح ${successful}، فشل ${failed}`);
      
      if (successful > 0) {
        toast.success(`تم إرسال ${successful} إشعار بنجاح${process.env.NODE_ENV === 'development' ? ' (محاكاة)' : ''}`);
      }
      
      if (failed > 0) {
        toast.error(`فشل في إرسال ${failed} إشعار`);
      }

      console.log('✅ === انتهاء إرسال الإشعارات الخارجية ===');

    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعارات الخارجية:', error);
      toast.error('حدث خطأ في إرسال الإشعارات الخارجية');
    }
  };

  // إرسال WhatsApp
  const sendWhatsAppNotification = async (phone: string, notificationData: any): Promise<boolean> => {
    try {
      console.log(`📱 === بدء إرسال WhatsApp إلى ${phone} ===`);
      console.log('📋 رسالة WhatsApp:', `${notificationData.title}\n\n${notificationData.message}`);
      
      const response = await fetch('/api/notifications/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          message: `${notificationData.title}\n\n${notificationData.message}`,
          type: 'notification'
        })
      });
      
      console.log('📱 استجابة WhatsApp:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ خطأ في WhatsApp:', errorData);
        throw new Error(`WhatsApp sending failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📱 نتيجة WhatsApp:', result);
      console.log(`✅ === انتهاء إرسال WhatsApp إلى ${phone} ===`);
      
      return true;
    } catch (error) {
      console.error(`❌ خطأ في WhatsApp لـ ${phone}:`, error);
      return false;
    }
  };

  // إرسال SMS
  const sendSMSNotification = async (phone: string, notificationData: any): Promise<boolean> => {
    try {
      console.log(`📱 === بدء إرسال SMS إلى ${phone} ===`);
      console.log('📋 رسالة SMS:', `${notificationData.title}\n\n${notificationData.message}`);
      
      const response = await fetch('/api/notifications/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          message: `${notificationData.title}\n\n${notificationData.message}`,
          type: 'notification'
        })
      });
      
      console.log('📱 استجابة SMS:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ خطأ في SMS:', errorData);
        throw new Error(`SMS sending failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📱 نتيجة SMS:', result);
      console.log(`✅ === انتهاء إرسال SMS إلى ${phone} ===`);
      
      return true;
    } catch (error) {
      console.error(`❌ خطأ في SMS لـ ${phone}:`, error);
      return false;
    }
  };

  // اختبار OTP
  const testOTPConfirmation = async () => {
    try {
      console.log('🔐 === بدء اختبار OTP ===');
      console.log('📋 بيانات اختبار OTP:', otpTestData);
      
      setActionLoading('otp_test');
      
      const results = [];
      
      // اختبار SMS OTP
      if (otpTestData.testType === 'sms' || otpTestData.testType === 'both') {
        console.log('📱 اختبار SMS OTP...');
        try {
          const response = await fetch('/api/notifications/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: otpTestData.phoneNumber,
              message: `🔐 رمز التحقق: ${otpTestData.reference}\n\n${otpTestData.message}`,
              type: 'otp_test'
            })
          });
          
          const result = await response.json();
          console.log('📱 نتيجة SMS OTP:', result);
          
          if (response.ok && result.success) {
            results.push({ method: 'SMS OTP', success: true, data: result });
            toast.success('تم إرسال SMS OTP بنجاح');
          } else {
            results.push({ method: 'SMS OTP', success: false, error: result.error });
            toast.error(`فشل في إرسال SMS OTP: ${result.error}`);
          }
        } catch (error) {
          console.error('❌ خطأ في SMS OTP:', error);
          results.push({ method: 'SMS OTP', success: false, error: error.message });
          toast.error('خطأ في إرسال SMS OTP');
        }
      }
      
      // اختبار WhatsApp OTP
      if (otpTestData.testType === 'whatsapp' || otpTestData.testType === 'both') {
        console.log('📱 اختبار WhatsApp OTP...');
        try {
          const response = await fetch('/api/notifications/whatsapp/otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: otpTestData.phoneNumber,
              reference: otpTestData.reference
            })
          });
          
          const result = await response.json();
          console.log('📱 نتيجة WhatsApp OTP:', result);
          
          if (response.ok && result.success) {
            results.push({ method: 'WhatsApp OTP', success: true, data: result });
            toast.success('تم إرسال WhatsApp OTP بنجاح');
          } else {
            results.push({ method: 'WhatsApp OTP', success: false, error: result.error });
            toast.error(`فشل في إرسال WhatsApp OTP: ${result.error}`);
          }
        } catch (error) {
          console.error('❌ خطأ في WhatsApp OTP:', error);
          results.push({ method: 'WhatsApp OTP', success: false, error: error.message });
          toast.error('خطأ في إرسال WhatsApp OTP');
        }
      }
      
      // عرض النتائج
      console.log('📊 نتائج اختبار OTP:', results);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        console.log(`✅ نجح ${successful} اختبار OTP`);
      }
      
      if (failed > 0) {
        console.log(`❌ فشل ${failed} اختبار OTP`);
      }
      
      console.log('✅ === انتهاء اختبار OTP ===');
      
    } catch (error) {
      console.error('❌ خطأ عام في اختبار OTP:', error);
      toast.error('حدث خطأ في اختبار OTP');
    } finally {
      setActionLoading(null);
    }
  };

  // اختبار سريع متعدد الأرقام
  const quickTestMultipleNumbers = async () => {
    try {
      console.log('🚀 === بدء اختبار سريع متعدد الأرقام ===');
      setActionLoading('quick_test');
      
      const results = [];
      
      for (const phoneNumber of quickTestNumbers.slice(0, 3)) { // اختبار أول 3 أرقام
        console.log(`📱 اختبار الرقم: ${phoneNumber}`);
        
        try {
          const response = await fetch('/api/notifications/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: phoneNumber,
              message: `Test message for ${phoneNumber}`,
              type: 'quick_test'
            })
          });
          
          const result = await response.json();
          console.log(`📱 نتيجة ${phoneNumber}:`, result);
          
          if (response.ok && result.success) {
            results.push({ phoneNumber, success: true, data: result });
            console.log(`✅ نجح إرسال SMS إلى ${phoneNumber}`);
          } else {
            results.push({ phoneNumber, success: false, error: result.error });
            console.log(`❌ فشل إرسال SMS إلى ${phoneNumber}: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ خطأ في إرسال SMS إلى ${phoneNumber}:`, error);
          results.push({ phoneNumber, success: false, error: error.message });
        }
        
        // انتظار بين الطلبات
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // عرض النتائج
      console.log('📊 نتائج الاختبار السريع:', results);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        toast.success(`نجح ${successful} اختبار من ${results.length}`);
        console.log(`✅ نجح ${successful} اختبار من ${results.length}`);
      }
      
      if (failed > 0) {
        toast.error(`فشل ${failed} اختبار من ${results.length}`);
        console.log(`❌ فشل ${failed} اختبار من ${results.length}`);
      }
      
      console.log('✅ === انتهاء الاختبار السريع ===');
      
    } catch (error) {
      console.error('❌ خطأ في الاختبار السريع:', error);
      toast.error('حدث خطأ في الاختبار السريع');
    } finally {
      setActionLoading(null);
    }
  };

  // اختبار WhatsApp سريع
  const quickTestWhatsApp = async () => {
    try {
      console.log('🚀 === بدء اختبار WhatsApp سريع ===');
      setActionLoading('whatsapp_test');
      
      const results = [];
      
      for (const phoneNumber of quickTestNumbers.slice(0, 2)) { // اختبار أول رقمين
        console.log(`📱 اختبار WhatsApp للرقم: ${phoneNumber}`);
        
        try {
          const response = await fetch('/api/notifications/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: phoneNumber,
              message: `Test WhatsApp message for ${phoneNumber}`,
              type: 'quick_test'
            })
          });
          
          const result = await response.json();
          console.log(`📱 نتيجة WhatsApp ${phoneNumber}:`, result);
          
          if (response.ok && result.success) {
            results.push({ phoneNumber, success: true, data: result });
            console.log(`✅ نجح إرسال WhatsApp إلى ${phoneNumber}`);
          } else {
            results.push({ phoneNumber, success: false, error: result.error });
            console.log(`❌ فشل إرسال WhatsApp إلى ${phoneNumber}: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ خطأ في إرسال WhatsApp إلى ${phoneNumber}:`, error);
          results.push({ phoneNumber, success: false, error: error.message });
        }
        
        // انتظار بين الطلبات
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // عرض النتائج
      console.log('📊 نتائج اختبار WhatsApp:', results);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (successful > 0) {
        toast.success(`نجح ${successful} اختبار WhatsApp من ${results.length}`);
        console.log(`✅ نجح ${successful} اختبار WhatsApp من ${results.length}`);
      }
      
      if (failed > 0) {
        toast.error(`فشل ${failed} اختبار WhatsApp من ${results.length}`);
        console.log(`❌ فشل ${failed} اختبار WhatsApp من ${results.length}`);
      }
      
      console.log('✅ === انتهاء اختبار WhatsApp ===');
      
    } catch (error) {
      console.error('❌ خطأ في اختبار WhatsApp:', error);
      toast.error('حدث خطأ في اختبار WhatsApp');
    } finally {
      setActionLoading(null);
    }
  };

  // اختبار مباشر مع BeOn V3 API
  const testDirectBeOnAPI = async () => {
    try {
      console.log('🔧 === بدء اختبار مباشر مع BeOn V3 API ===');
      setActionLoading('direct_test');
      
      const testData = {
        phoneNumbers: ['+201017799580'],
        message: 'Direct V3 API Test - رسالة اختبار من BeOn V3'
      };
      
      console.log('📋 بيانات الاختبار المباشر V3:', testData);
      
      try {
        const response = await fetch('https://v3.api.beon.chat/api/v3/messages/sms/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'beon-token': 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv'
          },
          body: JSON.stringify(testData)
        });
        
        console.log('📱 استجابة BeOn V3 API المباشرة:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        let responseData;
        try {
          responseData = await response.text();
          console.log('📱 محتوى الاستجابة V3:', responseData);
        } catch (e) {
          console.log('📱 لا يوجد محتوى في الاستجابة V3');
        }
        
        if (response.ok) {
          console.log('✅ اختبار BeOn V3 API المباشر نجح');
          toast.success('اختبار BeOn V3 API المباشر نجح');
        } else {
          console.log(`❌ اختبار BeOn V3 API المباشر فشل: ${response.status} ${response.statusText}`);
          toast.error(`اختبار BeOn V3 API فشل: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        console.error('❌ خطأ في اختبار BeOn V3 API المباشر:', error);
        toast.error('خطأ في اختبار BeOn V3 API المباشر');
      }
      
      console.log('✅ === انتهاء اختبار BeOn V3 API المباشر ===');
      
    } catch (error) {
      console.error('❌ خطأ عام في اختبار BeOn V3 API:', error);
      toast.error('حدث خطأ في اختبار BeOn V3 API');
    } finally {
      setActionLoading(null);
    }
  };

  // اختبار SMS Template مع BeOn V3
  const testSMSTemplate = async () => {
    try {
      console.log('📋 === بدء اختبار SMS Template مع BeOn V3 ===');
      setActionLoading('sms_template');
      
      const testData = {
        template_id: 133,
        phoneNumber: '+201017799580',
        name: 'El7lm',
        vars: ['1', '2']
      };
      
      console.log('📋 بيانات اختبار SMS Template:', testData);
      
      try {
        const response = await fetch('https://v3.api.beon.chat/api/v3/messages/sms/template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'beon-token': 'SPb4sbemr5bwb7sjzCqTcL'
          },
          body: JSON.stringify(testData)
        });
        
        console.log('📱 استجابة SMS Template:', {
          status: response.status,
          statusText: response.statusText
        });
        
        let responseData;
        try {
          responseData = await response.text();
          console.log('📱 محتوى استجابة Template:', responseData);
        } catch (e) {
          console.log('📱 لا يوجد محتوى في استجابة Template');
        }
        
        if (response.ok) {
          console.log('✅ اختبار SMS Template نجح');
          toast.success('اختبار SMS Template نجح');
        } else {
          console.log(`❌ اختبار SMS Template فشل: ${response.status} ${response.statusText}`);
          toast.error(`اختبار SMS Template فشل: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        console.error('❌ خطأ في اختبار SMS Template:', error);
        toast.error('خطأ في اختبار SMS Template');
      }
      
      console.log('✅ === انتهاء اختبار SMS Template ===');
      
    } catch (error) {
      console.error('❌ خطأ عام في اختبار SMS Template:', error);
      toast.error('حدث خطأ في اختبار SMS Template');
    } finally {
      setActionLoading(null);
    }
  };

  // اختبار SMS Bulk مع BeOn V3
  const testSMSBulk = async () => {
    try {
      console.log('📦 === بدء اختبار SMS Bulk مع BeOn V3 ===');
      setActionLoading('sms_bulk');
      
      const testData = {
        phoneNumbers: ['+201017799580'],
        message: 'hello from beon v3 sms api - رسالة جماعية من BeOn V3'
      };
      
      console.log('📋 بيانات اختبار SMS Bulk:', testData);
      
      try {
        const response = await fetch('https://v3.api.beon.chat/api/v3/messages/sms/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'beon-token': 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv'
          },
          body: JSON.stringify(testData)
        });
        
        console.log('📱 استجابة SMS Bulk:', {
          status: response.status,
          statusText: response.statusText
        });
        
        let responseData;
        try {
          responseData = await response.text();
          console.log('📱 محتوى استجابة Bulk:', responseData);
        } catch (e) {
          console.log('📱 لا يوجد محتوى في استجابة Bulk');
        }
        
        if (response.ok) {
          console.log('✅ اختبار SMS Bulk نجح');
          toast.success('اختبار SMS Bulk نجح');
        } else {
          console.log(`❌ اختبار SMS Bulk فشل: ${response.status} ${response.statusText}`);
          toast.error(`اختبار SMS Bulk فشل: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        console.error('❌ خطأ في اختبار SMS Bulk:', error);
        toast.error('خطأ في اختبار SMS Bulk');
      }
      
      console.log('✅ === انتهاء اختبار SMS Bulk ===');
      
    } catch (error) {
      console.error('❌ خطأ عام في اختبار SMS Bulk:', error);
      toast.error('حدث خطأ في اختبار SMS Bulk');
    } finally {
      setActionLoading(null);
    }
  };

  // اختبار OTP الجديد مع BeOn API الصحيح
  const testOTPNew = async () => {
    try {
      console.log('🔐 === بدء اختبار OTP الجديد مع BeOn API ===');
      setActionLoading('otp_new');
      
      // إنشاء FormData كما هو مطلوب في الوثائق
      const formData = new FormData();
      formData.append('phoneNumber', '+201017799580');
      formData.append('name', 'El7lm');
      formData.append('type', 'sms');
      formData.append('otp_length', '4');
      formData.append('lang', 'ar');
      
      console.log('📋 بيانات اختبار OTP الجديد:', {
        phoneNumber: '+201017799580',
        name: 'El7lm',
        type: 'sms',
        otp_length: '4',
        lang: 'ar'
      });
      
      try {
        const response = await fetch('https://beon.chat/api/send/message/otp', {
          method: 'POST',
          headers: {
            'beon-token': 'yK1zYZRgjvuVC5wJcmkMwL0zFsRi9BhytEYPXgnzbNCyPFkaJBp9ngjmO6q4'
          },
          body: formData
        });
        
        console.log('📱 استجابة OTP الجديد:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        let responseData;
        try {
          responseData = await response.text();
          console.log('📱 محتوى استجابة OTP:', responseData);
          
          // محاولة تحليل JSON
          if (responseData) {
            try {
              const jsonData = JSON.parse(responseData);
              console.log('📱 بيانات OTP JSON:', jsonData);
              
              if (jsonData.status === 200 && jsonData.data) {
                console.log('✅ اختبار OTP الجديد نجح - رمز التحقق:', jsonData.data);
                toast.success(`اختبار OTP نجح! رمز التحقق: ${jsonData.data}`);
              } else {
                console.log('❌ اختبار OTP فشل - استجابة غير صحيحة');
                toast.error('اختبار OTP فشل - استجابة غير صحيحة');
              }
            } catch (parseError) {
              console.log('📱 استجابة OTP ليست JSON:', responseData);
              if (response.ok) {
                console.log('✅ اختبار OTP نجح (استجابة نصية)');
                toast.success('اختبار OTP نجح');
              } else {
                console.log('❌ اختبار OTP فشل');
                toast.error('اختبار OTP فشل');
              }
            }
          }
        } catch (e) {
          console.log('📱 لا يوجد محتوى في استجابة OTP');
          if (response.ok) {
            console.log('✅ اختبار OTP نجح (بدون محتوى)');
            toast.success('اختبار OTP نجح');
          } else {
            console.log('❌ اختبار OTP فشل');
            toast.error('اختبار OTP فشل');
          }
        }
        
      } catch (error) {
        console.error('❌ خطأ في اختبار OTP الجديد:', error);
        toast.error('خطأ في اختبار OTP الجديد');
      }
      
      console.log('✅ === انتهاء اختبار OTP الجديد ===');
      
    } catch (error) {
      console.error('❌ خطأ عام في اختبار OTP الجديد:', error);
      toast.error('حدث خطأ في اختبار OTP الجديد');
    } finally {
      setActionLoading(null);
    }
  };

  // تصدير البيانات
  const exportData = () => {
    const data = {
      notifications: filteredNotifications,
      stats: stats,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notifications-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('تم تصدير البيانات بنجاح');
  };

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    // فلتر النوع
    if (typeFilter !== 'all' && notification.type !== typeFilter) {
      return false;
    }

    // فلتر الأولوية
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false;
    }

    // فلتر حالة القراءة
    if (readFilter === 'read' && !notification.isRead) {
      return false;
    }
    if (readFilter === 'unread' && notification.isRead) {
      return false;
    }

    // فلتر البحث
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.viewerName?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      setActionLoading(notificationId);
      await updateDoc(doc(db, 'smart_notifications', notificationId), {
        isRead: true
      });
      
      // تحديث القائمة محلياً
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updatedNotifications);
      updateStats(updatedNotifications);
      
      toast.success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('حدث خطأ في تحديث الإشعار');
    } finally {
      setActionLoading(null);
    }
  };

  // حذف الإشعار
  const deleteNotification = async (notificationId: string) => {
    try {
      setActionLoading(notificationId);
      await deleteDoc(doc(db, 'smart_notifications', notificationId));
      
      // تحديث القائمة محلياً
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      updateStats(updatedNotifications);
      
      toast.success('تم حذف الإشعار بنجاح');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('حدث خطأ في حذف الإشعار');
    } finally {
      setActionLoading(null);
    }
  };

  // تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      fetchUsers();
    }
  }, [user?.uid]);

  return (
          <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            إدارة الإشعارات الذكية
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              إشعار جديد
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              إرسال جماعي
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              جدولة
            </button>
            <button
              onClick={exportData}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              تصدير
            </button>
                         <button
               onClick={() => setExternalNotificationsEnabled(!externalNotificationsEnabled)}
               className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                 externalNotificationsEnabled 
                   ? 'bg-green-600 hover:bg-green-700 text-white' 
                   : 'bg-red-600 hover:bg-red-700 text-white'
               }`}
               title={externalNotificationsEnabled ? 'إيقاف الإرسال الخارجي' : 'تشغيل الإرسال الخارجي'}
             >
               <MessageCircle className="w-4 h-4" />
               {externalNotificationsEnabled ? 'إرسال خارجي مفعل' : 'إرسال خارجي معطل'}
             </button>
             <button
               onClick={() => setShowSettingsModal(true)}
               className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
             >
               <Settings className="w-4 h-4" />
               إعدادات
             </button>
            <button
              onClick={() => setShowOTPTestModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Key className="w-4 h-4" />
              اختبار OTP
            </button>
            <button
              onClick={() => fetchNotifications()}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">الإجمالي</p>
                <p className="text-xl font-bold text-blue-700">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600">غير مقروء</p>
                <p className="text-xl font-bold text-red-700">{stats.unread}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">WhatsApp</p>
                <p className="text-xl font-bold text-green-700">{stats.whatsappSent}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">SMS</p>
                <p className="text-xl font-bold text-purple-700">{stats.smsSent}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600">مشاهدات</p>
                <p className="text-xl font-bold text-yellow-700">{stats.profileViews}</p>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-indigo-600">طلبات التواصل</p>
                <p className="text-xl font-bold text-indigo-700">{stats.connections}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600">الإنجازات</p>
                <p className="text-xl font-bold text-orange-700">{stats.achievements}</p>
              </div>
            </div>
          </div>
        </div>

        {/* أدوات الفلترة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث في الإشعارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* فلتر النوع */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="فلتر حسب النوع"
              aria-label="فلتر حسب النوع"
            >
              <option value="all">جميع الأنواع</option>
              <option value="profile_view">مشاهدة الملف</option>
              <option value="search_result">نتائج البحث</option>
              <option value="connection_request">طلبات التواصل</option>
              <option value="achievement">الإنجازات</option>
              <option value="trending">الترند</option>
              <option value="custom">مخصص</option>
            </select>
          </div>

          {/* فلتر الأولوية */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="فلتر حسب الأولوية"
              aria-label="فلتر حسب الأولوية"
            >
              <option value="all">جميع الأولويات</option>
              <option value="urgent">مهم</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>
          </div>

          {/* فلتر حالة القراءة */}
          <div>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="فلتر حسب حالة القراءة"
              aria-label="فلتر حسب حالة القراءة"
            >
              <option value="all">الكل</option>
              <option value="read">مقروء</option>
              <option value="unread">غير مقروء</option>
            </select>
          </div>
        </div>
      </div>

      {/* قائمة الإشعارات */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-t-2 border-blue-600 rounded-full animate-spin"></div>
              <span>جاري التحميل...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد إشعارات{searchTerm ? ' تطابق البحث' : ''}</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl shadow-sm p-6 ${!notification.isRead ? 'border-r-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  notification.type === 'profile_view' ? 'bg-blue-100' :
                  notification.type === 'search_result' ? 'bg-green-100' :
                  notification.type === 'connection_request' ? 'bg-purple-100' :
                  notification.type === 'achievement' ? 'bg-yellow-100' :
                  notification.type === 'custom' ? 'bg-indigo-100' :
                  'bg-red-100'
                }`}>
                  {notification.type === 'profile_view' && <Eye className="w-5 h-5 text-blue-600" />}
                  {notification.type === 'search_result' && <Search className="w-5 h-5 text-green-600" />}
                  {notification.type === 'connection_request' && <Users className="w-5 h-5 text-purple-600" />}
                  {notification.type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-600" />}
                  {notification.type === 'custom' && <Bell className="w-5 h-5 text-indigo-600" />}
                  {notification.type === 'trending' && <TrendingUp className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600">{notification.message}</p>
                      {notification.metadata?.sentVia && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500">تم الإرسال عبر:</span>
                          {notification.metadata.sentVia === 'whatsapp' && (
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          )}
                          {notification.metadata.sentVia === 'sms' && (
                            <Smartphone className="w-4 h-4 text-purple-600" />
                          )}
                          {notification.metadata.sentVia === 'both' && (
                            <div className="flex gap-1">
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <Smartphone className="w-4 h-4 text-purple-600" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        notification.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {notification.priority === 'urgent' ? 'مهم' :
                         notification.priority === 'high' ? 'عالي' :
                         notification.priority === 'medium' ? 'متوسط' :
                         'منخفض'}
                      </span>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      {notification.viewerName && (
                        <>
                          <span>{notification.viewerName}</span>
                          <span>•</span>
                        </>
                      )}
                      {notification.viewerType && (
                        <>
                          <span>{notification.viewerType}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{new Date(notification.createdAt.seconds * 1000).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          disabled={actionLoading === notification.id}
                          className="text-blue-600 hover:text-blue-800"
                          title="تحديد كمقروء"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        disabled={actionLoading === notification.id}
                        className="text-red-600 hover:text-red-800"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة إنشاء إشعار جديد */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">إنشاء إشعار جديد</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">عنوان الإشعار</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل عنوان الإشعار"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">رسالة الإشعار</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="أدخل رسالة الإشعار"
                />
              </div>
              
                             <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-2">الأولوية</label>
                   <select
                     value={newNotification.priority}
                     onChange={(e) => setNewNotification({...newNotification, priority: e.target.value as any})}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     title="اختر أولوية الإشعار"
                     aria-label="اختر أولوية الإشعار"
                   >
                     <option value="low">منخفض</option>
                     <option value="medium">متوسط</option>
                     <option value="high">عالي</option>
                     <option value="urgent">مهم</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2">طريقة الإرسال</label>
                   <select
                     value={newNotification.sendVia}
                     onChange={(e) => setNewNotification({...newNotification, sendVia: e.target.value as any})}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     title="اختر طريقة الإرسال"
                     aria-label="اختر طريقة الإرسال"
                   >
                     <option value="in_app">في التطبيق فقط</option>
                     <option value="whatsapp">WhatsApp</option>
                     <option value="sms">SMS</option>
                     <option value="both">WhatsApp و SMS</option>
                   </select>
                 </div>
               </div>

                               {/* تحذير حول الإرسال الخارجي */}
                {newNotification.sendVia !== 'in_app' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-xs">⚠️</span>
                      </div>
                      <div>
                        <p className="text-sm text-yellow-800 font-medium">ملاحظة حول الإرسال الخارجي</p>
                        <p className="text-xs text-yellow-700">
                          {process.env.NODE_ENV === 'development' 
                            ? 'أنت في وضع التطوير - سيتم محاكاة الإرسال بدلاً من الإرسال الفعلي.'
                            : 'الإرسال عبر WhatsApp/SMS يتطلب إعدادات صحيحة. إذا فشل الإرسال، سيتم حفظ الإشعار في التطبيق فقط.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              
                             <div>
                 <label className="block text-sm font-medium mb-2">نوع الاستهداف</label>
                 <select
                   value={newNotification.targetType}
                   onChange={(e) => setNewNotification({...newNotification, targetType: e.target.value as any})}
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   title="اختر نوع الاستهداف"
                   aria-label="اختر نوع الاستهداف"
                 >
                   <option value="audience">الفئات المستهدفة</option>
                   <option value="custom_numbers">أرقام مخصصة</option>
                   <option value="both">الفئات والأرقام المخصصة</option>
                 </select>
               </div>

               {newNotification.targetType === 'audience' || newNotification.targetType === 'both' ? (
                 <div>
                   <label className="block text-sm font-medium mb-2">الفئة المستهدفة</label>
                   <div className="grid grid-cols-2 gap-2">
                     {['admin', 'user', 'player', 'academy', 'club', 'agent'].map((type) => (
                       <label key={type} className="flex items-center gap-2">
                         <input
                           type="checkbox"
                           checked={newNotification.targetAudience.includes(type)}
                           onChange={(e) => {
                             if (e.target.checked) {
                               setNewNotification({
                                 ...newNotification,
                                 targetAudience: [...newNotification.targetAudience, type]
                               });
                             } else {
                               setNewNotification({
                                 ...newNotification,
                                 targetAudience: newNotification.targetAudience.filter(t => t !== type)
                               });
                             }
                           }}
                           className="rounded"
                         />
                         <span className="text-sm">
                           {type === 'admin' ? 'المديرين' :
                            type === 'user' ? 'المستخدمين' :
                            type === 'player' ? 'اللاعبين' :
                            type === 'academy' ? 'الأكاديميات' :
                            type === 'club' ? 'الأندية' :
                            'الوكلاء'}
                         </span>
                       </label>
                     ))}
                   </div>
                 </div>
               ) : null}

                               {newNotification.targetType === 'custom_numbers' || newNotification.targetType === 'both' ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">الأرقام المخصصة</label>
                    <div className="space-y-3">
                      {/* إضافة رقم يدوياً */}
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          placeholder="أدخل رقم الهاتف (مثال: +966501234567)"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const phoneNumber = input.value.trim();
                              if (phoneNumber && !newNotification.customPhoneNumbers.includes(phoneNumber)) {
                                setNewNotification({
                                  ...newNotification,
                                  customPhoneNumbers: [...newNotification.customPhoneNumbers, phoneNumber]
                                });
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            const phoneNumber = input.value.trim();
                            if (phoneNumber && !newNotification.customPhoneNumbers.includes(phoneNumber)) {
                              setNewNotification({
                                ...newNotification,
                                customPhoneNumbers: [...newNotification.customPhoneNumbers, phoneNumber]
                              });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          إضافة
                        </button>
                      </div>

                      {/* اختيار من قائمة المستخدمين */}
                      <div>
                        <label className="block text-sm font-medium mb-2">أو اختر من المستخدمين المسجلين</label>
                        <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
                          {users.filter(user => user.phone).map((user) => (
                            <div
                              key={user.id}
                              className={`flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                newNotification.customPhoneNumbers.includes(user.phone!) ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                              onClick={() => {
                                if (user.phone) {
                                  if (newNotification.customPhoneNumbers.includes(user.phone)) {
                                    // إزالة الرقم إذا كان موجوداً
                                    setNewNotification({
                                      ...newNotification,
                                      customPhoneNumbers: newNotification.customPhoneNumbers.filter(phone => phone !== user.phone)
                                    });
                                  } else {
                                    // إضافة الرقم إذا لم يكن موجوداً
                                    setNewNotification({
                                      ...newNotification,
                                      customPhoneNumbers: [...newNotification.customPhoneNumbers, user.phone!]
                                    });
                                  }
                                }
                              }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    newNotification.customPhoneNumbers.includes(user.phone!) 
                                      ? 'bg-blue-600 border-blue-600' 
                                      : 'border-gray-300'
                                  }`}>
                                    {newNotification.customPhoneNumbers.includes(user.phone!) && (
                                      <div className="w-2 h-2 bg-white rounded"></div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <div className="flex items-center gap-1">
                                      <span className="text-xs text-gray-500">{user.phone}</span>
                                      {formatEgyptianPhone(user.phone) !== user.phone && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-1 rounded">
                                          → {formatEgyptianPhone(user.phone)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {user.accountType === 'admin' ? 'مدير' :
                                 user.accountType === 'user' ? 'مستخدم' :
                                 user.accountType === 'player' ? 'لاعب' :
                                 user.accountType === 'academy' ? 'أكاديمية' :
                                 user.accountType === 'club' ? 'نادي' :
                                 user.accountType === 'agent' ? 'وكيل' : 'غير محدد'}
                              </div>
                            </div>
                          ))}
                          {users.filter(user => user.phone).length === 0 && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              لا يوجد مستخدمين بأرقام هواتف مسجلة
                            </div>
                          )}
                        </div>
                      </div>
                      
                                             {/* عرض الأرقام المختارة */}
                       {newNotification.customPhoneNumbers.length > 0 && (
                         <div className="space-y-2">
                           <p className="text-sm text-gray-600">الأرقام المختارة ({newNotification.customPhoneNumbers.length}):</p>
                           <div className="space-y-1 max-h-32 overflow-y-auto">
                             {newNotification.customPhoneNumbers.map((phone, index) => {
                               const user = users.find(u => u.phone === phone);
                               const formattedPhone = formatEgyptianPhone(phone);
                               return (
                                 <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                   <div className="flex-1">
                                     <div className="flex items-center gap-2">
                                       <span className="text-sm font-medium">{phone}</span>
                                       {formattedPhone !== phone && (
                                         <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                           → {formattedPhone}
                                         </span>
                                       )}
                                     </div>
                                     {user && (
                                       <span className="text-xs text-gray-500 mr-2"> - {user.name}</span>
                                     )}
                                   </div>
                                   <button
                                     type="button"
                                     onClick={() => {
                                       setNewNotification({
                                         ...newNotification,
                                         customPhoneNumbers: newNotification.customPhoneNumbers.filter((_, i) => i !== index)
                                       });
                                     }}
                                     className="text-red-600 hover:text-red-800 text-sm"
                                   >
                                     حذف
                                   </button>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
                ) : null}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={createNotification}
                disabled={actionLoading === 'create' || !newNotification.title || !newNotification.message}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {actionLoading === 'create' ? 'جاري الإنشاء...' : 'إنشاء الإشعار'}
              </button>
            </div>
          </div>
        </div>
      )}

             {/* نافذة الإرسال الجماعي */}
       {showBulkModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <h2 className="text-xl font-bold mb-4">إرسال إشعار جماعي</h2>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-2">رسالة الإشعار</label>
                 <textarea
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   rows={4}
                   placeholder="أدخل رسالة الإشعار الجماعي"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium mb-2">طريقة الإرسال</label>
                   <select 
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     title="اختر طريقة الإرسال"
                     aria-label="اختر طريقة الإرسال"
                   >
                     <option value="whatsapp">WhatsApp</option>
                     <option value="sms">SMS</option>
                     <option value="both">WhatsApp و SMS</option>
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium mb-2">نوع الاستهداف</label>
                   <select 
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                     title="اختر نوع الاستهداف"
                     aria-label="اختر نوع الاستهداف"
                   >
                     <option value="audience">الفئات المستهدفة</option>
                     <option value="custom_numbers">أرقام مخصصة</option>
                     <option value="both">الفئات والأرقام المخصصة</option>
                   </select>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium mb-2">الفئة المستهدفة</label>
                 <select 
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   title="اختر الفئة المستهدفة"
                   aria-label="اختر الفئة المستهدفة"
                 >
                   <option value="all">جميع المستخدمين</option>
                   <option value="players">اللاعبين فقط</option>
                   <option value="academies">الأكاديميات فقط</option>
                   <option value="clubs">الأندية فقط</option>
                   <option value="agents">الوكلاء فقط</option>
                 </select>
               </div>

                               <div>
                  <label className="block text-sm font-medium mb-2">الأرقام المخصصة (اختياري)</label>
                  <div className="space-y-3">
                    {/* إضافة رقم يدوياً */}
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="أدخل رقم الهاتف (مثال: +966501234567)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        إضافة
                      </button>
                    </div>

                    {/* اختيار من قائمة المستخدمين */}
                    <div>
                      <label className="block text-sm font-medium mb-2">أو اختر من المستخدمين المسجلين</label>
                      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
                        {users.filter(user => user.phone).map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              // يمكن إضافة منطق اختيار المستخدمين هنا
                              console.log('Selected user:', user);
                            }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded border-2 border-gray-300 flex items-center justify-center">
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.phone}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {user.accountType === 'admin' ? 'مدير' :
                               user.accountType === 'user' ? 'مستخدم' :
                               user.accountType === 'player' ? 'لاعب' :
                               user.accountType === 'academy' ? 'أكاديمية' :
                               user.accountType === 'club' ? 'نادي' :
                               user.accountType === 'agent' ? 'وكيل' : 'غير محدد'}
                            </div>
                          </div>
                        ))}
                        {users.filter(user => user.phone).length === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            لا يوجد مستخدمين بأرقام هواتف مسجلة
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">الأرقام المضافة:</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">+966501234567</span>
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
             
             <div className="flex justify-end gap-3 mt-6">
               <button
                 onClick={() => setShowBulkModal(false)}
                 className="px-4 py-2 text-gray-600 hover:text-gray-800"
               >
                 إلغاء
               </button>
               <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                 إرسال جماعي
               </button>
             </div>
           </div>
         </div>
       )}

      {/* نافذة الجدولة */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">جدولة إشعار</h2>
            
            <div className="space-y-4">
                             <div>
                 <label className="block text-sm font-medium mb-2">تاريخ ووقت الإرسال</label>
                 <input
                   type="datetime-local"
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                   title="اختر تاريخ ووقت الإرسال"
                   aria-label="اختر تاريخ ووقت الإرسال"
                 />
               </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">رسالة الإشعار</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="أدخل رسالة الإشعار المجدول"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                جدولة الإشعار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الإعدادات */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">إعدادات الإشعارات</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">إعدادات WhatsApp</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>تفعيل إرسال WhatsApp</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>إرسال تلقائي للإشعارات المهمة</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">إعدادات SMS</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>تفعيل إرسال SMS</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>إرسال تلقائي للإشعارات المهمة</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">إعدادات عامة</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span>تفعيل الإشعارات في التطبيق</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>حفظ سجل الإشعارات المرسلة</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة اختبار OTP */}
      {showOTPTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-orange-600" />
              اختبار OTP - رسالة تأكيد
            </h2>
            <p className="text-gray-600 mb-6">
              اختبار إرسال رسائل OTP للتأكد من عمل الـ API بشكل منفصل عن محتوى الرسالة
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  value={otpTestData.phoneNumber}
                  onChange={(e) => setOtpTestData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+201017799580"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">نوع الاختبار</label>
                <select
                  value={otpTestData.testType}
                  onChange={(e) => setOtpTestData(prev => ({ ...prev, testType: e.target.value as 'sms' | 'whatsapp' | 'both' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="اختر نوع الاختبار"
                >
                  <option value="sms">SMS OTP فقط</option>
                  <option value="whatsapp">WhatsApp OTP فقط</option>
                  <option value="both">كلاهما</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reference (مرجع)</label>
                <input
                  type="text"
                  value={otpTestData.reference}
                  onChange={(e) => setOtpTestData(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="test_123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">رسالة التأكيد</label>
                <textarea
                  value={otpTestData.message}
                  onChange={(e) => setOtpTestData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="رسالة تأكيد OTP"
                />
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">معلومات الاختبار:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• SMS OTP: سيتم إرسال رسالة SMS تحتوي على رمز التحقق</li>
                  <li>• WhatsApp OTP: سيتم إرسال رابط WhatsApp مع رمز التحقق</li>
                  <li>• Reference: سيتم استخدامه كرمز التحقق</li>
                  <li>• الرسالة: ستظهر كرسالة تأكيد إضافية</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-orange-800 mb-2">اختبار سريع للتشخيص:</h3>
                <p className="text-sm text-orange-700 mb-3">
                  إذا لم تصل الرسالة، جرب هذا الاختبار السريع مع أرقام متعددة ورسائل بسيطة
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={quickTestMultipleNumbers}
                    disabled={actionLoading === 'quick_test'}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'quick_test' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        اختبار SMS (3 أرقام)
                      </>
                    )}
                  </button>
                  <button
                    onClick={quickTestWhatsApp}
                    disabled={actionLoading === 'whatsapp_test'}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'whatsapp_test' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        اختبار WhatsApp (2 أرقام)
                      </>
                    )}
                  </button>
                  <button
                    onClick={testDirectBeOnAPI}
                    disabled={actionLoading === 'direct_test'}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'direct_test' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        اختبار BeOn V3 API مباشرة
                      </>
                    )}
                  </button>
                  <button
                    onClick={testSMSTemplate}
                    disabled={actionLoading === 'sms_template'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'sms_template' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        اختبار SMS Template
                      </>
                    )}
                  </button>
                  <button
                    onClick={testSMSBulk}
                    disabled={actionLoading === 'sms_bulk'}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'sms_bulk' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        اختبار SMS Bulk
                      </>
                    )}
                  </button>
                  <button
                    onClick={testOTPNew}
                    disabled={actionLoading === 'otp_new'}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'otp_new' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        جاري الاختبار...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        اختبار OTP الجديد
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowOTPTestModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={testOTPConfirmation}
                disabled={actionLoading === 'otp_test'}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'otp_test' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري الاختبار...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    بدء اختبار OTP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

