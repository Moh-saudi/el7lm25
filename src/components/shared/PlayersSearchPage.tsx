'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, limit, doc, getDoc, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { secureConsole } from '@/lib/utils/secure-console';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, MessageSquare, Users, Sword, Shield, Building, Trophy, User, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { Player } from '@/types/player';
import SendMessageButton from '@/components/messaging/SendMessageButton';

interface PlayersSearchPageProps {
  accountType: 'club' | 'academy' | 'trainer' | 'agent';
}

// دالة لتنظيف روابط الصور
const getValidImageUrl = (url: any): string => {
  // التحقق من أن url هو string
  if (typeof url !== 'string') {
    return '/images/default-avatar.png';
  }
  
  // تحقق من وجود الرابط وصحته
  if (!url || 
      url === 'undefined' || 
      url === 'null' || 
      url === '' ||
      url.includes('test-url.com') ||
      url.includes('placeholder.com') ||
      url.includes('example.com')) {
    return '/images/default-avatar.png';
  }
  
  // تحقق من صحة روابط Supabase المكسورة
  if (url.includes('supabase.co') && url.includes('avatars/yf0b8T8xuuMfP8QAfvS9TLOJjVt2')) {
    return '/images/default-avatar.png';
  }
  
  return url;
};

export default function PlayersSearchPage({ accountType }: PlayersSearchPageProps) {
  secureConsole.log('🎯 PlayersSearchPage initialized with accountType:', accountType);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  // 1. متغيرات الحالة للصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 16;
  const [totalPlayers, setTotalPlayers] = useState(0);

  // 1. متغيرات الفلاتر
  const [filterPosition, setFilterPosition] = useState('');
  const [filterNationality, setFilterNationality] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterObjective, setFilterObjective] = useState('');
  const [filterAccountType, setFilterAccountType] = useState('all'); // فلتر جديد لنوع الحساب
  
  // فلاتر جديدة
  const [filterAge, setFilterAge] = useState(''); // فلتر العمر
  const [filterDependency, setFilterDependency] = useState('all'); // فلتر التبعية
  const [filterStatus, setFilterStatus] = useState('all'); // فلتر الحالة
  const [filterSkillLevel, setFilterSkillLevel] = useState(''); // فلتر مستوى المهارة

  // دالة إعداد معلومات المستخدم الحالي
  const setupCurrentUserInfo = () => {
    if (!user?.uid || !userData) {
      secureConsole.log('❌ setupCurrentUserInfo: لا يوجد user أو userData');
      setCurrentUserInfo(null);
      return;
    }
    
    secureConsole.log('🔍 setupCurrentUserInfo: إعداد معلومات المستخدم');
    secureConsole.sensitive('👤 User UID:', user.uid);
    secureConsole.sensitive('📧 User Email:', user.email);
    secureConsole.log('🎯 Account Type Required:', accountType);
    secureConsole.sensitive('💾 UserData:', userData);
    
    // تحديد نوع الحساب المطلوب بناءً على accountType
    const accountTypeMapping = {
      club: { type: 'نادي', icon: Building, color: 'bg-blue-500' },
      academy: { type: 'أكاديمية', icon: Trophy, color: 'bg-orange-500' },
      trainer: { type: 'مدرب', icon: User, color: 'bg-cyan-500' },
      agent: { type: 'وكيل لاعبين', icon: Briefcase, color: 'bg-purple-500' },
    };
    
    const targetAccountType = accountTypeMapping[accountType];
    
    if (!targetAccountType) {
      secureConsole.log('❌ نوع حساب غير معروف:', accountType);
      setCurrentUserInfo(null);
      return;
    }
    
    // التحقق من نوع الحساب - السماح بالوصول حتى لو كان مختلف
    if (userData.accountType === accountType) {
      secureConsole.log(`✅ تطابق نوع الحساب: ${accountType}`);
      
      setCurrentUserInfo({
        ...userData,
        id: user.uid,
        type: targetAccountType.type,
        icon: targetAccountType.icon,
        color: targetAccountType.color
      });
    } else {
      secureConsole.warn(`⚠️ عدم تطابق نوع الحساب: المطلوب ${accountType}، الموجود ${userData.accountType} - لكن سيتم السماح بالوصول`);
      
      // السماح بالوصول حتى لو كان نوع الحساب مختلف
      setCurrentUserInfo({
        ...userData,
        id: user.uid,
        type: targetAccountType.type,
        icon: targetAccountType.icon,
        color: targetAccountType.color,
        isDifferentAccountType: true
      });
    }
  };

  // دالة جلب اللاعبين (تجلب اللاعبين المستقلين من users والتابعين من players)
  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const allPlayers: Player[] = [];

      // جلب اللاعبين من مجموعة players (اللاعبين التابعين)
      try {
        const playersQuery = query(
          collection(db, 'players'),
          orderBy('created_at', 'desc')
        );
        const playersSnapshot = await getDocs(playersQuery);
        const playersFromPlayersCollection = playersSnapshot.docs.map(doc => {
          const data = doc.data();
          // تحديد نوع اللاعب بناءً على الانتماء
          let accountType = 'dependent'; // افتراضي للاعبين التابعين
          let organizationInfo = '';
          
          if (data.club_id || data.clubId) {
            accountType = 'dependent_club';
            organizationInfo = 'تابع لنادي';
          } else if (data.academy_id || data.academyId) {
            accountType = 'dependent_academy';
            organizationInfo = 'تابع لأكاديمية';
          } else if (data.trainer_id || data.trainerId) {
            accountType = 'dependent_trainer';
            organizationInfo = 'تابع لمدرب';
          } else if (data.agent_id || data.agentId) {
            accountType = 'dependent_agent';
            organizationInfo = 'تابع لوكيل';
          }
          
          return {
            id: doc.id,
            ...data,
            accountType,
            organizationInfo
          };
        }) as Player[];
        allPlayers.push(...playersFromPlayersCollection);
        console.log(`📊 تم جلب ${playersFromPlayersCollection.length} لاعب تابع من مجموعة players`);
      } catch (error) {
        console.error('❌ خطأ في جلب اللاعبين من مجموعة players:', error);
      }

      // جلب اللاعبين من مجموعة player (مجموعة إضافية)
      try {
        const playerQuery = query(
          collection(db, 'player'),
          orderBy('created_at', 'desc')
        );
        const playerSnapshot = await getDocs(playerQuery);
        const playersFromPlayerCollection = playerSnapshot.docs.map(doc => {
          const data = doc.data();
          // تحديد نوع اللاعب بناءً على الانتماء
          let accountType = 'dependent'; // افتراضي للاعبين التابعين
          let organizationInfo = '';
          
          if (data.club_id || data.clubId) {
            accountType = 'dependent_club';
            organizationInfo = 'تابع لنادي';
          } else if (data.academy_id || data.academyId) {
            accountType = 'dependent_academy';
            organizationInfo = 'تابع لأكاديمية';
          } else if (data.trainer_id || data.trainerId) {
            accountType = 'dependent_trainer';
            organizationInfo = 'تابع لمدرب';
          } else if (data.agent_id || data.agentId) {
            accountType = 'dependent_agent';
            organizationInfo = 'تابع لوكيل';
          }
          
          return {
            id: doc.id,
            ...data,
            accountType,
            organizationInfo
          };
        }) as Player[];
        allPlayers.push(...playersFromPlayerCollection);
        console.log(`📊 تم جلب ${playersFromPlayerCollection.length} لاعب من مجموعة player`);
      } catch (error) {
        console.error('❌ خطأ في جلب اللاعبين من مجموعة player:', error);
      }

      // جلب اللاعبين المستقلين من مجموعة users (فلترة حسب نوع الحساب)
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('accountType', '==', 'player')
        );
        const usersSnapshot = await getDocs(usersQuery);
        const playerUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];

        // إضافة اللاعبين المستقلين
        allPlayers.push(...playerUsers);
        console.log(`📊 تم جلب ${playerUsers.length} لاعب مستقل من مجموعة users`);
        
        // طباعة تفاصيل اللاعبين للتحقق
        console.log('📊 تفاصيل اللاعبين المستقلين المجلوبين:', playerUsers.map(user => ({
          id: user.id,
          name: user.full_name || user.name || user.displayName,
          email: user.email,
          accountType: user.accountType,
          position: user.primary_position || user.position
        })));
      } catch (error) {
        console.error('❌ خطأ في جلب اللاعبين المستقلين من مجموعة users:', error);
      }

      // جلب جميع المستخدمين كبديل إضافي للتأكد
      try {
        const allUsersQuery = query(collection(db, 'users'));
        const allUsersSnapshot = await getDocs(allUsersQuery);
        const allUsers = allUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        
        // فلترة اللاعبين من جميع المستخدمين
        const additionalPlayers = allUsers.filter(user => 
          user.accountType === 'player' && 
          !allPlayers.some(p => p.id === user.id) // تجنب التكرار
        );
        
        if (additionalPlayers.length > 0) {
          allPlayers.push(...additionalPlayers);
          console.log(`📊 تم جلب ${additionalPlayers.length} لاعب إضافي من فلترة جميع المستخدمين`);
        }
      } catch (error) {
        console.warn('⚠️ لم يتم جلب اللاعبين الإضافيين:', error);
      }

      // إزالة التكرار بناءً على ID
      const uniquePlayers = allPlayers.filter((player, index, self) => 
        index === self.findIndex(p => p.id === player.id)
      );

      console.log(`📊 إجمالي اللاعبين الفريدين (مستقلين + تابعين): ${uniquePlayers.length}`);
      console.log('📊 تفاصيل اللاعبين النهائيين:', uniquePlayers.map(p => ({
        id: p.id,
        name: p.full_name || p.name || p.displayName,
        position: p.primary_position || p.position,
        accountType: p.accountType,
        organizationInfo: p.organizationInfo || '',
        email: p.email,
        type: p.accountType === 'player' ? 'مستقل' : getOrganizationLabel(p.accountType),
        hasImage: !!(p.profile_image_url || p.profile_image || p.avatar),
        club_id: p.club_id || p.clubId,
        academy_id: p.academy_id || p.academyId,
        trainer_id: p.trainer_id || p.trainerId,
        agent_id: p.agent_id || p.agentId
      })));
      
              // إحصائيات تفصيلية
        const independentPlayers = uniquePlayers.filter(p => p.accountType === 'player');
        const dependentPlayers = uniquePlayers.filter(p => p.accountType !== 'player');
        const clubPlayers = uniquePlayers.filter(p => p.accountType === 'dependent_club');
        const academyPlayers = uniquePlayers.filter(p => p.accountType === 'dependent_academy');
        const trainerPlayers = uniquePlayers.filter(p => p.accountType === 'dependent_trainer');
        const agentPlayers = uniquePlayers.filter(p => p.accountType === 'dependent_agent');
        
        console.log(`📊 اللاعبين المستقلين: ${independentPlayers.length}`);
        console.log(`📊 اللاعبين التابعين: ${dependentPlayers.length}`);
        console.log(`📊 - تابعين لأندية: ${clubPlayers.length}`);
        console.log(`📊 - تابعين لأكاديميات: ${academyPlayers.length}`);
        console.log(`📊 - تابعين لمدربين: ${trainerPlayers.length}`);
        console.log(`📊 - تابعين لوكلاء: ${agentPlayers.length}`);
      
      setPlayers(uniquePlayers);
      setTotalPlayers(uniquePlayers.length);
    } catch (error) {
      secureConsole.error('خطأ في جلب اللاعبين:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // حدث الجلب عند تحميل الصفحة أو تغيير المستخدم
  useEffect(() => {
    loadPlayers();
    if (user && userData && !authLoading) {
      setupCurrentUserInfo();
    } else if (!authLoading) {
      setCurrentUserInfo(null);
    }
  }, [user, userData, accountType, authLoading]);

  // 2. استخراج القيم الفريدة للفلاتر من اللاعبين (بعد الجلب)
  const uniquePositions = Array.from(new Set(players.map(p => p.primary_position).filter(Boolean)));
  const uniqueNationalities = Array.from(new Set(players.map(p => p.nationality).filter(Boolean)));
  const uniqueCountries = Array.from(new Set(players.map(p => p.country).filter(Boolean)));

  // 3. استخراج الأهداف الفريدة من بيانات اللاعبين
  const uniqueObjectives = Array.from(new Set(players.flatMap(p => p.objectives ? Object.keys(p.objectives) : []).filter(Boolean)));

  // 4. فلترة اللاعبين بناءً على البحث والفلاتر
  

  const filteredPlayers = players.filter(player => {
    // التأكد من أن اللاعب له بيانات صحيحة
    const hasValidData = player.full_name || player.name || player.displayName;
    if (!hasValidData) return false;
    
    const playerFullName = player.full_name || '';
    const playerName = player.name || '';
    const playerDisplayName = player.displayName || '';
    const playerPrimaryPosition = player.primary_position || '';
    const playerPosition = player.position || '';
    
    const matchesSearch =
      playerFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerPrimaryPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playerPosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition ? (player.primary_position === filterPosition || player.position === filterPosition) : true;
    const matchesNationality = filterNationality ? player.nationality === filterNationality : true;
    const matchesCountry = filterCountry ? player.country === filterCountry : true;
    const matchesObjective = filterObjective ? (player.objectives && player.objectives[filterObjective]) : true;
    const matchesAccountType = filterAccountType === 'all' ? true : player.accountType === filterAccountType;
    
    // فلاتر جديدة
    const matchesAge = filterAge ? getAgeCategory(player.birth_date || player.date_of_birth) === filterAge : true;
    const matchesDependency = filterDependency === 'all' ? true : 
      filterDependency === 'independent' ? player.accountType === 'player' :
      filterDependency === 'dependent' ? player.accountType?.startsWith('dependent') : true;
    const matchesStatus = filterStatus === 'all' ? true : 
      filterStatus === 'active' ? player.isActive !== false :
      filterStatus === 'inactive' ? player.isActive === false : true;
    const matchesSkillLevel = filterSkillLevel ? player.skill_level === filterSkillLevel : true;
    
    return matchesSearch && matchesPosition && matchesNationality && matchesCountry && matchesObjective && matchesAccountType && 
           matchesAge && matchesDependency && matchesStatus && matchesSkillLevel;
  });

  // 5. إعادة الصفحة للأولى عند تغيير البحث أو الفلاتر
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterPosition, filterNationality, filterCountry, filterObjective, filterAccountType, filterAge, filterDependency, filterStatus, filterSkillLevel]);

  // 6. قص النتائج للصفحة الحالية بعد الفلترة
  const pagedPlayers = filteredPlayers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredPlayers.length / pageSize);

  const getPositionColor = (position: string) => {
    if (position?.includes('حارس')) return 'from-yellow-400 to-orange-500';
    if (position?.includes('مدافع')) return 'from-blue-400 to-indigo-600';
    if (position?.includes('وسط')) return 'from-green-400 to-teal-600';
    if (position?.includes('مهاجم')) return 'from-red-400 to-pink-600';
    return 'from-purple-400 to-indigo-600';
  };

  const getPositionEmoji = (position: string) => {
    if (position?.includes('حارس')) return '🥅';
    if (position?.includes('مدافع')) return '🛡️';
    if (position?.includes('وسط')) return '⚡';
    if (position?.includes('مهاجم')) return '⚔️';
    return '⚽';
  };

  // دالة للحصول على تسمية نوع المنظمة
  const getOrganizationLabel = (accountType: string) => {
    switch (accountType) {
      case 'dependent_club':
        return '🏢 تابع لنادي';
      case 'dependent_academy':
        return '🏆 تابع لأكاديمية';
      case 'dependent_trainer':
        return '👨‍🏫 تابع لمدرب';
      case 'dependent_agent':
        return '💼 تابع لوكيل';
      default:
        return '⚽ تابع';
    }
  };

  // دالة للحصول على ستايل المنظمة
  const getOrganizationBadgeStyle = (accountType: string) => {
    switch (accountType) {
      case 'dependent_club':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dependent_academy':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'dependent_trainer':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'dependent_agent':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 7. مكون الفلاتر
  const Filters = () => (
    <div className="flex flex-wrap gap-3 items-center justify-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
        <input
          type="text"
          placeholder="🔍 ابحث عن اسم اللاعب أو مهارته..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 pr-10 rounded border border-blue-200 bg-white text-blue-900 placeholder-blue-400 w-48"
        />
      </div>
      <select 
        value={filterPosition} 
        onChange={e => setFilterPosition(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر المراكز"
      >
        <option value="">⚽ كل المراكز</option>
        {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
      </select>
      <select 
        value={filterNationality} 
        onChange={e => setFilterNationality(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر الجنسيات"
      >
        <option value="">🌍 كل الجنسيات</option>
        {uniqueNationalities.map(nat => <option key={nat} value={nat}>{nat}</option>)}
      </select>
      <select 
        value={filterCountry} 
        onChange={e => setFilterCountry(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر الدول"
      >
        <option value="">🏳️ كل الدول</option>
        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select 
        value={filterObjective} 
        onChange={e => setFilterObjective(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر الأهداف"
      >
        <option value="">🎯 كل الأهداف</option>
        {uniqueObjectives.map(obj => <option key={obj} value={obj}>{obj}</option>)}
      </select>
      
      {/* فلتر نوع الحساب */}
      <select 
        value={filterAccountType} 
        onChange={e => setFilterAccountType(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر نوع الحساب"
      >
        <option value="all">👥 جميع الحسابات</option>
        <option value="player">⚽ لاعبين فقط</option>
        <option value="club">🏢 أندية فقط</option>
        <option value="academy">🏆 أكاديميات فقط</option>
        <option value="trainer">👨‍🏫 مدربين فقط</option>
        <option value="agent">💼 وكلاء فقط</option>
      </select>

      {/* فلتر العمر */}
      <select 
        value={filterAge} 
        onChange={e => setFilterAge(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر العمر"
      >
        <option value="">🎂 كل الأعمار</option>
        <option value="أقل من 12 سنة">👶 أقل من 12 سنة</option>
        <option value="12-14 سنة">🧒 12-14 سنة</option>
        <option value="15-17 سنة">👦 15-17 سنة</option>
        <option value="18-20 سنة">👨‍🎓 18-20 سنة</option>
        <option value="21-24 سنة">👨‍💼 21-24 سنة</option>
        <option value="25-29 سنة">👨‍💻 25-29 سنة</option>
        <option value="30-34 سنة">👨‍🏫 30-34 سنة</option>
        <option value="35 سنة وأكثر">👴 35 سنة وأكثر</option>
      </select>

      {/* فلتر التبعية */}
      <select 
        value={filterDependency} 
        onChange={e => setFilterDependency(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر التبعية"
      >
        <option value="all">👥 جميع اللاعبين</option>
        <option value="independent">🆓 لاعبين مستقلين</option>
        <option value="dependent">🔗 لاعبين تابعين</option>
      </select>

      {/* فلتر الحالة */}
      <select 
        value={filterStatus} 
        onChange={e => setFilterStatus(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر الحالة"
      >
        <option value="all">📊 جميع الحالات</option>
        <option value="active">✅ حسابات مفعلة</option>
        <option value="inactive">❌ حسابات معلقة</option>
      </select>

      {/* فلتر مستوى المهارة */}
      <select 
        value={filterSkillLevel} 
        onChange={e => setFilterSkillLevel(e.target.value)} 
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900"
        aria-label="فلتر مستوى المهارة"
      >
        <option value="">⭐ كل المستويات</option>
        <option value="مبتدئ">🌱 مبتدئ</option>
        <option value="متوسط">🌿 متوسط</option>
        <option value="متقدم">🌳 متقدم</option>
        <option value="محترف">🏆 محترف</option>
        <option value="خبير">👑 خبير</option>
      </select>

      {/* زر مسح الفلاتر */}
      <button
        onClick={() => {
          setSearchTerm('');
          setFilterPosition('');
          setFilterNationality('');
          setFilterCountry('');
          setFilterObjective('');
          setFilterAccountType('all');
          setFilterAge('');
          setFilterDependency('all');
          setFilterStatus('all');
          setFilterSkillLevel('');
        }}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
        title="مسح جميع الفلاتر"
      >
        🗑️ مسح الفلاتر
      </button>
    </div>
  );

  // 8. مكون الصفحات
  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        className="px-3 py-1 rounded bg-blue-200 text-blue-800 disabled:opacity-50"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        السابق
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded bg-blue-200 text-blue-800 disabled:opacity-50"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        التالي
      </button>
    </div>
  );

  // عرض شاشة التحميل إذا كان النظام لا يزال يحمل بيانات المصادقة
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // أضف دالة getUserDisplayName بسيطة
  const getUserDisplayName = () => {
    if (!userData) return 'مستخدم';
    return userData.full_name || userData.name || userData.email || 'مستخدم';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">

      {/* منطقة البحث الرئيسية */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                اكتشف أفضل المواهب
              </h2>
            </div>
            
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              ابحث عن اللاعبين المناسبين لفريقك من بين آلاف المواهب المميزة
            </p>
            
            <div className="max-w-xl mx-auto relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <Input
                type="text"
                placeholder="ابحث باسم اللاعب، المركز، أو الجنسية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-6 pr-12 py-4 text-lg bg-white/80 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* جزء الفلاتر */}
      <div className="container mx-auto px-6 mb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6">
          <Filters />
          
          {/* إحصائيات الفلترة */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📊 النتائج:</span>
                <span className="bg-blue-100 px-2 py-1 rounded-full">
                  {filteredPlayers.length} لاعب من أصل {players.length}
                </span>
              </div>
              
              {(searchTerm || filterPosition || filterNationality || filterCountry || filterObjective || filterAccountType !== 'all' || filterAge || filterDependency !== 'all' || filterStatus !== 'all' || filterSkillLevel) && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">🔍 الفلاتر المطبقة:</span>
                  <div className="flex flex-wrap gap-1">
                    {searchTerm && <span className="bg-blue-200 px-2 py-1 rounded-full text-xs">البحث: {searchTerm}</span>}
                    {filterPosition && <span className="bg-green-200 px-2 py-1 rounded-full text-xs">المركز: {filterPosition}</span>}
                    {filterNationality && <span className="bg-yellow-200 px-2 py-1 rounded-full text-xs">الجنسية: {filterNationality}</span>}
                    {filterCountry && <span className="bg-purple-200 px-2 py-1 rounded-full text-xs">الدولة: {filterCountry}</span>}
                    {filterObjective && <span className="bg-orange-200 px-2 py-1 rounded-full text-xs">الهدف: {filterObjective}</span>}
                    {filterAccountType !== 'all' && <span className="bg-indigo-200 px-2 py-1 rounded-full text-xs">النوع: {filterAccountType}</span>}
                    {filterAge && <span className="bg-pink-200 px-2 py-1 rounded-full text-xs">العمر: {filterAge}</span>}
                    {filterDependency !== 'all' && <span className="bg-teal-200 px-2 py-1 rounded-full text-xs">التبعية: {filterDependency === 'independent' ? 'مستقل' : 'تابع'}</span>}
                    {filterStatus !== 'all' && <span className="bg-red-200 px-2 py-1 rounded-full text-xs">الحالة: {filterStatus === 'active' ? 'مفعل' : 'معلق'}</span>}
                    {filterSkillLevel && <span className="bg-cyan-200 px-2 py-1 rounded-full text-xs">المهارة: {filterSkillLevel}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* قائمة اللاعبين */}
      <div className="container mx-auto px-6 pb-16">
        {/* إحصائيات مفصلة */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-slate-800">
                {pagedPlayers.length} لاعب من أصل {filteredPlayers.length}
              </span>
            </div>
          </div>
          
          {/* إحصائيات نوع اللاعبين */}
          <div className="flex justify-center gap-3 text-sm flex-wrap">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 rounded-xl border border-green-200 shadow-md">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-semibold">
                مستقلين: {filteredPlayers.filter(p => p.accountType === 'player').length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-xl border border-blue-200 shadow-md">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-800 font-semibold">
                أندية: {filteredPlayers.filter(p => p.accountType === 'dependent_club').length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 rounded-xl border border-orange-200 shadow-md">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-orange-800 font-semibold">
                أكاديميات: {filteredPlayers.filter(p => p.accountType === 'dependent_academy').length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-cyan-100 px-4 py-3 rounded-xl border border-cyan-200 shadow-md">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span className="text-cyan-800 font-semibold">
                مدربين: {filteredPlayers.filter(p => p.accountType === 'dependent_trainer').length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-xl border border-purple-200 shadow-md">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-purple-800 font-semibold">
                وكلاء: {filteredPlayers.filter(p => p.accountType === 'dependent_agent').length}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-lg border-white/40 shadow-2xl p-10 animate-pulse rounded-3xl">
                <div className="flex justify-center mb-8">
                  <div className="w-48 h-48 bg-slate-200 rounded-3xl"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-slate-200 rounded-2xl"></div>
                  <div className="h-6 bg-slate-200 rounded-2xl w-3/4 mx-auto"></div>
                  <div className="flex gap-3 justify-center">
                    <div className="h-10 w-20 bg-slate-200 rounded-2xl"></div>
                    <div className="h-10 w-24 bg-slate-200 rounded-2xl"></div>
                  </div>
                  <div className="flex gap-4 mt-10">
                    <div className="flex-1 h-12 bg-slate-200 rounded-2xl"></div>
                    <div className="flex-1 h-12 bg-slate-200 rounded-2xl"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {pagedPlayers.map((player) => {
              const playerPosition = player.primary_position || player.position || '';
              const positionColor = getPositionColor(playerPosition);
              const positionEmoji = getPositionEmoji(playerPosition);
              
              return (
                <Card key={player.id} className="group relative overflow-hidden bg-white/85 backdrop-blur-xl border-white/50 shadow-2xl hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] transform hover:scale-[1.04] transition-all duration-700 cursor-pointer rounded-3xl ring-1 ring-white/20 hover:ring-white/40">
                  <div className={`absolute inset-0 bg-gradient-to-br ${positionColor} opacity-5 group-hover:opacity-25 transition-all duration-700`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10 group-hover:from-black/10 transition-all duration-700" />
                  
                  <div className="relative p-10">
                    {/* الصورة الشخصية الكبيرة */}
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${positionColor} rounded-3xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-700 scale-110`} />
                        <div className="relative w-48 h-48 rounded-3xl overflow-hidden border-6 border-white/60 shadow-3xl bg-white group-hover:border-white/80 transition-all duration-700">
                          {player.profile_image || player.profile_image_url ? (
                            <Image
                              src={getValidImageUrl(player.profile_image_url || player.profile_image || player.avatar)}
                              alt={player.full_name || player.name || player.displayName || 'لاعب'}
                              width={192}
                              height={192}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              loading="eager"
                              priority={true}
                              onError={(e) => {
                                if (!e.currentTarget.dataset.errorHandled) {
                                  secureConsole.warn('خطأ في تحميل صورة اللاعب:', e.currentTarget.src);
                                  e.currentTarget.dataset.errorHandled = 'true';
                                  e.currentTarget.src = '/images/default-avatar.png';
                                }
                              }}
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${positionColor} flex items-center justify-center text-6xl text-white font-bold`}>
                              {positionEmoji}
                            </div>
                          )}
                        </div>
                        
                        <div className={`absolute -bottom-4 -right-4 w-14 h-14 bg-gradient-to-br ${positionColor} rounded-2xl border-4 border-white flex items-center justify-center text-2xl shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                          <span className="text-white">{positionEmoji}</span>
                        </div>
                      </div>
                    </div>

                    {/* معلومات اللاعب */}
                    <div className="text-center space-y-6">
                      <h3 className="font-bold text-2xl text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all duration-500 line-clamp-2 leading-tight">
                        {player.full_name || player.name || player.displayName || 'لاعب مجهول'}
                      </h3>

                      <div className="flex justify-center flex-wrap gap-3">
                        <Badge className={`bg-gradient-to-r ${positionColor} text-white border-0 shadow-xl px-5 py-2 rounded-2xl text-base font-bold`}>
                          {player.primary_position || player.position || 'غير محدد'}
                        </Badge>
                        <Badge variant="outline" className="border-2 border-slate-300 text-slate-700 bg-white/70 px-5 py-2 rounded-2xl text-base font-semibold">
                          {player.nationality || 'غير محدد'}
                        </Badge>
                      </div>

                      {/* مؤشر نوع اللاعب */}
                      <div className="flex justify-center">
                        <Badge 
                          variant={player.accountType === 'player' ? 'default' : 'secondary'} 
                          className={`${player.accountType === 'player' 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0' 
                            : getOrganizationBadgeStyle(player.accountType)
                          } px-6 py-3 rounded-2xl text-base font-bold shadow-xl`}
                        >
                          {player.accountType === 'player' ? '🎯 مستقل' : getOrganizationLabel(player.accountType)}
                        </Badge>
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="mt-10 flex gap-4">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-xl rounded-2xl py-4 text-lg font-bold transition-all duration-500 hover:shadow-2xl hover:scale-105"
                        onClick={async () => {
                          console.group('🔍 [PlayersSearchPage] بدء عملية عرض الملف');
                          console.log('بيانات اللاعب المحدد:', {
                            playerId: player.id,
                            playerName: player.full_name || player.name,
                            playerAccountType: player.accountType
                          });
                          console.log('بيانات المستخدم الحالي:', {
                            userId: user?.uid,
                            userAccountType: userData?.accountType,
                            userName: getUserDisplayName(),
                            hasUserData: !!userData
                          });
                          
                          // التحقق من نوع اللاعب قبل إرسال الإشعار
                          // اللاعب مستقل إذا:
                          // 1. accountType === 'player' (من مجموعة users)
                          // 2. أو لا يوجد لديه انتماء لأي منظمة (من مجموعات players/player)
                          const hasOrganizationAffiliation = !!(
                            player.club_id || player.clubId ||
                            player.academy_id || player.academyId ||
                            player.trainer_id || player.trainerId ||
                            player.agent_id || player.agentId
                          );
                          
                          const isIndependentPlayer = 
                            player.accountType === 'player' || // من مجموعة users
                            (!hasOrganizationAffiliation && !player.accountType?.startsWith('dependent')); // من مجموعات أخرى بدون انتماء
                          
                          // التحقق من إمكانية إرسال الإشعار
                          // يمكن إرسال إشعار إذا:
                          // 1. اللاعب مستقل
                          // 2. أو اللاعب تابع لكن له حساب تسجيل دخول (محول)
                          const hasLoginAccount = player.convertedToAccount || player.firebaseUid;
                          const canReceiveNotifications = isIndependentPlayer || hasLoginAccount;
                          
                          console.log('🎯 فحص نوع اللاعب المحدث:', {
                            playerAccountType: player.accountType,
                            hasOrganizationAffiliation,
                            organizationIds: {
                              club_id: player.club_id || player.clubId,
                              academy_id: player.academy_id || player.academyId,
                              trainer_id: player.trainer_id || player.trainerId,
                              agent_id: player.agent_id || player.agentId
                            },
                            isIndependent: isIndependentPlayer,
                            hasLoginAccount: hasLoginAccount,
                            canReceiveNotifications: canReceiveNotifications,
                            organizationInfo: player.organizationInfo || 'غير محدد',
                            source: player.accountType === 'player' ? 'users collection' : 'players/player collection'
                          });
                          
                          // إرسال إشعار مشاهدة الملف الشخصي للاعبين الذين يستطيعون تلقي الإشعارات
                          if (player.id && user && userData && canReceiveNotifications) {
                            const notificationData = {
                              type: 'profile_view',
                              profileOwnerId: player.id,
                              viewerId: user.uid,
                              viewerName: getUserDisplayName(),
                              viewerType: userData.accountType,
                              viewerAccountType: userData.accountType,
                              profileType: 'player'
                            };
                            
                            console.log('📢 بيانات الإشعار المرسلة:', notificationData);
                            console.log('📢 تفاصيل إضافية:', {
                              isViewingSelf: player.id === user.uid,
                              playerFirebaseId: player.id,
                              viewerFirebaseId: user.uid,
                              playerType: isIndependentPlayer ? 'مستقل' : 'تابع محول',
                              hasLoginAccount: hasLoginAccount
                            });
                            
                                                          try {
                                console.log('🚀 إرسال طلب API للاعب...');
                              const response = await fetch('/api/notifications/interaction', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(notificationData),
                              });

                              console.log('📨 استجابة API:', {
                                status: response.status,
                                statusText: response.statusText,
                                ok: response.ok
                              });

                              if (response.ok) {
                                const result = await response.json();
                                console.log('✅ تم إرسال إشعار مشاهدة الملف الشخصي بنجاح:', result);
                                console.log('📧 معرف الإشعار المرسل:', result.notificationId);
                              } else {
                                const errorText = await response.text();
                                console.error('❌ خطأ في إرسال إشعار مشاهدة الملف الشخصي:', {
                                  status: response.status,
                                  statusText: response.statusText,
                                  error: errorText
                                });
                              }
                            } catch (error) {
                              console.error('❌ خطأ في إرسال الإشعار:', error);
                            }
                          } else if (player.id && user && userData && !canReceiveNotifications) {
                            console.log('🚫 تم تخطي إرسال الإشعار - اللاعب لا يستطيع تلقي الإشعارات:', {
                              playerName: player.full_name || player.name,
                              playerAccountType: player.accountType,
                              organizationInfo: player.organizationInfo,
                              isIndependent: isIndependentPlayer,
                              hasLoginAccount: hasLoginAccount,
                              reason: 'اللاعب التابع يحتاج حساب تسجيل دخول أو التحويل لحساب مستقل'
                            });
                          } else {
                            console.warn('⚠️ لا يمكن إرسال الإشعار - بيانات غير مكتملة:', {
                              hasPlayerId: !!player.id,
                              hasUser: !!user,
                              hasUserData: !!userData,
                              playerId: player.id,
                              userId: user?.uid,
                              userAccountType: userData?.accountType,
                              playerAccountType: player.accountType,
                              isIndependent: isIndependentPlayer
                            });
                          }
                          
                          console.log('🌐 الانتقال إلى صفحة التقارير:', `/dashboard/player/reports?view=${player.id}`);
                          console.groupEnd();
                          
                          router.push(`/dashboard/player/reports?view=${player.id}`);
                        }}
                      >
                        <Eye className="w-6 h-6 ml-3" />
                        عرض الملف
                      </Button>
                      {player.id && user && userData && (
                        <SendMessageButton
                          user={user}
                          userData={userData}
                          getUserDisplayName={getUserDisplayName}
                          targetUserId={player.id}
                          targetUserName={player.full_name || 'لاعب'}
                          targetUserType="player"
                          buttonText="مراسلة"
                          buttonVariant="outline"
                          buttonSize="default"
                          className="flex-1 border-2 border-slate-400 text-slate-700 hover:bg-slate-100 hover:border-slate-500 rounded-2xl py-4 text-lg font-bold transition-all duration-500 hover:shadow-xl bg-white/70 backdrop-blur-sm"
                          redirectToMessages={true}
                        />
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {filteredPlayers.length === 0 && !isLoading && (
          <div className="col-span-full">
            <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg p-16 text-center rounded-2xl">
              <div className="text-8xl mb-6 opacity-50">🔍</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">لا توجد نتائج</h3>
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                لم نعثر على لاعبين يطابقون معايير البحث. جرب تعديل الفلاتر أو كلمات البحث.
              </p>
            </Card>
          </div>
        )}

        {/* أضف مكون الصفحات أسفل القائمة */}
        <Pagination />
      </div>
    </div>
  );
} 
