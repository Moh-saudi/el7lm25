import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/client';
import { Home, User, Users, Trophy, Calendar, Star, Bell, MessageSquare, CreditCard, KeyRound, Menu, LogOut, Clipboard, BookOpen, Target, Activity, BarChart3, Video, Award, Search } from 'lucide-react';

const getSupabaseImageUrl = (path) => {
  if (!path) return '/images/user-avatar.svg';
  if (path.startsWith('http')) return path;
  
  // قائمة الـ buckets للبحث فيها
  const bucketsToCheck = ['trainer', 'avatars', 'wallet', 'clubavatar'];
  
  // تحديد bucket بناءً على اسم الملف أولاً
  let preferredBucket = 'trainer'; // افتراضي للمدربين
  
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
  const { data: { publicUrl } } = supabase.storage.from('trainer').getPublicUrl(path);
  return publicUrl || '/images/user-avatar.svg';
};

const trainerMenuItems = [
  { title: 'الرئيسية', icon: <Home />, path: '/dashboard/trainer' },
  { title: 'الملف الشخصي', icon: <User />, path: '/dashboard/trainer/profile' },
  { title: 'إدارة اللاعبين', icon: <Users />, path: '/dashboard/trainer/players' },
  { title: 'البحث عن اللاعبين', icon: <Search />, path: '/dashboard/trainer/search-players' },
  { title: 'فيديوهات اللاعبين', icon: <Video />, path: '/dashboard/trainer/player-videos' },
  { title: 'الخطط التدريبية', icon: <Clipboard />, path: '/dashboard/trainer/training-plans' },
  { title: 'البرامج والجلسات', icon: <BookOpen />, path: '/dashboard/trainer/sessions' },
  { title: 'المباريات والمنافسات', icon: <Trophy />, path: '/dashboard/trainer/matches' },
  { title: 'الجدولة والتقويم', icon: <Calendar />, path: '/dashboard/trainer/schedule' },
  { title: 'تحليل الأداء', icon: <BarChart3 />, path: '/dashboard/trainer/performance' },
  { title: 'مقاطع الفيديو التحليلية', icon: <Video />, path: '/dashboard/trainer/video-analysis' },
  { title: 'تقييم اللاعبين', icon: <Star />, path: '/dashboard/trainer/evaluation' },
  { title: 'تتبع اللياقة البدنية', icon: <Activity />, path: '/dashboard/trainer/fitness' },
  { title: 'التقارير والإحصائيات', icon: <Award />, path: '/dashboard/trainer/reports' },
  { title: 'الإشعارات', icon: <Bell />, path: '/dashboard/trainer/notifications' },
  { title: 'الرسائل', icon: <MessageSquare />, path: '/dashboard/trainer/messages' },
  
  { title: 'دفع جماعي للاعبين', icon: <Users />, path: '/dashboard/trainer/bulk-payment' },
  { title: 'الفواتير', icon: <Award />, path: '/dashboard/trainer/billing' },
  { title: 'تغيير كلمة السر', icon: <KeyRound />, path: '/dashboard/trainer/change-password' },
];

export default function TrainerSidebar({ collapsed, setCollapsed }) {
  const router = useRouter();
  const { logout, user, userData } = useAuth();
  const [lang, setLang] = useState('ar');
  const [logo, setLogo] = useState('/images/user-avatar.svg');
  const [trainerName, setTrainerName] = useState('');

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
  }, []);

  // جلب صورة المدرب من Firestore مع التحديث الفوري
  useEffect(() => {
    if (!user?.uid) return;

    const trainerRef = doc(db, 'trainers', user.uid);
    const unsubscribe = onSnapshot(trainerRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // استخدام profile_photo بدلاً من logo
        const logoUrl = getSupabaseImageUrl(data.profile_photo);
        setLogo(logoUrl);
        
        // تحديد اسم المدرب من عدة مصادر
        const name = data.trainer_name || data.name || data.full_name || userData?.full_name || userData?.name || 'مدرب رياضي';
        setTrainerName(name);
      } else {
        // استخدم userData في حالة عدم وجود بيانات المدرب
        const name = userData?.full_name || userData?.name || 'مدرب رياضي';
        setTrainerName(name);
      }
    }, (error) => {
      console.log('خطأ في جلب صورة المدرب:', error);
      // في حالة الخطأ، استخدم userData
      const name = userData?.full_name || userData?.name || 'مدرب رياضي';
      setTrainerName(name);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // تحديث اسم المدرب عند تغيير userData
  useEffect(() => {
    if (userData && !trainerName) {
      const name = userData.full_name || userData.name || 'مدرب رياضي';
      setTrainerName(name);
    }
  }, [userData, trainerName]);

  const sidebarDir = lang === 'ar' ? 'rtl' : 'ltr';
  const borderDir = lang === 'ar' ? 'border-l' : 'border-r';

  const handleLogout = async () => {
    try {
      await logout();
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
          <Menu className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
        </button>
      </div>
      
      {/* شعار وعنوان */}
      {!collapsed && (
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
          <img src={logo} alt="صورة المدرب" className="w-32 h-32 rounded-full border-4 border-cyan-400 shadow" />
          <div className="mt-2 text-center">
            <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">المدرب الرياضي</div>
            <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-1">{trainerName}</div>
          </div>
        </div>
      )}
      
      {/* عناصر القائمة */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {trainerMenuItems.map((item, idx) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors font-medium text-gray-700 dark:text-gray-200 hover:bg-cyan-50 dark:hover:bg-cyan-900 group ${collapsed ? 'justify-center' : ''}`}
            style={{ fontSize: '1.08rem' }}
          >
            <span className={`transition-transform duration-200 group-hover:scale-110 ${collapsed ? 'mx-auto' : ''}`}
              style={{ color: ['#06b6d4', '#0ea5e9', '#22c55e', '#eab308', '#a21caf', '#f43f5e'][idx % 6] }}
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
