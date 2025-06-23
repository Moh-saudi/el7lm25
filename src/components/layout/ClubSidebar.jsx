import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/client';
import { Home, User, Users, FileText, Megaphone, BarChart3, DollarSign, Handshake, Star, Bell, MessageSquare, CreditCard, KeyRound, Menu, LogOut, VideoIcon, Search } from 'lucide-react';

const clubMenuItems = [
  { title: 'الرئيسية', icon: <Home />, path: '/dashboard/club' },
  { title: 'الملف الشخصي', icon: <User />, path: '/dashboard/club/profile' },
  { title: 'إدارة اللاعبين', icon: <Users />, path: '/dashboard/club/players' },
  { title: 'البحث عن اللاعبين', icon: <Search />, path: '/dashboard/club/search-players' },
  { title: 'فيديوهات اللاعبين', icon: <VideoIcon />, path: '/dashboard/club/player-videos' },
  { title: 'إدارة العقود', icon: <FileText />, path: '/dashboard/club/contracts' },
  { title: 'تسويق اللاعبين', icon: <Megaphone />, path: '/dashboard/club/marketing' },
  { title: 'تحليل الأداء', icon: <BarChart3 />, path: '/dashboard/club/ai-analysis' },
  { title: 'حركة أسعار اللاعبين', icon: <DollarSign />, path: '/dashboard/club/market-values' },
  { title: 'خدمات التفاوض', icon: <Handshake />, path: '/dashboard/club/negotiations' },
  { title: 'تقييم اللاعبين', icon: <Star />, path: '/dashboard/club/player-evaluation' },
  { title: 'الإشعارات', icon: <Bell />, path: '/dashboard/club/notifications' },
  { title: 'الرسائل', icon: <MessageSquare />, path: '/dashboard/club/messages' },
  
  { title: 'دفع جماعي للاعبين', icon: <Users />, path: '/dashboard/club/bulk-payment' },
  { title: 'الفواتير', icon: <FileText />, path: '/dashboard/club/billing' },
  { title: 'تغيير كلمة السر', icon: <KeyRound />, path: '/dashboard/club/change-password' },
];

export default function ClubSidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  // اللغة من localStorage أو الافتراضي 'ar'
  const [lang, setLang] = useState('ar');
  const [logo, setLogo] = useState('/club-avatar.png');

  useEffect(() => {
    // جلب اللغة من localStorage أو html tag
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
  }, []);

  // دالة لتحويل مسار Supabase إلى رابط كامل
  const getSupabaseImageUrl = (path) => {
    if (!path) return '/club-avatar.png';
    if (path.startsWith('http')) return path;
    const { data: { publicUrl } } = supabase.storage.from('clubavatar').getPublicUrl(path);
    return publicUrl || path;
  };

  // جلب شعار النادي من Firestore مع الاستماع للتحديثات
  useEffect(() => {
    if (!user?.uid) {
      setLogo('/club-avatar.png');
      return;
    }

    console.log('🎨 ClubSidebar: بدء جلب لوجو النادي للمستخدم:', user.uid);

    const clubRef = doc(db, 'clubs', user.uid);
    
    // استخدام onSnapshot للاستماع للتحديثات الفورية
    const unsubscribe = onSnapshot(clubRef, (clubDoc) => {
      try {
        if (clubDoc.exists()) {
          const data = clubDoc.data();
          console.log('🎨 ClubSidebar: بيانات النادي:', { logo: data.logo });
          
          if (data.logo) {
            const logoUrl = getSupabaseImageUrl(data.logo);
            console.log('🎨 ClubSidebar: تحديث اللوجو إلى:', logoUrl);
            setLogo(logoUrl);
          } else {
            console.log('🎨 ClubSidebar: لا يوجد لوجو، استخدام الافتراضي');
            setLogo('/club-avatar.png');
          }
        } else {
          console.log('🎨 ClubSidebar: وثيقة النادي غير موجودة');
          setLogo('/club-avatar.png');
        }
      } catch (error) {
        console.error('❌ ClubSidebar: خطأ في معالجة بيانات النادي:', error);
        setLogo('/club-avatar.png');
      }
    }, (error) => {
      console.error('❌ ClubSidebar: خطأ في الاستماع لتحديثات النادي:', error);
      setLogo('/club-avatar.png');
    });

    // تنظيف المستمع عند إلغاء التثبيت
    return () => {
      console.log('🎨 ClubSidebar: إيقاف الاستماع لتحديثات اللوجو');
      unsubscribe();
    };
  }, [user?.uid]);

  // اتجاه القائمة حسب اللغة
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
          <Menu className="w-6 h-6 text-green-600 dark:text-green-400" />
        </button>
      </div>
      {/* شعار وعنوان */}
      {!collapsed && (
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
          <img 
            src={logo} 
            alt="شعار النادي" 
            className="w-32 h-32 rounded-full border-4 border-green-400 shadow object-cover" 
            onError={(e) => {
              console.log('❌ ClubSidebar: فشل تحميل اللوجو، استخدام الافتراضي');
              e.target.src = "/club-avatar.png";
            }}
          />
        </div>
      )}
      {/* عناصر القائمة */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {clubMenuItems.map((item, idx) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900 group ${collapsed ? 'justify-center' : ''}`}
            style={{ fontSize: '1.08rem' }}
          >
            <span className={`transition-transform duration-200 group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`}
              style={{ color: ['#22c55e', '#0ea5e9', '#f59e42', '#eab308', '#a21caf', '#f43f5e'][idx % 6] }}
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