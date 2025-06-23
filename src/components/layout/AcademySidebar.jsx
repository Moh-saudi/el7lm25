import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/client';
import { Home, User, Users, Trophy, Calendar, Star, Bell, MessageSquare, CreditCard, KeyRound, Menu, LogOut, GraduationCap, Target, BookOpen, Award, MapPin, Settings, Search, Video } from 'lucide-react';

const getSupabaseImageUrl = (path) => {
  if (!path) return '/images/club-avatar.png';
  if (path.startsWith('http')) return path;
  const { data: { publicUrl } } = supabase.storage.from('academy').getPublicUrl(path);
  return publicUrl || '/images/club-avatar.png';
};

const academyMenuItems = [
  { title: 'الرئيسية', icon: <Home />, path: '/dashboard/academy' },
  { title: 'الملف الشخصي', icon: <User />, path: '/dashboard/academy/profile' },
  { title: 'إدارة اللاعبين', icon: <Users />, path: '/dashboard/academy/players' },
  { title: 'البحث عن اللاعبين', icon: <Search />, path: '/dashboard/academy/search-players' },
  { title: 'فيديوهات اللاعبين', icon: <Video />, path: '/dashboard/academy/player-videos' },
  { title: 'البرامج التدريبية', icon: <BookOpen />, path: '/dashboard/academy/programs' },
  { title: 'الفرق والمجموعات', icon: <Target />, path: '/dashboard/academy/teams' },
  { title: 'المدربين والكادر', icon: <GraduationCap />, path: '/dashboard/academy/coaches' },
  { title: 'الجدولة والحجوزات', icon: <Calendar />, path: '/dashboard/academy/schedule' },
  { title: 'البطولات والمسابقات', icon: <Trophy />, path: '/dashboard/academy/tournaments' },
  { title: 'تقييم الأداء', icon: <Star />, path: '/dashboard/academy/performance' },
  { title: 'التقارير والإحصائيات', icon: <Award />, path: '/dashboard/academy/reports' },
  { title: 'المرافق والملاعب', icon: <MapPin />, path: '/dashboard/academy/facilities' },
  { title: 'الإشعارات', icon: <Bell />, path: '/dashboard/academy/notifications' },
  { title: 'الرسائل', icon: <MessageSquare />, path: '/dashboard/academy/messages' },
  
  { title: 'دفع جماعي للاعبين', icon: <Users />, path: '/dashboard/academy/bulk-payment' },
  { title: 'الفواتير', icon: <Award />, path: '/dashboard/academy/billing' },
  { title: 'تغيير كلمة السر', icon: <KeyRound />, path: '/dashboard/academy/change-password' },
];

export default function AcademySidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [lang, setLang] = useState('ar');
  const [logo, setLogo] = useState('/images/club-avatar.png');

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
  }, []);

  // جلب شعار الأكاديمية من Firestore مع التحديث الفوري
  useEffect(() => {
    if (!user?.uid) return;

    const academyRef = doc(db, 'academies', user.uid);
    const unsubscribe = onSnapshot(academyRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const logoUrl = getSupabaseImageUrl(data.logo);
        setLogo(logoUrl);
      }
    }, (error) => {
      console.log('خطأ في جلب شعار الأكاديمية:', error);
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
          <Menu className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </button>
      </div>
      
      {/* شعار وعنوان */}
      {!collapsed && (
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
          <img src={logo} alt="شعار الأكاديمية" className="w-32 h-32 rounded-full border-4 border-orange-400 shadow" />
          <div className="mt-2 text-center">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400">الأكاديمية الرياضية</div>
          </div>
        </div>
      )}
      
      {/* عناصر القائمة */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {academyMenuItems.map((item, idx) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900 group ${collapsed ? 'justify-center' : ''}`}
            style={{ fontSize: '1.08rem' }}
          >
            <span className={`transition-transform duration-200 group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`}
              style={{ color: ['#f97316', '#0ea5e9', '#22c55e', '#eab308', '#a21caf', '#f43f5e'][idx % 6] }}
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