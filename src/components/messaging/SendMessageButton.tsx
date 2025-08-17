'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { addDoc, collection, serverTimestamp, query, where, getDocs, doc, writeBatch, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MessageSquare, 
  Send, 
  X,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  Phone,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SendMessageButtonProps {
  // الخصائص المشتركة
  user: any;
  userData: any;
  getUserDisplayName: () => string;

  // خصائص المحادثة المباشرة
  newMessage?: string;
  selectedConversation?: any;
  onMessageSent?: () => void;
  scrollToBottom?: () => void;

  // خصائص صفحة البحث
  targetUserId?: string;
  targetUserName?: string;
  targetUserType?: string;
  className?: string;
  organizationName?: string;
  redirectToMessages?: boolean;
  
  // خصائص تخصيص الزر
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

const USER_TYPES = {
  club: { name: 'نادي', icon: Building2, color: 'text-green-600' },
  academy: { name: 'أكاديمية', icon: GraduationCap, color: 'text-purple-600' },
  trainer: { name: 'مدرب', icon: UserCheck, color: 'text-blue-600' },
  agent: { name: 'وكيل', icon: Phone, color: 'text-orange-600' },
  player: { name: 'لاعب', icon: Users, color: 'text-gray-600' },
  admin: { name: 'مشرف', icon: Shield, color: 'text-red-600' }
};

const createNotification = async (batch: any, {
  userId,
  title,
  body,
  type,
  senderName,
  senderId,
  senderType,
  link
}: {
  userId: string;
  title: string;
  body: string;
  type: string;
  senderName: string;
  senderId: string;
  senderType: string;
  link: string;
}) => {
  const notificationRef = doc(collection(db, 'notifications'));
  const notificationData = {
    id: notificationRef.id,
    userId,
    title,
    body,
    type,
    senderName,
    senderId,
    senderType,
    link,
    isRead: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  batch.set(notificationRef, notificationData);
  return notificationRef;
};

const SendMessageButton: React.FC<SendMessageButtonProps> = ({
  // الخصائص المشتركة
  user,
  userData,
  getUserDisplayName,

  // خصائص المحادثة المباشرة
  newMessage = '',
  selectedConversation,
  onMessageSent,
  scrollToBottom,

  // خصائص صفحة البحث
  targetUserId,
  targetUserName,
  targetUserType,
  className = '',
  organizationName,
  redirectToMessages = false,
  
  // خصائص تخصيص الزر
  buttonText,
  buttonVariant = 'default',
  buttonSize = 'default'
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // التحقق من صحة البيانات
  if (!user || !userData) {
    return null;
  }

  // التحقق من صحة البيانات للمحادثة الجديدة
  if (!selectedConversation && (!targetUserId || targetUserId === user.uid)) {
    return null;
  }

  const getMessagesPath = () => {
    return '/dashboard/messages';
  };

  const sendDirectMessage = async () => {
    // منع الإرسال المتكرر
    if (sending) {
      console.log('🛑 Message sending blocked - already sending');
      return;
    }

    console.log('بدء عملية إرسال الرسالة:', {
      user: user?.uid,
      userData: {
        accountType: userData?.accountType,
        name: getUserDisplayName()
      },
      targetUserId,
      targetUserName,
      targetUserType
    });

    // التحقق من وجود المستخدم وبياناته
    if (!user || !userData) {
      console.error('خطأ: المستخدم غير مسجل الدخول أو البيانات غير متوفرة');
      toast.error('يرجى تسجيل الدخول');
      return;
    }

    // التحقق من وجود المستلم
    if (!targetUserId) {
      console.error('خطأ: لم يتم تحديد المستلم');
      toast.error('لم يتم تحديد المستلم');
      return;
    }

    // التحقق من أن المستلم ليس نفس المرسل
    if (targetUserId === user.uid) {
      console.error('خطأ: محاولة إرسال رسالة للنفس');
      toast.error('لا يمكن إرسال رسالة لنفسك');
      return;
    }

    // التحقق من وجود نص الرسالة
    if (!message.trim()) {
      console.error('خطأ: الرسالة فارغة');
      toast.error('يرجى كتابة رسالة');
      return;
    }

    setSending(true);
    try {
      // جلب بيانات المستلم المحدثة
      const receiverRef = doc(db, `${targetUserType}s`, targetUserId);
      const receiverDoc = await getDoc(receiverRef);
      const receiverData = receiverDoc.data();
      const receiverName = receiverData?.full_name || receiverData?.name || targetUserName;

      // إنشاء معرف المحادثة
      const conversationId = [user.uid, targetUserId].sort().join('-');
      console.log('معرف المحادثة:', conversationId);

      // البحث عن محادثة موجودة
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const existingConversation = conversationsSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(targetUserId);
      });

      const batch = writeBatch(db);

      let conversationRef;
      let isNewConversation = false;

      if (existingConversation) {
        // استخدام المحادثة الموجودة
        conversationRef = doc(db, 'conversations', existingConversation.id);
        console.log('استخدام محادثة موجودة:', {
          conversationId: existingConversation.id,
          participants: existingConversation.data().participants
        });

        // تحديث أسماء المشاركين
        batch.update(conversationRef, {
          [`participantNames.${user.uid}`]: getUserDisplayName(),
          [`participantNames.${targetUserId}`]: receiverName,
          updatedAt: serverTimestamp()
        });
      } else {
        // إنشاء محادثة جديدة
        conversationRef = doc(collection(db, 'conversations'));
        isNewConversation = true;
        console.log('إنشاء محادثة جديدة:', {
          conversationId: conversationRef.id,
          participants: [user.uid, targetUserId]
        });

        const conversationData = {
          id: conversationRef.id,
          participants: [user.uid, targetUserId],
          participantNames: {
            [user.uid]: getUserDisplayName(),
            [targetUserId]: receiverName
          },
          participantTypes: {
            [user.uid]: userData.accountType,
            [targetUserId]: targetUserType
          },
          lastMessage: message.trim(),
          lastMessageTime: serverTimestamp(),
          lastSenderId: user.uid,
          unreadCount: {
            [user.uid]: 0,
            [targetUserId]: 1
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true
        };
        batch.set(conversationRef, conversationData);
      }

      // إنشاء رسالة جديدة
      const messageRef = doc(collection(db, 'messages'));
      console.log('إنشاء رسالة جديدة:', {
        messageId: messageRef.id,
        conversationId: conversationRef.id,
        sender: getUserDisplayName(),
        receiver: receiverName
      });

      const messageData = {
        id: messageRef.id,
        conversationId: conversationRef.id,
        senderId: user.uid,
        receiverId: targetUserId,
        senderName: getUserDisplayName(),
        receiverName: receiverName,
        senderType: userData.accountType,
        receiverType: targetUserType,
        subject: subject.trim() || null,
        message: message.trim(),
        messageType: 'text',
        timestamp: serverTimestamp(),
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      batch.set(messageRef, messageData);

      // تحديث المحادثة
      batch.update(conversationRef, {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        lastSenderId: user.uid,
        [`unreadCount.${targetUserId}`]: increment(1),
        updatedAt: serverTimestamp()
      });

      // إنشاء إشعار للمستلم
      const notificationTitle = isNewConversation ? 'رسالة جديدة' : 'رسالة جديدة في المحادثة';
      const notificationBody = `${getUserDisplayName()}: ${message.trim().substring(0, 50)}${message.length > 50 ? '...' : ''}`;
      
      await createNotification(batch, {
        userId: targetUserId,
        title: notificationTitle,
        body: notificationBody,
        type: 'message',
        senderName: getUserDisplayName(),
        senderId: user.uid,
        senderType: userData.accountType,
        link: `/dashboard/messages?conversation=${conversationRef.id}`
      });

      // تنفيذ العملية
      console.log('بدء تنفيذ العملية...');
      await batch.commit();
      console.log('تم تنفيذ العملية بنجاح');
      
      // التحقق من نجاح العملية
      const verifyConversation = await getDoc(conversationRef);
      const verifyMessage = await getDoc(messageRef);

      if (!verifyConversation.exists()) {
        throw new Error('فشل في إنشاء المحادثة');
      }

      if (!verifyMessage.exists()) {
        throw new Error('فشل في إنشاء الرسالة');
      }

      console.log('تم إرسال الرسالة بنجاح:', {
        conversationId: conversationRef.id,
        messageId: messageRef.id,
        isNewConversation,
        messageContent: message.trim().substring(0, 50) + '...'
      });

      toast.success(isNewConversation ? 'تم إنشاء المحادثة وإرسال الرسالة بنجاح' : 'تم إرسال الرسالة بنجاح');
      
      // إعادة تعيين النموذج
      setSubject('');
      setMessage('');
      setIsOpen(false);

      // التوجه لصفحة الرسائل إذا طُلب ذلك
      if (redirectToMessages) {
        const messagesPath = getMessagesPath();
        console.log('جاري التوجيه إلى:', messagesPath);
        router.push(messagesPath);
      }

    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      if (error instanceof Error) {
        console.error('تفاصيل الخطأ:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        toast.error(`حدث خطأ: ${error.message}`);
      } else {
        console.error('خطأ غير معروف:', error);
        toast.error('حدث خطأ في إرسال الرسالة');
      }

    } finally {
      setSending(false);
    }
  };

  const startNewConversation = async () => {
    if (!targetUserId || !user || !userData) return;

    setSending(true);
    try {
      // إنشاء معرف المحادثة
      const conversationId = [user.uid, targetUserId].sort().join('-');

      // البحث عن محادثة موجودة
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const existingConversation = conversationsSnapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(targetUserId);
      });

      if (existingConversation) {
        // إذا وجدت محادثة، انتقل إليها
        if (redirectToMessages) {
          const messagesPath = getMessagesPath();
          router.push(messagesPath);
        }
        return;
      }

      // إنشاء محادثة جديدة
      const conversationData = {
        id: conversationId,
        participants: [user.uid, targetUserId],
        participantNames: {
          [user.uid]: getUserDisplayName(),
          [targetUserId]: targetUserName
        },
        participantTypes: {
          [user.uid]: userData.accountType,
          [targetUserId]: targetUserType
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastSenderId: '',
        unreadCount: {
          [user.uid]: 0,
          [targetUserId]: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      await addDoc(collection(db, 'conversations'), conversationData);

      toast.success('تم إنشاء المحادثة بنجاح');
      
      if (redirectToMessages) {
        const messagesPath = getMessagesPath();
        router.push(messagesPath);
      }
    } catch (error) {
      console.error('خطأ في إنشاء المحادثة:', error);
      toast.error('حدث خطأ في إنشاء المحادثة');
    } finally {
      setSending(false);
    }
  };

  const Icon = USER_TYPES[targetUserType]?.icon || MessageSquare;

  // التحقق من نوع الاستخدام وعرض الزر المناسب
  if (selectedConversation) {
    // زر إرسال في المحادثة المباشرة
    const sendMessage = async () => {
      if (!newMessage?.trim() || !selectedConversation || !user || !userData) {
        console.error('بيانات غير مكتملة:', { newMessage, selectedConversation, user, userData });
        return;
      }

      const receiverId = selectedConversation.participants.find((id: string) => id !== user.uid);
      if (!receiverId) {
        console.error('لم يتم العثور على المستلم في المحادثة:', selectedConversation);
        toast.error('لم يتم تحديد المستلم');
        return;
      }

      setSending(true);
      try {
        // تحديث أسماء المشاركين
        const receiverRef = doc(db, `${selectedConversation.participantTypes[receiverId]}s`, receiverId);
        const receiverDoc = await getDoc(receiverRef);
        const receiverData = receiverDoc.data();
        const receiverName = receiverData?.full_name || receiverData?.name || selectedConversation.participantNames[receiverId];

        const batch = writeBatch(db);

        // تحديث أسماء المشاركين في المحادثة
        const conversationRef = doc(db, 'conversations', selectedConversation.id);
        batch.update(conversationRef, {
          [`participantNames.${receiverId}`]: receiverName,
          [`participantNames.${user.uid}`]: getUserDisplayName(),
          updatedAt: serverTimestamp()
        });

        // إنشاء رسالة جديدة
        const messageRef = doc(collection(db, 'messages'));
        const messageData = {
          id: messageRef.id,
          conversationId: selectedConversation.id,
          senderId: user.uid,
          receiverId: receiverId,
          senderName: getUserDisplayName(),
          receiverName: receiverName,
          senderType: userData.accountType,
          receiverType: selectedConversation.participantTypes[receiverId],
          message: newMessage.trim(),
          messageType: 'text',
          timestamp: serverTimestamp(),
          isRead: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        batch.set(messageRef, messageData);

        // تحديث المحادثة
        batch.update(conversationRef, {
          lastMessage: newMessage.trim(),
          lastMessageTime: serverTimestamp(),
          lastSenderId: user.uid,
          [`unreadCount.${receiverId}`]: increment(1),
          updatedAt: serverTimestamp()
        });

        // إنشاء إشعار للمستلم
        await createNotification(batch, {
          userId: receiverId,
          title: 'رسالة جديدة',
          body: `${getUserDisplayName()}: ${newMessage.trim().substring(0, 50)}${newMessage.length > 50 ? '...' : ''}`,
          type: 'message',
          senderName: getUserDisplayName(),
          senderId: user.uid,
          senderType: userData.accountType,
          link: `/dashboard/messages?conversation=${selectedConversation.id}`
        });

        await batch.commit();
        
        if (onMessageSent) {
          onMessageSent();
        }
        
        if (scrollToBottom) {
          scrollToBottom();
        }

      } catch (error) {
        console.error('خطأ في إرسال الرسالة:', error);
        toast.error('حدث خطأ في إرسال الرسالة');
      } finally {
        setSending(false);
      }
    };

    return (
      <Button
        onClick={sendMessage}
        disabled={!newMessage?.trim() || sending}
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
      >
        {sending ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    );
  }

  // زر بدء محادثة جديدة في صفحة البحث
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className={`flex items-center gap-2 ${className}`}
          variant={buttonVariant}
          size={buttonSize}
          disabled={sending}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{buttonText || 'رسالة'}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5" />
            إرسال رسالة جديدة
          </DialogTitle>
          <DialogDescription>
            إرسال رسالة إلى {targetUserName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!message.trim()) {
            toast.error('يرجى كتابة رسالة');
            return;
          }
          await sendDirectMessage();
        }}>
          <div className="space-y-6">
            {/* معلومات المستقبل */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-full">
                <Icon className={`h-5 w-5 ${USER_TYPES[targetUserType]?.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{targetUserName}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{USER_TYPES[targetUserType]?.name}</span>
                  {organizationName && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">{organizationName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* موضوع الرسالة */}
            <div className="space-y-2">
              <Label htmlFor="subject">موضوع الرسالة (اختياري)</Label>
              <Input
                id="subject"
                placeholder="مثال: استفسار عن الانضمام، عرض تعاون..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* نص الرسالة */}
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={1000}
                required
              />
              <div className="text-xs text-gray-500 text-left">
                {message.length}/1000
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={sending}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={!message.trim() || sending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    إرسال
                  </div>
                )}
              </Button>
            </div>

            {/* رسالة تنبيه */}
            {redirectToMessages && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                💡 سيتم توجيهك لصفحة الرسائل بعد إرسال الرسالة لمتابعة المحادثة
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendMessageButton;
