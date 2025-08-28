'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  Flag, 
  CheckCircle, 
  Target, 
  Minimize2, 
  Maximize2,
  Eye,
  User,
  MapPin,
  Sword,
  Trophy,
  Users
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import SendMessageButton from '@/components/messaging/SendMessageButton';
import { secureConsole } from '@/lib/utils/secure-console';

// Simple debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
};

interface Player {
  id: string;
  full_name?: string;
  name?: string;
  displayName?: string;
  primary_position?: string;
  position?: string;
  nationality?: string;
  current_club?: string;
  club_name?: string;
  country?: string;
  city?: string;
  profile_image?: string;
  profile_image_url?: string;
  avatar?: string;
  accountType?: string;
  club_id?: string;
  clubId?: string;
  academy_id?: string;
  academyId?: string;
  trainer_id?: string;
  trainerId?: string;
  agent_id?: string;
  agentId?: string;
  convertedToAccount?: boolean;
  firebaseUid?: string;
  organizationInfo?: string;
  age?: number;
  dependency?: string;
  status?: string;
  skill_level?: string;
  objectives?: string[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2"
      >
        السابق
      </Button>
      
      {pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="px-3 py-2"
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2"
      >
        التالي
      </Button>
    </div>
  );
};

export default function PlayersSearchPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  
  // State variables
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(12);
  
  // Filter states
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterNationality, setFilterNationality] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterAccountType, setFilterAccountType] = useState('all');
  const [filterAge, setFilterAge] = useState('all');
  const [filterDependency, setFilterDependency] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSkillLevel, setFilterSkillLevel] = useState('all');
  const [filterObjective, setFilterObjective] = useState('all');
  
  // UI states
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Setup current user info
  const setupCurrentUserInfo = useCallback(() => {
    secureConsole.log('🔍 setupCurrentUserInfo: إعداد معلومات المستخدم');
    
    if (user?.uid) {
      secureConsole.log('🔒 [SENSITIVE] 👤 User UID:', user.uid);
      secureConsole.log('🔒 [SENSITIVE] 📧 User Email:', user.email);
    }
    
    if (userData) {
      secureConsole.log('🎯 Account Type Required: trainer');
      secureConsole.log('🔒 [SENSITIVE] 💾 UserData:', userData);
      
      if (userData.accountType !== 'trainer') {
        secureConsole.warn(' ⚠️ عدم تطابق نوع الحساب: المطلوب trainer، الموجود ' + userData.accountType + ' - لكن سيتم السماح بالوصول');
      }
    }
  }, [user, userData]);

  // Load players data
  const loadPlayers = useCallback(async () => {
    if (!user?.uid) return;
    
      setIsLoading(true);
    try {
      const allPlayers: Player[] = [];

      // Fetch dependent players from players collection
      const playersQuery = query(collection(db, 'players'), orderBy('createdAt', 'desc'), limit(100));
        const playersSnapshot = await getDocs(playersQuery);
      const dependentPlayers = playersSnapshot.docs.map(doc => ({
            id: doc.id,
        ...doc.data()
      })) as Player[];
      
      secureConsole.log('📊 تم جلب', dependentPlayers.length, 'لاعب تابع من مجموعة players');
      allPlayers.push(...dependentPlayers);
      
      // Fetch independent players from users collection
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
        const usersSnapshot = await getDocs(usersQuery);
      const usersIndependentPlayers = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((player: any) => player.accountType === 'player') as Player[];
      
      secureConsole.log('📊 تم جلب', usersIndependentPlayers.length, 'لاعب من مجموعة player');
      allPlayers.push(...usersIndependentPlayers);
      
      // Fetch players from player collection
      const playerCollectionQuery = query(collection(db, 'player'), orderBy('createdAt', 'desc'), limit(100));
      const playerCollectionSnapshot = await getDocs(playerCollectionQuery);
      const playerCollectionPlayers = playerCollectionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      })) as Player[];
      
      secureConsole.log('📊 تم جلب', playerCollectionPlayers.length, 'لاعب مستقل من مجموعة users');
      allPlayers.push(...playerCollectionPlayers);
      
      // Remove duplicates based on id
      const uniquePlayers = allPlayers.filter((player, index, self) => 
        index === self.findIndex(p => p.id === player.id)
      );

      secureConsole.log('📊 إجمالي اللاعبين الفريدين (مستقلين + تابعين):', uniquePlayers.length);
      secureConsole.log('📊 تفاصيل اللاعبين النهائيين:', uniquePlayers);
      
      // Categorize players
        const independentPlayers = uniquePlayers.filter(p => p.accountType === 'player');
      const dependentPlayersFinal = uniquePlayers.filter(p => p.accountType !== 'player');
      
      const clubDependents = dependentPlayersFinal.filter(p => p.club_id || p.clubId);
      const academyDependents = dependentPlayersFinal.filter(p => p.academy_id || p.academyId);
      const trainerDependents = dependentPlayersFinal.filter(p => p.trainer_id || p.trainerId);
      const agentDependents = dependentPlayersFinal.filter(p => p.agent_id || p.agentId);
      
      secureConsole.log('📊 اللاعبين المستقلين:', independentPlayers.length);
      secureConsole.log('📊 اللاعبين التابعين:', dependentPlayersFinal.length);
      secureConsole.log('📊 - تابعين لأندية:', clubDependents.length);
      secureConsole.log('📊 - تابعين لأكاديميات:', academyDependents.length);
      secureConsole.log('📊 - تابعين لمدربين:', trainerDependents.length);
      secureConsole.log('📊 - تابعين لوكلاء:', agentDependents.length);
      
      setPlayers(uniquePlayers);
    } catch (error) {
      secureConsole.error('❌ خطأ في جلب اللاعبين:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Load data on mount
  useEffect(() => {
      setupCurrentUserInfo();
    loadPlayers();
  }, [setupCurrentUserInfo, loadPlayers]);

  // Filter players based on search and filters
  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      // Search filter
      const searchFields = [
        player.full_name,
        player.name,
        player.displayName,
        player.primary_position,
        player.position,
        player.nationality,
        player.current_club,
        player.club_name,
        player.country,
        player.city
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = !debouncedSearchTerm || searchFields.includes(debouncedSearchTerm.toLowerCase());
      
      // Position filter
      const matchesPosition = filterPosition === 'all' || 
        player.primary_position === filterPosition || 
        player.position === filterPosition;
      
      // Nationality filter
      const matchesNationality = filterNationality === 'all' || 
        player.nationality === filterNationality;
      
      // Country filter
      const matchesCountry = filterCountry === 'all' || 
        player.country === filterCountry;
      
      // Account type filter
      const matchesAccountType = filterAccountType === 'all' || 
        (filterAccountType === 'independent' && player.accountType === 'player') ||
        (filterAccountType === 'dependent' && player.accountType !== 'player');
      
      // Age filter
      const matchesAge = filterAge === 'all' || 
        (filterAge === 'under16' && player.age && player.age < 16) ||
        (filterAge === 'under18' && player.age && player.age >= 16 && player.age < 18) ||
        (filterAge === 'under21' && player.age && player.age >= 18 && player.age < 21) ||
        (filterAge === 'senior' && player.age && player.age >= 21);
      
      // Dependency filter
      const matchesDependency = filterDependency === 'all' || 
        (filterDependency === 'independent' && player.accountType === 'player') ||
        (filterDependency === 'dependent' && player.accountType !== 'player');
      
      // Status filter
      const matchesStatus = filterStatus === 'all' || 
        player.status === filterStatus;
      
      // Skill level filter
      const matchesSkillLevel = filterSkillLevel === 'all' || 
        player.skill_level === filterSkillLevel;
      
      // Objective filter
      const matchesObjective = filterObjective === 'all' || 
        (player.objectives && player.objectives.includes(filterObjective));
      
      return matchesSearch && matchesPosition && matchesNationality && matchesCountry && 
             matchesAccountType && matchesAge && matchesDependency && matchesStatus && 
             matchesSkillLevel && matchesObjective;
    });
  }, [players, debouncedSearchTerm, filterPosition, filterNationality, filterCountry, 
      filterAccountType, filterAge, filterDependency, filterStatus, filterSkillLevel, filterObjective]);

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const pagedPlayers = filteredPlayers.slice(startIndex, endIndex);

  // Reset filters function
  const resetFilters = () => {
    setFilterPosition('all');
    setFilterNationality('all');
    setFilterCountry('all');
    setFilterAccountType('all');
    setFilterAge('all');
    setFilterDependency('all');
    setFilterStatus('all');
    setFilterSkillLevel('all');
    setFilterObjective('all');
    setSearchTerm('');
  };

  // Utility functions
  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'مهاجم': 'from-red-500 to-red-600',
      'لاعب وسط': 'from-blue-500 to-blue-600',
      'مدافع': 'from-green-500 to-green-600',
      'حارس مرمى': 'from-yellow-500 to-yellow-600',
      'مهاجم وسط': 'from-purple-500 to-purple-600',
      'مدافع وسط': 'from-indigo-500 to-indigo-600'
    };
    return colors[position] || 'from-gray-500 to-gray-600';
  };

  const getPositionEmoji = (position: string) => {
    const emojis: { [key: string]: string } = {
      'مهاجم': '⚽',
      'لاعب وسط': '🎯',
      'مدافع': '🛡️',
      'حارس مرمى': '🥅',
      'مهاجم وسط': '⚡',
      'مدافع وسط': '🛡️'
    };
    return emojis[position] || '👤';
  };

  const getOrganizationBadgeStyle = (accountType: string) => {
    const styles: { [key: string]: string } = {
      'club': 'from-blue-400 to-blue-500',
      'academy': 'from-green-400 to-green-500',
      'trainer': 'from-purple-400 to-purple-500',
      'agent': 'from-orange-400 to-orange-500',
      'parent': 'from-pink-400 to-pink-500',
      'marketer': 'from-indigo-400 to-indigo-500'
    };
    return styles[accountType] || 'from-gray-400 to-gray-500';
  };

  const getOrganizationLabel = (accountType: string) => {
    const labels: { [key: string]: string } = {
      'club': '🏢 نادي',
      'academy': '🎓 أكاديمية',
      'trainer': '👨‍🏫 مدرب',
      'agent': '🤝 وكيل',
      'parent': '👨‍👩‍👧‍👦 ولي أمر',
      'marketer': '📢 مسوق'
    };
    return labels[accountType] || '🏢 منظمة';
  };

  const getValidImageUrl = (url: any) => {
    if (!url || typeof url !== 'string') return '/images/default-avatar.png';
    if (url.startsWith('http')) return url;
    return url;
  };

  // Add simple getUserDisplayName function
  const getUserDisplayName = () => {
    if (!userData) return 'مستخدم';
    return userData.full_name || userData.name || userData.email || 'مستخدم';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      {/* شريط البحث المدمج */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* أيقونة البحث */}
            <div className="flex-shrink-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            
            {/* شريط البحث المدمج */}
            <div className="flex-1 relative">
              <Input
          type="text"
                placeholder="ابحث عن لاعبين..."
          value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/60 border-gray-200 rounded-xl pr-10"
        />
              {searchTerm && searchTerm !== debouncedSearchTerm && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      </div>
              )}
            </div>
            
            {/* زر توسيع البحث */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="flex-shrink-0"
            >
              {isSearchExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            {/* زر توسيع الفلاتر */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
            
            {/* إحصائيات سريعة */}
            <div className="flex-shrink-0 text-sm text-gray-600">
              {filteredPlayers.length} لاعب
    </div>
    </div>
        </div>
      </div>

      {/* البحث الموسع */}
      {isSearchExpanded && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400" />
              </div>
              <Input
                type="text"
                  placeholder="ابحث باسم اللاعب، المركز، الجنسية، النادي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-6 pr-12 py-3 text-lg bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm rounded-xl"
                />
                {/* نتائج البحث السريعة */}
                {debouncedSearchTerm && filteredPlayers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2 px-2">
                        {filteredPlayers.length} نتيجة للبحث عن "{debouncedSearchTerm}"
            </div>
                      {filteredPlayers.slice(0, 5).map((player) => (
                        <div 
                          key={player.id}
                          className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          onClick={() => {
                            setSearchTerm('');
                            setIsSearchExpanded(false);
                          }}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {(player.full_name || player.name || 'ل').charAt(0)}
          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-800 truncate">
                              {player.full_name || player.name || 'لاعب مجهول'}
        </div>
                            <div className="text-xs text-gray-500 truncate">
                              {player.primary_position || player.position} • {player.nationality || 'غير محدد'}
      </div>
              </div>
                  </div>
                      ))}
                      {filteredPlayers.length > 5 && (
                        <div className="text-center text-xs text-blue-600 py-2 border-t border-gray-100">
                          عرض جميع النتائج ({filteredPlayers.length})
                </div>
              )}
            </div>
          </div>
                )}
        </div>
      </div>
          </div>
        </div>
      )}

      {/* الفلاتر المتقدمة */}
      {isFiltersExpanded && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                الفلاتر المتقدمة
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة تعيين
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
              {/* المركز */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Sword className="w-3 h-3 text-blue-500" />
                  المركز
                </Label>
                <Select value={filterPosition} onValueChange={setFilterPosition}>
                  <SelectTrigger className="h-8 text-xs border-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المراكز</SelectItem>
                    <SelectItem value="مهاجم">مهاجم</SelectItem>
                    <SelectItem value="لاعب وسط">لاعب وسط</SelectItem>
                    <SelectItem value="مدافع">مدافع</SelectItem>
                    <SelectItem value="حارس مرمى">حارس مرمى</SelectItem>
                  </SelectContent>
                </Select>
          </div>
          
              {/* الجنسية */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Flag className="w-3 h-3 text-green-500" />
                  الجنسية
                </Label>
                <Select value={filterNationality} onValueChange={setFilterNationality}>
                  <SelectTrigger className="h-8 text-xs border-green-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الجنسيات</SelectItem>
                    <SelectItem value="مصري">مصري</SelectItem>
                    <SelectItem value="قطري">قطري</SelectItem>
                    <SelectItem value="سعودي">سعودي</SelectItem>
                    <SelectItem value="إماراتي">إماراتي</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* الدولة */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-500" />
                  الدولة
                </Label>
                <Select value={filterCountry} onValueChange={setFilterCountry}>
                  <SelectTrigger className="h-8 text-xs border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الدول</SelectItem>
                    <SelectItem value="مصر">مصر</SelectItem>
                    <SelectItem value="قطر">قطر</SelectItem>
                    <SelectItem value="السعودية">السعودية</SelectItem>
                    <SelectItem value="الإمارات">الإمارات</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* نوع الحساب */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <User className="w-3 h-3 text-orange-500" />
                  نوع الحساب
                </Label>
                <Select value={filterAccountType} onValueChange={setFilterAccountType}>
                  <SelectTrigger className="h-8 text-xs border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="independent">لاعب مستقل</SelectItem>
                    <SelectItem value="dependent">لاعب تابع</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* الفئة العمرية */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-pink-500" />
                  الفئة العمرية
                </Label>
                <Select value={filterAge} onValueChange={setFilterAge}>
                  <SelectTrigger className="h-8 text-xs border-pink-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأعمار</SelectItem>
                    <SelectItem value="under16">تحت 16 سنة</SelectItem>
                    <SelectItem value="under18">تحت 18 سنة</SelectItem>
                    <SelectItem value="under21">تحت 21 سنة</SelectItem>
                    <SelectItem value="senior">كبار</SelectItem>
                  </SelectContent>
                </Select>
            </div>

              {/* التبعية */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Users className="w-3 h-3 text-teal-500" />
                  التبعية
                </Label>
                <Select value={filterDependency} onValueChange={setFilterDependency}>
                  <SelectTrigger className="h-8 text-xs border-teal-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التبعيات</SelectItem>
                    <SelectItem value="independent">مستقل</SelectItem>
                    <SelectItem value="dependent">تابع</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* الحالة */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  الحالة
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-xs border-emerald-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">مفعل</SelectItem>
                    <SelectItem value="inactive">معلق</SelectItem>
                  </SelectContent>
                </Select>
        </div>

              {/* مستوى المهارة */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  مستوى المهارة
                </Label>
                <Select value={filterSkillLevel} onValueChange={setFilterSkillLevel}>
                  <SelectTrigger className="h-8 text-xs border-yellow-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                    <SelectItem value="professional">محترف</SelectItem>
                  </SelectContent>
                </Select>
                </div>

              {/* الأهداف */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Target className="w-3 h-3 text-red-500" />
                  الأهداف
                </Label>
                <Select value={filterObjective} onValueChange={setFilterObjective}>
                  <SelectTrigger className="h-8 text-xs border-red-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأهداف</SelectItem>
                    <SelectItem value="professional">احترافي</SelectItem>
                    <SelectItem value="academic">أكاديمي</SelectItem>
                    <SelectItem value="recreational">ترفيهي</SelectItem>
                  </SelectContent>
                </Select>
                  </div>
                  </div>
                </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        {/* إحصائيات سريعة */}
        <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              عرض {pagedPlayers.length} من {filteredPlayers.length} لاعب
            </span>
            <span className="text-gray-600">
              الصفحة {currentPage} من {totalPages}
            </span>
          </div>
        </div>

        {/* قائمة اللاعبين */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-80 bg-white/60 backdrop-blur-sm border-white/30 shadow-lg animate-pulse">
                <div className="h-full bg-gray-200 rounded-xl"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pagedPlayers.map((player) => {
              const playerPosition = player.primary_position || player.position || '';
              const positionColor = getPositionColor(playerPosition);
              const positionEmoji = getPositionEmoji(playerPosition);
              
              return (
                <div key={player.id} className="group relative h-80 cursor-pointer">
                  {/* البطاقة الرئيسية */}
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:scale-105">
                    {/* صورة اللاعب */}
                    <div className="absolute inset-0">
                          {player.profile_image || player.profile_image_url ? (
                            <Image
                              src={getValidImageUrl(player.profile_image_url || player.profile_image || player.avatar)}
                              alt={player.full_name || player.name || player.displayName || 'لاعب'}
                          fill
                          className="object-cover"
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
                        
                    {/* التدرج اللوني في الأسفل */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-90" />
                    
                    {/* المحتوى في الأسفل */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight">
                        {player.full_name || player.name || player.displayName || 'لاعب مجهول'}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={`bg-gradient-to-r ${positionColor} text-white border-0 shadow-md px-2 py-1 rounded-lg text-xs font-bold`}>
                          {playerPosition || 'غير محدد'}
                        </Badge>
                        <Badge variant="outline" className="border border-white/30 text-white bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold">
                          {player.nationality || 'غير محدد'}
                        </Badge>
                      </div>

                      {/* مؤشر نوع اللاعب */}
                      <div className="flex justify-start">
                        <Badge 
                          variant={player.accountType === 'player' ? 'default' : 'secondary'} 
                          className={`${player.accountType === 'player' 
                            ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-0' 
                            : getOrganizationBadgeStyle(player.accountType)
                          } px-2 py-1 rounded-lg text-xs font-bold shadow-md`}
                        >
                          {player.accountType === 'player' ? '🎯 مستقل' : getOrganizationLabel(player.accountType)}
                        </Badge>
                      </div>
                    </div>

                    {/* مؤشر التمرير */}
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* طبقة التفاعل */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                  </div>
                  
                  {/* أزرار الإجراءات تظهر في الأسفل عند التمرير */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-xl opacity-0 group-hover:opacity-100 transition-all duration-300 p-4">
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg rounded-lg py-2 text-xs font-bold transition-all duration-300 hover:shadow-xl"
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
                          const hasOrganizationAffiliation = !!(
                            player.club_id || player.clubId ||
                            player.academy_id || player.academyId ||
                            player.trainer_id || player.trainerId ||
                            player.agent_id || player.agentId
                          );
                          
                          const isIndependentPlayer = 
                            player.accountType === 'player' ||
                            (!hasOrganizationAffiliation && !player.accountType?.startsWith('dependent'));
                          
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
                          
                                                     console.log('🌐 الانتقال إلى صفحة الملف الشخصي المشتركة:', `/dashboard/shared/player-profile/${player.id}`);
                          console.groupEnd();
                          
                           router.push(`/dashboard/shared/player-profile/${player.id}`);
                        }}
                      >
                        <Eye className="w-3 h-3 ml-1" />
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
                          buttonSize="sm"
                          className="flex-1 border border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-lg py-2 text-xs font-bold transition-all duration-300 bg-white/10 backdrop-blur-sm"
                          redirectToMessages={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredPlayers.length === 0 && !isLoading && (
          <div className="col-span-full">
            <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-lg p-12 text-center rounded-xl">
              <div className="text-6xl mb-4 opacity-50">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">لا توجد نتائج</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                لم نعثر على لاعبين يطابقون معايير البحث. جرب تعديل الفلاتر أو كلمات البحث.
              </p>
            </Card>
          </div>
        )}

        {/* أضف مكون الصفحات أسفل القائمة */}
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
} 
