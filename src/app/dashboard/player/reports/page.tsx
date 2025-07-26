'use client';

import React, { Suspense } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { 
  Achievement, 
  AgentHistory, 
  ContractHistory, 
  Document, 
  Image, 
  Injury, 
  PlayerFormData, 
  Video as PlayerVideo 
} from '@/types/player';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { doc, getDoc } from 'firebase/firestore';
import {
  Dumbbell,
  FileText,
  GraduationCap,
  HeartPulse,
  ImageIcon,
  Star,
  Video as VideoIcon,
  Target,
  User,
  Layout,
  ArrowLeft,
  Building,
  Building2,
  School,
  Trophy,
  Eye,
  Award,
  Briefcase,
  Phone,
  Mail,
  ExternalLink,
  MapPin,
  Calendar,
  Shield,
  Users,
  Contact,
  Plus
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import 'react-photo-view/dist/react-photo-view.css';
import ReactPlayer from 'react-player/lazy';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { supabase } from '@/lib/supabase/client';
import { debugConsole } from '@/lib/utils/console-manager';

// تعيين اللغة العربية لمكتبة dayjs
dayjs.locale('ar');

// دالة التحقق من صحة رابط الصورة
const getValidImageUrl = (url: string | null | undefined, fallback: string = '/images/default-avatar.png'): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  
  // فلترة الروابط المكسورة المعروفة من Supabase
  const brokenSupabaseUrls = [
    'ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/avatars/yf0b8T8xuuMfP8QAfvS9TLOJjVt2',
    'ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/player-images/yf0b8T8xuuMfP8QAfvS9TLOJjVt2',
    'test-url.com',
    'example.com'
  ];
  
  const isBrokenUrl = brokenSupabaseUrls.some(brokenUrl => url.includes(brokenUrl));
  
  if (isBrokenUrl) {
    console.log(`🚫 تم فلترة رابط مكسور: ${url}`);
    return fallback;
  }
  
  return url;
};

// دالة حساب العمر
const calculateAge = (birthDate: any) => {
  if (!birthDate) return null;

  let dateToUse: Date;

  if (birthDate && typeof birthDate === 'object' && birthDate.toDate) {
    try {
      dateToUse = birthDate.toDate();
    } catch (error) {
      return null;
    }
  } else if (birthDate instanceof Date) {
    dateToUse = birthDate;
  } else if (typeof birthDate === 'string') {
    try {
      dateToUse = new Date(birthDate);
    } catch (error) {
      return null;
    }
  } else {
    return null;
  }

  if (isNaN(dateToUse.getTime())) {
    return null;
  }

  const now = new Date();
  if (dateToUse > now) {
    dateToUse = now;
  }

  const age = now.getFullYear() - dateToUse.getFullYear();
  const monthDiff = now.getMonth() - dateToUse.getMonth();
  
  let finalAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dateToUse.getDate())) {
    finalAge--;
  }

  return finalAge;
};

// دالة تحويل التاريخ إلى نص عربي
const formatDateToArabic = (date: any): string => {
  if (!date) return 'غير محدد';
  
  try {
    let dateToUse: Date;
    
    if (date && typeof date === 'object' && date.toDate) {
      dateToUse = date.toDate();
    } else if (date instanceof Date) {
      dateToUse = date;
    } else {
      dateToUse = new Date(date);
    }
    
    if (isNaN(dateToUse.getTime())) {
      return 'تاريخ غير صحيح';
    }
    
    return dayjs(dateToUse).format('DD MMMM YYYY');
  } catch (error) {
    return 'تاريخ غير صحيح';
  }
};

// دالة تحويل النسبة المئوية إلى نص عربي
const formatPercentageToArabic = (percentage: number): string => {
  if (percentage >= 90) return 'ممتاز';
  if (percentage >= 80) return 'جيد جداً';
  if (percentage >= 70) return 'جيد';
  if (percentage >= 60) return 'مقبول';
  if (percentage >= 50) return 'ضعيف';
  return 'ضعيف جداً';
};

// دالة تحويل المهارات إلى بيانات الرسم البياني
const convertSkillsToChartData = (skills: any): any[] => {
  if (!skills || typeof skills !== 'object') {
    return [];
  }

  const skillsMapping: Record<string, string> = {
    'speed': 'السرعة',
    'strength': 'القوة',
    'endurance': 'التحمل',
    'agility': 'الرشاقة',
    'technique': 'التقنية',
    'tactical': 'التكتيك',
    'mental': 'العقلية',
    'teamwork': 'العمل الجماعي',
    'leadership': 'القيادة',
    'communication': 'التواصل'
  };

  return Object.entries(skills).map(([key, value]) => ({
    subject: skillsMapping[key] || key,
    A: typeof value === 'number' ? value : 0,
    fullMark: 100,
  }));
};

// دالة تحويل الأهداف إلى نص عربي
const formatObjectivesToArabic = (objectives: any): string[] => {
  if (!objectives || !Array.isArray(objectives)) {
    return ['لا توجد أهداف محددة'];
  }

  const objectivesMapping: Record<string, string> = {
    'professional_contract': 'الحصول على عقد احترافي',
    'national_team': 'الانضمام للمنتخب الوطني',
    'international_transfer': 'الانتقال للخارج',
    'championship_win': 'الفوز ببطولة',
    'personal_development': 'التطوير الشخصي',
    'academic_balance': 'التوازن الأكاديمي',
    'injury_recovery': 'الشفاء من الإصابات',
    'skill_improvement': 'تحسين المهارات',
    'team_leadership': 'قيادة الفريق',
    'fan_recognition': 'الاعتراف الجماهيري'
  };

  return objectives.map((objective: string) => 
    objectivesMapping[objective] || objective
  );
};

function PlayerReportContent() {
  const [player, setPlayer] = useState<PlayerFormData | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [organizationLoading, setOrganizationLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'self' | 'other'>('other');
  const [currentUser] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();

  const playerId = searchParams.get('view');
  const isSelfView = searchParams.get('mode') === 'self';

  useEffect(() => {
    if (playerId) {
      fetchPlayerData();
    }
  }, [playerId]);

  const fetchPlayerData = async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      // جلب بيانات اللاعب من مجموعة players
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      
      if (playerDoc.exists()) {
        const playerData = { id: playerDoc.id, ...playerDoc.data() } as PlayerFormData;
        setPlayer(playerData);
        console.log('✅ تم جلب بيانات اللاعب من مجموعة players');
      } else {
        // جلب بيانات اللاعب من مجموعة users
        const userDoc = await getDoc(doc(db, 'users', playerId));
        
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as PlayerFormData;
          setPlayer(userData);
          console.log('✅ تم جلب بيانات اللاعب من مجموعة users');
        } else {
          setError('لم يتم العثور على بيانات اللاعب');
          console.error('❌ لم يتم العثور على بيانات اللاعب في أي من المجموعتين');
        }
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات اللاعب:', error);
      setError('حدث خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const sendProfileViewNotification = async () => {
    if (!currentUser || !player || currentUser.uid === playerId) return;

    try {
      const response = await fetch('/api/notifications/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'profile_view',
          targetUserId: playerId,
          viewerUserId: currentUser.uid,
          viewerName: currentUser.displayName || 'مستخدم',
          targetName: player.full_name || player.name || 'لاعب'
        }),
      });

      if (response.ok) {
        console.log('✅ تم إرسال إشعار مشاهدة الملف الشخصي');
      } else {
        console.error('❌ فشل في إرسال إشعار مشاهدة الملف الشخصي');
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار مشاهدة الملف الشخصي:', error);
    }
  };

  useEffect(() => {
    if (player && currentUser && playerId !== currentUser.uid) {
      sendProfileViewNotification();
    }
  }, [player, currentUser, playerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات اللاعب...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">لم يتم العثور على بيانات اللاعب</h2>
          <p className="text-gray-600 mb-4">اللاعب المطلوب غير موجود أو تم حذفه</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header بسيط */}
      <div className="sticky top-0 z-50 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            {/* زر العودة */}
            <button
              onClick={() => router.back()}
              className="flex gap-2 items-center px-4 py-2 text-gray-600 rounded-lg transition-all hover:text-gray-800 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">العودة</span>
            </button>

            {/* عنوان الصفحة */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">تقرير اللاعب</h1>
              <p className="text-sm text-gray-600">{player.full_name || player.name || 'لاعب'}</p>
            </div>

            {/* مساحة فارغة للتوازن */}
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
              <img
                src={getValidImageUrl(player.profile_image)}
                alt={player.full_name || player.name || 'صورة اللاعب'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {player.full_name || player.name || 'لاعب'}
              </h2>
              <p className="text-gray-600">{player.primary_position || player.position || 'مركز غير محدد'}</p>
              {player.birth_date && (
                <p className="text-sm text-gray-500">
                  العمر: {calculateAge(player.birth_date)} سنة
                </p>
              )}
            </div>
          </div>

          {/* معلومات أساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {player.nationality && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">الجنسية</p>
                <p className="font-medium">{player.nationality}</p>
              </div>
            )}
            {player.height && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">الطول</p>
                <p className="font-medium">{player.height} سم</p>
              </div>
            )}
            {player.weight && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">الوزن</p>
                <p className="font-medium">{player.weight} كجم</p>
              </div>
            )}
            {player.foot && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">القدم المفضلة</p>
                <p className="font-medium">{player.foot}</p>
              </div>
            )}
          </div>

          {/* معلومات الاتصال */}
          {player.phone && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">معلومات الاتصال</h3>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">{player.phone}</span>
              </div>
            </div>
          )}

          {/* المهارات */}
          {player.skills && Object.keys(player.skills).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">المهارات</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={convertSkillsToChartData(player.skills)}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="المهارات"
                      dataKey="A"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* الأهداف */}
          {player.objectives && player.objectives.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">الأهداف</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formatObjectivesToArabic(player.objectives).map((objective, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <Target className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الأندية السابقة */}
          {player.previous_clubs && Array.isArray(player.previous_clubs) && player.previous_clubs.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">الأندية السابقة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {player.previous_clubs.map((club, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                    <Building className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{club}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* الدورات التدريبية */}
          {player.training_courses && Array.isArray(player.training_courses) && player.training_courses.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">الدورات التدريبية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {player.training_courses.map((course, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">{course}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlayerReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PlayerReportContent />
    </Suspense>
  );
} 