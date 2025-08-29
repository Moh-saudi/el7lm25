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
  DocumentSnapshot,
  increment,
  setDoc
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
  Users,
  Plus,
  Check,
  Calendar
} from 'lucide-react';
import SendMessageButton from '@/components/messaging/SendMessageButton';
// تم إلغاء LanguageSwitcher مؤقتاً

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
  playerGoals: string[];
  requiredServices: string[];
}

export default function SearchPage() {
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
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
    sortBy: 'relevance',
    playerGoals: [],
    requiredServices: []
  });

  // حالة النتائج والتحميل
  const [entities, setEntities] = useState<SearchEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  
  // حالة التنقل بين الصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 3 صفوف × 2 كروت

  // حالة الواجهة
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // تعريف أنواع الكيانات مع الترجمة
  const ENTITY_TYPES = {
    club: { label: 'الأندية', icon: Building, color: 'bg-blue-500' },
    agent: { label: 'الوكلاء', icon: Briefcase, color: 'bg-purple-500' },
    scout: { label: 'الكشافين', icon: Eye, color: 'bg-green-500' },
    academy: { label: 'الأكاديميات', icon: Trophy, color: 'bg-orange-500' },
    sponsor: { label: 'الرعاة', icon: Award, color: 'bg-red-500' },
    trainer: { label: 'المدربين', icon: User, color: 'bg-cyan-500' }
  };

  const COUNTRIES = [
    'مصر',
    'السعودية',
    'الإمارات',
    'قطر',
    'الكويت',
    'البحرين',
    'عمان',
    'الأردن',
    'لبنان',
    'العراق',
    'المغرب',
    'الجزائر',
    'تونس',
    'ليبيا'
  ];

  // جلب البيانات من Firestore
  const fetchEntities = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // دالة مساعدة لتصفية الكيانات حسب الأهداف والخدمات
      const matchesPlayerGoals = (entity: SearchEntity) => {
        if (filters.playerGoals.length === 0) return true;
        
        // تحويل أهداف اللاعب إلى خدمات مطلوبة
        const goalToServiceMap: Record<string, string[]> = {
          'europeanLeague': ['playerRepresentation', 'contractNegotiation'],
          'nationalTeam': ['playerRepresentation', 'advancedPrograms'],
          'professionalClub': ['playerRepresentation', 'contractNegotiation'],
          'localChampionship': ['playerTraining', 'officialCompetitions'],
          'regionalChampionship': ['playerTraining', 'officialCompetitions'],
          'internationalChampionship': ['playerRepresentation', 'advancedPrograms'],
          'teamCaptain': ['playerTraining', 'personalTraining'],
          'technicalSkills': ['playerTraining', 'personalTraining'],
          'physicalFitness': ['playerTraining', 'personalTraining'],
          'individualAwards': ['playerRepresentation', 'advancedPrograms'],
          'inspireYouth': ['youthPrograms', 'talentDevelopment'],
          'firstDivision': ['playerTraining', 'officialCompetitions'],
          'sportsScholarship': ['playerRepresentation', 'advancedPrograms'],
          'topScorer': ['playerTraining', 'personalTraining'],
          'goalkeeperDefense': ['playerTraining', 'personalTraining'],
          'worldCup': ['playerRepresentation', 'advancedPrograms'],
          'gulfLeague': ['playerRepresentation', 'contractNegotiation'],
          'professionalReputation': ['playerRepresentation', 'sportsConsultations'],
          'olympics': ['playerRepresentation', 'advancedPrograms'],
          'bestYoungPlayer': ['playerRepresentation', 'advancedPrograms'],
          'leadershipSkills': ['playerTraining', 'personalTraining'],
          'playWithStars': ['playerRepresentation', 'advancedPrograms'],
          'clubStability': ['playerRepresentation', 'contractNegotiation'],
          'returnAsStar': ['playerRepresentation', 'contractNegotiation'],
          'futureTraining': ['playerTraining', 'talentDevelopment'],
          'internationalTrials': ['playerRepresentation', 'advancedPrograms'],
          'investmentClub': ['playerRepresentation', 'contractNegotiation'],
          'accreditedAcademy': ['youthPrograms', 'talentDevelopment'],
          'fifaRegistration': ['playerRepresentation', 'legalConsultation'],
          'englishCourses': ['advancedPrograms', 'preparationPrograms'],
          'additionalLanguages': ['advancedPrograms', 'preparationPrograms'],
          'sportsAnalysis': ['advancedPrograms', 'sportsConsultations'],
          'physicalPreparation': ['playerTraining', 'preparationPrograms'],
          'psychologicalPreparation': ['personalTraining', 'sportsConsultations'],
          'coachingLicense': ['advancedPrograms', 'trainingCamps'],
          'clubManagement': ['advancedPrograms', 'sportsConsultations']
        };

        // فحص إذا كان الكيان يقدم الخدمات المطلوبة لأهداف اللاعب
        const requiredServices = filters.playerGoals.flatMap(goal => goalToServiceMap[goal] || []);
        return requiredServices.some(service => 
          entity.services?.some(entityService => 
            entityService.toLowerCase().includes(service.toLowerCase())
          )
        );
      };

      const matchesRequiredServices = (entity: SearchEntity) => {
        if (filters.requiredServices.length === 0) return true;
        
        return filters.requiredServices.some(requiredService => 
          entity.services?.some(entityService => 
            entityService.toLowerCase().includes(requiredService.toLowerCase())
          )
        );
      };
      
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
              const clubName = clubData.name || '';
              const clubDescription = clubData.description || '';
              const clubType = clubData.type || '';
              
              const matchesSearch = 
                clubName.toLowerCase().includes(searchLower) ||
                clubDescription.toLowerCase().includes(searchLower) ||
                clubType.toLowerCase().includes(searchLower);
              
              if (!matchesSearch) return;
            }
            
            // تحويل بيانات النادي إلى تنسيق SearchEntity
            const entity: SearchEntity = {
              id: doc.id,
              name: clubData.name || 'dashboard.player.search.defaultNames.club',
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
              description: clubData.description || 'dashboard.player.search.defaultDescriptions.club',
              specialization: clubData.type || 'dashboard.player.search.defaultSpecializations.football',
              verified: true, // جميع الأندية المسجلة محققة
              rating: 4.5, // تقييم افتراضي
              reviewsCount: Math.floor(Math.random() * 500) + 100,
              followersCount: (clubData.stats?.players || 0) * 10,
              connectionsCount: clubData.stats?.contracts || 0,
              achievements: clubData.trophies?.map((t: any) => `${t.name} (${t.year})`) || [],
              services: ['dashboard.player.search.services.playerTraining', 'dashboard.player.search.services.youthPrograms', 'dashboard.player.search.services.officialCompetitions'],
              established: clubData.founded || '',
              languages: ['dashboard.player.search.languages.arabic'],
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
              const agentFullName = agentData.full_name || '';
              const agentSpecialization = agentData.specialization || '';
              const agentCurrentLocation = agentData.current_location || '';
              const agentNationality = agentData.nationality || '';
              const agentNotableDeals = agentData.notable_deals || '';
              
              const matchesSearch = 
                agentFullName.toLowerCase().includes(searchLower) ||
                agentSpecialization.toLowerCase().includes(searchLower) ||
                agentCurrentLocation.toLowerCase().includes(searchLower) ||
                agentNationality.toLowerCase().includes(searchLower) ||
                agentNotableDeals.toLowerCase().includes(searchLower);
              
              if (!matchesSearch) return;
            }
            
            const entity: SearchEntity = {
              id: doc.id,
              name: agentData.full_name || 'dashboard.player.search.defaultNames.agent',
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
              description: agentData.specialization || 'dashboard.player.search.defaultDescriptions.agent',
              specialization: agentData.specialization || 'dashboard.player.search.defaultSpecializations.playerAgent',
              verified: agentData.is_fifa_licensed || false,
              rating: 4.5,
              reviewsCount: Math.floor(Math.random() * 500) + 100,
              followersCount: (agentData.stats?.players || 0) * 10,
              connectionsCount: agentData.stats?.contracts || 0,
              achievements: agentData.is_fifa_licensed ? ['dashboard.player.search.achievements.fifaLicensed'] : [],
              services: ['dashboard.player.search.services.playerRepresentation', 'dashboard.player.search.services.contractNegotiation'],
              established: agentData.established || '',
              languages: agentData.spoken_languages || ['dashboard.player.search.languages.arabic'],
              createdAt: new Date(),
              lastActive: new Date(),
              isPremium: true,
              subscriptionType: 'premium',
              contactInfo: {
                email: agentData.email || '',
                phone: agentData.phone || '',
                whatsapp: agentData.phone || ''
              },
              stats: {
                successfulDeals: agentData.stats?.contracts || 0,
                playersRepresented: agentData.stats?.players || 0,
                activeContracts: agentData.stats?.contracts || 0
              },
              isFollowing: false,
              isConnected: false,
              hasPendingRequest: false
            };
            
            allEntities.push(entity);
          });
        } catch (error) {
          console.error('خطأ في جلب بيانات الوكلاء:', error);
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
              name: academyData.name || 'dashboard.player.search.defaultNames.academy',
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
              description: academyData.description || 'dashboard.player.search.defaultDescriptions.academy',
              specialization: Array.isArray(academyData.programs) ? academyData.programs.join(', ') : 'dashboard.player.search.defaultSpecializations.academy',
              verified: true,
              rating: 4.6,
              reviewsCount: Math.floor(Math.random() * 300) + 100,
              followersCount: (academyData.stats?.students || 0) * 5,
              connectionsCount: academyData.stats?.graduates || 0,
              achievements: ['dashboard.player.search.achievements.certified', 'dashboard.player.search.achievements.advancedPrograms'],
              services: ['dashboard.player.search.services.playerTraining', 'dashboard.player.search.services.advancedPrograms', 'dashboard.player.search.services.talentDevelopment'],
              established: academyData.established || '',
              languages: ['dashboard.player.search.languages.arabic'],
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
          console.error('خطأ في جلب بيانات الأكاديميات:', error);
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
              name: trainerData.full_name || 'dashboard.player.search.defaultNames.trainer',
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
              description: trainerData.specialization || 'dashboard.player.search.defaultDescriptions.trainer',
              specialization: trainerData.specialization || 'dashboard.player.search.defaultSpecializations.physicalTraining',
              verified: trainerData.is_certified || false,
              rating: 4.4,
              reviewsCount: Math.floor(Math.random() * 150) + 30,
              followersCount: (trainerData.stats?.players || 0) * 20,
              connectionsCount: trainerData.stats?.training_sessions || 0,
              achievements: trainerData.is_certified ? ['dashboard.player.search.achievements.certified', 'dashboard.player.search.achievements.advancedExperience'] : ['dashboard.player.search.achievements.local', 'dashboard.player.search.achievements.advancedExperience'],
              services: ['dashboard.player.search.services.personalTraining', 'dashboard.player.search.services.preparationPrograms', 'dashboard.player.search.services.sportsConsultations'],
              established: trainerData.established || '',
              languages: trainerData.spoken_languages || ['dashboard.player.search.languages.arabic'],
              createdAt: new Date(),
              lastActive: new Date(),
              isPremium: true,
              contactInfo: {
                email: trainerData.email || '',
                phone: trainerData.phone || '',
                whatsapp: trainerData.phone || ''
              },
              stats: {
                successfulDeals: trainerData.stats?.training_sessions || 0,
                playersRepresented: trainerData.stats?.players || 0,
                activeContracts: trainerData.stats?.success_rate || 0
              },
              isFollowing: false,
              isConnected: false,
              hasPendingRequest: false
            };
            
            allEntities.push(entity);
          });
        } catch (error) {
          console.error('خطأ في جلب بيانات المدربين:', error);
        }
      }
      
      // إذا لم يتم العثور على نتائج من Firestore، استخدم البيانات الوهمية
      if (allEntities.length === 0) {
        console.log('لم يتم العثور على نتائج من Firestore، استخدام البيانات الوهمية');
        const mockEntities: SearchEntity[] = [
          {
            id: '1',
            name: 'dashboard.player.search.mockEntities.alahly.name',
            type: 'club',
            email: 'info@alahly.com',
            phone: '+20223456789',
            website: 'www.alahly.com',
            profileImage: '/images/club-avatar.png',
            coverImage: '/images/hero-1.jpg',
            location: { country: 'dashboard.player.search.mockEntities.alahly.location.country', city: 'dashboard.player.search.mockEntities.alahly.location.city' },
            description: 'dashboard.player.search.mockEntities.alahly.description',
            verified: true,
            rating: 4.9,
            reviewsCount: 1200,
            followersCount: 5480000,
            connectionsCount: 1200,
            achievements: ['dashboard.player.search.mockEntities.alahly.achievements.afcon', 'dashboard.player.search.mockEntities.alahly.achievements.egyptianLeague'],
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
            name: 'dashboard.player.search.mockEntities.starsAgency.name',
            type: 'agent',
            email: 'contact@stars-agency.com',
            phone: '+97145678901',
            website: 'www.stars-agency.com',
            profileImage: '/images/agent-avatar.png',
            coverImage: '/images/hero-1.jpg',
            location: { country: 'dashboard.player.search.mockEntities.starsAgency.location.country', city: 'dashboard.player.search.mockEntities.starsAgency.location.city' },
            description: 'dashboard.player.search.mockEntities.starsAgency.description',
            specialization: 'dashboard.player.search.mockEntities.starsAgency.specialization',
            verified: true,
            rating: 4.8,
            reviewsCount: 340,
            followersCount: 89000,
            connectionsCount: 450,
            achievements: ['dashboard.player.search.mockEntities.starsAgency.achievements'],
            services: ['dashboard.player.search.mockEntities.starsAgency.services.contractNegotiation', 'dashboard.player.search.mockEntities.starsAgency.services.legalConsultation'],
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
            name: 'dashboard.player.search.mockEntities.faisalAcademy.name',
            type: 'academy',
            email: 'info@faisal-academy.com',
            phone: '+97123456789',
            website: 'www.faisal-academy.com',
            profileImage: '/images/club-avatar.png',
            coverImage: '/images/hero-1.jpg',
            location: { country: 'dashboard.player.search.mockEntities.faisalAcademy.location.country', city: 'dashboard.player.search.mockEntities.faisalAcademy.location.city' },
            description: 'dashboard.player.search.mockEntities.faisalAcademy.description',
            specialization: 'dashboard.player.search.mockEntities.faisalAcademy.specialization',
            verified: true,
            rating: 4.7,
            reviewsCount: 280,
            followersCount: 45000,
            connectionsCount: 320,
            achievements: ['dashboard.player.search.mockEntities.faisalAcademy.achievements.bestAcademy', 'dashboard.player.search.mockEntities.faisalAcademy.achievements.certified'],
            services: ['dashboard.player.search.mockEntities.faisalAcademy.services.youthPrograms', 'dashboard.player.search.mockEntities.faisalAcademy.services.talentDevelopment', 'dashboard.player.search.mockEntities.faisalAcademy.services.trainingCamps'],
            createdAt: new Date(),
            lastActive: new Date(),
            isPremium: true,
            contactInfo: { email: 'info@faisal-academy.com', phone: '+97123456789' },
            stats: { successfulDeals: 65, playersRepresented: 200, activeContracts: 25 },
            isFollowing: false,
            isConnected: false,
            hasPendingRequest: false
          },
          {
            id: '4',
            name: 'dashboard.player.search.mockEntities.ahmedExpert.name',
            type: 'trainer',
            email: 'ahmed.expert@email.com',
            phone: '+20345678901',
            website: '',
            profileImage: '/images/user-avatar.svg',
            coverImage: '/images/hero-1.jpg',
            location: { country: 'dashboard.player.search.mockEntities.ahmedExpert.location.country', city: 'dashboard.player.search.mockEntities.ahmedExpert.location.city' },
            description: 'dashboard.player.search.mockEntities.ahmedExpert.description',
            specialization: 'dashboard.player.search.mockEntities.ahmedExpert.specialization',
            verified: true,
            rating: 4.4,
            reviewsCount: 59,
            followersCount: 1200,
            connectionsCount: 85,
            achievements: ['dashboard.player.search.mockEntities.ahmedExpert.achievements.certified', 'dashboard.player.search.mockEntities.ahmedExpert.achievements.internationalCertification'],
            services: ['dashboard.player.search.mockEntities.ahmedExpert.services.personalTraining', 'dashboard.player.search.mockEntities.ahmedExpert.services.preparationPrograms', 'dashboard.player.search.mockEntities.ahmedExpert.services.sportsConsultations'],
            createdAt: new Date(),
            lastActive: new Date(),
            isPremium: true,
            contactInfo: { email: 'ahmed.expert@email.com', phone: '+20345678901' },
            stats: { successfulDeals: 45, playersRepresented: 80, activeContracts: 15 },
            isFollowing: false,
            isConnected: false,
            hasPendingRequest: false
          },
          {
            id: '5',
            name: 'dashboard.player.search.mockEntities.zamalek.name',
            type: 'club',
            email: 'info@zamalek.com',
            phone: '+20234567890',
            website: 'www.zamalek.com',
            profileImage: '/images/club-avatar.png',
            coverImage: '/images/hero-1.jpg',
            location: { country: 'dashboard.player.search.mockEntities.zamalek.location.country', city: 'dashboard.player.search.mockEntities.zamalek.location.city' },
            description: 'dashboard.player.search.mockEntities.zamalek.description',
            verified: true,
            rating: 4.8,
            reviewsCount: 980,
            followersCount: 3200000,
            connectionsCount: 950,
            achievements: ['dashboard.player.search.mockEntities.zamalek.achievements.afcon', 'dashboard.player.search.mockEntities.zamalek.achievements.egyptianLeague'],
            createdAt: new Date(),
            lastActive: new Date(),
            isPremium: true,
            contactInfo: { email: 'info@zamalek.com', phone: '+20234567890' },
            stats: { successfulDeals: 120, playersRepresented: 250, activeContracts: 40 },
            isFollowing: false,
            isConnected: false,
            hasPendingRequest: false
          }
        ];
        
        // تطبيق المرشحات على البيانات الوهمية
        let filteredMockEntities = mockEntities;
        
        if (filters.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          filteredMockEntities = mockEntities.filter(entity => 
            entity.name.toLowerCase().includes(searchLower) ||
            entity.description.toLowerCase().includes(searchLower) ||
            entity.specialization?.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.type !== 'all') {
          filteredMockEntities = filteredMockEntities.filter(entity => entity.type === filters.type);
        }
        
        if (filters.country) {
          filteredMockEntities = filteredMockEntities.filter(entity => 
            entity.location.country.toLowerCase().includes(filters.country.toLowerCase())
          );
        }
        
        allEntities.push(...filteredMockEntities);
      }
      
      // تطبيق الفلاتر على النتائج
      let filteredEntities = allEntities.filter(entity => {
        // فلتر البحث النصي
        if (filters.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase();
          const matchesSearch = 
            entity.name.toLowerCase().includes(searchLower) ||
            entity.description.toLowerCase().includes(searchLower) ||
            entity.specialization?.toLowerCase().includes(searchLower);
          
          if (!matchesSearch) return false;
        }
        
        // فلتر التقييم الأدنى
        if (filters.minRating > 0 && entity.rating < filters.minRating) {
          return false;
        }
        
        // فلتر الحسابات المحققة
        if (filters.verified === true && !entity.verified) {
          return false;
        }
        
        // فلتر الحسابات المميزة
        if (filters.premium === true && !entity.isPremium) {
          return false;
        }
        
        // فلتر أهداف اللاعب
        if (!matchesPlayerGoals(entity)) {
          return false;
        }
        
        // فلتر الخدمات المطلوبة
        if (!matchesRequiredServices(entity)) {
          return false;
        }
        
        return true;
      });
      
      // ترتيب النتائج
      switch (filters.sortBy) {
        case 'rating':
          filteredEntities.sort((a, b) => b.rating - a.rating);
          break;
        case 'followers':
          filteredEntities.sort((a, b) => b.followersCount - a.followersCount);
          break;
        case 'recent':
          filteredEntities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'alphabetical':
          filteredEntities.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default: // relevance
          // ترتيب حسب الصلة (عدد المطابقات مع الفلاتر)
          filteredEntities.sort((a, b) => {
            let aScore = 0;
            let bScore = 0;
            
            // نقاط إضافية للحسابات المحققة والمميزة
            if (a.verified) aScore += 10;
            if (b.verified) bScore += 10;
            if (a.isPremium) aScore += 5;
            if (b.isPremium) bScore += 5;
            
            // نقاط إضافية للتقييم العالي
            aScore += a.rating * 2;
            bScore += b.rating * 2;
            
            return bScore - aScore;
          });
      }
      
      setEntities(filteredEntities);
      setTotalResults(filteredEntities.length);
      
      setHasMore(false); // إيقاف التحميل الإضافي مؤقتاً
      
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      // إنشاء بيانات وهمية للعرض التوضيحي في حالة الفشل
      const mockEntities: SearchEntity[] = [
        {
          id: '1',
          name: 'dashboard.player.search.mockEntities.alahly.name',
          type: 'club',
          email: 'info@alahly.com',
          phone: '+20223456789',
          website: 'www.alahly.com',
          profileImage: '/images/club-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'dashboard.player.search.mockEntities.alahly.location.country', city: 'dashboard.player.search.mockEntities.alahly.location.city' },
          description: 'dashboard.player.search.mockEntities.alahly.description',
          verified: true,
          rating: 4.9,
          reviewsCount: 1200,
          followersCount: 5480000,
          connectionsCount: 1200,
          achievements: ['dashboard.player.search.mockEntities.alahly.achievements.afcon', 'dashboard.player.search.mockEntities.alahly.achievements.egyptianLeague'],
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
          name: 'dashboard.player.search.mockEntities.starsAgency.name',
          type: 'agent',
          email: 'contact@stars-agency.com',
          phone: '+97145678901',
          website: 'www.stars-agency.com',
          profileImage: '/images/agent-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'dashboard.player.search.mockEntities.starsAgency.location.country', city: 'dashboard.player.search.mockEntities.starsAgency.location.city' },
          description: 'dashboard.player.search.mockEntities.starsAgency.description',
          specialization: 'dashboard.player.search.mockEntities.starsAgency.specialization',
          verified: true,
          rating: 4.8,
          reviewsCount: 340,
          followersCount: 89000,
          connectionsCount: 450,
          achievements: ['dashboard.player.search.mockEntities.starsAgency.achievements'],
          services: ['dashboard.player.search.mockEntities.starsAgency.services.contractNegotiation', 'dashboard.player.search.mockEntities.starsAgency.services.legalConsultation'],
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
          name: 'dashboard.player.search.mockEntities.faisalAcademy.name',
          type: 'academy',
          email: 'info@faisal-academy.com',
          phone: '+97123456789',
          website: 'www.faisal-academy.com',
          profileImage: '/images/club-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'dashboard.player.search.mockEntities.faisalAcademy.location.country', city: 'dashboard.player.search.mockEntities.faisalAcademy.location.city' },
          description: 'dashboard.player.search.mockEntities.faisalAcademy.description',
          specialization: 'dashboard.player.search.mockEntities.faisalAcademy.specialization',
          verified: true,
          rating: 4.7,
          reviewsCount: 280,
          followersCount: 45000,
          connectionsCount: 320,
          achievements: ['dashboard.player.search.mockEntities.faisalAcademy.achievements.bestAcademy', 'dashboard.player.search.mockEntities.faisalAcademy.achievements.certified'],
          services: ['dashboard.player.search.mockEntities.faisalAcademy.services.youthPrograms', 'dashboard.player.search.mockEntities.faisalAcademy.services.talentDevelopment', 'dashboard.player.search.mockEntities.faisalAcademy.services.trainingCamps'],
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'info@faisal-academy.com', phone: '+97123456789' },
          stats: { successfulDeals: 65, playersRepresented: 200, activeContracts: 25 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        },
        {
          id: '4',
          name: 'dashboard.player.search.mockEntities.ahmedExpert.name',
          type: 'trainer',
          email: 'ahmed.expert@email.com',
          phone: '+20345678901',
          website: '',
          profileImage: '/images/user-avatar.svg',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'dashboard.player.search.mockEntities.ahmedExpert.location.country', city: 'dashboard.player.search.mockEntities.ahmedExpert.location.city' },
          description: 'dashboard.player.search.mockEntities.ahmedExpert.description',
          specialization: 'dashboard.player.search.mockEntities.ahmedExpert.specialization',
          verified: true,
          rating: 4.4,
          reviewsCount: 59,
          followersCount: 1200,
          connectionsCount: 85,
          achievements: ['dashboard.player.search.mockEntities.ahmedExpert.achievements.certified', 'dashboard.player.search.mockEntities.ahmedExpert.achievements.internationalCertification'],
          services: ['dashboard.player.search.mockEntities.ahmedExpert.services.personalTraining', 'dashboard.player.search.mockEntities.ahmedExpert.services.preparationPrograms', 'dashboard.player.search.mockEntities.ahmedExpert.services.sportsConsultations'],
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'ahmed.expert@email.com', phone: '+20345678901' },
          stats: { successfulDeals: 45, playersRepresented: 80, activeContracts: 15 },
          isFollowing: false,
          isConnected: false,
          hasPendingRequest: false
        },
        {
          id: '5',
          name: 'dashboard.player.search.mockEntities.zamalek.name',
          type: 'club',
          email: 'info@zamalek.com',
          phone: '+20234567890',
          website: 'www.zamalek.com',
          profileImage: '/images/club-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: 'dashboard.player.search.mockEntities.zamalek.location.country', city: 'dashboard.player.search.mockEntities.zamalek.location.city' },
          description: 'dashboard.player.search.mockEntities.zamalek.description',
          verified: true,
          rating: 4.8,
          reviewsCount: 980,
          followersCount: 3200000,
          connectionsCount: 950,
          achievements: ['dashboard.player.search.mockEntities.zamalek.achievements.afcon', 'dashboard.player.search.mockEntities.zamalek.achievements.egyptianLeague'],
          createdAt: new Date(),
          lastActive: new Date(),
          isPremium: true,
          contactInfo: { email: 'info@zamalek.com', phone: '+20234567890' },
          stats: { successfulDeals: 120, playersRepresented: 250, activeContracts: 40 },
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
  }, [user, filters, t]);

  // تأثير لجلب البيانات
  useEffect(() => {
    if (user) {
      fetchEntities(true);
    }
  }, [user, fetchEntities]);

  // تأثير لتشغيل البحث عند تغيير المرشحات
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchEntities(true);
      }, 300); // تقليل التأخير لتحسين الاستجابة

      return () => clearTimeout(timeoutId);
    }
  }, [filters, user]);

  // معالج البحث المباشر
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchQuery: value }));
  };

  // معالج تغيير المرشحات
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // معالج إعادة تعيين المرشحات
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      type: 'all',
      country: '',
      city: '',
      minRating: 0,
      verified: null,
      premium: null,
      sortBy: 'relevance',
      playerGoals: [],
      requiredServices: []
    });
  };

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
    
    setActionLoading(`follow-${entityId}`);
    try {
      const entity = entities.find(e => e.id === entityId);
      if (!entity) throw new Error('لم يتم العثور على الكيان');

      // تحديد مجموعة Firestore الصحيحة حسب نوع الكيان
      const collectionName =
        entity.type === 'club' ? 'clubs' :
        entity.type === 'agent' ? 'agents' :
        entity.type === 'academy' ? 'academies' :
        entity.type === 'trainer' ? 'trainers' : 'entities';

      const entityRef = doc(db, collectionName, entityId);

      // ضمان وجود المستند (يتجاهل لو موجود)
      await setDoc(entityRef, { id: entityId }, { merge: true });

      if (entity.isFollowing) {
        await updateDoc(entityRef, {
          followers: arrayRemove(user.uid),
          followersCount: increment(-1)
        });
      } else {
        await updateDoc(entityRef, {
          followers: arrayUnion(user.uid),
          followersCount: increment(1)
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
      
      // إظهار حالة النجاح
      setActionSuccess(`follow-${entityId}`);
      setTimeout(() => setActionSuccess(null), 2000);
      
      // إضافة تأثير بصري إضافي
      const button = document.querySelector(`[data-entity-id="${entityId}"]`) as HTMLElement;
      if (button) {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
          button.style.boxShadow = '';
        }, 200);
      }
      
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
    if (!user || actionLoading) return;
    
    setActionLoading(`message-${entityId}`);
    try {
      // إضافة تأخير صغير لمحاكاة التحميل
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // إظهار حالة النجاح
      setActionSuccess(`message-${entityId}`);
      setTimeout(() => setActionSuccess(null), 2000);
      
      // إضافة تأثير بصري إضافي
      const button = document.querySelector(`[data-entity-id="${entityId}"]`) as HTMLElement;
      if (button) {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        setTimeout(() => {
          button.style.transform = 'scale(1)';
          button.style.boxShadow = '';
        }, 200);
      }
      
      router.push(`/dashboard/messages?recipient=${entityId}`);
    } catch (error) {
      console.error('خطأ في إرسال الرسالة:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // إرسال إشعار مشاهدة الملف الشخصي
  const sendProfileViewNotification = async (entityId: string, entityType: string) => {
    if (!user || !userData) return;
    
    // لا نرسل إشعار إذا كان المستخدم يشاهد ملفه الشخصي
    if (user.uid === entityId) {
      console.log('🚫 لا يتم إرسال إشعار - المستخدم يشاهد ملفه الشخصي');
      return;
    }

    try {
      console.log('📢 إرسال إشعار مشاهدة الملف الشخصي:', {
        profileOwnerId: entityId,
        viewerId: user.uid,
        viewerName: userData.full_name || userData.displayName || userData.name || 'مستخدم',
        viewerType: userData.accountType || 'player'
      });

      const response = await fetch('/api/notifications/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'profile_view',
          profileOwnerId: entityId,
          viewerId: user.uid,
          viewerName: userData.full_name || userData.displayName || userData.name || 'مستخدم',
          viewerType: userData.accountType || 'player'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ تم إرسال إشعار مشاهدة الملف بنجاح:', result);
      } else {
        console.error('❌ فشل في إرسال إشعار مشاهدة الملف:', response.status);
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار مشاهدة الملف:', error);
    }
  };

  // عرض الملف التفصيلي
  const handleViewProfile = async (entity: SearchEntity) => {
    if (!user) return;
    
    // إرسال إشعار مشاهدة الملف الشخصي
    if (user && userData) {
      try {
        const response = await fetch('/api/notifications/interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'profile_view',
            profileOwnerId: entity.id,
            viewerId: user.uid,
            viewerName: userData.fullName || userData.name || 'مستخدم',
            viewerType: userData.accountType,
            viewerAccountType: userData.accountType,
            profileType: entity.type
          }),
        });

        if (response.ok) {
          console.log('✅ تم إرسال إشعار مشاهدة الملف الشخصي لـ:', entity.name);
        } else {
          console.error('❌ خطأ في إرسال إشعار مشاهدة الملف الشخصي');
        }
      } catch (error) {
        console.error('❌ خطأ في إرسال الإشعار:', error);
      }
    }
    
    // توجيه إلى صفحة عرض الملف الشخصي للكيان
    router.push(`/dashboard/player/search/profile?type=${entity.type}&id=${entity.id}`);
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
            title="نوع الكيان"
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
            title="الدولة"
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
                className={`${filters.minRating === rating ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
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
              <span className="text-sm">الحسابات المحققة فقط</span>
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
              <span className="text-sm">الحسابات المميزة فقط</span>
            </label>
          </div>
        </div>
      </div>

      {/* فلاتر الأهداف والخدمات */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* أهداف اللاعب */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">أهداف اللاعب</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[
                'europeanLeague',
                'nationalTeam',
                'professionalClub',
                'localChampionship',
                'regionalChampionship',
                'internationalChampionship',
                'teamCaptain',
                'technicalSkills',
                'physicalFitness',
                'individualAwards',
                'inspireYouth',
                'firstDivision',
                'sportsScholarship',
                'topScorer',
                'goalkeeperDefense',
                'worldCup',
                'gulfLeague',
                'professionalReputation',
                'olympics',
                'bestYoungPlayer',
                'leadershipSkills',
                'playWithStars',
                'clubStability',
                'returnAsStar',
                'futureTraining',
                'internationalTrials',
                'investmentClub',
                'accreditedAcademy',
                'fifaRegistration',
                'englishCourses',
                'additionalLanguages',
                'sportsAnalysis',
                'physicalPreparation',
                'psychologicalPreparation',
                'coachingLicense',
                'clubManagement'
              ].map(goal => (
                <label key={goal} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.playerGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          playerGoals: [...prev.playerGoals, goal]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          playerGoals: prev.playerGoals.filter(g => g !== goal)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm">{goal === 'europeanLeague' ? 'الدوري الأوروبي' :
                    goal === 'nationalTeam' ? 'المنتخب الوطني' :
                    goal === 'professionalClub' ? 'النادي الاحترافي' :
                    goal === 'localChampionship' ? 'البطولة المحلية' :
                    goal === 'regionalChampionship' ? 'البطولة الإقليمية' :
                    goal === 'internationalChampionship' ? 'البطولة الدولية' :
                    goal === 'teamCaptain' ? 'قائد الفريق' :
                    goal === 'technicalSkills' ? 'المهارات التقنية' :
                    goal === 'physicalFitness' ? 'اللياقة البدنية' :
                    goal === 'individualAwards' ? 'الجوائز الفردية' :
                    goal === 'inspireYouth' ? 'إلهام الشباب' :
                    goal === 'firstDivision' ? 'الدوري الأول' :
                    goal === 'sportsScholarship' ? 'المنحة الرياضية' :
                    goal === 'topScorer' ? 'الهداف الأول' :
                    goal === 'goalkeeperDefense' ? 'دفاع حارس المرمى' :
                    goal === 'worldCup' ? 'كأس العالم' :
                    goal === 'gulfLeague' ? 'دوري الخليج' :
                    goal === 'professionalReputation' ? 'السمعة الاحترافية' :
                    goal === 'olympics' ? 'الأولمبياد' :
                    goal === 'bestYoungPlayer' ? 'أفضل لاعب شاب' :
                    goal === 'leadershipSkills' ? 'مهارات القيادة' :
                    goal === 'playWithStars' ? 'اللعب مع النجوم' :
                    goal === 'clubStability' ? 'استقرار النادي' :
                    goal === 'returnAsStar' ? 'العودة كنجم' :
                    goal === 'futureTraining' ? 'التدريب المستقبلي' :
                    goal === 'internationalTrials' ? 'التجارب الدولية' :
                    goal === 'investmentClub' ? 'نادي الاستثمار' :
                    goal === 'accreditedAcademy' ? 'الأكاديمية المعتمدة' :
                    goal === 'fifaRegistration' ? 'تسجيل الفيفا' :
                    goal === 'englishCourses' ? 'دورات اللغة الإنجليزية' :
                    goal === 'additionalLanguages' ? 'اللغات الإضافية' :
                    goal === 'sportsAnalysis' ? 'التحليل الرياضي' :
                    goal === 'physicalPreparation' ? 'الإعداد البدني' :
                    goal === 'psychologicalPreparation' ? 'الإعداد النفسي' :
                    goal === 'coachingLicense' ? 'رخصة التدريب' :
                    goal === 'clubManagement' ? 'إدارة النادي' : goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* الخدمات المطلوبة */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">الخدمات المطلوبة</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {[
                'playerTraining',
                'youthPrograms',
                'officialCompetitions',
                'playerRepresentation',
                'contractNegotiation',
                'advancedPrograms',
                'talentDevelopment',
                'personalTraining',
                'preparationPrograms',
                'sportsConsultations',
                'legalConsultation',
                'trainingCamps'
              ].map(service => (
                <label key={service} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.requiredServices.includes(service)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(prev => ({
                          ...prev,
                          requiredServices: [...prev.requiredServices, service]
                        }));
                      } else {
                        setFilters(prev => ({
                          ...prev,
                          requiredServices: prev.requiredServices.filter(s => s !== service)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm">{service === 'playerTraining' ? 'تدريب اللاعبين' :
                    service === 'youthPrograms' ? 'برامج الشباب' :
                    service === 'officialCompetitions' ? 'المنافسات الرسمية' :
                    service === 'playerRepresentation' ? 'تمثيل اللاعبين' :
                    service === 'contractNegotiation' ? 'تفاوض العقود' :
                    service === 'advancedPrograms' ? 'البرامج المتقدمة' :
                    service === 'talentDevelopment' ? 'تطوير المواهب' :
                    service === 'personalTraining' ? 'التدريب الشخصي' :
                    service === 'preparationPrograms' ? 'برامج الإعداد' :
                    service === 'sportsConsultations' ? 'الاستشارات الرياضية' :
                    service === 'legalConsultation' ? 'الاستشارات القانونية' :
                    service === 'trainingCamps' ? 'معسكرات التدريب' : service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

              {/* ترتيب النتائج */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium mb-2 text-gray-700">ترتيب النتائج</label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'relevance', label: 'الأكثر صلة' },
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
                className={`${filters.sortBy === sort.key ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {sort.label}
              </Button>
            ))}
          </div>
        </div>

      {/* أزرار التحكم */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {totalResults} {'dashboard.player.search.resultsFound'}
        </div>
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          {'dashboard.player.search.resetFilters'}
        </Button>
      </div>
    </Card>
  );

  // مكون عرض الكيان
  const EntityCard = ({ entity }: { entity: SearchEntity }) => {
    const entityType = ENTITY_TYPES[entity.type];
    const EntityIcon = entityType.icon;

    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full flex flex-col min-h-[500px] border-2 border-transparent hover:border-blue-200 hover:border-opacity-50">
        {/* الصورة الغلاف */}
        {entity.coverImage && (
          <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 relative group-hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img 
              src={entity.coverImage} 
              alt={entity.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
          </div>
        )}

        <div className="p-6 flex-1 flex flex-col group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50 transition-all duration-300">
                      {/* الرأس */}
            <div className="flex items-start gap-4 mb-6 group-hover:gap-6 transition-all duration-300">
            {/* الصورة الشخصية */}
                          <div className="relative flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              {entity.profileImage ? (
                <img 
                  src={entity.profileImage} 
                  alt={entity.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full ${entityType.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <EntityIcon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              )}
              
              {/* شارات الحالة */}
              <div className="absolute -top-2 -right-2 flex flex-col gap-1 group-hover:scale-110 transition-transform duration-300">
                {entity.verified && (
                  <div className="bg-blue-500 rounded-full p-1.5 group-hover:bg-blue-600 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                  </div>
                )}
                {entity.isPremium && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5 group-hover:from-yellow-500 group-hover:to-orange-600 transition-all duration-300">
                    <Sparkles className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                  </div>
                )}
              </div>
            </div>

            {/* معلومات أساسية */}
            <div className="flex-1 min-w-0 group-hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-2 group-hover:gap-3 transition-all duration-300">
                <h3 className="font-bold text-xl text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">{entity.name}</h3>
                <Badge variant="secondary" className={`${entityType.color} text-white flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                  {entityType.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 group-hover:scale-105 transition-transform duration-300 group-hover:gap-6">
                <div className="flex items-center gap-1 group-hover:text-blue-600 transition-colors duration-300 group-hover:gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="truncate">{entity.location.city}, {entity.location.country}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 group-hover:text-yellow-600 transition-colors duration-300 group-hover:gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                  <span>{entity.rating.toFixed(1)} ({entity.reviewsCount})</span>
                </div>
              </div>

              {entity.specialization && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2 group-hover:text-purple-600 transition-colors duration-300 group-hover:gap-2">
                  <Target className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="truncate">{entity.specialization}</span>
                </div>
              )}

              {/* معلومات إضافية */}
              {entity.established && (
                <div className="flex items-center gap-1 text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-300 group-hover:gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span>تأسس في: {entity.established}</span>
                </div>
              )}
            </div>
          </div>

          {/* الوصف */}
          <div className="mb-6 flex-1 group-hover:scale-105 transition-transform duration-300">
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">{entity.description}</p>
          </div>

          {/* الخدمات */}
          {entity.services && entity.services.length > 0 && (
            <div className="mb-4 group-hover:scale-105 transition-transform duration-300">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 group-hover:text-gray-800 transition-colors duration-300">الخدمات المقدمة</h4>
              <div className="flex flex-wrap gap-1 group-hover:gap-2 transition-all duration-300">
                              {entity.services.slice(0, 3).map((service, index) => {
                // تحويل مفاتيح الترجمة إلى نصوص عربية
                const serviceText = service.includes('dashboard.player.search.services.') 
                  ? service.replace('dashboard.player.search.services.', '')
                    .replace('playerTraining', 'تدريب اللاعبين')
                    .replace('youthPrograms', 'برامج الشباب')
                    .replace('officialCompetitions', 'المنافسات الرسمية')
                    .replace('playerRepresentation', 'تمثيل اللاعبين')
                    .replace('contractNegotiation', 'تفاوض العقود')
                    .replace('advancedPrograms', 'البرامج المتقدمة')
                    .replace('talentDevelopment', 'تطوير المواهب')
                    .replace('personalTraining', 'التدريب الشخصي')
                    .replace('preparationPrograms', 'برامج الإعداد')
                    .replace('sportsConsultations', 'الاستشارات الرياضية')
                    .replace('legalConsultation', 'الاستشارات القانونية')
                    .replace('trainingCamps', 'معسكرات التدريب')
                  : service;
                
                return (
                  <Badge key={index} variant="outline" className="text-xs group-hover:scale-105 transition-transform duration-300">
                    {serviceText}
                  </Badge>
                );
              })}
                {entity.services.length > 3 && (
                  <Badge variant="outline" className="text-xs group-hover:scale-105 transition-transform duration-300">
                    +{entity.services.length - 3} المزيد
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* الأزرار */}
                        <div className="flex flex-col gap-3 mt-auto group-hover:scale-105 transition-transform duration-300 group-hover:gap-4">
            <Button
              onClick={() => handleViewProfile(entity)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group-hover:shadow-2xl"
              disabled={actionLoading === entity.id}
            >
              {actionLoading === entity.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              )}
              عرض الملف الشخصي
            </Button>
            
            <div className="flex gap-2 transition-all duration-300 hover:gap-3 group-hover:gap-4 group-hover:scale-105">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFollow(entity.id)}
                disabled={actionLoading === `follow-${entity.id}`}
                data-entity-id={entity.id}
                className={`flex-1 border-0 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group-hover:shadow-2xl ${
                  actionLoading === `follow-${entity.id}`
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse text-white'
                    : actionSuccess === `follow-${entity.id}`
                    ? 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 animate-pulse text-white'
                    : entity.isFollowing
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                }`}
              >
                {actionLoading === `follow-${entity.id}` ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : actionSuccess === `follow-${entity.id}` ? (
                  <>
                    <Check className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    {entity.isFollowing ? 'متابع' : 'متابعة'}
                  </>
                ) : entity.isFollowing ? (
                  <>
                    <Check className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    متابع
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    متابعة
                  </>
                )}
              </Button>
              
              <SendMessageButton
                user={user}
                userData={userData}
                getUserDisplayName={() => userData?.full_name || userData?.displayName || userData?.name || 'مستخدم'}
                targetUserId={entity.id}
                targetUserName={entity.name}
                targetUserType={entity.type}
                organizationName={entity?.specialization}
                buttonText={'رسالة'}
                buttonVariant="outline"
                buttonSize="sm"
                className={`flex-1 border-0 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group-hover:shadow-2xl ${
                  actionLoading === `message-${entity.id}`
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse text-white'
                    : actionSuccess === `message-${entity.id}`
                    ? 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 animate-pulse text-white'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                }`}
              />
            </div>
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
      <div className="w-full px-6 py-8">
        {/* العنوان والبحث */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
                            {/* تم إلغاء مبدل اللغة مؤقتاً */}
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            البحث عن الفرص والأندية والأكاديميات
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            اكتشف أفضل الفرص للانضمام للأندية والأكاديميات والعمل مع الوكلاء المحترفين
          </p>

          {/* شريط البحث */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="البحث عن أندية، أكاديميات، وكلاء، مدربين..."
                value={filters.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* أزرار المرشحات السريعة */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={filters.type === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange({ type: 'all' })}
              className={`rounded-full ${filters.type === 'all' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              جميع الأنواع
            </Button>
            {Object.entries(ENTITY_TYPES).map(([key, value]) => (
              <Button
                key={key}
                variant={filters.type === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange({ type: key as any })}
                className={`rounded-full ${filters.type === key ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                {value.label}
              </Button>
            ))}
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="flex gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              المرشحات المتقدمة
            </Button>
          </div>

          {/* عدد النتائج */}
          <div className="text-sm text-gray-600">
            {totalResults > 0 && `تم العثور على ${totalResults} نتيجة`}
          </div>
        </div>

        {/* المرشحات المتقدمة */}
        {showFilters && <SearchFilters />}

        {/* النتائج */}
        {isLoading && entities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(10)].map((_, i) => (
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
                          <h3 className="text-2xl font-bold text-gray-900">لم يتم العثور على نتائج</h3>
            <p className="text-gray-500 max-w-md">
              جرب تغيير معايير البحث أو استخدام كلمات مفتاحية مختلفة
            </p>
            <Button
              onClick={handleResetFilters}
              className="mt-4"
            >
              إعادة تعيين المرشحات
            </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {entities
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((entity, index) => (
                  <EntityCard key={`${entity.id}-${entity.type}-${index}`} entity={entity} />
                ))}
            </div>

            {/* التنقل بين الصفحات */}
            {entities.length > itemsPerPage && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2"
                >
                  السابق
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.ceil(entities.length / itemsPerPage) }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      onClick={() => setCurrentPage(i + 1)}
                      className="w-10 h-10 p-0"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(entities.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(entities.length / itemsPerPage)}
                  className="px-4 py-2"
                >
                  التالي
                </Button>
              </div>
            )}

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
