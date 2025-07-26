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
import { useTranslation } from '@/lib/translations/simple-context';
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

export default function SearchPage() {
  const { t, tWithVars } = useTranslation();
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

  // تعريف أنواع الكيانات مع الترجمة
  const ENTITY_TYPES = {
    club: { label: t('dashboard.player.search.entityTypes.club'), icon: Building, color: 'bg-blue-500' },
    agent: { label: t('dashboard.player.search.entityTypes.agent'), icon: Briefcase, color: 'bg-purple-500' },
    scout: { label: t('dashboard.player.search.entityTypes.scout'), icon: Eye, color: 'bg-green-500' },
    academy: { label: t('dashboard.player.search.entityTypes.academy'), icon: Trophy, color: 'bg-orange-500' },
    sponsor: { label: t('dashboard.player.search.entityTypes.sponsor'), icon: Award, color: 'bg-red-500' },
    trainer: { label: t('dashboard.player.search.entityTypes.trainer'), icon: User, color: 'bg-cyan-500' }
  };

  const COUNTRIES = [
    t('dashboard.player.search.countries.egypt'),
    t('dashboard.player.search.countries.saudiArabia'),
    t('dashboard.player.search.countries.uae'),
    t('dashboard.player.search.countries.qatar'),
    t('dashboard.player.search.countries.kuwait'),
    t('dashboard.player.search.countries.bahrain'),
    t('dashboard.player.search.countries.oman'),
    t('dashboard.player.search.countries.jordan'),
    t('dashboard.player.search.countries.lebanon'),
    t('dashboard.player.search.countries.iraq'),
    t('dashboard.player.search.countries.morocco'),
    t('dashboard.player.search.countries.algeria'),
    t('dashboard.player.search.countries.tunisia'),
    t('dashboard.player.search.countries.libya')
  ];

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
              name: clubData.name || t('dashboard.player.search.defaultNames.club'),
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
              description: clubData.description || t('dashboard.player.search.defaultDescriptions.club'),
              specialization: clubData.type || t('dashboard.player.search.defaultSpecializations.football'),
              verified: true, // جميع الأندية المسجلة محققة
              rating: 4.5, // تقييم افتراضي
              reviewsCount: Math.floor(Math.random() * 500) + 100,
              followersCount: (clubData.stats?.players || 0) * 10,
              connectionsCount: clubData.stats?.contracts || 0,
              achievements: clubData.trophies?.map((t: any) => `${t.name} (${t.year})`) || [],
              services: [t('dashboard.player.search.services.playerTraining'), t('dashboard.player.search.services.youthPrograms'), t('dashboard.player.search.services.officialCompetitions')],
              established: clubData.founded || '',
              languages: [t('dashboard.player.search.languages.arabic')],
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
              name: agentData.full_name || t('dashboard.player.search.defaultNames.agent'),
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
              description: agentData.specialization || t('dashboard.player.search.defaultDescriptions.agent'),
              specialization: agentData.specialization || t('dashboard.player.search.defaultSpecializations.playerAgent'),
              verified: agentData.is_fifa_licensed || false,
              rating: 4.5,
              reviewsCount: Math.floor(Math.random() * 500) + 100,
              followersCount: (agentData.stats?.players || 0) * 10,
              connectionsCount: agentData.stats?.contracts || 0,
              achievements: agentData.is_fifa_licensed ? [t('dashboard.player.search.achievements.fifaLicensed')] : [],
              services: [t('dashboard.player.search.services.playerRepresentation'), t('dashboard.player.search.services.contractNegotiation')],
              established: agentData.established || '',
              languages: agentData.spoken_languages || [t('dashboard.player.search.languages.arabic')],
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
              name: academyData.name || t('dashboard.player.search.defaultNames.academy'),
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
              description: academyData.description || t('dashboard.player.search.defaultDescriptions.academy'),
              specialization: Array.isArray(academyData.programs) ? academyData.programs.join(', ') : t('dashboard.player.search.defaultSpecializations.academy'),
              verified: true,
              rating: 4.6,
              reviewsCount: Math.floor(Math.random() * 300) + 100,
              followersCount: (academyData.stats?.students || 0) * 5,
              connectionsCount: academyData.stats?.graduates || 0,
              achievements: [t('dashboard.player.search.achievements.certified'), t('dashboard.player.search.achievements.advancedPrograms')],
              services: [t('dashboard.player.search.services.playerTraining'), t('dashboard.player.search.services.advancedPrograms'), t('dashboard.player.search.services.talentDevelopment')],
              established: academyData.established || '',
              languages: [t('dashboard.player.search.languages.arabic')],
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
              name: trainerData.full_name || t('dashboard.player.search.defaultNames.trainer'),
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
              description: trainerData.specialization || t('dashboard.player.search.defaultDescriptions.trainer'),
              specialization: trainerData.specialization || t('dashboard.player.search.defaultSpecializations.physicalTraining'),
              verified: trainerData.is_certified || false,
              rating: 4.4,
              reviewsCount: Math.floor(Math.random() * 150) + 30,
              followersCount: (trainerData.stats?.players || 0) * 20,
              connectionsCount: trainerData.stats?.training_sessions || 0,
              achievements: trainerData.is_certified ? [t('dashboard.player.search.achievements.certified'), t('dashboard.player.search.achievements.advancedExperience')] : [t('dashboard.player.search.achievements.local'), t('dashboard.player.search.achievements.advancedExperience')],
              services: [t('dashboard.player.search.services.personalTraining'), t('dashboard.player.search.services.preparationPrograms'), t('dashboard.player.search.services.sportsConsultations')],
              established: trainerData.established || '',
              languages: trainerData.spoken_languages || [t('dashboard.player.search.languages.arabic')],
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
          allEntities.sort((a, b) => a.name.localeCompare(b.name));
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
          name: t('dashboard.player.search.mockEntities.alahly.name'),
          type: 'club',
          email: 'info@alahly.com',
          phone: '+20223456789',
          website: 'www.alahly.com',
          profileImage: '/clubs/ahly.jpg',
          location: { country: t('dashboard.player.search.mockEntities.alahly.location.country'), city: t('dashboard.player.search.mockEntities.alahly.location.city') },
          description: t('dashboard.player.search.mockEntities.alahly.description'),
          verified: true,
          rating: 4.9,
          reviewsCount: 1200,
          followersCount: 5480000,
          connectionsCount: 1200,
          achievements: [t('dashboard.player.search.mockEntities.alahly.achievements.afcon'), t('dashboard.player.search.mockEntities.alahly.achievements.egyptianLeague')],
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
          name: t('dashboard.player.search.mockEntities.starsAgency.name'),
          type: 'agent',
          email: 'contact@stars-agency.com',
          phone: '+97145678901',
          website: 'www.stars-agency.com',
          profileImage: '/images/agent-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: t('dashboard.player.search.mockEntities.starsAgency.location.country'), city: t('dashboard.player.search.mockEntities.starsAgency.location.city') },
          description: t('dashboard.player.search.mockEntities.starsAgency.description'),
          specialization: t('dashboard.player.search.mockEntities.starsAgency.specialization'),
          verified: true,
          rating: 4.8,
          reviewsCount: 340,
          followersCount: 89000,
          connectionsCount: 450,
          achievements: [t('dashboard.player.search.mockEntities.starsAgency.achievements')],
          services: [t('dashboard.player.search.mockEntities.starsAgency.services.contractNegotiation'), t('dashboard.player.search.mockEntities.starsAgency.services.legalConsultation')],
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
          name: t('dashboard.player.search.mockEntities.faisalAcademy.name'),
          type: 'academy',
          email: 'info@faisal-academy.com',
          phone: '+966112345678',
          website: 'www.faisal-academy.com',
          profileImage: '/images/club-avatar.png',
          coverImage: '/images/hero-1.jpg',
          location: { country: t('dashboard.player.search.mockEntities.faisalAcademy.location.country'), city: t('dashboard.player.search.mockEntities.faisalAcademy.location.city') },
          description: t('dashboard.player.search.mockEntities.faisalAcademy.description'),
          specialization: t('dashboard.player.search.mockEntities.faisalAcademy.specialization'),
          verified: true,
          rating: 4.7,
          reviewsCount: 250,
          followersCount: 15000,
          connectionsCount: 800,
          achievements: [t('dashboard.player.search.mockEntities.faisalAcademy.achievements.bestAcademy'), t('dashboard.player.search.mockEntities.faisalAcademy.achievements.certified')],
          services: [t('dashboard.player.search.mockEntities.faisalAcademy.services.youthPrograms'), t('dashboard.player.search.mockEntities.faisalAcademy.services.talentDevelopment'), t('dashboard.player.search.mockEntities.faisalAcademy.services.trainingCamps')],
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
          name: t('dashboard.player.search.mockEntities.ahmedExpert.name'),
          type: 'trainer',
          email: 'ahmed.expert@trainer.com',
          phone: '+966501234567',
          website: 'www.ahmed-trainer.com',
          profileImage: '/images/user-avatar.svg',
          coverImage: '/images/hero-1.jpg',
          location: { country: t('dashboard.player.search.mockEntities.ahmedExpert.location.country'), city: t('dashboard.player.search.mockEntities.ahmedExpert.location.city') },
          description: t('dashboard.player.search.mockEntities.ahmedExpert.description'),
          specialization: t('dashboard.player.search.mockEntities.ahmedExpert.specialization'),
          verified: true,
          rating: 4.5,
          reviewsCount: 180,
          followersCount: 8500,
          connectionsCount: 120,
          achievements: [t('dashboard.player.search.mockEntities.ahmedExpert.achievements.certified'), t('dashboard.player.search.mockEntities.ahmedExpert.achievements.internationalCertification')],
          services: [t('dashboard.player.search.mockEntities.ahmedExpert.services.personalTraining'), t('dashboard.player.search.mockEntities.ahmedExpert.services.preparationPrograms'), t('dashboard.player.search.mockEntities.ahmedExpert.services.sportsConsultations')],
          established: '8 years experience',
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
          name: t('dashboard.player.search.mockEntities.zamalek.name'),
          type: 'club',
          email: 'info@zamalek.com',
          phone: '+20223456780',
          website: 'www.zamalek.com',
          profileImage: '/clubs/zamalek.jpg',
          location: { country: t('dashboard.player.search.mockEntities.zamalek.location.country'), city: t('dashboard.player.search.mockEntities.zamalek.location.city') },
          description: t('dashboard.player.search.mockEntities.zamalek.description'),
          verified: true,
          rating: 4.8,
          reviewsCount: 980,
          followersCount: 3200000,
          connectionsCount: 850,
          achievements: [t('dashboard.player.search.mockEntities.zamalek.achievements.afcon'), t('dashboard.player.search.mockEntities.zamalek.achievements.egyptianLeague')],
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
  }, [user, filters, t]);

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
    
    setActionLoading(`follow-${entityId}`);
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
  const handleViewProfile = (entity: SearchEntity) => {
    if (!user) return;
    
    // إرسال إشعار مشاهدة الملف
    sendProfileViewNotification(entity.id, entity.type);
    
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
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('dashboard.player.search.filters.entityType')}</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t('dashboard.player.search.filters.allTypes')}</option>
            {Object.entries(ENTITY_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>

        {/* الدولة */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('dashboard.player.search.filters.country')}</label>
          <select
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('dashboard.player.search.filters.allCountries')}</option>
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* التقييم الأدنى */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('dashboard.player.search.filters.minRating')}</label>
          <div className="flex gap-2">
            {[0, 3, 3.5, 4, 4.5].map(rating => (
              <Button
                key={rating}
                variant={filters.minRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
              >
                {rating > 0 ? `${rating}+` : t('dashboard.player.search.filters.all')}
              </Button>
            ))}
          </div>
        </div>

        {/* خيارات إضافية */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">{t('dashboard.player.search.filters.additionalOptions')}</label>
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
              <span className="text-sm">{t('dashboard.player.search.filters.verifiedOnly')}</span>
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
              <span className="text-sm">{t('dashboard.player.search.filters.premiumOnly')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* ترتيب النتائج */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium mb-2 text-gray-700">{t('dashboard.player.search.filters.sortResults')}</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'relevance', label: t('dashboard.player.search.sortOptions.relevance') },
            { key: 'rating', label: t('dashboard.player.search.sortOptions.highestRated') },
            { key: 'followers', label: t('dashboard.player.search.sortOptions.mostFollowed') },
            { key: 'recent', label: t('dashboard.player.search.sortOptions.newest') },
            { key: 'alphabetical', label: t('dashboard.player.search.sortOptions.alphabetical') }
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
              <div className="text-xs text-gray-500">{t('dashboard.player.search.stats.followers')}</div>
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                {formatNumber(entity.connectionsCount)}
              </div>
              <div className="text-xs text-gray-500">{t('dashboard.player.search.stats.connections')}</div>
            </div>
            <div>
              <div className="font-bold text-lg text-gray-900">
                {formatNumber(entity.stats?.successfulDeals || 0)}
              </div>
              <div className="text-xs text-gray-500">{t('dashboard.player.search.stats.deals')}</div>
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
              {t('dashboard.player.search.actions.viewProfile')}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={entity.isFollowing ? "default" : "outline"}
                size="sm"
                onClick={() => handleFollow(entity.id)}
                disabled={actionLoading === `follow-${entity.id}`}
                className="flex-1"
              >
                {actionLoading === `follow-${entity.id}` ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : entity.isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" />
                    {t('dashboard.player.search.actions.following')}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    {t('dashboard.player.search.actions.follow')}
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
                  buttonText={t('dashboard.player.search.actions.message')}
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
                {t('dashboard.player.search.contact.email')}
              </a>
            )}
            {entity.contactInfo.phone && (
              <a
                href={`tel:${entity.contactInfo.phone}`}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Phone className="w-4 h-4" />
                {t('dashboard.player.search.contact.phone')}
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
                {t('dashboard.player.search.contact.website')}
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
            {t('dashboard.player.search.title')}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {t('dashboard.player.search.subtitle')}
          </p>
          
          {/* شريط البحث الرئيسي */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={t('dashboard.player.search.searchPlaceholder')}
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-4 pr-12 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
              <Button
                onClick={() => fetchEntities(true)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
              >
                {t('dashboard.player.search.searchButton')}
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
              {t('dashboard.player.search.advancedFilters')}
            </Button>
          </div>

          {/* عدد النتائج */}
          <div className="text-sm text-gray-600">
            {totalResults > 0 && tWithVars('dashboard.player.search.resultsCount', { count: totalResults })}
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
              <h3 className="text-2xl font-bold text-gray-900">{t('dashboard.player.search.noResults.title')}</h3>
              <p className="text-gray-500 max-w-md">
                {t('dashboard.player.search.noResults.description')}
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
                {t('dashboard.player.search.noResults.resetFilters')}
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
                      {t('dashboard.player.search.loadingMore')}
                    </>
                  ) : (
                    <>
                      {t('dashboard.player.search.loadMore')}
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
