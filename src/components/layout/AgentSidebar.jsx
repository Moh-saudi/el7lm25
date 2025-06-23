import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/client';
import { Home, User, Users, FileText, Briefcase, BarChart3, DollarSign, Handshake, Star, Bell, MessageSquare, CreditCard, KeyRound, Menu, LogOut, Search, Target, Shield, Video } from 'lucide-react';

const getSupabaseImageUrl = (path) => {
  if (!path) return '/images/agent-avatar.png';
  if (path.startsWith('http')) return path;
  
  // قائمة الـ buckets للبحث فيها
  const bucketsToCheck = ['agent', 'avatars', 'wallet', 'clubavatar'];
  
  // تحديد bucket بناءً على اسم الملف أولاً
  let preferredBucket = 'agent'; // افتراضي للوكلاء
  
  if (path.includes('wallet') || path.startsWith('wallet')) {
    preferredBucket = 'wallet';
  } else if (path.includes('avatar') || path.startsWith('avatar')) {
    preferredBucket = 'avatars';
  } else if (path.includes('clubavatar') || path.startsWith('clubavatar')) {
    preferredBucket = 'clubavatar';
  }
  
  // وضع الـ bucket المفضل في المقدمة
  const orderedBuckets = [preferredBucket, ...bucketsToCheck.filter(b => b !== preferredBucket)];
  
  // جرب كل bucket حتى نجد الملف
  for (const bucketName of orderedBuckets) {
    try {
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(path);
      if (publicUrl) {
        return publicUrl;
      }
    } catch (error) {
      continue;
    }
  }
  
  // إذا لم نجد في أي bucket، استخدم الافتراضي
  const { data: { publicUrl } } = supabase.storage.from('agent').getPublicUrl(path);
  return publicUrl || '/images/agent-avatar.png';
};

const agentMenuItems = [
  { title: 'الرئيسية', icon: <Home />, path: '/dashboard/agent' },
  { title: 'الملف الشخصي', icon: <User />, path: '/dashboard/agent/profile' },
  { title: 'إدارة اللاعبين', icon: <Users />, path: '/dashboard/agent/players' },
  { title: 'البحث عن اللاعبين', icon: <Search />, path: '/dashboard/agent/search-players' },
  { title: 'فيديوهات اللاعبين', icon: <Video />, path: '/dashboard/agent/player-videos' },
  { title: 'اللاعبين المُمثلين', icon: <Users />, path: '/dashboard/agent/represented-players' },
  { title: 'إدارة العقود', icon: <FileText />, path: '/dashboard/agent/contracts' },
  { title: 'الفرص التجارية', icon: <Briefcase />, path: '/dashboard/agent/opportunities' },
  { title: 'تحليل السوق', icon: <BarChart3 />, path: '/dashboard/agent/market-analysis' },
  { title: 'تسعير الخدمات', icon: <DollarSign />, path: '/dashboard/agent/pricing' },
  { title: 'خدمات التفاوض', icon: <Handshake />, path: '/dashboard/agent/negotiations' },
  { title: 'تقييم اللاعبين', icon: <Star />, path: '/dashboard/agent/player-evaluation' },
  { title: 'الشبكة المهنية', icon: <Target />, path: '/dashboard/agent/network' },
  { title: 'الإشعارات', icon: <Bell />, path: '/dashboard/agent/notifications' },
  { title: 'الرسائل', icon: <MessageSquare />, path: '/dashboard/agent/messages' },
  
  { title: 'دفع جماعي للاعبين', icon: <Users />, path: '/dashboard/agent/bulk-payment' },
  { title: 'الفواتير', icon: <Shield />, path: '/dashboard/agent/billing' },
  { title: 'تغيير كلمة السر', icon: <KeyRound />, path: '/dashboard/agent/change-password' },
];

export default function AgentSidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [logo, setLogo] = useState('/images/agent-avatar.png');

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
  }, []);

  // جلب صورة الوكيل من Firestore مع التحديث الفوري
  useEffect(() => {
    if (!user?.uid) return;

    const agentRef = doc(db, 'agents', user.uid);
    const unsubscribe = onSnapshot(agentRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const logoUrl = getSupabaseImageUrl(data.profile_photo);
        setLogo(logoUrl);
      }
    }, (error) => {
      console.log('خطأ في جلب صورة الوكيل:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const sidebarDir = lang === 'ar' ? 'rtl' : 'ltr';
  const borderDir = lang === 'ar' ? 'border-l' : 'border-r';

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside
      className={`transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 shadow-lg ${borderDir} border-gray-200 dark:border-gray-800 flex flex-col`}
      style={{ direction: sidebarDir }}
    >
      {/* زر الطي */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <Menu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </button>
      </div>
      
      {/* شعار وعنوان */}
      {!collapsed && (
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
          <img src={logo} alt="صورة الوكيل" className="w-32 h-32 rounded-full border-4 border-purple-400 shadow" />
          <div className="mt-2 text-center">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">وكيل اللاعبين</div>
          </div>
        </div>
      )}
      
      {/* عناصر القائمة */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {agentMenuItems.map((item, idx) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900 group ${collapsed ? 'justify-center' : ''}`}
            style={{ fontSize: '1.08rem' }}
          >
            <span className={`transition-transform duration-200 group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`}
              style={{ color: ['#8b5cf6', '#0ea5e9', '#f59e42', '#eab308', '#a21caf', '#f43f5e'][idx % 6] }}
            >
              {item.icon}
            </span>
            {!collapsed && <span className="truncate">{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* زر تسجيل الخروج */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 p-3 w-full rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900 group ${collapsed ? 'justify-center' : ''}`}
          style={{ fontSize: '1.08rem' }}
        >
          <span className={`transition-transform duration-200 group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`} style={{ color: '#ef4444' }}>
            <LogOut />
          </span>
          {!collapsed && <span className="truncate">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
} 