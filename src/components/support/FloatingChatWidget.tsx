'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { usePathname } from 'next/navigation';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  Headphones,
  User,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  message: string;
  timestamp: any;
  isRead: boolean;
  attachments?: string[];
}

interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userType: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'bug_report' | 'feature_request';
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  assignedTo?: string;
  createdAt: any;
  updatedAt: any;
}

const FloatingChatWidget: React.FC = () => {
  const { user, userData } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [category, setCategory] = useState<string>('general');
  const [priority, setPriority] = useState<string>('medium');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // تحديد الصفحات التي يجب إخفاء الأيقونة منها
  const hiddenPages = [
    '/auth/login',
    '/auth/register', 
    '/admin/login',
    '/admin/login-advanced',
    '/admin/login-new',
    '/', // الصفحة الرئيسية (landing page)
    '/about',
    '/contact',
    '/privacy'
  ];

  // فحص إذا كان المسار الحالي يجب إخفاء الأيقونة منه
  const shouldHideWidget = () => {
    // إخفاء الأيقونة من الصفحات المحددة
    if (hiddenPages.includes(pathname)) return true;
    
    // إخفاء الأيقونة من جميع صفحات الأدمن
    if (pathname.startsWith('/dashboard/admin')) return true;
    
    // إخفاء الأيقونة إذا لم يكن المستخدم مُسجل
    if (!user) return true;
    
    return false;
  };

  // تحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  useEffect(() => {
    if (user) {
      loadExistingConversation();
    }
  }, [user]);

  useEffect(() => {
    if (conversation) {
      try {
        // Try the indexed query first
        const messagesQuery = query(
          collection(db, 'support_messages'),
          where('conversationId', '==', conversation.id),
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(
          messagesQuery, 
          (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as SupportMessage[];
            
            setMessages(newMessages);
            
            // Count unread messages from support
            const unread = newMessages.filter(
              msg => !msg.isRead && msg.senderId !== user?.uid
            ).length;
            setUnreadCount(unread);
            
            // Update read status
            markMessagesAsRead(newMessages);
          },
          async (error) => {
            console.warn('Index error, using fallback query:', error);
            // If index error, use simple query and sort manually
            const simpleQuery = query(
              collection(db, 'support_messages'),
              where('conversationId', '==', conversation.id)
            );

            const unsubscribeSimple = onSnapshot(
              simpleQuery,
              (snapshot) => {
                const newMessages = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as SupportMessage[];

                // Sort messages by timestamp manually
                const sortedMessages = newMessages.sort((a, b) => {
                  const timeA = a.timestamp?.toDate?.() || new Date(0);
                  const timeB = b.timestamp?.toDate?.() || new Date(0);
                  return timeA.getTime() - timeB.getTime();
                });
                
                setMessages(sortedMessages);
                
                // Count unread messages
                const unread = sortedMessages.filter(
                  msg => !msg.isRead && msg.senderId !== user?.uid
                ).length;
                setUnreadCount(unread);
                
                // Update read status
                markMessagesAsRead(sortedMessages);
              },
              (fallbackError) => {
                console.error('Fallback query failed:', fallbackError);
                // Load messages manually as last resort
                loadMessagesManually();
              }
            );

            return () => unsubscribeSimple();
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up message listener:', error);
        // Load messages manually as last resort
        loadMessagesManually();
      }
    }
  }, [conversation, user]);

  // دالة بديلة لتحميل الرسائل يدوياً
  const loadMessagesManually = async () => {
    if (!conversation) return;
    
    try {
      const messagesRef = collection(db, 'support_messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversation.id)
      );
      
      const snapshot = await getDocs(q);
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportMessage[];
      
      // ترتيب الرسائل حسب الوقت محلياً
      const sortedMessages = allMessages.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime();
      });
      
      setMessages(sortedMessages);
      
      // حساب الرسائل غير المقروءة
      const unread = sortedMessages.filter(
        msg => !msg.isRead && msg.senderId !== user?.uid
      ).length;
      setUnreadCount(unread);
      
      // تحديث حالة القراءة
      markMessagesAsRead(sortedMessages);
    } catch (error) {
      console.error('خطأ في تحميل الرسائل يدوياً:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadExistingConversation = async () => {
    try {
      // استعلام بسيط جداً بدون أي فلاتر معقدة
      const conversationsRef = collection(db, 'support_conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', user!.uid)
        // إزالة orderBy لتجنب خطأ الفهرس
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // البحث عن محادثة نشطة وترتيب النتائج محلياً
        const allConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SupportConversation[];
        
        // ترتيب محلي حسب updatedAt
        const sortedConversations = allConversations.sort((a, b) => {
          if (!a.updatedAt || !b.updatedAt) return 0;
          return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime();
        });
        
        // البحث عن محادثة نشطة
        const activeConversation = sortedConversations.find(conv => 
          conv.status === 'open' || conv.status === 'in_progress'
        );
        
        if (activeConversation) {
          setConversation(activeConversation);
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل المحادثة:', error);
      // في حالة فشل الاستعلام، لا نعرض خطأ للمستخدم
      // سيتمكن من إنشاء محادثة جديدة
    }
  };

  const createNewConversation = async () => {
    if (!user || !userData) return;

    setLoading(true);
    try {
      const newConversation = {
        userId: user.uid,
        userName: userData.name || userData.displayName || 'مستخدم',
        userType: userData.accountType || 'player',
        status: 'open',
        priority: priority,
        category: category,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const conversationRef = await addDoc(collection(db, 'support_conversations'), newConversation);
      
      setConversation({
        id: conversationRef.id,
        ...newConversation
      } as SupportConversation);

      // إرسال رسالة ترحيبية
      await sendWelcomeMessage(conversationRef.id);
      
      toast.success('تم إنشاء محادثة دعم فني جديدة');
    } catch (error) {
      console.error('خطأ في إنشاء المحادثة:', error);
      toast.error('فشل في إنشاء محادثة الدعم');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeMessage = async (conversationId: string) => {
    const welcomeMessage = {
      conversationId,
      senderId: 'system',
      senderName: 'نظام الدعم الفني',
      senderType: 'system',
      message: 'مرحباً بك في الدعم الفني لـ El7hm! 👋\n\nكيف يمكننا مساعدتك اليوم؟ فريق الدعم سيرد عليك في أقرب وقت ممكن.',
      timestamp: serverTimestamp(),
      isRead: true
    };

    await addDoc(collection(db, 'support_messages'), welcomeMessage);
  };

  const sendMessage = async () => {
    if (!message.trim() || !user || !userData) return;

    // إنشاء محادثة جديدة إذا لم تكن موجودة
    if (!conversation) {
      await createNewConversation();
      return;
    }

    setLoading(true);
    try {
      const newMessage = {
        conversationId: conversation.id,
        senderId: user.uid,
        senderName: userData.name || userData.displayName || 'مستخدم',
        senderType: userData.accountType || 'player',
        message: message.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      };

      await addDoc(collection(db, 'support_messages'), newMessage);

      // تحديث المحادثة
      await updateDoc(doc(db, 'support_conversations', conversation.id), {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: conversation.status === 'resolved' ? 'open' : conversation.status
      });

      setMessage('');
      toast.success('تم إرسال الرسالة');
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
      toast.error('فشل في إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (msgs: SupportMessage[]) => {
    const unreadMessages = msgs.filter(msg => !msg.isRead && msg.senderId !== user?.uid);
    
    for (const msg of unreadMessages) {
      try {
        await updateDoc(doc(db, 'support_messages', msg.id), {
          isRead: true
        });
      } catch (error) {
        console.error('خطأ في تحديث حالة القراءة:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // إخفاء الأيقونة في الصفحات المحددة
  if (shouldHideWidget()) {
    return null;
  }

  return (
    <>
      {/* أيقونة عائمة */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            size="icon"
          >
            <div className="relative">
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </div>
          </Button>
        </div>
      )}

      {/* نافذة الدردشة */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          }`}
        >
          {/* شريط العنوان */}
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              <span className="font-semibold">الدعم الفني</span>
              {conversation && (
                <Badge 
                  className={`${getStatusColor(conversation.status)} text-white text-xs`}
                >
                  {conversation.status === 'open' && 'مفتوحة'}
                  {conversation.status === 'in_progress' && 'قيد المعالجة'}
                  {conversation.status === 'resolved' && 'محلولة'}
                  {conversation.status === 'closed' && 'مغلقة'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-700"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* منطقة الرسائل */}
              <div className="flex-1 p-4 h-80 overflow-y-auto bg-gray-50">
                {!conversation ? (
                  // نموذج بدء محادثة جديدة
                  <div className="space-y-4">
                    <div className="text-center">
                      <Headphones className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                      <h3 className="font-semibold text-gray-800">كيف يمكننا مساعدتك؟</h3>
                      <p className="text-sm text-gray-600">اختر نوع المشكلة والأولوية</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        نوع المشكلة:
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      >
                        <option value="general">استفسار عام</option>
                        <option value="technical">مشكلة تقنية</option>
                        <option value="billing">مشكلة مالية</option>
                        <option value="bug_report">بلاغ عن خطأ</option>
                        <option value="feature_request">طلب ميزة جديدة</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الأولوية:
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                      >
                        <option value="low">منخفضة</option>
                        <option value="medium">متوسطة</option>
                        <option value="high">عالية</option>
                        <option value="urgent">عاجلة</option>
                      </select>
                    </div>

                    <Button
                      onClick={createNewConversation}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? 'جاري البدء...' : 'بدء محادثة جديدة'}
                    </Button>
                  </div>
                ) : (
                  // عرض الرسائل
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.senderId === user.uid
                              ? 'bg-blue-600 text-white'
                              : msg.senderId === 'system'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          {msg.senderId !== user.uid && msg.senderId !== 'system' && (
                            <div className="flex items-center gap-1 mb-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">{msg.senderName}</span>
                              <Badge variant="outline" className="text-xs">
                                دعم فني
                              </Badge>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 opacity-60" />
                              <span className="text-xs opacity-60">
                                {msg.timestamp && formatDistanceToNow(msg.timestamp.toDate(), { 
                                  addSuffix: true, 
                                  locale: ar 
                                })}
                              </span>
                            </div>
                            {msg.senderId === user.uid && (
                              <CheckCircle className={`h-3 w-3 ${msg.isRead ? 'text-green-400' : 'opacity-40'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* منطقة إدخال الرسالة */}
              {conversation && (
                <div className="p-4 border-t bg-white rounded-b-lg">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="اكتب رسالتك هنا..."
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || loading}
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  {conversation.status === 'resolved' && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ تم حل هذه المشكلة. إرسال رسالة جديدة سيعيد فتح التذكرة.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;
