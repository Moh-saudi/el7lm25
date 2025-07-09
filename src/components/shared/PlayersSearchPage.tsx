'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
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
const getValidImageUrl = (url: string | null | undefined): string => {
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
    
    // التحقق من نوع الحساب
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
      secureConsole.warn(`❌ عدم تطابق نوع الحساب: المطلوب ${accountType}، الموجود ${userData.accountType}`);
      setCurrentUserInfo(null);
    }
  };

  // دالة جلب اللاعبين (تجلب جميع اللاعبين فقط)
  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const playersQuery = query(
        collection(db, 'players'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(playersQuery);
      const allPlayers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
      setPlayers(allPlayers);
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
    const matchesSearch =
      player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.primary_position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = filterPosition ? player.primary_position === filterPosition : true;
    const matchesNationality = filterNationality ? player.nationality === filterNationality : true;
    const matchesCountry = filterCountry ? player.country === filterCountry : true;
    const matchesObjective = filterObjective ? (player.objectives && player.objectives[filterObjective]) : true;
    return matchesSearch && matchesPosition && matchesNationality && matchesCountry && matchesObjective;
  });

  // 5. إعادة الصفحة للأولى عند تغيير البحث أو الفلاتر
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterPosition, filterNationality, filterCountry, filterObjective]);

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

  // 7. مكون الفلاتر
  const Filters = () => (
    <div className="flex flex-wrap gap-3 items-center justify-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <input
        type="text"
        placeholder="ابحث عن اسم اللاعب أو مهارته..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900 placeholder-blue-400 w-48"
      />
      <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)} className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900">
        <option value="">كل المراكز</option>
        {uniquePositions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
      </select>
      <select value={filterNationality} onChange={e => setFilterNationality(e.target.value)} className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900">
        <option value="">كل الجنسيات</option>
        {uniqueNationalities.map(nat => <option key={nat} value={nat}>{nat}</option>)}
      </select>
      <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900">
        <option value="">كل الدول</option>
        {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filterObjective} onChange={e => setFilterObjective(e.target.value)} className="px-3 py-2 rounded border border-blue-200 bg-white text-blue-900">
        <option value="">كل الأهداف</option>
        {uniqueObjectives.map(obj => <option key={obj} value={obj}>{obj}</option>)}
      </select>
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
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header مع معلومات الحساب */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* عنوان الصفحة */}
            <div className="flex items-center gap-3">
              <Sword className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-blue-900">اكتشف المواهب</h1>
            </div>

            {/* معلومات الحساب المصادق */}
            {currentUserInfo && (
              <div className="flex items-center gap-3">
                {/* تسمية توضيحية */}
                <div className="text-sm text-blue-800/60 font-medium border-l border-blue-100 pl-3">
                  تتصفح بحساب:
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-lg border border-blue-200 shadow-sm">
                  <div className={`p-2 rounded-full ${currentUserInfo.color} text-blue-800 shadow-sm`}>
                    <currentUserInfo.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-800">
                      {currentUserInfo.name || currentUserInfo.full_name}
                    </div>
                    <div className="text-xs text-blue-800/80 font-medium">
                      {currentUserInfo.type} • نشط
                    </div>
                  </div>
                  
                  {/* أيقونة التحقق */}
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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

      {/* الهيدر */}
      <div className="relative overflow-hidden py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
              <Shield className="w-12 h-12 text-blue-400 animate-bounce" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                ⚔️ اكتشف الأبطال ⚡
              </h2>
              <Sword className="w-12 h-12 text-yellow-400 animate-bounce" />
            </div>
            
            <p className="text-xl text-blue-800/80 mb-6">
              ابحث عن المحاربين الجدد في عالم كرة القدم
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-800/60 w-5 h-5" />
              <Input
                type="text"
                placeholder="ابحث عن اسم المحارب أو مهارته..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-12 py-3 bg-blue-100 border-blue-200 text-blue-800 placeholder-blue-800/60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* جزء الفلاتر */}
      <div className="container mx-auto px-4">
        <Filters />
      </div>

      {/* قائمة اللاعبين */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mb-4 text-blue-800 text-center">
          <Users className="w-5 h-5 inline mr-2" />
          {pagedPlayers.length} لاعب في هذه الصفحة من أصل {filteredPlayers.length}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-blue-100 border-blue-200 p-6 animate-pulse">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-blue-200 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-blue-200 rounded"></div>
                  <div className="h-3 bg-blue-200 rounded w-3/4 mx-auto"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pagedPlayers.map((player) => {
              const positionColor = getPositionColor(player.primary_position || '');
              const positionEmoji = getPositionEmoji(player.primary_position || '');
              
              return (
                <Card key={player.id} className="group relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 border-0 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500 cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${positionColor} opacity-10 group-hover:opacity-30 transition-all duration-500`} />
                  
                  <div className="relative p-6">
                    {/* الصورة الشخصية */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${positionColor} rounded-full blur-md opacity-60 animate-pulse`} />
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 shadow-xl">
                          {player.profile_image || player.profile_image_url ? (
                            <Image
                              src={getValidImageUrl(player.profile_image_url || player.profile_image)}
                              alt={player.full_name || 'لاعب'}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
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
                            <div className={`w-full h-full bg-gradient-to-br ${positionColor} flex items-center justify-center text-3xl text-blue-800 font-bold`}>
                              {positionEmoji}
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-200 rounded-full border-2 border-blue-300 flex items-center justify-center text-sm">
                          {positionEmoji}
                        </div>
                      </div>
                    </div>

                    {/* معلومات اللاعب */}
                    <div className="text-center space-y-3">
                      <h3 className="font-bold text-lg text-blue-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 group-hover:bg-clip-text transition-all duration-300">
                        {player.full_name || 'لاعب مجهول'}
                      </h3>

                      <div className="flex justify-center space-x-2 space-x-reverse">
                        <Badge className={`bg-gradient-to-r ${positionColor} text-blue-800 border-0 shadow-lg`}>
                          {player.primary_position || 'غير محدد'}
                        </Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-800/80">
                          {player.nationality || 'غير محدد'}
                        </Badge>
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="mt-6 flex space-x-2 space-x-reverse">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg"
                        onClick={() => router.push(`/dashboard/player/reports?view=${player.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        عرض
                      </Button>
                      {player.id && user && userData && (
                        <SendMessageButton
                          user={user}
                          userData={userData}
                          getUserDisplayName={getUserDisplayName}
                          targetUserId={player.id}
                          targetUserName={player.full_name || 'لاعب'}
                          targetUserType="player"
                          buttonText="راسل"
                          buttonVariant="outline"
                          buttonSize="sm"
                          className="flex-1 border-blue-300 text-blue-800 hover:bg-blue-100"
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
          <Card className="bg-blue-100 border-blue-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">لا توجد نتائج</h3>
            <p className="text-blue-800/80">لم نعثر على محاربين يطابقون معايير البحث</p>
          </Card>
        )}

        {/* أضف مكون الصفحات أسفل القائمة */}
        <Pagination />
      </div>
    </div>
  );
} 
