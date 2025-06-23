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

interface PlayersSearchPageProps {
  accountType: 'club' | 'academy' | 'trainer' | 'agent';
}

export default function PlayersSearchPage({ accountType }: PlayersSearchPageProps) {
  secureConsole.log('🎯 PlayersSearchPage initialized with accountType:', accountType);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

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

  useEffect(() => {
    secureConsole.debug('🚀 PlayersSearchPage useEffect triggered:', { 
      accountType, 
      userUID: user?.uid, 
      hasUserData: !!userData,
      authLoading 
    });
    
    loadPlayers();
    
    // إعداد معلومات المستخدم إذا كانت البيانات متوفرة
    if (user && userData && !authLoading) {
      setupCurrentUserInfo();
    } else if (!authLoading) {
      setCurrentUserInfo(null);
    }
  }, [user, userData, accountType, authLoading]); // إضافة userData و authLoading كـ dependencies

  const loadPlayers = async () => {
    try {
      setIsLoading(true);
      const playersQuery = query(
        collection(db, 'players'),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(playersQuery);
      const playersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Player[];
      
      setPlayers(playersData);
    } catch (error) {
      secureConsole.error('خطأ في جلب اللاعبين:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPlayers = players.filter(player =>
    player.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.primary_position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" dir="rtl">
      {/* Header مع معلومات الحساب */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* عنوان الصفحة */}
            <div className="flex items-center gap-3">
              <Sword className="w-8 h-8 text-yellow-400" />
              <h1 className="text-2xl font-bold text-white">البحث عن اللاعبين</h1>
            </div>

            {/* معلومات الحساب المصادق */}
            {currentUserInfo && (
              <div className="flex items-center gap-3">
                {/* تسمية توضيحية */}
                <div className="text-sm text-white/60 font-medium border-l border-white/20 pl-3">
                  تتصفح بحساب:
                </div>
                
                <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm">
                  <div className={`p-2 rounded-full ${currentUserInfo.color} text-white shadow-sm`}>
                    <currentUserInfo.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {currentUserInfo.name || currentUserInfo.full_name}
                    </div>
                    <div className="text-xs text-white/80 font-medium">
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
            
            <p className="text-xl text-white/80 mb-6">
              ابحث عن المحاربين الجدد في عالم كرة القدم
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <Input
                type="text"
                placeholder="ابحث عن اسم المحارب أو مهارته..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-12 py-3 bg-slate-800/50 border-white/20 text-white placeholder-white/60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* قائمة اللاعبين */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mb-4 text-white/60 text-center">
          <Users className="w-5 h-5 inline mr-2" />
          {filteredPlayers.length} محارب جاهز للمعركة
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-white/10 p-6 animate-pulse">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 bg-slate-700 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-3 bg-slate-700 rounded w-3/4 mx-auto"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player) => {
              const positionColor = getPositionColor(player.primary_position || '');
              const positionEmoji = getPositionEmoji(player.primary_position || '');
              
              return (
                <Card key={player.id} className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 cursor-pointer">
                  <div className={`absolute inset-0 bg-gradient-to-br ${positionColor} opacity-10 group-hover:opacity-30 transition-all duration-500`} />
                  
                  <div className="relative p-6">
                    {/* الصورة الشخصية */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${positionColor} rounded-full blur-md opacity-60 animate-pulse`} />
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                          {player.profile_image || player.profile_image_url ? (
                            <Image
                              src={player.profile_image_url || player.profile_image || '/images/default-avatar.png'}
                              alt={player.full_name || 'لاعب'}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                secureConsole.warn('خطأ في تحميل صورة اللاعب:', e.currentTarget.src);
                                e.currentTarget.src = '/images/default-avatar.png';
                              }}
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${positionColor} flex items-center justify-center text-3xl text-white font-bold`}>
                              {positionEmoji}
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 rounded-full border-2 border-white/30 flex items-center justify-center text-sm">
                          {positionEmoji}
                        </div>
                      </div>
                    </div>

                    {/* معلومات اللاعب */}
                    <div className="text-center space-y-3">
                      <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 group-hover:bg-clip-text transition-all duration-300">
                        {player.full_name || 'لاعب مجهول'}
                      </h3>

                      <div className="flex justify-center space-x-2 space-x-reverse">
                        <Badge className={`bg-gradient-to-r ${positionColor} text-white border-0 shadow-lg`}>
                          {player.primary_position || 'غير محدد'}
                        </Badge>
                        <Badge variant="outline" className="border-white/30 text-white/80">
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-white/30 text-white hover:bg-white/10"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        راسل
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {filteredPlayers.length === 0 && !isLoading && (
          <Card className="bg-slate-800/50 border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد نتائج</h3>
            <p className="text-white/60">لم نعثر على محاربين يطابقون معايير البحث</p>
          </Card>
        )}
      </div>
    </div>
  );
} 