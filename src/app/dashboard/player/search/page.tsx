'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc,
  getDoc,
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  Building,
  Briefcase,
  Eye,
  Mail,
  Phone,
  Globe,
  Award,
  Target,
  Trophy,
  CheckCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  User,
  Users
} from 'lucide-react';
import SendMessageButton from '@/components/messaging/SendMessageButton';

// أنواع البيانات
interface SearchEntity {
  id: string;
  name: string;
  type: 'club' | 'agent' | 'scout' | 'academy' | 'sponsor' | 'trainer';
  email: string;
  phone?: string;
  website?: string;
  profileImage?: string;
  coverImage?: string;
  location: {
    country: string;
    city: string;
    address?: string;
  };
  description: string;
  specialization?: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  connectionsCount: number;
  achievements?: string[];
  services?: string[];
  established?: string;
  languages?: string[];
  createdAt: any;
  lastActive: any;
  isPremium: boolean;
  subscriptionType?: string;
  contactInfo: {
    email: string;
    phone: string;
    whatsapp?: string;
  };
  stats?: {
    successfulDeals: number;
    playersRepresented: number;
    activeContracts: number;
  };
  // حالة العلاقة مع المستخدم الحالي
  isFollowing?: boolean;
  isConnected?: boolean;
  hasPendingRequest?: boolean;
}

interface FilterOptions {
  searchQuery: string;
  type: 'all' | 'club' | 'agent' | 'scout' | 'academy' | 'sponsor' | 'trainer';
  country: string;
  city: string;
  minRating: number;
  verified: boolean | null;
  premium: boolean | null;
  sortBy: 'relevance' | 'rating' | 'followers' | 'recent' | 'alphabetical';
}

const ENTITY_TYPES = {
  club: { label: 'نادي', icon: Building, color: 'bg-blue-500' },
  agent: { label: 'وكيل لاعبين', icon: Briefcase, color: 'bg-purple-500' },
  scout: { label: 'سكاوت', icon: Eye, color: 'bg-green-500' },
  academy: { label: 'أكاديمية', icon: Trophy, color: 'bg-orange-500' },
  sponsor: { label: 'راعي', icon: Award, color: 'bg-red-500' },
  trainer: { label: 'مدرب', icon: User, color: 'bg-cyan-500' }
};

const COUNTRIES = [
  'مصر', 'السعودية', 'الإمارات', 'قطر', 'الكويت', 'البحرين', 'عمان',
  'الأردن', 'لبنان', 'العراق', 'المغرب', 'الجزائر', 'تونس', 'ليبيا'
];

export default function SearchPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  
  // حالة البحث والتصفية
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    type: 'all',
    country: '',
    city: '',
    minRating: 0,
    verified: null,
    premium: null,
    sortBy: 'relevance'
  });

  // حالة النتائج والتحميل
  const [entities, setEntities] = useState<SearchEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  // حالة الواجهة
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // جلب البيانات من Firestore
  const fetchEntities = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // جلب البيانات الحقيقية من collections مختلفة
      const allEntities: SearchEntity[] = [];
      
      // جلب الأندية من clubs collection
      if (filters.type === 'all' || filters.type === 'club') {
        try {
          let clubsQuery = query(collection(db, 'clubs'));
          
          // تصفية حسب الدولة
          if (filters.country) {
            clubsQuery = query(clubsQuery, where('country', '==', filters.country));
          }
          
          // ترتيب حسب اسم النادي
          clubsQuery = query(clubsQuery, orderBy('name', 'asc'), limit(10));
          
          const clubsSnapshot = await getDocs(clubsQuery);
          
          clubsSnapshot.docs.forEach(doc => {
            const clubData = doc.data();
            
            // فحص البحث النصي
            if (filters.searchQuery) {
              const searchLower = filters.searchQuery.toLowerCase();
              const matchesSearch = 
                clubData.name?.toLowerCase().includes(searchLower) ||
                clubData.description?.toLowerCase().includes(searchLower) ||
                clubData.type?.toLowerCase().includes(searchLower);
              
              if (!matchesSearch) return;
            }
            
            // تحويل بيانات النادي إلى تنسيق SearchEntity
            const entity: SearchEntity = {
              id: doc.id,
              name: clubData.name || 'نادي غير مسمى',
              type: 'club',
              email: clubData.email || '',
              phone: clubData.phone || '',
              website: clubData.website || '',
              profileImage: clubData.logo || '/images/club-avatar.png',
              coverImage: clubData.coverImage || '/images/hero-1.jpg',
              location: {
                country: clubData.country || '',
                city: clubData.city || '',
                address: clubData.address || ''
              },
              description: clubData.description || 'نادي رياضي متميز',
              specialization: clubData.type || 'كرة القدم',
              verified: true, // جميع الأندية المسجلة محققة
              rating: 4.5, // تقييم افتراضي
              reviewsCount: Math.floor(Math.random() * 500) + 100,
              followersCount: (clubData.stats?.players || 0) * 10,
              connectionsCount: clubData.stats?.contracts || 0,
              achievements: clubData.trophies?.map((t: any) => `${t.name} (${t.year})`) || [],
              services: ['تدريب اللاعبين', 'برامج الناشئين', 'المنافسات الرسمية'],
              established: clubData.founded || '',
              languages: ['العربية'],
              createdAt: new Date(),
              lastActive: new Date(),
              isPremium: true,
              subscriptionType: 'premium',
              contactInfo: {
                email: clubData.email || '',
                phone: clubData.phone || '',
                whatsapp: clubData.phone || ''
              },
              stats: {
                successfulDeals: clubData.stats?.contracts || 0,
                playersRepresented: clubData.stats?.players || 0,
                activeContracts: clubData.stats?.contracts || 0
              },
              isFollowing: false,
              isConnected: false,
              hasPendingRequest: false
            };
            
            allEntities.push(entity);
          });
        } catch (error) {
          console.error('خطأ في جلب بيانات الأندية:', error);
        }
      }
      
      // جلب الوكلاء من agents collection
      if (filters.type === 'all' || filters.type === 'agent') {
        try {
          let agentsQuery = query(collection(db, 'agents'));
          
          // تطبيق مرشح الدولة حسب الجنسية
          if (filters.country) {
            agentsQuery = query(agentsQuery, where('nationality', '==', filters.country));
          }
          
          agentsQuery = query(agentsQuery, limit(10));
          const agentsSnapshot = await getDocs(agentsQuery);
          
          agentsSnapshot.docs.forEach(doc => {
            const agentData = doc.data();
            
            // فحص البحث النصي
            if (filters.searchQuery) {
              const searchLower = filters.searchQuery.toLowerCase();
              const matchesSearch = 
                agentData.full_name?.toLowerCase().includes(searchLower) ||
                agentData.specialization?.toLowerCase().includes(searchLower) ||
                agentData.current_location?.toLowerCase().includes(searchLower) ||
                agentData.nationality?.toLowerCase().includes(searchLower) ||
                agentData.notable_deals?.toLowerCase().includes(searchLower);
              
              if (!matchesSearch) return;
            }
            
            const entity: SearchEntity = {
              id: doc.id,
              name: agentData.full_name || 'وكيل لاعبين',
              type: 'agent',
              email: agentData.email || '',
              phone: agentData.phone || '',
              website: agentData.website || '',
              profileImage: agentData.profile_photo || '/images/agent-avatar.png',
              coverImage: agentData.coverImage || '/images/hero-1.jpg',
              location: {
                country: agentData.nationality || '',
                city: agentData.current_location?.split(' - ')[1] || agentData.current_location || '',
                address: agentData.office_address || ''
              },
              description: `وكيل لاعبين ${agentData.is_fifa_licensed ? 'معتمد من FIFA' : 'محلي'} - ${agentData.years_of_experience || 0} سنة خبرة`,
              specialization: agentData.specialization || 'إدارة أعمال اللاعبين',
              verified: agentData.is_fifa_licensed || false,
              rating: 4.5,
              reviewsCount: Math.floor(Math.random() * 200) + 50,
              followersCount: (agentData.stats?.active_players || 0) * 25,
              connectionsCount: agentData.stats?.completed_deals || 0,
              achievements: agentData.is_fifa_licensed ? ['وكيل معتمد FIFA', 'خبرة متقدمة'] : ['وكيل محلي', 'خبرة متقدمة'],
              services: ['التفاوض على العقود', 'الاستشارات القانونية', 'إدارة المسيرة المهنية'],
              established: agentData.createdAt ? new Date(agentData.createdAt.seconds * 1000).getFullYear().toString() : '',
              languages: agentData.spoken_languages || ['العربية'],
              createdAt: agentData.createdAt || new Date(),
              lastActive: agentData.updatedAt || new Date(),
              isPremium: agentData.isPremium || false,
              contactInfo: {
                email: agentData.email || '',
                phone: agentData.phone || '',
                whatsapp: agentData.phone || ''
              },
              stats: {
                successfulDeals: agentData.stats?.completed_deals || 0,
                playersRepresented: agentData.stats?.active_players || 0,
                activeContracts: agentData.stats?.success_rate || 0
              },
              isFollowing: false,
              isConnected: false,
              hasPendingRequest: false
            };
            
            allEntities.push(entity);
          });
        } catch (error) {
          console.log('خطأ في جلب بيانات الوكلاء:', error);
        }
      }

      // جلب الأكاديميات من academies collection
      if (filters.type === 'all' || filters.type === 'academy') {
        try {
          let academiesQuery = query(collection(db, 'academies'));
          
          if (filters.country) {
            academiesQuery = query(academiesQuery, where('country', '==', filters.country));
          }
          
          academiesQuery = query(academiesQuery, orderBy('name', 'asc'), limit(10));
          const academiesSnapshot = await getDocs(academiesQuery);
          
          academiesSnapshot.docs.forEach(doc => {
            const academyData = doc.data();
            
            // فحص البحث النصي
            if (filters.searchQuery) {
              const searchLower = filters.searchQuery.toLowerCase();
              const matchesSearch = 
                academyData.name?.toLowerCase().includes(searchLower) ||
                academyData.description?.toLowerCase().includes(searchLower) ||
                (Array.isArray(academyData.programs) && academyData.programs.some((p: string) => p.toLowerCase().includes(searchLower)));
              
              if (!matchesSearch) return;
            }
            
            const entity: SearchEntity = {
              id: doc.id,
              name: academyData.name || 'أكاديمية رياضية',
              type: 'academy',
              email: academyData.email || '',
              phone: academyData.phone || '',
              website: academyData.website || '',
              profileImage: academyData.logo || '/images/club-avatar.png',
              coverImage: academyData.coverImage || '/images/hero-1.jpg',
              location: {
                country: academyData.country || '',
                city: academyData.city || '',
                address: academyData.address || ''
              },
              description: academyData.description || 'أكاديمية تدريب رياضي متميزة',
              specialization: Array.isArray(academyData.programs) ? academyData.programs.join(', ') : 'تدريب الناشئين',
              verified: true,
              rating: 4.6,
              reviewsCount: Math.floor(Math.random() * 300) + 100,
              followersCount: (academyData.stats?.students || 0) * 5,
              connectionsCount: academyData.stats?.graduates || 0,
              achievements: ['أكاديمية معتمدة', 'برامج متميزة'],
              services: ['تدريب الناشئين', 'برامج متقدمة', 'تطوير المواهب'],
              established: academyData.established || '',
              languages: ['العربية'],
              createdAt: new Date(),
              lastActive: new Date(),
              isPremium: true,
              contactInfo: {
                email: academyData.email || '',
                phone: academyData.phone || '',
                whatsapp: academyData.phone || ''
              },
              stats: {
                successfulDeals: academyData.stats?.programs || 0,
                playersRepresented: academyData.stats?.students || 0,
                activeContracts: academyData.stats?.graduates || 0
              },
              isFollowing: false,
              isConnected: false,
              hasPendingRequest: false
            };
            
            allEntities.push(entity);
          });
        } catch (error) {
          console.log('خطأ في جلب بيانات الأكاديميات:', error);
        }
      }

      // جلب المدربين من trainers collection
      if (filters.type === 'all' || filters.type === 'trainer') {
        try {
          let trainersQuery = query(collection(db, 'trainers'));
          
          // تطبيق مرشح الدولة حسب الجنسية
          if (filters.country) {
            trainersQuery = query(trainersQuery, where('nationality', '==', filters.country));
          }
          
          trainersQuery = query(trainersQuery, limit(10));
          const trainersSnapshot = await getDocs(trainersQuery);
          
          trainersSnapshot.docs.forEach(doc => {
            const trainerData = doc.data();
            
            // فحص البحث النصي
            if (filters.searchQuery) {
              const searchLower = filters.searchQuery.toLowerCase();
              const matchesSearch = 
                trainerData.full_name?.toLowerCase().includes(searchLower) ||
                trainerData.specialization?.toLowerCase().includes(searchLower) ||
                trainerData.current_location?.toLowerCase().includes(searchLower) ||
                trainerData.nationality?.toLowerCase().includes(searchLower) ||
                trainerData.coaching_level?.toLowerCase().includes(searchLower) ||
                trainerData.description?.toLowerCase().includes(searchLower);
              
              if (!matchesSearch) return;
            }
            
            const entity: SearchEntity = {
              id: doc.id,
              name: trainerData.full_name || 'مدرب رياضي',
              type: 'trainer',
              email: trainerData.email || '',
              phone: trainerData.phone || '',
              website: '',
              profileImage: trainerData.profile_photo || '/images/user-avatar.svg',
              coverImage: trainerData.coverImage || '/images/hero-1.jpg',
              location: {
                country: trainerData.nationality || '',
                city: trainerData.current_location?.split(' - ')[1] || trainerData.current_location || '',
                address: ''
              },
              description: `مدرب رياضي ${trainerData.is_certified ? 'معتمد' : 'محلي'} - ${trainerData.years_of_experience || 0} سنة خبرة`,
              specialization: trainerData.specialization || 'تدريب بدني',
              verified: trainerData.is_certified || false,
              rating: 4.4,
              reviewsCount: Math.floor(Math.random() * 150) + 30,
              followersCount: (trainerData.stats?.players_trained || 0) * 20,
              connectionsCount: trainerData.stats?.training_sessions || 0,
              achievements: trainerData.is_certified ? ['مدرب معتمد', 'خبرة متقدمة'] : ['مدرب محلي', 'خبرة متقدمة'],
              services: ['تدريب شخصي', 'برامج تأهيل', 'استشارات رياضية'],
              established: trainerData.createdAt ? new Date(trainerData.createdAt.seconds * 1000).getFullYear().toString() : '',
              languages: trainerData.spoken_languages || ['العربية'],
              createdAt: trainerData.createdAt || new Date(),
              lastActive: trainerData.updatedAt || new Date(),
              isPremium: trainerData.isPremium || false,
              contactInfo: {
                email: trainerData.email || '',
                phone: trainerData.phone || '',
                whatsapp: trainerData.phone || ''
              },
              stats: {
                successfulDeals: trainerData.stats?.training_sessions || 0,
                playersRepresented: trainerData.stats?.players_trained || 0,
                activeContracts: trainerData.stats?.success_rate || 0
              },
              isFollowing: false,
              isConnected: false,
              hasPendingRequest: false
            };
            
            allEntities.push(entity);
          });
        } catch (error) {
          console.log('خطأ في جلب بيانات المدربين:', error);
        }
      }
      
      // ترتيب النتائج
      switch (filters.sortBy) {
        case 'rating':
          allEntities.sort((a, b) => b.rating - a.rating);
          break;
        case 'followers':
          allEntities.sort((a, b) => b.followersCount - a.followersCount);
          break;
        case 'alphabetical':
          allEntities.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
          break;
        default:
          // ترتيب افتراضي: الأندية أولاً ثم باقي الأنواع
          allEntities.sort((a, b) => {
            if (a.type === 'club' && b.type !== 'club') return -1;
            if (a.type !== 'club' && b.type === 'club') return 1;
            return b.rating - a.rating;
          });
      }
      
      // تطبيق المرشحات الإضافية
      const filteredEntities = allEntities.filter(entity => {
        // فلترة حسب التقييم الأدنى
        if (filters.minRating > 0 && entity.rating < filters.minRating) {
          return false;
        }
        
        // فلترة حسب التحقق
        if (filters.verified !== null && entity.verified !== filters.verified) {
          return false;
        }
        
        // فلترة حسب العضوية المميزة
        if (filters.premium !== null && entity.isPremium !== filters.premium) {
          return false;
        }
        
        return true;
      });
      
      if (reset) {
        setEntities(filteredEntities);
      } else {
        setEntities(prev => [...prev, ...filteredEntities]);
      }
      
      setTotalResults(filteredEntities.length);
      setHasMore(false); // إيقاف التحميل الإضافي مؤقتاً
      
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      // إنشاء بيانات وهمية للعرض التوضيحي في حالة الفشل
      const mockEntities: SearchEntity[] = [
        {
          id: '1',
          name: 'النادي الأهلي',
          type: 'club',
          email: 'info@alahly.com',
          phone: '+20223456789',
          website: 'www.alahly.com',
          profileImage: '/clubs/ahly.jpg',
          location: { country: 'مصر', city: 'القاهرة' },
          description: 'نادي القرن في أفريقيا، أحد أكبر الأندية في العالم العربي والقارة الأفريقية.',
          verified: true,
          rating: 4.9,
          reviewsCount: 1200,
          followersCount: 5480000,
          connectionsCount: 1200,
          achievements: ['دوري أبطال أفريقيا (10 مرات)', 'الدوري المصري (42 مرة)'],
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'info@alahly.com', phone: '+20223456789' },
          stats: { successfulDeals: 150, playersRepresented: 300, activeContracts: 45 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        },
        {
          id: '2',
          name: 'وكالة النجوم الرياضية',
          type: 'agent',
          email: 'contact@stars-agency.com',
          phone: '+97145678901',
          website: 'www.stars-agency.com',
          profileImage: '/images/agent-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'الإمارات', city: 'دبي' },
          description: 'وكالة رائدة في مجال إدارة أعمال اللاعبين المحترفين في الشرق الأوسط.',
          specialization: 'لاعبي كرة القدم المحترفين',
          verified: true,
          rating: 4.8,
          reviewsCount: 340,
          followersCount: 89000,
          connectionsCount: 450,
          achievements: ['أفضل وكيل في الخليج 2023'],
          services: ['التفاوض على العقود', 'الاستشارات القانونية'],
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'contact@stars-agency.com', phone: '+97145678901' },
          stats: { successfulDeals: 85, playersRepresented: 120, activeContracts: 35 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        },
        {
          id: '3',
          name: 'أكاديمية الفيصل الرياضية',
          type: 'academy',
          email: 'info@faisal-academy.com',
          phone: '+966112345678',
          website: 'www.faisal-academy.com',
          profileImage: '/images/club-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'السعودية', city: 'الرياض' },
          description: 'أكاديمية رائدة في تدريب الناشئين وتطوير المواهب الرياضية في المملكة.',
          specialization: 'تدريب الناشئين، كرة القدم',
          verified: true,
          rating: 4.7,
          reviewsCount: 250,
          followersCount: 15000,
          connectionsCount: 800,
          achievements: ['أفضل أكاديمية 2023', 'أكاديمية معتمدة'],
          services: ['برامج الناشئين', 'تطوير المواهب', 'المعسكرات التدريبية'],
          established: '2015',
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'info@faisal-academy.com', phone: '+966112345678' },
          stats: { successfulDeals: 12, playersRepresented: 500, activeContracts: 150 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        },
        {
          id: '4',
          name: 'المدرب أحمد الخبير',
          type: 'trainer',
          email: 'ahmed.expert@trainer.com',
          phone: '+966501234567',
          website: 'www.ahmed-trainer.com',
          profileImage: '/images/user-avatar.svg',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'السعودية', city: 'جدة' },
          description: 'مدرب رياضي محترف متخصص في تدريب اللاعبين المحترفين وتطوير الأداء.',
          specialization: 'تدريب بدني، تأهيل الإصابات',
          verified: true,
          rating: 4.5,
          reviewsCount: 180,
          followersCount: 8500,
          connectionsCount: 120,
          achievements: ['مدرب معتمد', 'شهادة دولية'],
          services: ['تدريب شخصي', 'برامج تأهيل', 'استشارات رياضية'],
          established: '8 سنوات خبرة',
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'ahmed.expert@trainer.com', phone: '+966501234567' },
          stats: { successfulDeals: 25, playersRepresented: 80, activeContracts: 15 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        },
        {
          id: '5',
          name: 'نادي الزمالك',
          type: 'club',
          email: 'info@zamalek.com',
          phone: '+20223456780',
          website: 'www.zamalek.com',
          profileImage: '/clubs/zamalek.jpg',
          location: { country: 'مصر', city: 'القاهرة' },
          description: 'النادي الأبيض، واحد من أعرق الأندية المصرية والعربية.',
          verified: true,
          rating: 4.8,
          reviewsCount: 980,
          followersCount: 3200000,
          connectionsCount: 850,
          achievements: ['دوري أبطال أفريقيا (5 مرات)', 'الدوري المصري (14 مرة)'],
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'info@zamalek.com', phone: '+20223456780' },
          stats: { successfulDeals: 120, playersRepresented: 250, activeContracts: 35 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        }
      ];
      setEntities(mockEntities);
      setTotalResults(mockEntities.length);
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  // تأثير لجلب البيانات
  useEffect(() => {
    if (user) {
      fetchEntities(true);
    }
  }, [user, fetchEntities]);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // First get the user's basic info to determine account type
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.error('User document not found');
          return;
        }

        const basicUserData = userDoc.data();
        const accountType = basicUserData.accountType;

        // Get detailed user data from the appropriate collection
        let detailedUserDoc;
        switch (accountType) {
          case 'player':
            detailedUserDoc = await getDoc(doc(db, 'players', user.uid));
            break;
          case 'club':
            detailedUserDoc = await getDoc(doc(db, 'clubs', user.uid));
            break;
          case 'agent':
            detailedUserDoc = await getDoc(doc(db, 'agents', user.uid));
            break;
          case 'academy':
            detailedUserDoc = await getDoc(doc(db, 'academies', user.uid));
            break;
          case 'trainer':
            detailedUserDoc = await getDoc(doc(db, 'trainers', user.uid));
            break;
          case 'admin':
            detailedUserDoc = await getDoc(doc(db, 'admins', user.uid));
            break;
          default:
            console.error('Unknown account type:', accountType);
            return;
        }

        if (detailedUserDoc?.exists()) {
          // Combine basic and detailed user data
          setUserData({
            ...basicUserData,
            ...detailedUserDoc.data(),
            accountType // Ensure accountType is included
          });
        } else {
          // If no detailed doc exists, use basic user data
          setUserData(basicUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  // متابعة كيان
  const handleFollow = async (entityId: string) => {
    if (!user || actionLoading) return;
    
    setActionLoading(entityId);
    try {
      const entityRef = doc(db, 'entities', entityId);
      const entity = entities.find(e => e.id === entityId);
      
      if (entity?.isFollowing) {
        await updateDoc(entityRef, {
          followers: arrayRemove(user.uid),
          followersCount: (entity.followersCount || 1) - 1
        });
      } else {
        await updateDoc(entityRef, {
          followers: arrayUnion(user.uid),
          followersCount: (entity?.followersCount || 0) + 1
        });
      }
      
      // تحديث الحالة المحلية
      setEntities(prev => prev.map(e => 
        e.id === entityId 
          ? { 
              ...e, 
              isFollowing: !e.isFollowing,
              followersCount: e.isFollowing ? (e.followersCount || 1) - 1 : (e.followersCount || 0) + 1
            }
          : e
      ));
      
    } catch (error) {
      console.error('خطأ في المتابعة:', error);
      // تحديث محلي فقط في حالة الخطأ
      setEntities(prev => prev.map(e => 
        e.id === entityId 
          ? { 
              ...e, 
              isFollowing: !e.isFollowing,
              followersCount: e.isFollowing ? (e.followersCount || 1) - 1 : (e.followersCount || 0) + 1
            }
          : e
      ));
    } finally {
      setActionLoading(null);
    }
  };

  // إرسال رسالة
  const handleMessage = async (entityId: string) => {
    if (!user) return;
    router.push(`/dashboard/messages?recipient=${entityId}`);
  };

  // عرض الملف التفصيلي
  const handleViewProfile = (entity: SearchEntity) => {
    if (!user) return;
    router.push(`/dashboard/player/entity-profile?type=${entity.type}&id=${entity.id}`);
  };

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // مكون البحث المتقدم
  const SearchFilters = () => (
    <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* نوع الكيان */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">نوع الكيان</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الأنواع</option>
            {Object.entries(ENTITY_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>

        {/* الدولة */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">الدولة</label>
          <select
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الدول</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* التقييم الأدنى */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">التقييم الأدنى</label>
          <div className="flex gap-2">
            {[0, 3, 3.5, 4, 4.5].map(rating => (
              <Button
                key={rating}
                variant={filters.minRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
              >
                {rating > 0 ? `${rating}+` : 'الكل'}
              </Button>
            ))}
          </div>
        </div>

        {/* خيارات إضافية */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">خيارات إضافية</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.verified === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  verified: e.target.checked ? true : null 
                }))}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm">محقق فقط</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.premium === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  premium: e.target.checked ? true : null 
                }))}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="text-sm">عضوية مميزة فقط</span>
            </label>
          </div>
        </div>
      </div>

      {/* ترتيب النتائج */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium mb-2 text-gray-700">ترتيب النتائج</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'relevance', label: 'الصلة' },
            { key: 'rating', label: 'الأعلى تقييماً' },
            { key: 'followers', label: 'الأكثر متابعة' },
            { key: 'recent', label: 'الأحدث' },
            { key: 'alphabetical', label: 'أبجدياً' }
          ].map(sort => (
            <Button
              key={sort.key}
              variant={filters.sortBy === sort.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, sortBy: sort.key as any }))}
            >
              {sort.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );

  // مكون عرض الكيان
  const EntityCard = ({ entity }: { entity: SearchEntity }) => {
    const entityType = ENTITY_TYPES[entity.type];
    const EntityIcon = entityType.icon;

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        {/* الصورة الغلاف */}
        {entity.coverImage && (
          <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            <img 
              src={entity.coverImage} 
              alt={entity.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
        )}

        <div className="p-6">
          {/* الرأس */}
          <div className="flex items-start gap-4 mb-4">
            {/* الصورة الشخصية */}
            <div className="relative">
              {entity.profileImage ? (
                <img 
                  src={entity.profileImage} 
                  alt={entity.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className={`w-16 h-16 rounded-full ${entityType.color} flex items-center justify-center shadow-lg`}>
                  <EntityIcon className="w-8 h-8 text-white" />
                </div>
              )}
              
              {/* شارات الحالة */}
              <div className="absolute -top-1 -right-1 flex flex-col gap-1">
                {entity.verified && (
                  <div className="bg-blue-500 rounded-full p-1">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
                {entity.isPremium && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* معلومات أساسية */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900 truncate">{entity.name}</h3>
                <Badge variant="secondary" className={`${entityType.color} text-white`}>
                  {entityType.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{entity.location.city}, {entity.location.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>{entity.rating.toFixed(1)} ({entity.reviewsCount})</span>
                </div>
              </div>

              {entity.specialization && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Target className="w-4 h-4" />
                  <span>{entity.specialization}</span>
                </div>
              )}
            </div>
          </div>

          {/* الوصف */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{entity.description}</p>

          {/* الإحصائيات */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="font-bold text-lg text-gray-900">
                {formatNumber(entity.followersCount)}
              </div>
              <div className="text-xs text-gray-500">متابع</div>
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                {formatNumber(entity.connectionsCount)}
              </div>
              <div className="text-xs text-gray-500">اتصال</div>
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                {entity.stats?.successfulDeals || 0}
              </div>
              <div className="text-xs text-gray-500">صفقة</div>
            </div>
          </div>

          {/* الإنجازات */}
          {entity.achievements && entity.achievements.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {entity.achievements.slice(0, 2).map((achievement, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {achievement}
                  </Badge>
                ))}
                {entity.achievements.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{entity.achievements.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="grid grid-cols-1 gap-2 mb-4">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleViewProfile(entity)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Eye className="w-4 h-4 mr-1" />
              عرض الملف التفصيلي
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={entity.isFollowing ? "default" : "outline"}
                size="sm"
                onClick={() => handleFollow(entity.id)}
                disabled={actionLoading === entity.id}
                className="flex-1"
              >
                {actionLoading === entity.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : entity.isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" />
                    متابَع
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    متابعة
                  </>
                )}
              </Button>

              {userData && entity && (
                <SendMessageButton
                  user={user}
                  userData={userData}
                  getUserDisplayName={() => user?.displayName || userData?.name || 'مستخدم'}
                  targetUserId={entity.id}
                  targetUserName={entity.name}
                  targetUserType={entity.type as any}
                  buttonText="رسالة"
                  buttonVariant="outline"
                  buttonSize="sm"
                  className="flex-1"
                  redirectToMessages={false}
                />
              )}
            </div>
          </div>

          {/* معلومات الاتصال السريع */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm">
            {entity.contactInfo.email && (
              <a
                href={`mailto:${entity.contactInfo.email}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Mail className="w-4 h-4" />
                بريد
              </a>
            )}
            {entity.contactInfo.phone && (
              <a
                href={`tel:${entity.contactInfo.phone}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Phone className="w-4 h-4" />
                هاتف
              </a>
            )}
            {entity.website && (
              <a
                href={`https://${entity.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Globe className="w-4 h-4" />
                موقع
              </a>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // التحقق من تسجيل الدخول
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* العنوان والبحث */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            البحث عن الفرص والأندية
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            اكتشف الفرص المتاحة مع الأندية والوكلاء والسكاوت والأكاديميات والمدربين والرعاة
          </p>
          
          {/* شريط البحث الرئيسي */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="ابحث عن الأندية، الوكلاء، الأكاديميات، المدربين..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-4 pr-12 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <Button
                onClick={() => fetchEntities(true)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
              >
                بحث
              </Button>
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              مرشحات متقدمة
            </Button>
          </div>

          {/* عدد النتائج */}
          <div className="text-sm text-gray-600">
            {totalResults > 0 && `${totalResults} نتيجة`}
          </div>
        </div>

        {/* المرشحات المتقدمة */}
        {showFilters && <SearchFilters />}

        {/* النتائج */}
        {isLoading && entities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : entities.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <Search size={64} className="text-gray-300" />
              <h3 className="text-2xl font-bold text-gray-900">لا توجد نتائج</h3>
              <p className="text-gray-500 max-w-md">
                لم نتمكن من العثور على نتائج مطابقة لبحثك. جرب تغيير الكلمات المفتاحية أو المرشحات.
              </p>
              <Button
                onClick={() => setFilters({
                  searchQuery: '',
                  type: 'all',
                  country: '',
                  city: '',
                  minRating: 0,
                  verified: null,
                  premium: null,
                  sortBy: 'relevance'
                })}
                className="mt-4"
              >
                إعادة تعيين المرشحات
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {entities.map((entity, index) => (
                <EntityCard key={`${entity.id}-${entity.type}-${index}`} entity={entity} />
              ))}
            </div>

            {/* تحميل المزيد */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => fetchEntities(false)}
                  disabled={isLoading}
                  className="px-8 py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      جاري التحميل...
                    </>
                  ) : (
                    <>
                      تحميل المزيد
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 
