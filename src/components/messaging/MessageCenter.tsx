'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  writeBatch,
  getDoc,
  setDoc,
  deleteDoc,
  limit,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  Phone,
  Circle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Smile,
  Shield,
  Eye,
  User,
  UserCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import SendMessageButton from './SendMessageButton';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderType: string;
  receiverType: string;
  message: string;
  timestamp: any;
  isRead: boolean;
  messageType: 'text';
  senderAvatar?: string;
  deliveryStatus: 'sending' | 'sent';
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantTypes: Record<string, string>;
  subject: string;
  lastMessage: string;
  lastMessageTime: any;
  lastSenderId: string;
  unreadCount: Record<string, number>;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
}

interface Contact {
  id: string;
  name: string;
  type: 'club' | 'player' | 'agent' | 'academy' | 'trainer' | 'admin';
  avatar?: string | null;
  isOnline: boolean;
  organizationId?: string | null;
  organizationName?: string | null;
  organizationType?: string | null;
  isIndependent?: boolean;
  playerData?: any;
  trainerData?: any;
  agentData?: any;
}

const USER_TYPES = {
  club: { name: 'نادي', icon: Building2, color: 'text-green-600' },
  academy: { name: 'أكاديمية', icon: GraduationCap, color: 'text-purple-600' },
  trainer: { name: 'مدرب', icon: UserCheck, color: 'text-blue-600' },
  agent: { name: 'وكيل', icon: Phone, color: 'text-orange-600' },
  player: { name: 'لاعب', icon: Users, color: 'text-gray-600' },
  admin: { name: 'مشرف', icon: Shield, color: 'text-red-600' }
};

const MessageCenter: React.FC = () => {
  console.log('🚀 MessageCenter component is rendering');
  const { user, userData } = useAuth();
  console.log('👤 User data:', { user: user?.uid, userData });
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    conversations: true,
    messages: false,
    contacts: false,
    sending: false
  });
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // تعريف دالة التمرير للأسفل
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // تحسين استعلامات Firestore
  const COLLECTION_NAMES = {
    MESSAGES: 'messages',
    CONVERSATIONS: 'conversations',
    SUPPORT_CONVERSATIONS: 'support_conversations',
    SUPPORT_MESSAGES: 'support_messages',
    PLAYERS: 'players',
    CLUBS: 'clubs',
    ACADEMIES: 'academies',
    AGENTS: 'agents',
    TRAINERS: 'trainers',
    ADMINS: 'admins'
  } as const;

  // تعريف الحقول الموحدة
  const FIELD_NAMES = {
    ORGANIZATION_ID: 'organizationId', // حقل موحد للمؤسسات
    CREATED_AT: 'createdAt',          // حقل موحد للتواريخ
    NAME: 'name',                     // حقل موحد للأسماء
    IS_ACTIVE: 'isActive',            // حقل موحد للحالة
    ORGANIZATION_TYPE: 'organizationType', // حقل موحد لنوع المؤسسة
    TIMESTAMP: 'timestamp',
    CONVERSATION_ID: 'conversationId'
  } as const;

  // تحسين معالجة الأخطاء
  const handleError = (error: any, context: string) => {
    console.error(`❌ خطأ في ${context}:`, error);
    
    // تحليل نوع الخطأ
    let errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
    
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء.';
          break;
        case 'not-found':
          errorMessage = 'لم يتم العثور على البيانات المطلوبة.';
          break;
        case 'failed-precondition':
          if (error.message.includes('index')) {
            errorMessage = 'جاري تحديث النظام، يرجى المحاولة بعد قليل.';
          }
          break;
        case 'resource-exhausted':
          errorMessage = 'تم تجاوز حد الاستخدام، يرجى المحاولة لاحقاً.';
          break;
        case 'cancelled':
          errorMessage = 'تم إلغاء العملية.';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
      }
    }

    setError(errorMessage);
    toast.error(errorMessage);

    // إعادة المحاولة في حالات معينة
    if (error.code === 'failed-precondition' && retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // إعادة تحميل البيانات
        if (context === 'جلب المحادثات') {
          fetchConversations();
        } else if (context === 'جلب الرسائل') {
          fetchMessages();
        }
      }, RETRY_DELAY);
    }
  };

  // تحسين إدارة الإشعارات
  useEffect(() => {
    if (!user || !userData) return;

    const handleNewMessage = async (message: Message) => {
      try {
        // تحديث عداد الرسائل غير المقروءة
        if (message.receiverId === user.uid && !message.isRead) {
          // تحديث الإشعارات المحلية
          toast.info(`رسالة جديدة من ${message.senderName}`, {
            description: message.message.substring(0, 50) + (message.message.length > 50 ? '...' : ''),
            action: {
              label: 'عرض',
              onClick: () => {
                // العثور على المحادثة وفتحها
                const conversation = conversations.find(c => c.id === message.conversationId);
                if (conversation) {
                  setSelectedConversation(conversation);
                }
              }
            }
          });
        }
      } catch (error) {
        console.error('خطأ في معالجة الإشعارات:', error);
      }
    };

    let unsubscribe: () => void;

    const setupNotificationsListener = async () => {
      try {
        // استخدام استعلام بسيط لا يحتاج إلى فهرس مركب
        const simpleQuery = query(
          collection(db, COLLECTION_NAMES.MESSAGES),
          where('receiverId', '==', user.uid),
          where('isRead', '==', false),
          limit(10) // تحديد عدد النتائج لتحسين الأداء
        );

        unsubscribe = onSnapshot(
          simpleQuery,
          {
            next: (snapshot) => {
              const changes = snapshot.docChanges();
              // معالجة التغييرات الجديدة فقط
              changes
                .filter(change => change.type === 'added')
                .sort((a, b) => {
                  const timeA = a.doc.data().timestamp?.toMillis() || 0;
                  const timeB = b.doc.data().timestamp?.toMillis() || 0;
                  return timeB - timeA; // ترتيب تنازلي
                })
                .slice(0, 1) // أخذ أحدث رسالة فقط
                .forEach(change => {
                  const newMessage = {
                    id: change.doc.id,
                    ...change.doc.data()
                  } as Message;
                  handleNewMessage(newMessage);
                });
            },
            error: (error) => {
              console.error('خطأ في مراقب الإشعارات:', error);
              toast.error('حدث خطأ في نظام الإشعارات');
            }
          }
        );
      } catch (error) {
        console.error('خطأ في إعداد مراقب الإشعارات:', error);
        toast.error('تعذر إعداد نظام الإشعارات');
      }
    };

    setupNotificationsListener();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid, userData, conversations]);

  // تحسين التعامل مع حالة عدم الاتصال
  useEffect(() => {
    const handleConnectionChange = () => {
      const isOnline = navigator.onLine;
      setConnectionError(!isOnline);
      
      if (isOnline) {
        toast.success('تم استعادة الاتصال');
        // إعادة تحميل البيانات
        fetchConversations();
        if (selectedConversation) {
          fetchMessages();
        }
      } else {
        toast.error('انقطع الاتصال بالإنترنت');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleConnectionChange);
      window.addEventListener('offline', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleConnectionChange);
        window.removeEventListener('offline', handleConnectionChange);
      };
    }
  }, [selectedConversation]);

  // تحسين جلب المحادثات
  useEffect(() => {
    console.log('🔄 useEffect for conversations triggered');
    console.log('👤 User:', user);
    console.log('📊 UserData:', userData);
    
    if (!user || !userData) {
      console.log('❌ لا يوجد مستخدم أو بيانات مستخدم');
      return;
    }

    console.log('✅ User and userData are available, starting fetchInitialData');
    let unsubscribe: (() => void) | null = null;
    setLoading(true);

    const fetchInitialData = async () => {
      if (!user || !userData) {
        console.log('❌ لا يمكن جلب البيانات: المستخدم أو البيانات غير متوفرة');
        return;
      }

      console.log('🔄 بدء جلب البيانات الأولية...');
      console.log('👤 User ID:', user.uid);
      console.log('📊 UserData:', userData);

      try {
        // جلب المحادثات العادية
        const conversationsRef = collection(db, COLLECTION_NAMES.CONVERSATIONS);
        const baseQuery = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid)
        );

        console.log('📋 جاري استعلام المحادثات العادية...');
        const snapshot = await getDocs(baseQuery);
        
        console.log('📊 عدد المحادثات العادية:', snapshot.size);
        
        let conversationsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            lastMessageTime: data.lastMessageTime?.toDate() || null,
            updatedAt: data.updatedAt?.toDate() || null,
            createdAt: data.createdAt?.toDate() || null
          };
        }) as Conversation[];

        // جلب محادثات الدعم الفني
        const supportConversationsRef = collection(db, COLLECTION_NAMES.SUPPORT_CONVERSATIONS);
        const supportQuery = query(
          supportConversationsRef,
          where('userId', '==', user.uid)
        );

        console.log('📋 جاري استعلام محادثات الدعم الفني...');
        const supportSnapshot = await getDocs(supportQuery);
        
        console.log('📊 عدد محادثات الدعم الفني:', supportSnapshot.size);
        
        const supportConversationsData = supportSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            participants: [data.userId, 'system'],
            participantNames: {
              [data.userId]: data.userName || 'مستخدم',
              'system': 'نظام الدعم الفني'
            },
            participantTypes: {
              [data.userId]: data.userType || 'player',
              'system': 'system'
            },
            subject: `دعم فني - ${data.category || 'عام'}`,
            lastMessage: data.lastMessage || '',
            lastMessageTime: data.lastMessageTime?.toDate() || null,
            lastSenderId: data.lastSenderId || '',
            unreadCount: {
              [data.userId]: data.unreadCount || 0
            },
            isActive: data.status === 'open' || data.status === 'in_progress',
            createdAt: data.createdAt?.toDate() || null,
            updatedAt: data.updatedAt?.toDate() || null
          };
        }) as Conversation[];

        // دمج المحادثات
        const allConversations = [...conversationsData, ...supportConversationsData];
        
        console.log('📝 جميع المحادثات المحملة:', allConversations);

        // ترتيب المحادثات
        const sortedConversations = allConversations.sort((a, b) => {
          const timeA = a.updatedAt || a.createdAt || new Date(0);
          const timeB = b.updatedAt || b.createdAt || new Date(0);
          return timeB.getTime() - timeA.getTime();
        });

        // إزالة المحادثات المكررة
        const uniqueConversations = sortedConversations.filter((conversation, index, self) => 
          index === self.findIndex(c => c.id === conversation.id)
        );

        console.log('✅ تم تحميل المحادثات بنجاح:', uniqueConversations.length);
        setConversations(uniqueConversations);
        setLoading(false);

        // إعداد المراقب بعد نجاح الجلب الأولي
        unsubscribe = onSnapshot(
          baseQuery,
          {
            next: (realtimeSnapshot) => {
              console.log('🔄 تحديث فوري للمحادثات:', realtimeSnapshot.size);
              const updatedData = realtimeSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  lastMessageTime: data.lastMessageTime?.toDate() || null,
                  updatedAt: data.updatedAt?.toDate() || null,
                  createdAt: data.createdAt?.toDate() || null
                };
              }) as Conversation[];

              const sortedUpdates = updatedData.sort((a, b) => {
                const timeA = a.updatedAt || a.createdAt || new Date(0);
                const timeB = b.updatedAt || b.createdAt || new Date(0);
                return timeB.getTime() - timeA.getTime();
              });

              // إزالة المحادثات المكررة في التحديثات الفورية
              const uniqueUpdates = sortedUpdates.filter((conversation, index, self) => 
                index === self.findIndex(c => c.id === conversation.id)
              );

              setConversations(uniqueUpdates);
            },
            error: (error) => {
              console.error('❌ خطأ في مراقب المحادثات:', error);
              // في حالة الخطأ، نحتفظ بآخر بيانات تم تحميلها
              // ونحاول إعادة إنشاء المراقب بعد فترة
              setTimeout(fetchInitialData, 5000);
            }
          }
        );
      } catch (error) {
        console.error('❌ خطأ في جلب المحادثات:', error);
        setLoading(false);
        // محاولة إعادة الاتصال في حالة الفشل
        setTimeout(fetchInitialData, 5000);
      }
    };

    fetchInitialData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, userData]);

  // تحسين جلب الرسائل
  useEffect(() => {
    if (!selectedConversation || !user) {
      setMessages([]);
      return;
    }

    let unsubscribe: () => void;

    const setupMessagesListener = async () => {
      if (!selectedConversation || !user) {
        console.log('❌ لا يمكن إعداد مراقب الرسائل: المحادثة أو المستخدم غير متوفر');
        return;
      }

      console.log('🔄 بدء إعداد مراقب الرسائل...');
      console.log('📝 Conversation ID:', selectedConversation.id);
      console.log('👤 User ID:', user.uid);

      try {
        // تحديد مجموعة الرسائل حسب نوع المحادثة
        const isSupportConversation = selectedConversation.participants.includes('system');
        const messagesCollection = isSupportConversation ? COLLECTION_NAMES.SUPPORT_MESSAGES : COLLECTION_NAMES.MESSAGES;
        
        console.log('📋 مجموعة الرسائل:', messagesCollection);
        console.log('🔍 نوع المحادثة:', isSupportConversation ? 'دعم فني' : 'عادية');

        const messagesRef = collection(db, messagesCollection);
        
        // استخدام استعلام بسيط لا يحتاج فهرس مركب
        const messagesQuery = query(
          messagesRef,
          where(FIELD_NAMES.CONVERSATION_ID, '==', selectedConversation.id),
          orderBy('timestamp', 'asc')
        );

        console.log('📋 جاري استعلام الرسائل...');

        unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
          try {
            console.log('📊 عدد الرسائل المحملة:', snapshot.size);
            
            const messagesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate() || new Date(),
              createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as Message[];

            console.log('📝 الرسائل المحملة:', messagesData);

            // تحديث حالة القراءة للرسائل غير المقروءة
            if (userData?.accountType !== 'admin') {
              const unreadMessages = messagesData.filter(msg => 
                !msg.isRead && 
                msg.receiverId === user.uid
              );

              console.log('📖 الرسائل غير المقروءة:', unreadMessages.length);

              if (unreadMessages.length > 0) {
                const batch = writeBatch(db);
                
                // تحديث المحادثة
                const conversationCollection = isSupportConversation ? COLLECTION_NAMES.SUPPORT_CONVERSATIONS : COLLECTION_NAMES.CONVERSATIONS;
                batch.update(doc(db, conversationCollection, selectedConversation.id), {
                  [`unreadCount.${user.uid}`]: 0,
                  updatedAt: serverTimestamp()
                });

                // تحديث الرسائل غير المقروءة
                for (const msg of unreadMessages) {
                  batch.update(doc(messagesRef, msg.id), {
                    isRead: true,
                    readAt: serverTimestamp()
                  });
                }

                try {
                  await batch.commit();
                  console.log('✅ تم تحديث حالة القراءة بنجاح');
                } catch (error) {
                  console.error('❌ خطأ في تحديث حالة القراءة:', error);
                  handleError(error, 'تحديث حالة القراءة');
                }
              }
            }

            setMessages(messagesData);
            console.log('✅ تم تحديث الرسائل بنجاح');
          } catch (error) {
            console.error('❌ خطأ في معالجة الرسائل:', error);
            handleError(error, 'معالجة الرسائل');
          }
        }, (error) => {
          // تجاهل أخطاء الفهرس قيد الإنشاء
          if (error.code === 'failed-precondition' && error.message.includes('index is currently building')) {
            console.warn('⚠️ Index is still building, using fallback query');
            return;
          }
          console.error('❌ خطأ في مراقبة الرسائل:', error);
          handleError(error, 'مراقبة الرسائل');
        });
      } catch (error) {
        console.error('❌ خطأ في إعداد المراقب:', error);
        handleError(error, 'إعداد المراقب');
      }
    };

    setupMessagesListener();
    return () => unsubscribe?.();
  }, [selectedConversation?.id, user?.uid, userData?.accountType]);

  // تحسين عرض الرسائل غير المقروءة
  const unreadCount = useMemo(() => {
    if (!selectedConversation || !user) return 0;
    return messages.filter(msg => !msg.isRead && msg.receiverId === user.uid).length;
  }, [messages, selectedConversation, user]);

  // التمرير التلقائي للرسائل الجديدة
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // تحسين جلب جهات الاتصال
  const fetchContacts = async () => {
    console.log('🚀 fetchContacts function called');
    console.log('👤 User in fetchContacts:', user);
    console.log('📊 UserData in fetchContacts:', userData);
    
    if (!user || !userData) {
      console.log('❌ No user or userData in fetchContacts, returning early');
      return;
    }

    try {
      console.log('بدء جلب جهات الاتصال...');
      const contactsData: Contact[] = [];

      // تحديد جهات الاتصال المسموح بها حسب نوع الحساب
      const allowedContactTypes = {
        player: ['club', 'academy', 'agent', 'trainer', 'player'],
        club: ['player', 'agent', 'trainer', 'club', 'academy'],
        academy: ['player', 'agent', 'trainer', 'club', 'academy'],
        agent: ['player', 'club', 'academy', 'trainer', 'agent'],
        trainer: ['player', 'club', 'academy', 'agent', 'trainer'],
        admin: ['player', 'club', 'academy', 'agent', 'trainer', 'admin']
      };

      const currentUserType = userData.accountType as keyof typeof allowedContactTypes;
      const allowedTypes = allowedContactTypes[currentUserType] || [];

      console.log('نوع الحساب الحالي:', currentUserType);
      console.log('الأنواع المسموح بها:', allowedTypes);

      // جلب المشرفين
      if (allowedTypes.includes('admin')) {
        console.log('جلب المشرفين...');
        const adminsQuery = query(collection(db, 'admins'));
        const adminsSnapshot = await getDocs(adminsQuery);
        adminsSnapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            const adminData = doc.data();
            contactsData.push({
              id: doc.id,
              name: adminData.full_name || adminData.name || 'مدير النظام',
              type: 'admin',
              avatar: adminData.avatar || null,
              isOnline: false,
              organizationName: 'إدارة النظام'
            });
          }
        });
      }

      // جلب الأندية
      if (allowedTypes.includes('club')) {
        console.log('جلب الأندية...');
        const clubsQuery = query(collection(db, 'clubs'));
        const clubsSnapshot = await getDocs(clubsQuery);
        clubsSnapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            const clubData = doc.data();
            contactsData.push({
              id: doc.id,
              name: clubData.name || 'نادي',
              type: 'club',
              avatar: clubData.logo || null,
              isOnline: false,
              organizationName: clubData.name
            });
          }
        });
      }

      // جلب الأكاديميات
      if (allowedTypes.includes('academy')) {
        console.log('جلب الأكاديميات...');
        const academiesQuery = query(collection(db, 'academies'));
        const academiesSnapshot = await getDocs(academiesQuery);
        academiesSnapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            const academyData = doc.data();
            contactsData.push({
              id: doc.id,
              name: academyData.name || 'أكاديمية',
              type: 'academy',
              avatar: academyData.logo || null,
              isOnline: false,
              organizationName: academyData.name
            });
          }
        });
      }

      // جلب الوكلاء
      if (allowedTypes.includes('agent')) {
        console.log('جلب الوكلاء...');
        const agentsQuery = query(collection(db, 'agents'));
        const agentsSnapshot = await getDocs(agentsQuery);
        agentsSnapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            const agentData = doc.data();
            contactsData.push({
              id: doc.id,
              name: agentData.full_name || 'وكيل',
              type: 'agent',
              avatar: agentData.profile_photo || null,
              isOnline: false,
              agentData: agentData
            });
          }
        });
      }

      // جلب المدربين
      if (allowedTypes.includes('trainer')) {
        console.log('جلب المدربين...');
        const trainersQuery = query(collection(db, 'trainers'));
        const trainersSnapshot = await getDocs(trainersQuery);
        trainersSnapshot.forEach(doc => {
          if (doc.id !== user.uid) {
            const trainerData = doc.data();
            contactsData.push({
              id: doc.id,
              name: trainerData.full_name || 'مدرب',
              type: 'trainer',
              avatar: trainerData.profile_photo || null,
              isOnline: false,
              trainerData: trainerData
            });
          }
        });
      }

      // جلب اللاعبين
      if (allowedTypes.includes('player')) {
        console.log('جلب اللاعبين...');
        const playersQuery = query(collection(db, 'players'));
        const playersSnapshot = await getDocs(playersQuery);
        
        for (const doc of playersSnapshot.docs) {
          if (doc.id !== user.uid) {
            const playerData = doc.data();
            let playerName = '';

            // محاولة الحصول على الاسم الكامل بعدة طرق
            if (playerData.full_name && playerData.full_name !== 'undefined undefined' && playerData.full_name !== 'لاعب') {
              playerName = playerData.full_name;
            } else if (playerData.firstName && playerData.lastName) {
              const fullName = `${playerData.firstName} ${playerData.lastName}`.trim();
              if (fullName !== 'undefined undefined' && fullName !== 'لاعب') {
                playerName = fullName;
              }
            } else if (playerData.name && playerData.name !== 'لاعب' && playerData.name !== 'undefined undefined') {
              playerName = playerData.name;
            } else {
              console.warn('لاعب بدون اسم صالح:', doc.id);
              continue;
            }

            // التأكد من أن الاسم ليس فارغاً
            if (!playerName.trim()) {
              console.warn('تم تخطي لاعب بسبب اسم فارغ:', doc.id);
              continue;
            }

            contactsData.push({
              id: doc.id,
              name: playerName,
              type: 'player',
              avatar: playerData.profile_photo || null,
              isOnline: false,
              playerData: {
                ...playerData,
                displayName: playerName
              }
            });
          }
        }
      }

      // ترتيب جهات الاتصال
      const sortedContacts = contactsData.sort((a, b) => {
        if (a.type !== b.type) {
          const typeOrder = ['player', 'club', 'academy', 'agent', 'trainer', 'admin'];
          return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
        }
        return a.name.localeCompare(b.name, 'ar');
      });

      // تصفية المشرفين
      const filteredContacts = userData.accountType !== 'admin' 
        ? sortedContacts.filter(contact => contact.type !== 'admin')
        : sortedContacts;

      console.log('تم جلب عدد جهات الاتصال:', filteredContacts.length);
      console.log('📝 تفاصيل جهات الاتصال:', filteredContacts.map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        organizationName: c.organizationName
      })));
      setContacts(filteredContacts);
      console.log('✅ تم تحديث حالة جهات الاتصال بنجاح');

    } catch (error) {
      console.error('خطأ في جلب جهات الاتصال:', error);
      handleError(error, 'جلب جهات الاتصال');
    }
  };

  // استدعاء جلب جهات الاتصال عند تحميل المكون
  useEffect(() => {
    console.log('🔄 useEffect for fetchContacts triggered');
    console.log('👤 User in fetchContacts useEffect:', user);
    console.log('📊 UserData in fetchContacts useEffect:', userData);
    
    if (user && userData) {
      console.log('✅ User and userData are available, calling fetchContacts');
      fetchContacts();
    } else {
      console.log('❌ User or userData not available in fetchContacts useEffect');
    }
  }, [user, userData]);

  // دالة الحصول على اسم المستخدم
  const getUserDisplayName = (userId: string, userType: string, userData: any) => {
    if (!userData) return 'مستخدم غير معروف';
    
    // Handle player names with special care
    if (userType === 'player') {
      const fullName = [
        userData.firstName,
        userData.middleName,
        userData.lastName
      ].filter(Boolean).join(' ');
      return fullName || userData.name || 'لاعب';
    }

    // For organizations, use organization name if available
    if (['club', 'academy', 'agent'].includes(userType) && userData.organizationName) {
      return userData.organizationName;
    }

    // For trainers, use full name if available
    if (userType === 'trainer') {
      const fullName = [
        userData.firstName,
        userData.lastName
      ].filter(Boolean).join(' ');
      return fullName || userData.name || 'مدرب';
    }

    // Fallback to name field or type-specific default
    return userData.name || USER_TYPES[userType as keyof typeof USER_TYPES]?.name || 'مستخدم';
  };

  // تحسين عرض اسم المستخدم في المحادثة
  const getParticipantDisplayName = (participantId: string, conversation: Conversation) => {
    // البحث عن معلومات المستخدم في قائمة جهات الاتصال
    const contact = contacts.find(c => c.id === participantId);
    if (contact) {
      if (contact.type === 'player' && contact.playerData) {
        return getUserDisplayName(participantId, 'player', contact.playerData);
      }
      // Make sure contact.name is valid before using it
      if (contact.name && contact.name !== 'لاعب' && contact.name !== 'undefined undefined') {
        return contact.name;
      }
      // If contact.name is not valid, try to get a name based on the contact type
      return getUserDisplayName(participantId, contact.type, contact);
    }

    // إذا لم نجد في جهات الاتصال، نستخدم الاسم المخزن في المحادثة
    const storedName = conversation.participantNames[participantId];
    if (storedName && storedName !== 'لاعب' && storedName !== 'undefined undefined') {
      return storedName;
    }

    // If no valid name is found, return a more descriptive default
    const userType = conversation.participantTypes[participantId];
    return `${USER_TYPES[userType as keyof typeof USER_TYPES]?.name || 'مستخدم'} ${participantId.substring(0, 4)}`;
  };

  // إضافة مستمع لإغلاق منتقي الإيموجي عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // دالة إضافة الإيموجي للرسالة
  const onEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = (document.querySelector('input[type="text"]') as HTMLInputElement)?.selectionStart || newMessage.length;
    const updatedMessage = newMessage.slice(0, cursorPosition) + emoji + newMessage.slice(cursorPosition);
    setNewMessage(updatedMessage);
    setShowEmojiPicker(false);
  };

  // تحسين عرض المحادثات
  const renderConversationView = () => {
    if (!selectedConversation || !user || !userData) return null;

    const otherParticipantId = selectedConversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return null;

    const contact = contacts.find(c => c.id === otherParticipantId);
    const userType = selectedConversation.participantTypes[otherParticipantId];
    const UserTypeIcon = USER_TYPES[userType as keyof typeof USER_TYPES]?.icon || User;

    // استخدام الاسم المحسن
    const participantName = getParticipantDisplayName(otherParticipantId, selectedConversation);

    return (
      <div className="flex flex-col h-full">
        {/* رأس المحادثة */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {contact?.avatar ? (
                <AvatarImage src={contact.avatar} alt={participantName} />
              ) : (
                <AvatarFallback>
                  <UserTypeIcon className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {participantName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={USER_TYPES[userType as keyof typeof USER_TYPES]?.color || 'bg-gray-100'}>
                  {USER_TYPES[userType as keyof typeof USER_TYPES]?.name || 'مستخدم'}
                </Badge>
                {contact?.organizationName && (
                  <span className="text-sm text-gray-500">
                    {contact.organizationName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* منطقة الرسائل */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* منطقة إدخال الرسالة */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="اكتب رسالتك..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        // إرسال الرسالة مباشرة
                        const sendMessage = async () => {
                          if (!newMessage.trim() || !selectedConversation || !user || !userData) {
                            return;
                          }

                          try {
                            const messageData = {
                              conversationId: selectedConversation.id,
                              senderId: user.uid,
                              receiverId: selectedConversation.participants.find(p => p !== user.uid) || '',
                              senderName: getUserDisplayName(user.uid, userData.accountType, userData),
                              receiverName: getParticipantDisplayName(selectedConversation.participants.find(p => p !== user.uid) || '', selectedConversation),
                              senderType: userData.accountType,
                              receiverType: selectedConversation.participantTypes[selectedConversation.participants.find(p => p !== user.uid) || ''] || 'player',
                              message: newMessage.trim(),
                              messageType: 'text' as const,
                              timestamp: serverTimestamp(),
                              isRead: false,
                              createdAt: serverTimestamp(),
                              updatedAt: serverTimestamp()
                            };

                            await addDoc(collection(db, 'messages'), messageData);

                            // تحديث المحادثة
                            await updateDoc(doc(db, 'conversations', selectedConversation.id), {
                              lastMessage: newMessage.trim(),
                              lastMessageTime: serverTimestamp(),
                              lastSenderId: user.uid,
                              [`unreadCount.${selectedConversation.participants.find(p => p !== user.uid) || ''}`]: increment(1),
                              updatedAt: serverTimestamp()
                            });

                            setNewMessage('');
                            toast.success('تم إرسال الرسالة');
                          } catch (error) {
                            console.error('خطأ في إرسال الرسالة:', error);
                            toast.error('فشل في إرسال الرسالة');
                          }
                        };

                        sendMessage();
                      }
                    }
                  }}
                className="pr-12"
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <div className="relative" ref={emojiPickerRef}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="hover:bg-gray-100 rounded-full p-1"
                  >
                    <Smile className="h-5 w-5 text-gray-500" />
                  </Button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-50">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        autoFocusSearch={false}
                        lazyLoadEmojis={true}
                        searchPlaceHolder="بحث عن إيموجي..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <SendMessageButton
              newMessage={newMessage}
              selectedConversation={selectedConversation}
              user={user}
              userData={userData}
              getUserDisplayName={() => getUserDisplayName(user.uid, userData.accountType, userData)}
              scrollToBottom={scrollToBottom}
            />
          </div>
        </div>
      </div>
    );
  };

  // تنسيق وقت الرسالة
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate || typeof timestamp.toDate !== 'function') {
      return '';
    }

    try {
      const date = timestamp.toDate();
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }

      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

      // إذا كان اليوم نفسه
      if (diffDays === 0) {
        return date.toLocaleTimeString('ar-EG', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      // إذا كان أمس
      else if (diffDays === 1) {
        return 'أمس';
      }
      // إذا كان خلال الأسبوع
      else if (diffDays < 7) {
        return date.toLocaleDateString('ar-EG', { weekday: 'long' });
      }
      // إذا كان أقدم
      else {
        return date.toLocaleDateString('ar-EG', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (error) {
      console.error('خطأ في تنسيق التاريخ:', error);
      return '';
    }
  };

  // إضافة دالة عرض الحالة الفارغة
  const renderEmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <MessageSquare className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر محادثة</h2>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        اختر محادثة من القائمة لبدء التواصل أو ابدأ محادثة جديدة
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => {
            console.log('🔄 تم النقر على زر محادثة جديدة من الحالة الفارغة');
            setTimeout(() => {
              setShowNewChat(true);
              console.log('✅ تم تحديث showNewChat إلى true');
            }, 100);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">محادثة جديدة</span>
        </button>
      </div>
    </div>
  );

  // دالة عرض الرسالة الواحدة
  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.senderId === user?.uid;
    const messageTime = formatMessageTime(message.timestamp);
    const UserIcon = USER_TYPES[message.senderType as keyof typeof USER_TYPES]?.icon || User;

    return (
      <div
        key={`${message.id}-${index}`}
        className={`flex items-start gap-2 mb-4 ${
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.senderAvatar} />
            <AvatarFallback>
              <UserIcon className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div
          className={`flex flex-col max-w-[70%] ${
            isCurrentUser ? 'items-end' : 'items-start'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {message.senderName || 'مستخدم'}
            </span>
            <span className="text-xs text-gray-500">{messageTime}</span>
            {message.deliveryStatus === 'sent' && isCurrentUser && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <div
            className={`rounded-lg p-3 ${
              isCurrentUser
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          </div>
        </div>
      </div>
    );
  };

  // تحديث دالة عرض المحادثة
  const renderConversationItem = (conversation: Conversation) => {
    if (!user) return null;
    
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return null;
    
    const contact = contacts.find(c => c.id === otherParticipantId);
    const userType = conversation.participantTypes[otherParticipantId];
    const UserTypeIcon = USER_TYPES[userType as keyof typeof USER_TYPES]?.icon || User;
    
    const isSelected = selectedConversation?.id === conversation.id;
    const unreadCount = conversation.unreadCount?.[user.uid] || 0;
    const lastMessageTime = formatMessageTime(conversation.lastMessageTime);

    // استخدام الاسم المحسن
    const participantName = getParticipantDisplayName(otherParticipantId, conversation);

    return (
      <div
        key={conversation.id}
        className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
          isSelected ? 'bg-gray-100' : ''
        }`}
        onClick={() => setSelectedConversation(conversation)}
      >
        <Avatar className="h-10 w-10 flex-shrink-0">
          {contact?.avatar ? (
            <AvatarImage src={contact.avatar} alt={participantName} />
          ) : (
            <AvatarFallback>
              <UserTypeIcon className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">
                {participantName}
              </span>
              <Badge variant="outline" className={USER_TYPES[userType as keyof typeof USER_TYPES]?.color || 'bg-gray-100'}>
                {USER_TYPES[userType as keyof typeof USER_TYPES]?.name || 'مستخدم'}
              </Badge>
            </div>
            {lastMessageTime && (
              <span className="text-xs text-gray-500">{lastMessageTime}</span>
            )}
          </div>
          
          {contact?.organizationName && contact.type !== 'club' && contact.type !== 'academy' && (
            <div className="text-xs text-gray-500 mb-1">
              {contact.organizationName}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage || 'لا توجد رسائل'}
            </p>
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  // دالة بدء محادثة جديدة
  const startNewConversation = async (contact: Contact) => {
    if (!user || !userData) {
      console.error('❌ لا يمكن بدء محادثة جديدة: المستخدم أو البيانات غير متوفرة');
      toast.error('يرجى تسجيل الدخول');
      return;
    }

    console.log('🚀 بدء محادثة جديدة مع:', contact);
    console.log('👤 User:', user.uid);
    console.log('📞 Contact:', contact.id);

    try {
      // إنشاء معرف المحادثة
      const conversationId = [user.uid, contact.id].sort().join('-');
      console.log('📝 Conversation ID:', conversationId);

      // البحث عن محادثة موجودة
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(contact.id)
      );

      if (existingConversation) {
        console.log('✅ وجدت محادثة موجودة:', existingConversation.id);
        // إذا وجدت محادثة، انتقل إليها
        setSelectedConversation(existingConversation);
        setShowNewChat(false);
        return;
      }

      console.log('🆕 إنشاء محادثة جديدة...');

      // إنشاء محادثة جديدة
      const conversationData = {
        id: conversationId,
        participants: [user.uid, contact.id],
        participantNames: {
          [user.uid]: getUserDisplayName(user.uid, userData.accountType, userData),
          [contact.id]: contact.name
        },
        participantTypes: {
          [user.uid]: userData.accountType,
          [contact.id]: contact.type
        },
        subject: '',
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastSenderId: '',
        unreadCount: {
          [user.uid]: 0,
          [contact.id]: 0
        },
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 بيانات المحادثة الجديدة:', conversationData);

      // إضافة المحادثة إلى Firestore
      const conversationRef = doc(collection(db, 'conversations'), conversationId);
      await setDoc(conversationRef, conversationData);

      console.log('✅ تم إنشاء المحادثة في Firestore بنجاح');

      // إضافة المحادثة إلى القائمة المحلية
      const newConversation: Conversation = {
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageTime: new Date()
      };

      setConversations(prev => {
        // التحقق من عدم وجود محادثة مكررة
        const existing = prev.find(conv => conv.id === conversationId);
        if (existing) {
          console.log('⚠️ المحادثة موجودة بالفعل في القائمة المحلية');
          return prev;
        }
        console.log('✅ إضافة المحادثة الجديدة إلى القائمة المحلية');
        return [newConversation, ...prev];
      });

      // تحديد المحادثة الجديدة
      setSelectedConversation(newConversation);
      setShowNewChat(false);
      setNewMessage('');

      toast.success(`تم بدء محادثة مع ${contact.name}`);
      console.log('✅ تم بدء المحادثة الجديدة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في بدء المحادثة الجديدة:', error);
      toast.error('فشل في بدء المحادثة الجديدة');
      handleError(error, 'بدء محادثة جديدة');
    }
  };

  // تحسين عرض قائمة جهات الاتصال
  const renderContactsList = () => {
    console.log('🔄 renderContactsList called - showNewChat:', showNewChat);
    console.log('📊 عدد جهات الاتصال:', contacts.length);
    console.log('📝 جهات الاتصال:', contacts);
    
    if (!showNewChat) {
      console.log('❌ showNewChat هو false، لن يتم عرض القائمة');
      return null;
    }
    
    if (contacts.length === 0) {
      console.log('❌ لا توجد جهات اتصال متاحة');
      return (
        <div className="p-4 text-center text-gray-500">
          <p>جاري تحميل جهات الاتصال...</p>
        </div>
      );
    }
    
    // تجميع جهات الاتصال حسب النوع
    const groupedContacts = contacts.reduce((acc, contact) => {
      const type = contact.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    console.log('📋 جهات الاتصال المجمعة:', groupedContacts);

    // ترتيب المجموعات
    const orderedTypes = [
      'admin',
      'club',
      'academy',
      'agent',
      'trainer',
      'player',
      'other'
    ];

    // تصفية وترتيب جهات الاتصال
    const filteredContacts = contacts.filter(contact => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        contact.name.toLowerCase().includes(searchLower) ||
        USER_TYPES[contact.type]?.name.toLowerCase().includes(searchLower) ||
        (contact.organizationName || '').toLowerCase().includes(searchLower)
      );
    });

    console.log('🔍 جهات الاتصال المفلترة:', filteredContacts.length);

    if (filteredContacts.length === 0) {
      console.log('❌ لا توجد جهات اتصال متاحة');
      return (
        <div className="p-4 text-center text-gray-500">
          {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد جهات اتصال متاحة'}
        </div>
      );
    }

    console.log('✅ عرض قائمة جهات الاتصال');
    return (
      <div className="divide-y divide-gray-100">
        {orderedTypes.map(type => {
          const typeContacts = groupedContacts[type] || [];
          if (typeContacts.length === 0) return null;

          // تصفية جهات الاتصال حسب البحث
          const filteredTypeContacts = typeContacts.filter(contact => {
            if (!searchTerm) return true;
            
            const searchLower = searchTerm.toLowerCase();
            return (
              contact.name.toLowerCase().includes(searchLower) ||
              USER_TYPES[contact.type]?.name.toLowerCase().includes(searchLower) ||
              (contact.organizationName || '').toLowerCase().includes(searchLower)
            );
          });

          if (filteredTypeContacts.length === 0) return null;

          console.log(`📋 عرض ${filteredTypeContacts.length} جهة اتصال من نوع ${type}`);

          return (
            <div key={type} className="py-2">
              <div className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50">
                {USER_TYPES[type as keyof typeof USER_TYPES]?.name || 'آخر'}
              </div>
              {filteredTypeContacts.map(contact => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    console.log('🔄 تم النقر على جهة اتصال:', contact);
                    startNewConversation(contact);
                  }}
                >
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                    {contact.avatar ? (
                      <AvatarImage src={contact.avatar} alt={contact.name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white">
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">
                          {contact.name}
                        </span>
                        {contact.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {USER_TYPES[contact.type]?.name || 'مستخدم'}
                      </Badge>
                    </div>
                    {contact.organizationName && contact.type !== 'club' && contact.type !== 'academy' && (
                      <div className="text-sm text-gray-500 mt-1">
                        {contact.organizationName}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      انقر لبدء محادثة جديدة
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري تحميل المحادثات...</p>
          <p className="text-sm text-gray-500 mt-2">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  // إذا كان showNewChat صحيحاً، اعرض قائمة جهات الاتصال في الجانب
  if (showNewChat) {
    return (
      <div className="flex h-[75vh] min-h-[500px] bg-gray-50">
        {/* عمود جهات الاتصال في الجانب */}
        <div className="w-1/3 bg-white shadow-lg rounded-l-lg overflow-hidden border-r border-gray-200">
          {/* Header مشابه لـ WhatsApp */}
          <div className="bg-green-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">جهات الاتصال</h2>
                  <p className="text-sm text-green-100">اختر جهة اتصال لبدء محادثة</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  console.log('🔄 تم إغلاق قائمة جهات الاتصال');
                  setShowNewChat(false);
                }}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar محسن */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="relative">
              <Input
                type="text"
                placeholder="البحث في جهات الاتصال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
              />
              <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          {/* قائمة جهات الاتصال */}
          <div className="overflow-y-auto max-h-[calc(75vh-140px)]">
            {(() => {
              console.log('🔄 عرض قائمة جهات الاتصال - showNewChat:', showNewChat);
              console.log('📊 عدد جهات الاتصال:', contacts.length);
              console.log('📝 جهات الاتصال:', contacts);
              
              if (contacts.length === 0) {
                console.log('❌ لا توجد جهات اتصال متاحة');
                return (
                  <div className="p-8 text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">جاري تحميل جهات الاتصال...</p>
                    <p className="text-sm">يرجى الانتظار قليلاً</p>
                  </div>
                );
              }
              
              console.log('✅ عرض قائمة جهات الاتصال');
              return renderContactsList();
            })()}
          </div>
        </div>

        {/* مساحة فارغة في المنتصف */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">اختر جهة اتصال</h3>
            <p className="text-sm">انقر على جهة اتصال من القائمة لبدء محادثة جديدة</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد محادثات</h2>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          ابدأ محادثة جديدة مع اللاعبين والأندية والوكلاء لتبدأ التواصل
        </p>
        <button
          onClick={() => {
            console.log('🔄 تم النقر على زر محادثة جديدة');
            console.log('📊 عدد جهات الاتصال الحالية:', contacts.length);
            console.log('📝 جهات الاتصال:', contacts);
            console.log('🔍 حالة showNewChat قبل التحديث:', showNewChat);
            
            // إضافة تأخير صغير للتأكد من تحميل البيانات
            setTimeout(() => {
              setShowNewChat(true);
              console.log('✅ تم تحديث showNewChat إلى true');
            }, 100);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span className="font-semibold">محادثة جديدة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[75vh] min-h-[500px] bg-gray-50">
      {/* عمود المحادثات في اليسار */}
      <div className="w-1/3 bg-white shadow-lg rounded-l-lg overflow-hidden border-r border-gray-200">
        {/* Header مشابه لـ WhatsApp */}
        <div className="bg-green-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">المحادثات</h2>
                <p className="text-sm text-green-100">رسائل ومحادثات</p>
              </div>
            </div>
            <Button
              onClick={() => {
                console.log('🔄 تم النقر على زر محادثة جديدة');
                console.log('📊 عدد جهات الاتصال الحالية:', contacts.length);
                console.log('📝 جهات الاتصال:', contacts);
                console.log('🔍 حالة showNewChat قبل التحديث:', showNewChat);
                
                setTimeout(() => {
                  setShowNewChat(true);
                  console.log('✅ تم تحديث showNewChat إلى true');
                }, 100);
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search Bar محسن */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <Input
              type="text"
              placeholder="البحث في المحادثات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
            <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* قائمة المحادثات */}
        <div className="overflow-y-auto max-h-[calc(75vh-140px)]">
          {conversations
            .filter((conversation, index, self) => 
              index === self.findIndex(c => c.id === conversation.id)
            )
            .map(renderConversationItem)}
        </div>
      </div>

      {/* عمود الرسائل في المنتصف */}
      <div className="flex-1 flex flex-col bg-white shadow-lg rounded-r-lg overflow-hidden">
        {selectedConversation ? (
          renderConversationView()
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
};

export default MessageCenter; 

