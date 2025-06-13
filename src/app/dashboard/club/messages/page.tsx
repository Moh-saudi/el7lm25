'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast, Toaster } from 'sonner';

interface Chat {
  id: string;
  clubId: string;
  participantId: string;
  participantName: string;
  participantType: 'player' | 'agent' | 'club';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-lg text-gray-600">جاري تحميل المحادثات...</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8">
    <span className="h-12 w-12 text-gray-400 mx-auto mb-4 block">Icon</span>
    <h3 className="text-lg font-medium text-gray-900">لا توجد محادثات</h3>
    <p className="text-gray-500 mt-2">ابدأ محادثة جديدة مع لاعب أو وكيل</p>
  </div>
);

const ChatCard = ({ chat, onSelect }: { chat: Chat; onSelect: (chat: Chat) => void }) => (
  <div className="hover:shadow-lg transition-shadow border rounded-lg mb-4">
    <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b">
      <div className="text-xl font-bold">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5">Icon</span>
          {chat.participantName}
        </div>
      </div>
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${chat.participantType === 'player' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
        {chat.participantType === 'player' ? 'لاعب' : 'وكيل'}
      </span>
    </div>
    <div className="p-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{chat.lastMessage}</p>
        {chat.unreadCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-500 text-white px-2 py-0.5 text-xs ml-2">{chat.unreadCount}</span>
        )}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs text-gray-400">
          {new Date(chat.lastMessageTime).toLocaleString('ar-SA')}
        </span>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded px-3 py-1 text-sm ml-2" onClick={() => onSelect(chat)}>
          <span className="h-4 w-4 ml-2">Icon</span>
          فتح المحادثة
        </button>
      </div>
    </div>
  </div>
);

const ChatList = ({ chats, onChatSelect }: { chats: Chat[]; onChatSelect: (chat: Chat) => void }) => (
  <div className="grid gap-4">
    {chats.map((chat) => (
      <ChatCard key={chat.id} chat={chat} onSelect={onChatSelect} />
    ))}
  </div>
);

const SearchBar = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
  <div className="relative w-64">
    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{fontSize: 20}}>Icon</span>
    <input
      type="text"
      placeholder="بحث في المحادثات..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10 flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  </div>
);

export default function MessagesPage() {
  const { user, userData } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || !userData || !userData.clubId) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        const chatsRef = collection(db, 'chats');
        const q = query(
          chatsRef,
          where('clubId', '==', userData.clubId),
          orderBy('lastMessageTime', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const chatsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Chat[];
        if (chatsData.length === 0) {
          if (userData?.clubId) {
            setChats([
              {
                id: '1',
                clubId: userData.clubId,
                participantId: 'player1',
                participantName: 'أحمد محمد',
                participantType: 'player',
                lastMessage: 'مرحباً، هل يمكنني معرفة المزيد عن الفرص المتاحة؟',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 2
              },
              {
                id: '2',
                clubId: userData.clubId,
                participantId: 'agent1',
                participantName: 'محمد علي - وكيل',
                participantType: 'agent',
                lastMessage: 'نود مناقشة عرض جديد للاعب',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0
              }
            ]);
            toast.info('تم عرض بيانات تجريبية');
          } else {
            setChats([]);
            toast.error('لم يتم العثور على معرف النادي');
          }
        } else {
          setChats(chatsData);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('حدث خطأ أثناء جلب المحادثات');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user, userData]);

  const filteredChats = chats.filter(chat =>
    chat.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatSelect = (chat: Chat) => {
    console.log('Selected chat:', chat);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <Toaster />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">الرسائل</h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {filteredChats.length > 0 ? (
          <ChatList chats={filteredChats} onChatSelect={handleChatSelect} />
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  );
} 