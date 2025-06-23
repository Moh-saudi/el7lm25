'use client';
import { auth, db } from '@/lib/firebase/config';
import { Achievement, AgentHistory, ContractHistory, Document, Image, Injury, PlayerFormData, Video } from '@/types/player';
// استيراد العميل المركزي
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
  VideoIcon,
  Target, User,
  Layout,
  ArrowLeft,
  Building,
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
  Contact
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



// استخدام العميل المركزي لـ Supabase
import { supabase } from '@/lib/supabase/client';

// تعيين اللغة العربية لمكتبة dayjs
dayjs.locale('ar');

// استبدال واجهة Player بواجهة PlayerFormData من الملف الشخصي
export interface Surgery {
  type: string;
  date: string;
}

export interface ClubHistory {
  name: string;
  from: string;
  to: string;
}

// دالة حساب العمر (محسّنة)
const calculateAge = (birthDate: any) => {
  if (!birthDate) {
    console.log('❌ calculateAge: لا يوجد تاريخ ميلاد');
    return null;
  }
  
  try {
    let d: Date;
    
    console.log('📅 calculateAge: معالجة تاريخ الميلاد:', birthDate, 'نوع:', typeof birthDate);
    
    // التعامل مع Firebase Timestamp
          if (typeof birthDate === 'object' && (birthDate as any).toDate && typeof (birthDate as any).toDate === 'function') {
              d = (birthDate as any).toDate();
      console.log('✅ calculateAge: تم تحويل Firebase Timestamp إلى Date:', d);
    } 
    // التعامل مع Firebase Timestamp مع seconds
    else if (typeof birthDate === 'object' && birthDate.seconds) {
      d = new Date(birthDate.seconds * 1000);
      console.log('✅ calculateAge: تم تحويل Firebase Timestamp (seconds) إلى Date:', d);
    }
    // التعامل مع Date object
    else if (birthDate instanceof Date) {
      d = birthDate;
      console.log('✅ calculateAge: التاريخ هو Date object:', d);
    } 
         // التعامل مع string أو number
     else if (typeof birthDate === 'string' || typeof birthDate === 'number') {
       d = new Date(birthDate);
       console.log('✅ calculateAge: تم تحويل string/number إلى Date:', d);
    }
    // محاولة أخيرة للتحويل
    else {
      console.log('⚠️ calculateAge: محاولة تحويل نوع غير معروف:', birthDate);
      d = new Date(birthDate);
    }
    
    // التحقق من صحة التاريخ
    if (isNaN(d.getTime())) {
      console.error('❌ calculateAge: التاريخ غير صالح بعد التحويل:', d, 'من البيانات الأصلية:', birthDate);
      return null;
    }
    
    // حساب العمر
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    
    // التحقق من منطقية العمر
    if (age < 0 || age > 100) {
      console.warn('⚠️ calculateAge: العمر غير منطقي:', age, 'للتاريخ:', d);
      return null;
    }
    
    console.log('✅ calculateAge: العمر المحسوب:', age, 'سنة');
    return age;
    
  } catch (error) {
    console.error('❌ calculateAge: خطأ في حساب العمر:', error, 'للتاريخ:', birthDate);
    return null;
  }
};

const PlayerReport = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, loading, authError] = useAuthState(auth);
  const [player, setPlayer] = useState<PlayerFormData | null>(null);
  
  // إذا كان هناك معامل "view" فسنعرض اللاعب المحدد، وإلا نعرض اللاعب المسجل دخوله
  const viewPlayerId = searchParams?.get('view');
  
  // إضافة تشخيصات
  console.log('🔍 تشخيص صفحة التقارير:');
  console.log('  - معامل view:', viewPlayerId);
  console.log('  - المستخدم الحالي:', user?.uid);
  console.log('  - معاملات البحث الكاملة:', searchParams?.toString());
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  // معلومات إضافية للعرض المحسن
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const [playerOrganization, setPlayerOrganization] = useState<any>(null);
  const [organizationType, setOrganizationType] = useState<string>('');
  const [organizationLoading, setOrganizationLoading] = useState(true);

  // دالة مساعدة لإنشاء بيانات آمنة للمخططات
  const createSafeChartData = (skillsObject: any, skillsMapping: Record<string, string>) => {
    if (!skillsObject || typeof skillsObject !== 'object') {
      return [];
    }
    
    const entries = Object.entries(skillsObject);
    if (entries.length === 0) {
      return [];
    }
    
    return entries.map(([key, value]) => ({
      skill: skillsMapping[key] || key,
      value: Number(value) || 0
    }));
  };

  // تحويل بيانات المهارات لمخططات الرادار
  const technicalSkillsMapping = {
    'ball_control': 'التحكم بالكرة',
    'passing': 'التمرير',
    'shooting': 'التسديد',
    'dribbling': 'المراوغة',
    'heading': 'الضربات الرأسية',
    'tackling': 'العرقلة',
    'marking': 'المراقبة',
    'positioning': 'التموضع',
    'vision': 'الرؤية',
    'decision_making': 'اتخاذ القرار'
  };

  const physicalSkillsMapping = {
    'speed': 'السرعة',
    'strength': 'القوة',
    'stamina': 'التحمل',
    'agility': 'الرشاقة',
    'balance': 'التوازن',
    'flexibility': 'المرونة',
    'jumping': 'الوثب',
    'coordination': 'التنسيق',
    'reaction_time': 'وقت رد الفعل'
  };

  const socialSkillsMapping = {
    'teamwork': 'العمل الجماعي',
    'communication': 'التواصل',
    'discipline': 'الانضباط',
    'self_confidence': 'الثقة بالنفس',
    'pressure_handling': 'تحمل الضغط',
    'punctuality': 'الالتزام بالمواعيد',
    'leadership': 'القيادة',
    'adaptability': 'القدرة على التكيف',
    'motivation': 'الدافعية'
  };

  const technicalSkillsData = createSafeChartData(player?.technical_skills, technicalSkillsMapping);
  const physicalSkillsData = createSafeChartData(player?.physical_skills, physicalSkillsMapping);
  const socialSkillsData = createSafeChartData(player?.social_skills, socialSkillsMapping);

  // دالة جلب معلومات الحساب الحالي
  const fetchCurrentUserInfo = async () => {
    if (!user?.uid) {
      console.log('❌ reports fetchCurrentUserInfo: لا يوجد user أو uid');
      return;
    }
    
    console.log('🔍 reports fetchCurrentUserInfo: بدء جلب معلومات المستخدم');
    console.log('👤 reports User UID:', user.uid);
    console.log('📧 reports User Email:', user.email);
    console.log('📱 reports User Display Name:', user.displayName);
    
    try {
      // البحث في جميع أنواع الحسابات لمعرفة نوع الحساب الحالي
      const accountTypes = [
        { collection: 'clubs', type: 'نادي', icon: Building, color: 'bg-blue-500' },
        { collection: 'academies', type: 'أكاديمية', icon: Trophy, color: 'bg-orange-500' },
        { collection: 'trainers', type: 'مدرب', icon: User, color: 'bg-cyan-500' },
        { collection: 'agents', type: 'وكيل لاعبين', icon: Briefcase, color: 'bg-purple-500' },
        { collection: 'scouts', type: 'سكاوت', icon: Eye, color: 'bg-green-500' }
      ];
      
      let foundAccount = false;
      
      for (const accountType of accountTypes) {
        console.log(`🔎 reports البحث في ${accountType.collection} عن المستخدم ${user.uid}`);
        
        try {
          const userDoc = await getDoc(doc(db, accountType.collection, user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(`✅ reports تم العثور على المستخدم في ${accountType.collection}:`, userData);
            
            setCurrentUserInfo({
              ...userData,
              id: userDoc.id,
              type: accountType.type,
              icon: accountType.icon,
              color: accountType.color
            });
            
            foundAccount = true;
            break;
          } else {
            console.log(`❌ reports لم يتم العثور على المستخدم في ${accountType.collection}`);
          }
        } catch (docError) {
          console.error(`💥 reports خطأ في جلب ${accountType.collection}:`, docError);
        }
      }
      
      if (!foundAccount) {
        console.log('⚠️ reports لم يتم العثور على المستخدم في أي collection');
        setCurrentUserInfo(null);
      }
      
    } catch (error) {
      console.error('❌ reports خطأ عام في fetchCurrentUserInfo:', error);
      setCurrentUserInfo(null);
    }
  };

  // دالة تحويل مسار Supabase إلى رابط كامل (للوجو) - محسنة لتدعم جميع أنواع البوكتات
  const getSupabaseImageUrl = (path: string, organizationType?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    console.log(`🎨 معالجة مسار الصورة: ${path} لنوع المنظمة: ${organizationType}`);
    
    // تحديد البوكت المناسب حسب نوع المنظمة
    const bucketMapping: Record<string, string[]> = {
      'نادي': ['clubavatar', 'club-logos'],
      'أكاديمية': ['academyavatar', 'academy-logos', 'clubavatar'],
      'مدرب': ['traineravatar', 'trainer-logos', 'clubavatar'],
      'وكيل لاعبين': ['agentavatar', 'agent-logos', 'clubavatar']
    };
    
    const possibleBuckets = organizationType ? 
      (bucketMapping[organizationType] || ['clubavatar']) : 
      ['clubavatar', 'academyavatar', 'traineravatar', 'agentavatar'];
    
    console.log(`🗂️ البوكتات المحتملة:`, possibleBuckets);
    
    // جرب البوكتات بالترتيب حتى تجد واحد يعمل
    for (const bucket of possibleBuckets) {
      try {
        const { data: { publicUrl }, error } = supabase.storage.from(bucket).getPublicUrl(path);
        if (publicUrl && !error) {
          console.log(`✅ تم إنشاء رابط من البوكت ${bucket}: ${publicUrl}`);
          return publicUrl;
        }
      } catch (bucketError) {
        console.log(`⚠️ فشل البوكت ${bucket}:`, bucketError);
        continue;
      }
    }
    
    // إذا فشلت جميع البوكتات، ارجع المسار الأصلي
    console.log(`❌ فشل في جميع البوكتات، استخدام المسار الأصلي: ${path}`);
    return path;
  };

  // دالة جلب معلومات المنظمة التابع لها اللاعب (محسّنة مع تشخيص متقدم)
  const fetchPlayerOrganization = async () => {
    if (!player) {
      console.log('⚠️ fetchPlayerOrganization: لا توجد بيانات للاعب');
      return;
    }
    
    try {
      setOrganizationLoading(true);
      console.log('🔍 بدء البحث عن الجهة التابع لها اللاعب:', player.full_name);
      console.log('📋 بيانات اللاعب الكاملة:', player);
      
      // إنشاء تقرير مفصل عن جميع الحقول المحتملة
      const possibleFields = [
        'club_id', 'clubId', 'academy_id', 'academyId', 
        'trainer_id', 'trainerId', 'agent_id', 'agentId'
      ];
      
      console.log('🔎 فحص جميع الحقول المحتملة للانتماء:');
      possibleFields.forEach(field => {
        const value = (player as any)[field];
        console.log(`  ${field}: ${value || 'غير موجود'}`);
      });
      
      // البحث عن المنظمة التابع لها اللاعب مع دعم كلا التنسيقين
      const organizationFields = [
        { 
          field: 'club_id', 
          collection: 'clubs', 
          type: 'نادي', 
          icon: Building, 
          color: 'bg-blue-500',
          alternativeField: 'clubId'
        },
        { 
          field: 'academy_id', 
          collection: 'academies', 
          type: 'أكاديمية', 
          icon: Trophy, 
          color: 'bg-orange-500',
          alternativeField: 'academyId'
        },
        { 
          field: 'trainer_id', 
          collection: 'trainers', 
          type: 'مدرب', 
          icon: User, 
          color: 'bg-cyan-500',
          alternativeField: 'trainerId'
        },
        { 
          field: 'agent_id', 
          collection: 'agents', 
          type: 'وكيل لاعبين', 
          icon: Briefcase, 
          color: 'bg-purple-500',
          alternativeField: 'agentId'
        }
      ];
      
      console.log('🔎 البحث في الحقول التالية:');
      
      for (const orgField of organizationFields) {
        // البحث في كلا الحقلين
        const orgId = (player as any)[orgField.field] || (player as any)[orgField.alternativeField];
        
        console.log(`${orgField.type === 'نادي' ? '🏢' : 
                      orgField.type === 'أكاديمية' ? '🏆' : 
                      orgField.type === 'مدرب' ? '👨‍🏫' : '💼'} ${orgField.field}:`, 
                   (player as any)[orgField.field], 
                   `أو ${orgField.alternativeField}:`, 
                   (player as any)[orgField.alternativeField],
                   `النتيجة النهائية:`, orgId);
        
        if (orgId) {
          console.log(`✅ تم العثور على ${orgField.type} بـ ID: ${orgId}`);
          console.log(`🔍 البحث في collection: ${orgField.collection}`);
          
          try {
            const orgDoc = await getDoc(doc(db, orgField.collection, orgId));
            
            if (orgDoc.exists()) {
              const orgData = orgDoc.data();
              console.log(`✅ تم العثور على ${orgField.type} في قاعدة البيانات:`, orgData);
              
              // معالجة اللوجو بشكل صحيح مع تحديد نوع المنظمة
              let logoUrl = '';
              if (orgData.logo) {
                logoUrl = getSupabaseImageUrl(orgData.logo, orgField.type);
                console.log(`🎨 معالجة لوجو ${orgField.type}:`, {
                  originalPath: orgData.logo,
                  organizationType: orgField.type,
                  processedUrl: logoUrl
                });
              } else {
                console.log(`⚠️ لا يوجد لوجو محدد لـ ${orgField.type}`);
              }
              
              const organizationInfo = {
                ...orgData,
                id: orgDoc.id,
                type: orgField.type,
                icon: orgField.icon,
                color: orgField.color,
                logoUrl: logoUrl // إضافة اللوجو المعالج
              };
              
              console.log(`🎯 معلومات المنظمة النهائية:`, organizationInfo);
              
              setPlayerOrganization(organizationInfo);
              setOrganizationType(orgField.type);
              console.log(`✅ تم تعيين المنظمة بنجاح: ${orgField.type} - ${orgData.name || orgData.full_name}`);
              return; // خروج من الحلقة بعد العثور على المنظمة
            } else {
              console.log(`❌ ${orgField.type} بـ ID ${orgId} غير موجود في قاعدة البيانات`);
            }
          } catch (docError) {
            console.error(`💥 خطأ في جلب مستند ${orgField.type}:`, docError);
          }
        } else {
          console.log(`⚪ لا يوجد ${orgField.field} أو ${orgField.alternativeField} في بيانات اللاعب`);
        }
      }
      
      console.log('⚠️ لم يتم العثور على أي جهة تابع لها - اللاعب مستقل');
      setPlayerOrganization(null);
      setOrganizationType('');
      
    } catch (error) {
      console.error('❌ خطأ في جلب معلومات المنظمة:', error);
      setPlayerOrganization(null);
      setOrganizationType('');
    } finally {
      setOrganizationLoading(false);
      console.log('✅ انتهاء عملية البحث عن المنظمة');
    }
  };

  // Render functions for each tab
  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">الاسم الكامل</div>
        <div className="text-lg font-bold text-blue-900">{player?.full_name || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">تاريخ الميلاد</div>
        <div className="text-lg font-bold text-green-900">
          {(() => {
            if (!player?.birth_date) return '--';
            try {
              let date: Date;
              if (typeof player.birth_date === 'object' && (player.birth_date as any).toDate && typeof (player.birth_date as any).toDate === 'function') {
                date = (player.birth_date as any).toDate();
              } else if (player.birth_date instanceof Date) {
                date = player.birth_date;
              } else {
                date = new Date(player.birth_date);
              }
              
              if (isNaN(date.getTime())) {
                console.error('❌ تاريخ الميلاد غير صالح:', player.birth_date);
                return 'تاريخ غير صحيح';
              }
              
              // عرض التاريخ بالتقويم الميلادي باللغة العربية
              return date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                calendar: 'gregory' // فرض استخدام التقويم الميلادي
              });
            } catch (error) {
              console.error('❌ خطأ في تنسيق تاريخ الميلاد:', error);
              return 'تاريخ غير صحيح';
            }
          })()}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-orange-50">
        <div className="mb-1 font-semibold text-orange-700">العمر</div>
        <div className="text-lg font-bold text-orange-900">
          {(() => {
            const age = calculateAge(player?.birth_date);
            return age ? `${age} سنة` : '--';
          })()}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">الجنسية</div>
        <div className="text-lg font-bold text-purple-900">{player?.nationality || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">المدينة</div>
        <div className="text-lg font-bold text-yellow-900">{player?.city || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">الدولة</div>
        <div className="text-lg font-bold text-red-900">{player?.country || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">رقم الهاتف</div>
        <div className="text-lg font-bold text-indigo-900">{player?.phone || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-pink-50">
        <div className="mb-1 font-semibold text-pink-700">واتساب</div>
        <div className="text-lg font-bold text-pink-900">{player?.whatsapp || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-cyan-50">
        <div className="mb-1 font-semibold text-cyan-700">البريد الإلكتروني</div>
        <div className="text-lg font-bold text-cyan-900">{player?.email || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-teal-50">
        <div className="mb-1 font-semibold text-teal-700">العنوان</div>
        <div className="text-lg font-bold text-teal-900">{player?.address || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-slate-50">
        <div className="mb-1 font-semibold text-slate-700">نبذة مختصرة</div>
        <div className="text-lg font-bold text-slate-900">{player?.brief || '--'}</div>
      </div>
    </div>
  );

  const renderSportsInfo = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">المركز الأساسي</div>
        <div className="text-lg font-bold text-blue-900">{player?.primary_position || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">المركز الثانوي</div>
        <div className="text-lg font-bold text-green-900">{player?.secondary_position || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">القدم المفضلة</div>
        <div className="text-lg font-bold text-purple-900">{player?.preferred_foot || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">الطول</div>
        <div className="text-lg font-bold text-yellow-900">{player?.height ? `${player.height} سم` : '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">الوزن</div>
        <div className="text-lg font-bold text-red-900">{player?.weight ? `${player.weight} كجم` : '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">النادي الحالي</div>
        <div className="text-lg font-bold text-indigo-900">{player?.current_club || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-gray-50">
        <div className="mb-1 font-semibold text-gray-700">سنوات الخبرة</div>
        <div className="text-lg font-bold text-gray-900">{player?.experience_years || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-lime-50">
        <div className="mb-1 font-semibold text-lime-700">رقم اللاعب</div>
        <div className="text-lg font-bold text-lime-900">{player?.player_number || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-emerald-50">
        <div className="mb-1 font-semibold text-emerald-700">رقم القميص المفضل</div>
        <div className="text-lg font-bold text-emerald-900">{player?.favorite_jersey_number || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-pink-50">
        <div className="mb-2 font-semibold text-pink-700">الأندية السابقة</div>
        <div className="space-y-2">
          {player?.previous_clubs && player.previous_clubs.length > 0 ? (
            player.previous_clubs.map((club: string, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {club}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد أندية سابقة مسجلة</div>
          )}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-orange-50">
        <div className="mb-2 font-semibold text-orange-700">الإنجازات</div>
        <div className="space-y-2">
          {player?.achievements && player.achievements.length > 0 ? (
            player.achievements.map((achievement: Achievement, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                <div className="font-semibold">{achievement.title}</div>
                <div className="text-sm text-gray-600">التاريخ: {achievement.date}</div>
                {achievement.description && (
                  <div className="mt-1 text-sm text-gray-600">{achievement.description}</div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد إنجازات مسجلة</div>
          )}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-slate-50">
        <div className="mb-1 font-semibold text-slate-700">ملاحظات رياضية</div>
        <div className="text-lg font-bold text-slate-900">{player?.sports_notes || '--'}</div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">المستوى التعليمي</div>
        <div className="text-lg font-bold text-blue-900">{player?.education_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">سنة التخرج</div>
        <div className="text-lg font-bold text-green-900">{player?.graduation_year || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">مستوى اللغة الإنجليزية</div>
        <div className="text-lg font-bold text-purple-900">{player?.english_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">مستوى اللغة الإسبانية</div>
        <div className="text-lg font-bold text-yellow-900">{player?.spanish_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">مستوى اللغة العربية</div>
        <div className="text-lg font-bold text-red-900">{player?.arabic_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-gray-50">
        <div className="mb-1 font-semibold text-gray-700">الدرجة العلمية</div>
        <div className="text-lg font-bold text-gray-900">{player?.degree || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-indigo-50">
        <div className="mb-2 font-semibold text-indigo-700">الدورات التدريبية</div>
        <div className="space-y-2">
          {player?.training_courses && player.training_courses.length > 0 ? (
            player.training_courses.map((course: string, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {course}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد دورات تدريبية مسجلة</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMedicalRecord = () => {
    // حساب BMI
    const height = player?.height ? parseFloat(player.height) : null;
    const weight = player?.weight ? parseFloat(player.weight) : null;
    const bmi = height && weight ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="mb-1 font-semibold text-gray-700">الوزن (كجم)</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.weight || '--'}</div>
            {bmi && <div className="mt-1 text-xs text-gray-500">BMI: {bmi}</div>}
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">الطول (سم)</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.height || '--'}</div>
            <div className="mt-1 text-xs text-gray-500">متوسط الطول العالمي: 175 سم</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">فصيلة الدم</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.blood_type || '--'}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">آخر فحص طبي</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.medical_history?.last_checkup || '--'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 font-semibold text-gray-700">هل لديك أمراض مزمنة؟</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.chronic_conditions ? 'نعم' : 'لا'}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">تفاصيل الأمراض المزمنة</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.chronic_details || 'لا يوجد'}</div>
          </div>
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">الحساسية</div>
          <div className="p-2 text-center bg-gray-100 rounded">{player?.allergies ? player.allergies : 'لا يوجد'}</div>
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">الإصابات السابقة</div>
          {player?.injuries && player.injuries.length > 0 ? (
            player.injuries.map((injury: Injury, idx: number) => (
              <div key={idx} className="p-2 mb-2 bg-gray-100 rounded">
                <div>النوع: {injury.type || '--'}</div>
                <div>التاريخ: {injury.date || '--'}</div>
                <div>الحالة: {injury.status || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center bg-gray-100 rounded">لا يوجد</div>
          )}
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">العمليات الجراحية</div>
          {player?.surgeries && player.surgeries.length > 0 ? (
            player.surgeries.map((surgery, idx) => (
              <div key={idx} className="p-2 mb-2 bg-gray-100 rounded">
                <div>النوع: {surgery.type || '--'}</div>
                <div>التاريخ: {surgery.date || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center bg-gray-100 rounded">لا يوجد</div>
          )}
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">ملاحظات طبية</div>
          <div className="p-2 text-center bg-gray-100 rounded">{player?.medical_notes || 'لا يوجد'}</div>
        </div>
      </div>
    );
  };

  const renderSkills = () => (
    <div className="space-y-8">
      {technicalSkillsData.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات الفنية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={technicalSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {technicalSkillsData.map((skillData, index) => (
              <div key={index} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {skillData.skill}
                </div>
                <div className="text-sm text-gray-600">المستوى: {skillData.value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {physicalSkillsData.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات البدنية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={physicalSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {physicalSkillsData.map((skillData, index) => (
              <div key={index} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {skillData.skill}
                </div>
                <div className="text-sm text-gray-600">المستوى: {skillData.value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {socialSkillsData.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات الاجتماعية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={socialSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {socialSkillsData.map((skillData, index) => (
              <div key={index} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {skillData.skill}
                </div>
                <div className="text-sm text-gray-600">المستوى: {skillData.value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderObjectives = () => {
    // تعريف الأهداف مع تسمياتها
    const objectiveLabels = {
      professional: 'الاحتراف',
      trials: 'إجراء التجارب',
      local_leagues: 'اللعب في الدوريات المحلية',
      arab_leagues: 'اللعب في الدوريات العربية',
      european_leagues: 'اللعب في الدوريات الأوروبية',
      training: 'التدريب والتطوير',
      other: 'أهداف أخرى'
    };

    return (
      <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {player?.objectives && Object.entries(player.objectives).map(([key, value]: [string, boolean | string]) => {
            const label = objectiveLabels[key as keyof typeof objectiveLabels] || key;
            const displayValue = typeof value === 'boolean' ? (value ? 'نعم ✅' : 'لا ❌') : value || '--';
            const bgColor = typeof value === 'boolean' 
              ? (value ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')
              : 'bg-blue-50 border-blue-200';
            const textColor = typeof value === 'boolean'
              ? (value ? 'text-green-700' : 'text-gray-700') 
              : 'text-blue-700';
            const valueColor = typeof value === 'boolean'
              ? (value ? 'text-green-900' : 'text-gray-900')
              : 'text-blue-900';

            return (
              <div key={key} className={`p-4 rounded-lg border-2 ${bgColor}`}>
                <div className={`mb-2 font-semibold ${textColor}`}>
                  {label}
          </div>
                <div className={`text-lg font-bold ${valueColor}`}>
                  {displayValue}
          </div>
        </div>
            );
          })}
        </div>
        
        {/* عرض ملخص الأهداف */}
        {player?.objectives && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h4 className="mb-3 text-lg font-semibold text-blue-800">ملخص الأهداف والطموحات</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">الأهداف المحددة: </span>
                <span className="font-bold text-green-900">
                  {Object.values(player.objectives).filter(v => v === true).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-700">إجمالي الأهداف: </span>
                <span className="font-bold text-blue-900">
                  {Object.keys(player.objectives).length}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
  };

  const renderMedia = () => {
    console.log('🎬 [renderMedia] بيانات اللاعب المعالجة:', {
      profile_image_url: player?.profile_image_url,
      additional_images: player?.additional_images,
      additional_images_length: player?.additional_images?.length || 0,
      videos: player?.videos,
      videos_length: player?.videos?.length || 0,
      documents: player?.documents,
      documents_length: player?.documents?.length || 0
    });

    // تجميع كل الصور من مصادر مختلفة
    const allImages: { url: string; label: string; type: 'profile' | 'additional' }[] = [];
    
    // إضافة الصورة الشخصية
    if (player?.profile_image_url) {
      console.log('✅ [renderMedia] تم العثور على صورة شخصية:', player.profile_image_url);
      allImages.push({ url: player.profile_image_url, label: 'الصورة الشخصية', type: 'profile' });
    } else {
      console.log('❌ [renderMedia] لا توجد صورة شخصية');
    }
    
    // إضافة الصور الإضافية مع تحقق محسن
    if (player?.additional_images && player.additional_images.length > 0) {
      console.log('✅ [renderMedia] تم العثور على صور إضافية:', player.additional_images);
      player.additional_images.forEach((image, index) => {
        console.log(`📷 [renderMedia] معالجة الصورة الإضافية ${index + 1}:`, image);
        
        let imageUrl = '';
        
        // تحقق من البنية المختلفة للصورة
        if (typeof image === 'string') {
          imageUrl = image;
          console.log(`✅ رابط مباشر للصورة ${index + 1}:`, imageUrl);
        } else if (image && typeof image === 'object') {
          if (image.url) {
            imageUrl = image.url;
            console.log(`✅ رابط من image.url للصورة ${index + 1}:`, imageUrl);
          } else if ((image as any).src) {
            imageUrl = (image as any).src;
            console.log(`✅ رابط من image.src للصورة ${index + 1}:`, imageUrl);
          } else if ((image as any).path) {
            imageUrl = (image as any).path;
            console.log(`✅ رابط من image.path للصورة ${index + 1}:`, imageUrl);
          } else {
            console.log(`❌ لم يتم العثور على رابط للصورة ${index + 1}:`, image);
          }
        }
        
        if (imageUrl && imageUrl.trim() !== '') {
          allImages.push({ url: imageUrl, label: `صورة إضافية ${index + 1}`, type: 'additional' });
          console.log(`✅ تم إضافة الصورة ${index + 1} إلى المجموعة`);
        } else {
          console.log(`❌ رابط الصورة ${index + 1} فارغ أو غير صحيح`);
        }
      });
    } else {
      console.log('❌ [renderMedia] لا توجد صور إضافية');
             console.log('🔍 تحقق من البيانات:', {
         additional_images: player?.additional_images,
         hasAdditionalImages: !!player?.additional_images,
         additionalImagesLength: player?.additional_images?.length || 0
       });
    }

    console.log('📷 [renderMedia] إجمالي الصور:', allImages);

    return (
    <div className="space-y-8">
        {/* زر التشخيص الشامل */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
        <div>
              <h4 className="font-semibold text-blue-800">تشخيص بيانات الوسائط</h4>
              <p className="text-sm text-blue-600">اضغط لعرض جميع بيانات الصور والفيديوهات والمستندات</p>
            </div>
            <button
              onClick={() => {
                console.log('🔍 تشخيص شامل للوسائط:', {
                  profile_image_url: player?.profile_image_url,
                  profile_image: player?.profile_image,
                  additional_images: player?.additional_images,
                  additional_images_length: player?.additional_images?.length || 0,
                  videos: player?.videos,
                  videos_length: player?.videos?.length || 0,
                  documents: player?.documents,
                  documents_length: player?.documents?.length || 0,
                  allImages: allImages,
                  allImages_length: allImages.length
                });
                
                const diagnosticData = {
                  'الصورة الشخصية': player?.profile_image_url || 'غير موجودة',
                  'عدد الصور الإضافية': player?.additional_images?.length || 0,
                  'عدد الفيديوهات': player?.videos?.length || 0,
                  'عدد المستندات': player?.documents?.length || 0,
                  'إجمالي الصور المعروضة': allImages.length
                };
                
                alert('تشخيص بيانات الوسائط:\n\n' + 
                  Object.entries(diagnosticData)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n') + 
                  '\n\nتحقق من console للتفاصيل الكاملة'
                );
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔍 تشخيص البيانات
            </button>
          </div>
        </div>
        
        {/* قسم جميع الصور */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">الصور</h3>
            {allImages.length > 0 && (
              <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                {allImages.length} صورة
              </span>
            )}
          </div>

          {allImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {allImages.map((image, index) => (
                <div key={`image-${index}`} className="relative overflow-hidden rounded-lg shadow-md aspect-square group">
                <img
                  src={image.url}
                    alt={image.label}
                    className="object-cover w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setSelectedImage(image.url);
                    setSelectedImageIdx(index);
                  }}
                    onLoad={() => console.log(`✅ تم تحميل ${image.label} بنجاح`)}
                    onError={(e) => {
                      console.error(`❌ فشل في تحميل ${image.label}:`, e);
                      console.error(`❌ رابط الصورة:`, image.url);
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded">
                    {index + 1}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 text-xs text-white bg-black bg-opacity-70 rounded truncate">
                    {image.label}
                  </div>
                  {image.type === 'profile' && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-xs text-white bg-blue-600 rounded">
                      ⭐ شخصية
                    </div>
                  )}
                  {/* زر التشخيص - يظهر عند hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`تفاصيل ${image.label}:`, image);
                        alert(`${image.label}\nالرابط: ${image.url}`);
                      }}
                      className="px-3 py-1 text-xs bg-white bg-opacity-90 text-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      عرض الرابط
                    </button>
                  </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد صور</h3>
              <p className="mb-4 text-gray-500">أضف صورة شخصية وصور إضافية لإظهار مهاراتك وإنجازاتك</p>
              <div className="text-sm text-gray-400">
                💡 يمكنك إضافة الصور من صفحة تعديل الملف الشخصي
          </div>
        </div>
      )}
        </div>

      {/* قسم الفيديوهات المحسن */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">الفيديوهات</h3>
          <div className="flex items-center gap-3">
            {player?.videos && player.videos.length > 0 && (
              <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                {player.videos.length} فيديو
              </span>
            )}
            <button
              onClick={() => router.push('/dashboard/player/videos')}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إدارة الفيديوهات
            </button>
          </div>
        </div>
        
        {player?.videos && player.videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {player.videos.map((video: Video, index: number) => {
                console.log(`🎬 [renderMedia] فيديو ${index + 1}:`, video);
                console.log(`🔗 رابط الفيديو:`, video.url);
                console.log(`📝 وصف الفيديو:`, video.desc);
                
                // التحقق من صحة رابط الفيديو
                if (!video.url || video.url.trim() === '') {
                  console.log(`❌ رابط الفيديو ${index + 1} فارغ`);
                  return (
                    <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600">رابط الفيديو {index + 1} غير صحيح أو فارغ</p>
                    </div>
                  );
                }
                
                return (
              <div key={index} className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
                    <div className="aspect-video bg-gray-100 relative">
                  <ReactPlayer
                    url={video.url}
                    width="100%"
                    height="100%"
                    controls
                    light
                        config={{
                          youtube: {
                            playerVars: { showinfo: 1 }
                          },
                          vimeo: {
                            playerOptions: { byline: false }
                          }
                        }}
                        onError={(error) => {
                          console.error(`❌ خطأ في تشغيل الفيديو ${index + 1}:`, error);
                        }}
                        onReady={() => {
                          console.log(`✅ تم تحميل الفيديو ${index + 1} بنجاح`);
                        }}
                    playIcon={
                      <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-5.4-6.7L7.4 8.7a8 8 0 000 6.6l2.6 4.7c.3.5 1.1.5 1.4 0l2.6-4.7a8 8 0 000-6.6L11.4 3.3c-.3-.5-1.1-.5-1.4 0z" />
                        </svg>
                      </div>
                    }
                  />
                      {/* عرض رابط الفيديو للتشخيص */}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                        Video {index + 1}
                      </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm text-gray-700">
                    {video.desc || 'لا يوجد وصف'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">فيديو {index + 1}</span>
                        <div className="flex gap-2">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      مشاهدة في نافذة جديدة
                    </a>
                          <button
                            onClick={() => {
                              console.log('تفاصيل الفيديو:', video);
                              alert(`رابط الفيديو: ${video.url}`);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            تشخيص
                          </button>
                  </div>
                </div>
              </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-12 text-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد فيديوهات</h3>
            <p className="mb-4 text-gray-500">أضف فيديوهات لتظهر مهاراتك وإنجازاتك</p>
            <button
              onClick={() => router.push('/dashboard/player/videos')}
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة فيديو
            </button>
          </div>
        )}
      </div>

        {/* قسم المستندات الجديد */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">المستندات والشهادات</h3>
            {player?.documents && player.documents.length > 0 && (
              <span className="px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full">
                {player.documents.length} مستند
              </span>
            )}
          </div>

          {player?.documents && player.documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {player.documents.map((doc: Document, index: number) => (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">النوع: {doc.type}</p>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        عرض المستند
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد مستندات</h3>
              <p className="mb-4 text-gray-500">أضف مستندات وشهادات لتعزيز ملفك الشخصي</p>
            </div>
          )}
        </div>
    </div>
  );
  };

  const renderContracts = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* سؤال جواز السفر */}
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">هل لديك جواز سفر؟</div>
        <div className="text-lg font-bold text-blue-900">
          {player?.has_passport === 'yes' ? 'نعم' : player?.has_passport === 'no' ? 'لا' : '--'}
        </div>
      </div>
      {/* سؤال متعاقد حاليًا */}
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">هل أنت متعاقد حاليًا؟</div>
        <div className="text-lg font-bold text-green-900">
          {player?.currently_contracted === 'yes' ? 'نعم' : player?.currently_contracted === 'no' ? 'لا' : '--'}
        </div>
      </div>
      {/* تاريخ التعاقدات السابقة */}
      <div className="col-span-2 p-4 rounded-lg bg-gray-50">
        <div className="mb-2 font-semibold text-gray-700">تاريخ التعاقدات السابقة</div>
        <div className="space-y-2">
          {player?.contract_history && player.contract_history.length > 0 ? (
            player.contract_history.map((contract: ContractHistory, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div>النادي: {contract.club || '--'}</div>
                <div>الفترة: {contract.from} - {contract.to}</div>
                <div>المركز: {contract.role || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد تعاقدات سابقة مسجلة</div>
          )}
        </div>
      </div>
      {/* بيانات وكيل اللاعبين */}
      <div className="col-span-2 p-4 rounded-lg bg-yellow-50">
        <div className="mb-2 font-semibold text-yellow-700">تاريخ وكيل اللاعبين</div>
        <div className="space-y-2">
          {player?.agent_history && player.agent_history.length > 0 ? (
            player.agent_history.map((agent: AgentHistory, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div>الاسم: {agent.agent || '--'}</div>
                <div>الفترة: {agent.from} - {agent.to}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا يوجد وكلاء لاعبين مسجلين</div>
          )}
        </div>
      </div>
      {/* جهة الاتصال والتفاوض الرسمية */}
      <div className="col-span-2 p-4 rounded-lg bg-purple-50">
        <div className="mb-2 font-semibold text-purple-700">جهة الاتصال والتفاوض الرسمية</div>
        <div className="p-2 bg-white rounded">
          <div>الاسم: {player?.official_contact?.name || '--'}</div>
          <div>المسمى الوظيفي: {player?.official_contact?.title || '--'}</div>
          <div>رقم الهاتف: {player?.official_contact?.phone || '--'}</div>
          <div>البريد الإلكتروني: {player?.official_contact?.email || '--'}</div>
        </div>
      </div>
      {/* كيف عرفت المنصة */}
      <div className="col-span-2 p-4 rounded-lg bg-orange-50">
        <div className="mb-2 font-semibold text-orange-700">من أين عرفت عنا؟</div>
        <div className="p-2 bg-white rounded">
          {player?.ref_source || '--'}
        </div>
      </div>

      {/* بيانات الاشتراك */}
      <div className="col-span-2 p-4 rounded-lg bg-green-50">
        <div className="mb-2 font-semibold text-green-700">تاريخ انتهاء الاشتراك</div>
        <div className="text-lg font-bold text-green-900">
          {player?.subscription_end ? dayjs(player.subscription_end).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-yellow-50">
        <div className="mb-2 font-semibold text-yellow-700">حالة الاشتراك</div>
        <div className="text-lg font-bold text-yellow-900">
          {player?.subscription_status || '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-red-50">
        <div className="mb-2 font-semibold text-red-700">نوع الاشتراك</div>
        <div className="text-lg font-bold text-red-900">
          {player?.subscription_type || '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-purple-50">
        <div className="mb-2 font-semibold text-purple-700">آخر تحديث</div>
        <div className="text-lg font-bold text-purple-900">
          {player?.updated_at ? dayjs(player.updated_at).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
    </div>
  );

  const TABS = [
    { name: 'البيانات الشخصية', render: renderPersonalInfo },
    { name: 'المعلومات الرياضية', render: renderSportsInfo },
    { name: 'التعليم', render: renderEducation },
    { name: 'السجل الطبي', render: renderMedicalRecord },
    { name: 'المهارات', render: renderSkills },
    { name: 'التعاقدات', render: renderContracts },
    { name: 'الأهداف', render: renderObjectives },
    { name: 'الوسائط', render: renderMedia },
  ];

  // دالة لحساب نسبة اكتمال الملف الشخصي
  const calculateProfileCompletion = (player: PlayerFormData | null): number => {
    if (!player) return 0;

    const requiredFields = {
      basic: [
        'full_name',
        'birth_date',
        'nationality',
        'city',
        'country',
        'phone',
        'whatsapp',
        'email',
        'profile_image_url'
      ],
      physical: [
        'height',
        'weight',
        'blood_type',
        'chronic_details'
      ],
      football: [
        'primary_position',
        'secondary_position',
        'preferred_foot',
        'current_club'
      ],
      skills: [
        'technical_skills',
        'physical_skills',
        'social_skills'
      ],
      education: [
        'education_level',
        'graduation_year',
        'english_level',
        'spanish_level',
        'arabic_level'
      ],
      objectives: [
        'objectives'
      ],
      media: [
        'additional_image_urls',
        'videos'
      ]
    };

    let totalFields = 0;
    let completedFields = 0;

    // حساب الحقول الأساسية
    for (const field of requiredFields.basic) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الحقول البدنية
    for (const field of requiredFields.physical) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الحقول المتعلقة بكرة القدم
    for (const field of requiredFields.football) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب المهارات
    for (const field of requiredFields.skills) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && Object.keys(player[field as keyof PlayerFormData] || {}).length > 0) {
        completedFields++;
      }
    }

    // حساب الحقول التعليمية
    for (const field of requiredFields.education) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الأهداف
    totalFields++;
    if (player.objectives && Object.values(player.objectives).some(value => value === true)) {
      completedFields++;
    }

    // حساب الوسائط
    for (const field of requiredFields.media) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && Array.isArray(player[field as keyof PlayerFormData]) && (player[field as keyof PlayerFormData] as any[]).length > 0) {
        completedFields++;
      }
    }

    return Math.round((completedFields / totalFields) * 100);
  };

  // جلب بيانات اللاعب من Firebase والصور من Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchPlayerData = async () => {
      if (!user && !viewPlayerId) {
        console.log("No user found, redirecting to login");
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        // إذا كان هناك viewPlayerId نستخدمه، وإلا نستخدم user.uid
        const playerId = viewPlayerId || user?.uid;
        
        console.log('📋 تشخيص جلب البيانات:');
        console.log('  - viewPlayerId:', viewPlayerId);
        console.log('  - user?.uid:', user?.uid);
        console.log('  - playerId المختار:', playerId);
        
        if (!playerId) {
          console.log('❌ لم يتم تحديد معرف اللاعب');
          setError("لم يتم تحديد اللاعب المطلوب");
          setIsLoading(false);
          return;
        }
        
        console.log("🔍 البحث عن بيانات اللاعب:", playerId);

        const playerDoc = await getDoc(doc(db, 'players', playerId));
        console.log("🔥 استجابة Firestore:", playerDoc.exists() ? "✅ المستند موجود" : "❌ المستند غير موجود");

        if (!isMounted) return;

        if (!playerDoc.exists()) {
          console.log("❌ لم يتم العثور على مستند اللاعب:", playerId);
          console.log("🔍 التفاصيل الإضافية:");
          console.log("  - نوع المعرف:", typeof playerId);
          console.log("  - طول المعرف:", playerId?.length);
          console.log("  - محاولة البحث في المجموعة: players");
          console.log("  - المسار الكامل: players/" + playerId);
          
          setError(`لم يتم العثور على بيانات اللاعب بالمعرف: ${playerId}`);
          setIsLoading(false);
          return;
        }

        const data = playerDoc.data();
        console.log("✅ تم جلب بيانات اللاعب بنجاح:", data?.full_name || 'اسم غير محدد');

        if (!data) {
          console.error("Player data is null or undefined");
          setError("بيانات اللاعب فارغة");
          setIsLoading(false);
          return;
        }

        // معالجة البيانات الطبية
        const medicalHistory = {
          blood_type: data.blood_type || '',
          chronic_conditions: data.chronic_conditions ? [data.chronic_conditions] : [],
          allergies: data.allergies ? [data.allergies] : [],
          injuries: data.injuries || [],
          last_checkup: data.medical_history?.last_checkup || ''
        };

        // معالجة الصور
        console.log("معلومات الصور في البيانات:", {
          additional_image_urls: data.additional_image_urls,
          additional_images: data.additional_images,
          profile_image_url: data.profile_image_url,
          profile_image: data.profile_image
        });
        
        // إصلاح معالجة الصور الإضافية - البحث في الحقول الصحيحة
        let additionalImages: { url: string }[] = [];
        
        if (data.additional_images && Array.isArray(data.additional_images)) {
          // الحقل الصحيح من صفحة التحرير
          additionalImages = data.additional_images;
          console.log("✅ تم العثور على additional_images:", additionalImages);
        } else if (data.additional_image_urls && Array.isArray(data.additional_image_urls)) {
          // حقل بديل
          additionalImages = data.additional_image_urls.map((url: string) => ({ url }));
          console.log("✅ تم العثور على additional_image_urls:", additionalImages);
        } else {
          console.log("❌ لم يتم العثور على صور إضافية");
        }

        // معالجة الفيديوهات
        console.log("معلومات الفيديوهات في البيانات:", {
          videos: data.videos,
          videosLength: data.videos?.length || 0
        });
        const videos = data.videos || [];

        // معالجة التواريخ
        let birthDate: Date | undefined = undefined;
        try {
          birthDate = data.birth_date ? new Date(data.birth_date) : undefined;
        } catch (dateError) {
          console.error("Error converting birth_date:", dateError);
          birthDate = undefined;
        }

        let updatedAt = null;
        try {
          updatedAt = (data.updated_at as any)?.toDate() || new Date();
        } catch (dateError) {
          console.error("Error converting updated_at:", dateError);
          updatedAt = new Date();
        }

        let subscriptionEnd = null;
        try {
          subscriptionEnd = (data.subscription_end as any)?.toDate() || null;
        } catch (dateError) {
          console.error("Error converting subscription_end:", dateError);
          subscriptionEnd = null;
        }

        if (!isMounted) return;

        // إصلاح الصورة الشخصية - البحث في الحقول المختلفة
        let profileImageUrl = '';
        if (data.profile_image_url) {
          profileImageUrl = data.profile_image_url;
          console.log("✅ تم العثور على profile_image_url:", profileImageUrl);
        } else if (data.profile_image) {
          if (typeof data.profile_image === 'string') {
            profileImageUrl = data.profile_image;
            console.log("✅ تم العثور على profile_image (string):", profileImageUrl);
          } else if (data.profile_image && data.profile_image.url) {
            profileImageUrl = data.profile_image.url;
            console.log("✅ تم العثور على profile_image.url:", profileImageUrl);
          }
        }
        
        console.log("🖼️ الصورة الشخصية النهائية:", profileImageUrl);
        console.log("📷 الصور الإضافية النهائية:", additionalImages);
        console.log("🎬 الفيديوهات النهائية:", videos);

        const processedData: PlayerFormData = {
          full_name: data.full_name || '',
          birth_date: birthDate,
          nationality: data.nationality || '',
          city: data.city || '',
          country: data.country || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          brief: data.brief || '',
          education_level: data.education_level || '',
          graduation_year: data.graduation_year || '',
          degree: data.degree || '',
          english_level: data.english_level || '',
          arabic_level: data.arabic_level || '',
          spanish_level: data.spanish_level || '',
          blood_type: data.blood_type || '',
          height: data.height || '',
          weight: data.weight || '',
          chronic_conditions: data.chronic_conditions || false,
          chronic_details: data.chronic_details || '',
          injuries: data.injuries || [],
          surgeries: data.surgeries || [],
          allergies: data.allergies || '',
          medical_notes: data.medical_notes || '',
          primary_position: data.primary_position || '',
          secondary_position: data.secondary_position || '',
          preferred_foot: data.preferred_foot || '',
          club_history: data.club_history || [],
          experience_years: data.experience_years || '',
          sports_notes: data.sports_notes || '',
          technical_skills: data.technical_skills || {},
          physical_skills: data.physical_skills || {},
          social_skills: data.social_skills || {},
          objectives: data.objectives || {
            professional: false,
            trials: false,
            local_leagues: false,
            arab_leagues: false,
            european_leagues: false,
            training: false,
            other: ''
          },
          profile_image: data.profile_image || null,
          additional_images: additionalImages,
          videos: videos,
          training_courses: data.training_courses || [],
          has_passport: data.has_passport || 'no',
          ref_source: data.ref_source || '',
          contract_history: data.contract_history || [],
          agent_history: data.agent_history || [],
          official_contact: data.official_contact || { name: '', title: '', phone: '', email: '' },
          currently_contracted: data.currently_contracted || 'no',
          achievements: data.achievements || [],
          medical_history: medicalHistory,
          current_club: data.current_club || '',
          previous_clubs: data.previous_clubs || [],
          documents: data.documents || [],
          updated_at: updatedAt,
          subscription_end: subscriptionEnd,
          profile_image_url: profileImageUrl, // استخدام القيمة المعالجة
          subscription_status: data.subscription_status || '',
          subscription_type: data.subscription_type || '',
          address: data.address || '',
          player_number: data.player_number || '',
          favorite_jersey_number: data.favorite_jersey_number || ''
        };

        setPlayer(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching player data:", error);
        if (isMounted) {
          setError("حدث خطأ أثناء جلب بيانات اللاعب. يرجى المحاولة لاحقاً");
          setIsLoading(false);
        }
      }
    };

    fetchPlayerData();

    return () => {
      isMounted = false;
    };
  }, [user, router, viewPlayerId]);

  // جلب معلومات الحساب الحالي
  useEffect(() => {
    if (user) {
      fetchCurrentUserInfo();
    }
  }, [user]);

  // جلب معلومات المنظمة التابع لها اللاعب
  useEffect(() => {
    console.log('🔥 useEffect للمنظمة triggered - حالة اللاعب:', {
      hasPlayer: !!player,
      playerName: player?.full_name,
      playerId: (player as any)?.id
    });
    
    if (player) {
      console.log('✅ استدعاء fetchPlayerOrganization للاعب:', player.full_name);
      fetchPlayerOrganization();
    } else {
      console.log('⚠️ لا توجد بيانات للاعب - تخطي استدعاء fetchPlayerOrganization');
      setOrganizationLoading(false);
      setPlayerOrganization(null);
      setOrganizationType('');
    }
  }, [player]); // إزالة fetchPlayerOrganization من dependencies لتجنب infinite loop

  // دالة توليد رابط الملف الشخصي للمنظمة
  const getOrganizationProfileUrl = (organization: any): string => {
    if (!organization || !organization.type || !organization.id) return '';
    
    switch (organization.type) {
      case 'نادي':
        return `/dashboard/player/search/profile/club/${organization.id}`;
      case 'أكاديمية':
        return `/dashboard/player/search/profile/academy/${organization.id}`;
      case 'مدرب':
        return `/dashboard/player/search/profile/trainer/${organization.id}`;
      case 'وكيل لاعبين':
        return `/dashboard/player/search/profile/agent/${organization.id}`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header مع معلومات الحساب */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* زر العودة */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">العودة</span>
            </button>

            {/* معلومات الحساب المصادق - محسنة للوضوح */}
            {currentUserInfo && (
              <div className="flex items-center gap-3">
                {/* تسمية توضيحية */}
                <div className="text-sm text-gray-500 font-medium border-l border-gray-300 pl-3">
                  تتصفح بحساب:
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 shadow-sm">
                  <div className={`p-2 rounded-full ${currentUserInfo.color} text-white shadow-sm`}>
                    <currentUserInfo.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">
                      {currentUserInfo.name || currentUserInfo.full_name}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {currentUserInfo.type} • نشط
                    </div>
                  </div>
                  
                  {/* أيقونة التحقق */}
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-600 mb-2">⚠️ خطأ في تحميل البيانات</h2>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{error}</p>
              
              {/* تفاصيل إضافية للمطورين */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs text-left">
                <div className="font-mono">
                  <div>🔍 Player ID: {viewPlayerId || user?.uid || 'غير محدد'}</div>
                  <div>👤 User ID: {user?.uid || 'غير مسجل'}</div>
                  <div>🔗 View Mode: {viewPlayerId ? 'عرض لاعب آخر' : 'عرض الملف الشخصي'}</div>
                </div>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔙 العودة
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🔄 إعادة تحميل
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* شريط توضيحي لبيانات اللاعب */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-6 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">ملف اللاعب التفصيلي</h2>
                  <p className="text-blue-100 text-sm">جميع البيانات التالية خاصة باللاعب المعروض</p>
                </div>
              </div>
            </div>

            {/* Header اللاعب - محسن */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* تسمية توضيحية لبيانات اللاعب */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                    📋 بيانات اللاعب
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end gap-6">
                    {/* صورة اللاعب مع لوجو الجهة التابع لها */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                        {player?.profile_image_url ? (
                          <img
                            src={player.profile_image_url}
                            alt={player.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <User className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* لوجو الجهة التابع لها مع تحسينات */}
                      {!organizationLoading && playerOrganization && (
                        <button
                          onClick={() => {
                            const profileUrl = getOrganizationProfileUrl(playerOrganization);
                            if (profileUrl) {
                              router.push(profileUrl);
                            }
                          }}
                          className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full border-3 border-white shadow-lg hover:scale-110 transition-transform group bg-white"
                          title={`انتقل إلى ملف ${playerOrganization.type}: ${playerOrganization.name || playerOrganization.full_name}`}
                        >
                          {playerOrganization.logoUrl ? (
                            <img
                              src={playerOrganization.logoUrl}
                              alt={`لوجو ${playerOrganization.name || playerOrganization.full_name}`}
                              className="w-full h-full rounded-full object-cover group-hover:shadow-md"
                              onError={(e) => {
                                console.log(`❌ فشل تحميل لوجو ${playerOrganization.type}، استخدام الأيقونة الافتراضية`);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full rounded-full ${playerOrganization.color} flex items-center justify-center text-white group-hover:shadow-md ${
                              playerOrganization.logoUrl ? 'hidden' : 'flex'
                            }`}
                          >
                            <playerOrganization.icon className="w-6 h-6" />
                          </div>
                          
                          {/* نص توضيحي صغير */}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {playerOrganization.type}
                            </div>
                          </div>
                        </button>
                      )}
                      
                      {/* شارة اللاعب المستقل - محسنة */}
                      {!organizationLoading && !playerOrganization && (
                        <div
                          className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full border-3 border-white shadow-lg bg-gray-500 flex items-center justify-center group"
                          title="لاعب مستقل - غير تابع لأي جهة"
                        >
                          <User className="w-6 h-6 text-white" />
                          
                          {/* نص توضيحي */}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              مستقل
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* مؤشر التحميل */}
                      {organizationLoading && (
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full border-3 border-white shadow-lg bg-blue-500 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* معلومات اللاعب */}
                    <div className="flex-1 text-white mb-4">
                      <h1 className="text-3xl font-bold mb-2">{player?.full_name}</h1>
                      <div className="flex items-center gap-4 text-white/90">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {player?.primary_position || 'غير محدد'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {(() => {
                            const age = calculateAge(player?.birth_date);
                            return age ? `${age} سنة` : 'العمر غير محدد';
                          })()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {player?.nationality || player?.country || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات الجهة التابع لها والاتصال - محسنة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* الجهة التابع لها - محسنة للوضوح */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    الجهة التابع لها اللاعب
                  </h3>
                  
                  {/* مؤشر الحالة */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    !organizationLoading && playerOrganization 
                      ? 'bg-green-100 text-green-800' 
                      : !organizationLoading && !playerOrganization
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {!organizationLoading && playerOrganization 
                      ? '✅ تابع لجهة' 
                      : !organizationLoading && !playerOrganization
                      ? '🔸 مستقل'
                      : '⏳ جاري التحقق'
                    }
                  </div>
                </div>
                
                {!organizationLoading && playerOrganization ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {playerOrganization.logoUrl ? (
                            <img
                              src={playerOrganization.logoUrl}
                              alt={`لوجو ${playerOrganization.name || playerOrganization.full_name}`}
                              className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-white"
                              onError={(e) => {
                                console.log(`❌ فشل تحميل لوجو ${playerOrganization.type} في القسم الرئيسي`);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-14 h-14 p-3 rounded-full ${playerOrganization.color} text-white shadow-lg ${
                            playerOrganization.logoUrl ? 'hidden' : 'flex'
                          } items-center justify-center border-2 border-white`}>
                            <playerOrganization.icon className="w-7 h-7" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 text-lg">
                            {playerOrganization.name || playerOrganization.full_name}
                          </div>
                          <div className="text-sm text-gray-700 font-medium flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${playerOrganization.color.replace('bg-', 'bg-')}`}></span>
                            {playerOrganization.type}
                          </div>
                          {(playerOrganization.city || playerOrganization.country) && (
                            <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {playerOrganization.city}
                              {playerOrganization.city && playerOrganization.country && ', '}
                              {playerOrganization.country}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const profileUrl = getOrganizationProfileUrl(playerOrganization);
                            if (profileUrl) {
                              router.push(profileUrl);
                            }
                          }}
                          disabled={!getOrganizationProfileUrl(playerOrganization)}
                          className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                          title="عرض الملف الشخصي"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* معلومات إضافية عن الجهة */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      {playerOrganization.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{playerOrganization.email}</span>
                        </div>
                      )}
                      {playerOrganization.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{playerOrganization.phone}</span>
                        </div>
                      )}
                      {playerOrganization.founded && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>تأسس: {playerOrganization.founded}</span>
                        </div>
                      )}
                      {playerOrganization.type === 'نادي' && playerOrganization.league && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                          <Trophy className="w-4 h-4 text-gray-400" />
                          <span>{playerOrganization.league}</span>
                        </div>
                      )}
                    </div>

                    {/* وصف موجز */}
                    {playerOrganization.description && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                          {playerOrganization.description.length > 150 
                            ? playerOrganization.description.slice(0, 150) + '...' 
                            : playerOrganization.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : organizationLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium">جاري البحث عن المنظمة...</p>
                    <p className="text-xs text-gray-400 mt-1">فحص الارتباط بالأندية والأكاديميات والمدربين...</p>
                    <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                      🔍 يتم فحص جميع قواعد البيانات
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-1">لاعب مستقل</p>
                      <p className="text-xs text-gray-500 mb-3">هذا اللاعب غير مرتبط بأي جهة حالياً</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>يمكنه الانضمام لنادي أو أكاديمية</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>يمكنه التعاقد مع وكيل لاعبين</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>يمكنه العمل مع مدرب شخصي</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* جهة الاتصال الرسمية */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Contact className="w-5 h-5 text-green-600" />
                  جهة الاتصال الرسمية
                </h3>
                {player?.official_contact && (
                  player.official_contact.name || 
                  player.official_contact.phone || 
                  player.official_contact.email
                ) ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{player.official_contact.name || 'غير محدد'}</div>
                        <div className="text-sm text-gray-600">{player.official_contact.title || 'غير محدد'}</div>
                      </div>
                    </div>
                    {player.official_contact.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`tel:${player.official_contact.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {player.official_contact.phone}
                        </a>
                      </div>
                    )}
                    {player.official_contact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${player.official_contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {player.official_contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Contact className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">لم يتم تحديد جهة اتصال رسمية</p>
                    <p className="text-xs text-gray-400">يمكن للاعب إضافة هذه المعلومات في ملفه الشخصي</p>
                  </div>
                )}
              </div>
            </div>

            {/* التبويبات */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {TABS.map((tab, idx) => (
                    <button
                      key={tab.name}
                      onClick={() => setCurrentTab(idx)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        currentTab === idx
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                {TABS[currentTab].render()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function PlayerReportPage() {
  return <PlayerReport />;
}

