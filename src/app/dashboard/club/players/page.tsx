'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Target,
  Award,
  User,
  ArrowLeft,
  Heart,
  Share2,
  Eye,
  Phone,
  Mail,
  Video
} from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import Select from 'react-select';
import { Player } from '@/types/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"

interface SelectOption {
  value: string;
  label: string;
}

interface PlayerData {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  country: string;
  rating: number;
  currentClub: string;
  contractEnd: string;
  marketValue: string;
  imageUrl: string;
  stats: {
    goals: number;
    assists: number;
    matches: number;
    yellowCards: number;
    redCards: number;
  };
  skills: {
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  primary_position: string;
}

interface DetailedPlayerData extends PlayerData {
  biography?: string;
  achievements?: string[];
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
  videos?: string[];
  documents?: string[];
  notFound?: boolean;
  error?: boolean;
  city?: string;
  full_name?: string;
  technical_skills?: Record<string, number>;
  physical_skills?: Record<string, number>;
  profile_image?: {
    url?: string;
  };
  images?: string[];
  image?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  brief?: string;
}

type MultiSelectOption = SelectOption & {
  isDisabled?: boolean;
}

// أضف الكلاسات المخصصة للـ flip في الأعلى (يمكنك نقلها لملف CSS خارجي)
const cardFlipStyles = `
  .preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
`;

// خريطة المراكز مع الإحداثيات والألوان
const positionsMap: Record<string, { x: number; y: number; label: string; color: string }> = {
  "حارس مرمى": { x: 40, y: 90, label: "حارس", color: "#374151" },
  "مدافع": { x: 100, y: 90, label: "مدافع", color: "#2563eb" },
  "ظهير أيمن": { x: 100, y: 40, label: "ظهير أيمن", color: "#0ea5e9" },
  "ظهير أيسر": { x: 100, y: 140, label: "ظهير أيسر", color: "#0ea5e9" },
  "وسط دفاعي": { x: 170, y: 90, label: "وسط دفاعي", color: "#f59e42" },
  "وسط": { x: 200, y: 90, label: "وسط", color: "#fbbf24" },
  "وسط هجومي": { x: 230, y: 90, label: "وسط هجومي", color: "#fbbf24" },
  "جناح أيمن": { x: 230, y: 40, label: "جناح أيمن", color: "#f43f5e" },
  "جناح أيسر": { x: 230, y: 140, label: "جناح أيسر", color: "#f43f5e" },
  "مهاجم": { x: 320, y: 90, label: "مهاجم", color: "#ef4444" },
};

export default function PlayersSearchPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [goalsRange, setGoalsRange] = useState<[number, number]>([0, 50]);
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [error, setError] = useState('');
  const [detailedPlayer, setDetailedPlayer] = useState<DetailedPlayerData | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // متغيرات آمنة لتفاصيل اللاعب
  const stats = selectedPlayer?.stats || { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 };
  const skills = selectedPlayer?.skills || { shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 };

  // قائمة المراكز المتاحة
  const positionsList = ['حارس مرمى', 'مدافع', 'وسط', 'مهاجم'];

  // استخراج القيم الفريدة من المركز الأساسي فقط
  const allPositions = Array.from(new Set(players.map(p => p.primary_position).filter(Boolean)));
  const allNationalities = Array.from(new Set(players.map(p => p.nationality).filter(Boolean)));
  const allCountries = Array.from(new Set(players.map(p => p.country).filter(Boolean)));
  const allClubs = Array.from(new Set(players.map(p => p.currentClub).filter(Boolean)));
  // حساب نسبة اكتمال الملف
  function getProfileCompletion(player: PlayerData): number {
    let filled = 0, total = 6;
    if (player.imageUrl) filled++;
    if (player.stats && Object.values(player.stats).some(v => v > 0)) filled++;
    if (player.skills && Object.values(player.skills).some(v => v > 0)) filled++;
    if (player.nationality) filled++;
    if (player.primary_position) filled++;
    if (player.age) filled++;
    return Math.round((filled / total) * 100);
  }

  // استخراج أقل وأكبر عمر من بيانات اللاعبين
  const minAge = 0;
  const maxAge = 40;
  const [ageRange, setAgeRange] = useState<[number, number]>([minAge, maxAge]);

  // دالة لحساب العمر من تاريخ الميلاد
  function calculateAge(birthDateStr: string): number {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    slides: { perView: 2, spacing: 16 },
    loop: true,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (userData?.accountType !== 'club') {
        router.push('/dashboard');
        return;
      }
      fetchPlayers();
    }
    // eslint-disable-next-line
  }, [user, userData, authLoading]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching players from Firebase...');
      const playersRef = collection(db, 'players');
      const querySnapshot = await getDocs(playersRef);
      
      console.log('Firebase query result:', querySnapshot.size, 'documents found');
      
      if (querySnapshot.size > 0) {
        const playersData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // معالجة id ليكون نص فقط
          const playerId = typeof doc.id === 'string' ? doc.id : String(doc.id);
          // معالجة الصورة لتكون نص فقط
          let imageUrl = undefined;
          if (typeof data.imageUrl === 'string') imageUrl = data.imageUrl;
          else if (typeof data.profile_image === 'string') imageUrl = data.profile_image;
          else if (data.profile_image && typeof data.profile_image.url === 'string') imageUrl = data.profile_image.url;
          else if (typeof data.image === 'string') imageUrl = data.image;
          else if (Array.isArray(data.images) && typeof data.images[0] === 'string') imageUrl = data.images[0];
          else if (Array.isArray(data.media) && typeof data.media[0] === 'string') imageUrl = data.media[0];
          else {
            imageUrl = '/default-avatar.png';
            if (data.profile_image) {
              console.error('Invalid player profile_image:', data.profile_image);
            }
          }
          return {
            id: playerId,
            ...data,
            name: typeof data.name === 'string' ? data.name : (typeof data.full_name === 'string' ? data.full_name : (typeof data.playerName === 'string' ? data.playerName : 'لاعب بدون اسم')),
            age: typeof data.age === 'number' ? data.age : (typeof data.birth_date === 'string' ? calculateAge(data.birth_date) : 0),
            nationality: typeof data.nationality === 'string' ? data.nationality : (typeof data.country === 'string' ? data.country : 'غير محدد'),
            primary_position: typeof data.primary_position === 'string' ? data.primary_position : (typeof data.position === 'string' ? data.position : (typeof data.mainPosition === 'string' ? data.mainPosition : 'غير محدد')),
            currentClub: typeof data.currentClub === 'string' ? data.currentClub : (typeof data.current_club === 'string' ? data.current_club : (typeof data.club === 'string' ? data.club : 'غير محدد')),
            imageUrl,
            stats: typeof data.stats === 'object' && data.stats !== null ? data.stats : { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
            skills: typeof data.skills === 'object' && data.skills !== null ? data.skills : { shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 }
          };
        }) as PlayerData[];
        console.log('Processed players data:', playersData);
        setPlayers(playersData);
      } else {
        console.log('No players found in Firebase');
        setError('لم يتم العثور على لاعبين في قاعدة البيانات');
      }
    } catch (error: unknown) {
      console.error('Error fetching from Firebase:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      setError(`حدث خطأ أثناء جلب بيانات اللاعبين من قاعدة البيانات: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const name = player.name || '';
    const position = player.primary_position || '';
    const currentClub = player.currentClub || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      currentClub.toLowerCase().includes(searchTerm.toLowerCase());
    // فلترة العمر
    const matchesAge = player.age >= ageRange[0] && player.age <= ageRange[1];
    // فلترة متعددة للمراكز
    const matchesPosition =
      selectedPositions.length === 0 || selectedPositions.includes(position);
    // فلترة متعددة للجنسية
    const matchesNationality =
      selectedNationalities.length === 0 || selectedNationalities.includes(player.nationality);
    // فلترة متعددة للدولة
    const matchesCountry =
      selectedCountries.length === 0 || selectedCountries.includes(player.country);
    // فلترة متعددة للنادي الحالي
    const matchesClub =
      selectedClubs.length === 0 || selectedClubs.includes(player.currentClub);
    // فلترة عدد الأهداف
    const goals = player.stats?.goals ?? 0;
    const matchesGoals = goals >= goalsRange[0] && goals <= goalsRange[1];
    // فلترة نسبة اكتمال الملف
    const completion = getProfileCompletion(player);
    const matchesProfile = completion >= profileCompletion;
    return (
      matchesSearch &&
      matchesPosition &&
      matchesNationality &&
      matchesCountry &&
      matchesClub &&
      matchesGoals &&
      matchesAge &&
      matchesProfile
    );
  });

  const handleCardClick = (player: PlayerData) => {
    setSelectedPlayer(player);
    setIsCardFlipped(true);
  };

  const handleBackClick = () => {
    setIsCardFlipped(false);
    setTimeout(() => setSelectedPlayer(null), 300);
  };

  const handleShowPlayerDetails = async (playerId: string) => {
    try {
      setDetailedPlayer(null);
      setShowPlayerModal(true);
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      if (playerDoc.exists()) {
        const data = playerDoc.data();
        setDetailedPlayer({
          ...data,
          id: playerId,
        } as DetailedPlayerData);
      } else {
        setDetailedPlayer({ notFound: true } as DetailedPlayerData);
      }
    } catch (error: unknown) {
      console.error('Error fetching player details:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      setDetailedPlayer({ error: true } as DetailedPlayerData);
      toast.error(`حدث خطأ أثناء جلب تفاصيل اللاعب: ${errorMessage}`);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-screen">جاري التحقق من المستخدم...</div>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل بيانات اللاعبين...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="mb-4 text-red-600">{error}</div>
          <button
            onClick={fetchPlayers}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للوحة التحكم
        </button>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">البحث عن اللاعبين</h1>
        <p className="text-gray-600">اكتشف أفضل المواهب وأضفهم إلى فريقك</p>
      </div>

      {/* Search and Multi-Filter */}
      <div className="flex flex-col flex-wrap items-center gap-4 mb-8 sm:flex-row">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
          <input
            type="text"
            placeholder="ابحث عن لاعب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {/* فلتر متعدد للمراكز (Dropdown احترافي) */}
        <div className="min-w-[180px]">
          <Select<MultiSelectOption, true>
            isMulti
            options={allPositions.map(pos => ({ value: pos, label: pos }))}
            value={selectedPositions.map(pos => ({ value: pos, label: pos }))}
            onChange={(opts) => setSelectedPositions((opts ?? []).map(opt => opt.value))}
            placeholder="اختر المركز..."
            classNamePrefix="react-select"
            isClearable
            isSearchable
          />
        </div>
        {/* فلتر متعدد للدولة (Dropdown احترافي) */}
        <div className="min-w-[180px]">
          <Select<MultiSelectOption, true>
            isMulti
            options={allCountries.map(c => ({ value: c, label: c }))}
            value={selectedCountries.map(c => ({ value: c, label: c }))}
            onChange={(opts) => setSelectedCountries((opts ?? []).map(opt => opt.value))}
            placeholder="اختر الدولة..."
            classNamePrefix="react-select"
            isClearable
            isSearchable
          />
        </div>
        {/* فلتر العمر (نطاق ديناميكي) */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">العمر</label>
          <input
            type="number"
            min={minAge}
            max={ageRange[1]}
            value={ageRange[0]}
            onChange={e => setAgeRange([Number(e.target.value), ageRange[1]])}
            className="w-16 px-2 py-1 border border-gray-300 rounded"
          />
          <span>-</span>
          <input
            type="number"
            min={ageRange[0]}
            max={maxAge}
            value={ageRange[1]}
            onChange={e => setAgeRange([ageRange[0], Number(e.target.value)])}
            className="w-16 px-2 py-1 border border-gray-300 rounded"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {filteredPlayers.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative group"
            >
              <div
                className="overflow-hidden transition-all duration-300 transform bg-white shadow-lg cursor-pointer rounded-2xl hover:scale-105"
                onClick={() => handleCardClick(player)}
              >
                {/* Player Image */}
                <div className="relative h-64">
                  <img
                    src={player.imageUrl || '/default-avatar.png'}
                    alt={player.name || 'لاعب بدون اسم'}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute text-white bottom-4 right-4">
                    <h3 className="text-xl font-bold">{player.name || 'لاعب بدون اسم'}</h3>
                    <p className="text-sm opacity-90">{player.primary_position || 'غير محدد'}</p>
                  </div>
                </div>

                {/* Player Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold">{typeof player.rating === 'number' ? player.rating : 0}</span>
                    </div>
                    <span className="text-sm text-gray-600">{player.age ? `${player.age} سنة` : 'العمر غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{player.nationality || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">{player.marketValue || '-'}</span>
                    <button className="text-gray-400 hover:text-blue-600">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Player Details Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <>
            {/* Inject custom styles for flip */}
            <style>{cardFlipStyles}</style>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={handleBackClick}
            >
              <div
                className="relative w-full max-w-4xl overflow-hidden bg-white shadow-2xl rounded-2xl"
                style={{ perspective: '1200px' }}
                onClick={e => e.stopPropagation()}
              >
                <div
                  className={`relative w-full h-full preserve-3d transition-transform duration-500 ${isCardFlipped ? 'rotate-y-180' : ''}`}
                  style={{ minHeight: 500 }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 flex flex-col w-full h-full backface-hidden md:flex-row">
                    {/* صورة اللاعب */}
                    <div className="relative w-full md:w-1/2">
                      <img
                        src={selectedPlayer.imageUrl || '/default-avatar.png'}
                        alt={selectedPlayer.name}
                        className="object-contain w-full h-full"
                        style={{ maxHeight: '500px' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 right-6">
                        <h2 className="mb-2 text-3xl font-bold text-white">{selectedPlayer.name}</h2>
                        <p className="text-lg text-white opacity-90">{selectedPlayer.primary_position}</p>
                      </div>
                    </div>
                    {/* زر إغلاق أو قلب البطاقة */}
                    <div className="flex items-center justify-center w-full md:w-1/2">
                      <button
                        onClick={() => setIsCardFlipped(true)}
                        className="px-6 py-3 text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700"
                      >
                        عرض التفاصيل
                      </button>
                    </div>
                  </div>
                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                    <div className="flex flex-col w-full h-full bg-white md:flex-row rounded-2xl">
                      {/* صورة اللاعب (اختياري: يمكن إخفاؤها أو تصغيرها) */}
                      <div className="relative hidden w-full md:w-1/2 md:block">
                        <img
                          src={selectedPlayer.imageUrl || '/default-avatar.png'}
                          alt={selectedPlayer.name}
                          className="object-contain w-full h-full"
                          style={{ maxHeight: '500px' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 right-6">
                          <h2 className="mb-2 text-3xl font-bold text-white">{selectedPlayer.name}</h2>
                          <p className="text-lg text-white opacity-90">{selectedPlayer.primary_position}</p>
                        </div>
                      </div>
                      {/* تفاصيل اللاعب */}
                      <div className="w-full md:w-1/2 p-6 flex flex-col justify-between min-h-[500px] overflow-y-auto pb-8">
                        <div>
                          <div className="flex items-start justify-between mb-6">
                            <button
                              onClick={() => { setIsCardFlipped(false); }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div className="flex gap-2">
                              <button className="p-2 text-gray-600 hover:text-blue-600">
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-red-600">
                                <Heart className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-600">{selectedPlayer.age} سنة</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-600">{selectedPlayer.nationality}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-600">{selectedPlayer.currentClub}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-600">{selectedPlayer.contractEnd}</span>
                              </div>
                            </div>
                            {/* Stats */}
                            <div>
                              <h3 className="flex items-center gap-2 mb-3 text-lg font-semibold">
                                <Award className="w-5 h-5 text-blue-600" />
                                الإحصائيات
                              </h3>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 text-center rounded-lg bg-gray-50">
                                  <p className="text-2xl font-bold text-blue-600">{stats.goals}</p>
                                  <p className="text-sm text-gray-600">الأهداف</p>
                                </div>
                                <div className="p-3 text-center rounded-lg bg-gray-50">
                                  <p className="text-2xl font-bold text-blue-600">{stats.assists}</p>
                                  <p className="text-sm text-gray-600">التمريرات</p>
                                </div>
                                <div className="p-3 text-center rounded-lg bg-gray-50">
                                  <p className="text-2xl font-bold text-blue-600">{stats.matches}</p>
                                  <p className="text-sm text-gray-600">المباريات</p>
                                </div>
                              </div>
                            </div>
                            {/* Skills */}
                            <div>
                              <h3 className="mb-3 text-lg font-semibold">المهارات</h3>
                              <div className="space-y-3">
                                {Object.entries(skills).map(([skill, value]) => (
                                  <div key={skill} className="flex items-center gap-2">
                                    <span className="w-24 text-sm text-gray-600">{skill}</span>
                                    <div className="flex-1 h-2 overflow-hidden bg-gray-200 rounded-full">
                                      <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${value}%` }}
                                      />
                                    </div>
                                    <span className="w-8 text-sm text-gray-600">{value}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex gap-4 mt-8">
                          <button
                            onClick={() => handleShowPlayerDetails(selectedPlayer.id)}
                            className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-700"
                          >
                            <Eye className="w-5 h-5" />
                            عرض الملف الشخصي
                          </button>
                          <button className="flex items-center justify-center flex-1 gap-2 px-6 py-3 text-blue-600 transition-colors border border-blue-600 rounded-xl hover:bg-blue-50">
                            <Heart className="w-5 h-5" />
                            إضافة للمفضلة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* نافذة عرض بيانات اللاعب */}
      <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">الملف الشخصي للاعب</DialogTitle>
            <DialogDescription>
              جميع بيانات اللاعب وتفاصيله تظهر هنا.
            </DialogDescription>
          </DialogHeader>
          {detailedPlayer === null && <div>جاري تحميل البيانات...</div>}
          {detailedPlayer?.notFound && <div>لم يتم العثور على بيانات اللاعب.</div>}
          {detailedPlayer?.error && <div>حدث خطأ أثناء جلب البيانات.</div>}
          {detailedPlayer && !detailedPlayer.notFound && !detailedPlayer.error && (
            <div className="space-y-8">
              {/* صورة واسم اللاعب */}
              <div className="flex flex-col items-center gap-4">
                <img
                  src={getPlayerImage(detailedPlayer)}
                  alt={detailedPlayer.full_name || detailedPlayer.name}
                  className="w-36 h-36 object-cover rounded-full shadow-lg border-4 border-blue-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.png';
                  }}
                />
                <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <User className="w-6 h-6 text-blue-400" />
                  {detailedPlayer.full_name || detailedPlayer.name}
                </h2>
                <div className="flex flex-wrap gap-4 justify-center text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-green-500" /> {detailedPlayer.city || '--'}</span>
                  <span className="flex items-center gap-1"><Award className="w-4 h-4 text-yellow-500" /> {detailedPlayer.primary_position || detailedPlayer.position || '--'}</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-purple-500" /> {detailedPlayer.nationality || detailedPlayer.country || '--'}</span>
                </div>
              </div>
              {/* ملعب كرة القدم مع مركز اللاعب */}
              <div className="relative w-full h-48 bg-green-200 rounded-xl flex items-center justify-center my-4 overflow-hidden">
                <svg viewBox="0 0 400 180" className="absolute inset-0 w-full h-full opacity-80">
                  <rect x="0" y="0" width="400" height="180" rx="24" fill="#4ade80" />
                  <rect x="20" y="20" width="360" height="140" rx="16" fill="#22c55e" />
                  <circle cx="200" cy="90" r="40" fill="none" stroke="#fff" strokeWidth="2" />
                  <rect x="0" y="60" width="40" height="60" fill="none" stroke="#fff" strokeWidth="2" />
                  <rect x="360" y="60" width="40" height="60" fill="none" stroke="#fff" strokeWidth="2" />
                  <line x1="200" y1="20" x2="200" y2="160" stroke="#fff" strokeWidth="2" />
                </svg>
                {/* إبراز مركز اللاعب بدقة */}
                {positionsMap[detailedPlayer.primary_position] && (
                  <div
                    className="absolute flex items-center justify-center font-bold shadow-lg border-4 border-white text-lg"
                    style={{
                      left: `${positionsMap[detailedPlayer.primary_position].x}px`,
                      top: `${positionsMap[detailedPlayer.primary_position].y}px`,
                      background: positionsMap[detailedPlayer.primary_position].color,
                      color: "#fff",
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {positionsMap[detailedPlayer.primary_position].label}
                  </div>
                )}
              </div>
              {/* المهارات الفنية (رادار) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <h3 className="font-bold mb-4 text-blue-700 dark:text-blue-300">المهارات الفنية</h3>
                {hasTechnicalSkills(detailedPlayer) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={formatTechnicalSkills(detailedPlayer.technical_skills)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="المهارات" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-gray-400">لا توجد بيانات مهارات فنية</div>
                )}
              </div>
              {/* المهارات البدنية (Progress Bars) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <h3 className="font-bold mb-4 text-green-700 dark:text-green-300">المهارات البدنية</h3>
                {detailedPlayer.physical_skills && Object.entries(detailedPlayer.physical_skills).length > 0 ? (
                  Object.entries(detailedPlayer.physical_skills).map(([key, value]) => (
                    <div key={key} className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{key}</span>
                        <span>{value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400">لا توجد بيانات مهارات بدنية</div>
                )}
              </div>
              {/* بيانات التواصل */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow flex flex-col gap-2">
                <h3 className="font-bold mb-2 text-indigo-700 dark:text-indigo-300">معلومات التواصل</h3>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> {detailedPlayer.phone || '--'}</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" /> {detailedPlayer.email || '--'}</div>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> واتساب: {detailedPlayer.whatsapp || '--'}</div>
              </div>
              {/* الفيديوهات (keen-slider) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <h3 className="font-bold mb-4 text-pink-700 dark:text-pink-300 flex items-center gap-2"><Video className="w-5 h-5" /> فيديوهات اللاعب</h3>
                {Array.isArray(detailedPlayer.videos) && detailedPlayer.videos.length > 0 ? (
                  <div ref={sliderRef} className="keen-slider">
                    {detailedPlayer.videos.map((vid: any, idx: number) => (
                      <div key={idx} className="keen-slider__slide min-w-[300px] bg-gray-100 dark:bg-gray-700 rounded p-2 shadow flex flex-col items-center">
                        <a href={vid.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline mb-2">{vid.desc || vid.url}</a>
                        <iframe
                          src={vid.url.replace('watch?v=', 'embed/')}
                          className="w-full h-40 rounded"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">لا يوجد فيديوهات</div>
                )}
              </div>
              {/* نبذة مختصرة */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">
                <h3 className="font-bold mb-2 text-gray-700 dark:text-gray-200">نبذة مختصرة</h3>
                <p className="text-gray-600 dark:text-gray-300">{detailedPlayer.brief || '--'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper functions
function getPlayerImage(player: DetailedPlayerData): string {
  if (player.profile_image?.url) return player.profile_image.url;
  if (player.imageUrl) return player.imageUrl;
  if (player.image) return player.image;
  if (Array.isArray(player.images) && player.images[0]) return player.images[0];
  return '/default-avatar.png';
}

function hasTechnicalSkills(player: DetailedPlayerData): boolean {
  return !!player.technical_skills && Object.keys(player.technical_skills).length > 0;
}

function formatTechnicalSkills(skills: Record<string, number> | undefined): Array<{ skill: string; value: number }> {
  if (!skills) return [];
  return Object.entries(skills).map(([key, value]) => ({
    skill: key,
    value: Number(value)
  }));
} 