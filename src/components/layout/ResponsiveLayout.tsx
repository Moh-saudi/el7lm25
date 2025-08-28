'use client';

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Home, 
  User, 
  Users, 
  Search, 
  Video, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Shield,
  GraduationCap,
  Bell,
  MessageSquare,
  BarChart3,
  DollarSign,
  Handshake,
  Star,
  Clock,
  CreditCard,
  Target,
  Settings,
  Globe,
  Play,
  Award,
  TrendingUp,
  Zap,
  Heart,
  Building,
  Briefcase,
  Crown,
  Menu,
  X,
  UserPlus,
  BookOpen,
  Calendar,
  MapPin,
  Headphones,
  Database,
  HardDrive,
  UserCheck,
  UserCog,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Brain,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from 'react-responsive';

// ===== Context للتحكم في التخطيط =====
interface LayoutContextType {
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isClient: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

// ===== Provider للتحكم في التخطيط =====
interface LayoutProviderProps {
  children: React.ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // استخدام react-responsive للكشف عن حجم الشاشة
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
  }, []);

  // إدارة حالة السايدبار حسب حجم الشاشة
  useEffect(() => {
    if (!isClient) return; // لا نطبق التغييرات حتى يعمل على العميل
    
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsSidebarCollapsed(false);
    } else if (isTablet) {
      setIsSidebarOpen(true);
      setIsSidebarCollapsed(false); // تغيير من true إلى false
    } else {
      setIsSidebarOpen(true);
      setIsSidebarCollapsed(false);
    }
  }, [isMobile, isTablet, isDesktop, isClient]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
      // تأكد من أن السايدبار مفتوح على الشاشات الكبيرة
      if (isSidebarCollapsed) {
        setIsSidebarOpen(true);
      }
    }
  };

  const toggleSidebarCollapse = () => {
    if (!isMobile) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarCollapsed(true);
    }
  };

  const openSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  };

  const value: LayoutContextType = {
    isSidebarOpen,
    isSidebarCollapsed,
    isMobile,
    isTablet,
    isDesktop,
    isClient,
    toggleSidebar,
    toggleSidebarCollapse,
    closeSidebar,
    openSidebar,
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

// ===== مكون السايدبار المحسن =====
interface ResponsiveSidebarProps {
  accountType?: string;
}

const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ accountType: propAccountType = 'player' }) => {
  const { user, userData, logout } = useAuth();
  
  // تحديد نوع الحساب من userData أو من prop
  const accountType = userData?.accountType || propAccountType;
  const router = useRouter();
  const pathname = usePathname();

  const { 
    isSidebarOpen, 
    isSidebarCollapsed, 
    isMobile, 
    isTablet, 
    isDesktop,
    isClient,
    toggleSidebar,
    closeSidebar 
  } = useLayout();

  const [activeItem, setActiveItem] = useState('dashboard');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['main']));

  // معلومات أنواع الحسابات
  const ACCOUNT_TYPE_INFO = {
    player: {
      title: 'منصة اللاعب',
      subtitle: 'لاعب',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      emoji: '⚽'
    },
    club: {
      title: 'منصة النادي',
      subtitle: 'نادي',
      icon: Building,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      emoji: '🏢'
    },
    admin: {
      title: 'منصة الإدارة',
      subtitle: 'مدير',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      emoji: '👑'
    },
    agent: {
      title: 'منصة الوكيل',
      subtitle: 'وكيل',
      icon: Briefcase,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      emoji: '💼'
    },
    academy: {
      title: 'منصة الأكاديمية',
      subtitle: 'أكاديمية',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      emoji: '🎓'
    },
    trainer: {
      title: 'منصة المدرب',
      subtitle: 'مدرب',
      icon: Target,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      emoji: '🎯'
    },
    marketer: {
      title: 'منصة المسوق',
      subtitle: 'مسوق',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      emoji: '📈'
    },
    'dream-academy': {
      title: 'أكاديمية الحلم',
      subtitle: 'أكاديمية الحلم',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      emoji: '🎓'
    }
  };

  const accountInfo = ACCOUNT_TYPE_INFO[accountType as keyof typeof ACCOUNT_TYPE_INFO] || ACCOUNT_TYPE_INFO.player;
  const IconComponent = accountInfo.icon;

  // تحديد عرض السايدبار - أحجام مصغرة
  const getSidebarWidth = () => {
    if (isMobile) return 'w-72';
    if (isSidebarCollapsed) {
      if (isTablet) return 'w-14';
      return 'w-16';
    }
    if (isTablet) return 'w-56';
    return 'w-64';
  };

  // تحديد ما إذا كان يجب إظهار النصوص
  const shouldShowText = () => {
    if (isMobile) return true;
    if (isTablet) return !isSidebarCollapsed;
    return !isSidebarCollapsed;
  };

  // الحصول على مجموعات القائمة
  const getMenuGroups = () => {
    const baseGroup = {
      id: 'main',
      title: 'القائمة الرئيسية',
      icon: Home,
      items: [
        {
          id: 'dashboard',
          label: 'الرئيسية',
          icon: Home,
          href: `/dashboard/${accountType}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          id: 'profile',
          label: 'الملف الشخصي',
          icon: User,
          href: `/dashboard/${accountType}/profile`,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          id: 'messages',
          label: 'الرسائل',
          icon: MessageSquare,
          href: `/dashboard/messages`,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50'
        },
        {
          id: 'notifications',
          label: 'الإشعارات',
          icon: Bell,
          href: `/dashboard/${accountType}/notifications`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        }
      ]
    };

    const subscriptionGroup = {
      id: 'subscription',
      title: 'الاشتراكات والمدفوعات',
      icon: CreditCard,
      items: [
        {
          id: 'subscription-status',
          label: 'حالة الاشتراك',
          icon: Star,
          href: `/dashboard/subscription`,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50'
        },
        {
          id: 'payment',
          label: 'الدفع',
          icon: CreditCard,
          href: accountType === 'admin' ? `/dashboard/admin/payments` : `/dashboard/shared/bulk-payment`,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      ]
    };

    const academyGroup = {
      id: 'academy',
      title: 'التدريب والتعليم',
      icon: GraduationCap,
      items: [
        {
          id: 'dream-academy',
          label: 'أكاديمية الحلم',
          icon: GraduationCap,
          href: `/dashboard/dream-academy`,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50'
        }
      ]
    };

    const sharedGroup = {
      id: 'shared',
      title: 'الصفحات المشتركة',
      icon: Users,
      items: [
        {
          id: 'shared-bulk-payment',
          label: 'الدفع الجماعي',
          icon: CreditCard,
          href: `/dashboard/shared/bulk-payment`,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      ]
    };

    // إضافة قوائم مخصصة حسب نوع الحساب - الصفحات الموجودة فعلياً
    const accountSpecificGroups = [];

    // قائمة اللاعب - إعادة ترتيب منطقي
    if (accountType === 'player') {
      accountSpecificGroups.push({
        id: 'player-content',
        title: 'المحتوى الشخصي',
        icon: Video,
        items: [
          {
            id: 'player-videos',
            label: 'فيديوهاتي',
            icon: Video,
            href: `/dashboard/player/videos`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            id: 'player-stats',
            label: 'إحصائياتي',
            icon: BarChart3,
            href: `/dashboard/player/stats`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'player-reports',
            label: 'تقاريري',
            icon: FileText,
            href: `/dashboard/player/reports`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'player-services',
        title: 'الخدمات',
        icon: ShoppingBag,
        items: [
          {
            id: 'player-academy',
            label: 'الأكاديمية',
            icon: GraduationCap,
            href: `/dashboard/player/academy`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'player-store',
            label: 'المتجر',
            icon: ShoppingBag,
            href: `/dashboard/player/store`,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50'
          },
          {
            id: 'player-search',
            label: 'البحث',
            icon: Search,
            href: `/dashboard/player/search`,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'player-financial',
        title: 'المالية',
        icon: DollarSign,
        items: [
          {
            id: 'player-billing',
            label: 'الفواتير',
            icon: CreditCard,
            href: `/dashboard/player/billing`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
          {
            id: 'player-referrals',
            label: 'الإحالات',
            icon: Users,
            href: `/dashboard/player/referrals`,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
          }
        ]
      });
    }

    // قائمة النادي - إعادة ترتيب منطقي
    if (accountType === 'club') {
      accountSpecificGroups.push({
        id: 'club-players',
        title: 'إدارة اللاعبين',
        icon: Users,
        items: [
          {
            id: 'club-players-list',
            label: 'قائمة اللاعبين',
            icon: Users,
            href: `/dashboard/club/players`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            id: 'club-search-players',
            label: 'البحث عن لاعبين',
            icon: Search,
            href: `/dashboard/club/search-players`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'club-player-videos',
            label: 'فيديوهات اللاعبين',
            icon: Video,
            href: `/dashboard/club/player-videos`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'club-player-evaluation',
            label: 'تقييم اللاعبين',
            icon: Target,
            href: `/dashboard/club/player-evaluation`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'club-business',
        title: 'الأعمال التجارية',
        icon: Handshake,
        items: [
          {
            id: 'club-contracts',
            label: 'العقود',
            icon: FileText,
            href: `/dashboard/club/contracts`,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          },
          {
            id: 'club-negotiations',
            label: 'المفاوضات',
            icon: Handshake,
            href: `/dashboard/club/negotiations`,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
          },
          {
            id: 'club-market-values',
            label: 'القيم السوقية',
            icon: DollarSign,
            href: `/dashboard/club/market-values`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'club-marketing',
        title: 'التسويق والتحليل',
        icon: TrendingUp,
        items: [
          {
            id: 'club-marketing-tools',
            label: 'التسويق',
            icon: TrendingUp,
            href: `/dashboard/club/marketing`,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50'
          },
          {
            id: 'club-ai-analysis',
            label: 'تحليل الذكاء الاصطناعي',
            icon: Brain,
            href: `/dashboard/club/ai-analysis`,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          }
        ]
      });
    }

    // قائمة المدرب - إعادة ترتيب منطقي
    if (accountType === 'trainer') {
      accountSpecificGroups.push({
        id: 'trainer-players',
        title: 'إدارة اللاعبين',
        icon: Users,
        items: [
          {
            id: 'trainer-players-list',
            label: 'قائمة لاعبي',
            icon: Users,
            href: `/dashboard/trainer/players`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'trainer-search-players',
            label: 'البحث عن لاعبين',
            icon: Search,
            href: `/dashboard/trainer/search-players`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'trainer-player-videos',
            label: 'فيديوهات اللاعبين',
            icon: Video,
            href: `/dashboard/trainer/player-videos`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }
        ]
      });
    }

    // قائمة الأكاديمية - إعادة ترتيب منطقي
    if (accountType === 'academy') {
      accountSpecificGroups.push({
        id: 'academy-players',
        title: 'إدارة اللاعبين',
        icon: Users,
        items: [
          {
            id: 'academy-players-list',
            label: 'لاعبي الأكاديمية',
            icon: Users,
            href: `/dashboard/academy/players`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'academy-search-players',
            label: 'البحث عن لاعبين',
            icon: Search,
            href: `/dashboard/academy/search-players`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'academy-player-videos',
            label: 'فيديوهات اللاعبين',
            icon: Video,
            href: `/dashboard/academy/player-videos`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }
        ]
      });
    }

    // قائمة الوكيل - إعادة ترتيب منطقي
    if (accountType === 'agent') {
      accountSpecificGroups.push({
        id: 'agent-players',
        title: 'إدارة اللاعبين',
        icon: Users,
        items: [
          {
            id: 'agent-players-list',
            label: 'قائمة لاعبي',
            icon: Users,
            href: `/dashboard/agent/players`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'agent-search-players',
            label: 'البحث عن لاعبين',
            icon: Search,
            href: `/dashboard/agent/search-players`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'agent-player-videos',
            label: 'فيديوهات اللاعبين',
            icon: Video,
            href: `/dashboard/agent/player-videos`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }
        ]
      });
    }

    // قائمة الإدارة - إعادة ترتيب منطقي
    if (accountType === 'admin') {
      accountSpecificGroups.push({
        id: 'admin-users',
        title: 'إدارة المستخدمين',
        icon: Users,
        items: [
          {
            id: 'admin-users-management',
            label: 'إدارة المستخدمين',
            icon: Users,
            href: `/dashboard/admin/users`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'admin-employees',
            label: 'الموظفين',
            icon: UserCheck,
            href: `/dashboard/admin/employees`,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'admin-financial',
        title: 'الإدارة المالية',
        icon: DollarSign,
        items: [
          {
            id: 'admin-payments',
            label: 'المدفوعات',
            icon: CreditCard,
            href: `/dashboard/admin/payments`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            id: 'admin-subscriptions',
            label: 'الاشتراكات',
            icon: Star,
            href: `/dashboard/admin/subscriptions`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          },
          {
            id: 'admin-invoices',
            label: 'الفواتير',
            icon: FileText,
            href: `/dashboard/admin/invoices`,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'admin-operations',
        title: 'العمليات',
        icon: Settings,
        items: [
          {
            id: 'admin-notifications',
            label: 'الإشعارات',
            icon: Bell,
            href: `/dashboard/admin/notifications`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          },
          {
            id: 'admin-notification-center',
            label: 'مركز الإشعارات',
            icon: Bell,
            href: `/dashboard/admin/notification-center`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            id: 'admin-send-notifications',
            label: 'إرسال الإشعارات',
            icon: Send,
            href: `/dashboard/admin/send-notifications`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },

          {
            id: 'admin-reports',
            label: 'التقارير',
            icon: FileText,
            href: `/dashboard/admin/reports`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'admin-customer-management',
            label: 'إدارة العملاء',
            icon: UserPlus,
            href: `/dashboard/admin/customer-management`,
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
          },
          {
            id: 'admin-careers',
            label: 'الوظائف',
            icon: Briefcase,
            href: `/dashboard/admin/careers`,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50'
          },
          {
            id: 'admin-support',
            label: 'الدعم الفني',
            icon: Headphones,
            href: `/dashboard/admin/support`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
          {
            id: 'admin-system',
            label: 'النظام',
            icon: Settings,
            href: `/dashboard/admin/system`,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'admin-marketing',
        title: 'التسويق والإعلانات',
        icon: TrendingUp,
        items: [
          {
            id: 'admin-ads',
            label: 'إدارة الإعلانات',
            icon: TrendingUp,
            href: `/dashboard/admin/ads`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          },
          {
            id: 'admin-videos',
            label: 'إدارة الفيديوهات',
            icon: Video,
            href: `/dashboard/admin/videos`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'admin-academy',
        title: 'أكاديمية الحلم',
        icon: GraduationCap,
        items: [
          {
            id: 'admin-dream-academy',
            label: 'إدارة الأكاديمية',
            icon: GraduationCap,
            href: `/dashboard/admin/dream-academy`,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
          }
        ]
      });
    }

    // قائمة المسوق - إعادة ترتيب منطقي
    if (accountType === 'marketer') {
      accountSpecificGroups.push({
        id: 'marketer-dashboard',
        title: 'لوحة التسويق',
        icon: TrendingUp,
        items: [
          {
            id: 'marketer-main',
            label: 'لوحة التسويق',
            icon: BarChart3,
            href: `/dashboard/marketer`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'marketer-content',
        title: 'إدارة المحتوى',
        icon: Video,
        items: [
          {
            id: 'marketer-videos',
            label: 'فيديوهات اللاعبين',
            icon: Video,
            href: `/dashboard/marketer/videos`,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
          },
          {
            id: 'marketer-players',
            label: 'إدارة اللاعبين',
            icon: Users,
            href: `/dashboard/marketer/players`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          },
          {
            id: 'marketer-search',
            label: 'البحث عن لاعبين',
            icon: Search,
            href: `/dashboard/marketer/search`,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'marketer-services',
        title: 'الخدمات',
        icon: ShoppingBag,
        items: [
          {
            id: 'marketer-dream-academy',
            label: 'أكاديمية الحلم',
            icon: GraduationCap,
            href: `/dashboard/marketer/dream-academy`,
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
          },
          {
            id: 'marketer-subscription',
            label: 'الاشتراكات',
            icon: CreditCard,
            href: `/dashboard/marketer/subscription`,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'marketer-financial',
        title: 'المالية',
        icon: DollarSign,
        items: [
          {
            id: 'marketer-billing',
            label: 'الفواتير',
            icon: CreditCard,
            href: `/dashboard/marketer/billing`,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
          },
          {
            id: 'marketer-payment',
            label: 'المدفوعات',
            icon: DollarSign,
            href: `/dashboard/marketer/payment`,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
          }
        ]
      });

      accountSpecificGroups.push({
        id: 'marketer-communication',
        title: 'التواصل',
        icon: MessageSquare,
        items: [
          {
            id: 'marketer-messages',
            label: 'الرسائل',
            icon: MessageSquare,
            href: `/dashboard/marketer/messages`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          },
          {
            id: 'marketer-notifications',
            label: 'الإشعارات',
            icon: Bell,
            href: `/dashboard/marketer/notifications`,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
          }
        ]
      });
    }

    // قائمة الوالد - إعادة ترتيب منطقي
    if (accountType === 'parent') {
      accountSpecificGroups.push({
        id: 'parent-dashboard',
        title: 'لوحة الوالد',
        icon: User,
        items: [
          {
            id: 'parent-main',
            label: 'لوحة الوالد',
            icon: BarChart3,
            href: `/dashboard/parent`,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
          }
        ]
      });
    }

    return [baseGroup, subscriptionGroup, academyGroup, sharedGroup, ...accountSpecificGroups];
  };

  const menuGroups = useMemo(() => getMenuGroups(), [accountType]);
  const showText = useMemo(() => shouldShowText(), [isMobile, isTablet, isSidebarCollapsed]);
  const sidebarWidth = useMemo(() => getSidebarWidth(), [isMobile, isTablet, isSidebarCollapsed]);

  const getUserAvatar = () => {
    if (userData?.photoURL) return userData.photoURL;
    if (userData?.avatar) return userData.avatar;
    if (userData?.profileImage) return userData.profileImage;
    return null;
  };

  const getUserDisplayName = () => {
    return userData?.displayName || userData?.name || user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
  };

  const handleNavigation = (href: string, id: string) => {
    setActiveItem(id);
    router.push(href);
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      await logout();
      router.push('/');
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  // تحديد العنصر النشط
  useEffect(() => {
    for (const group of menuGroups) {
      const currentItem = group.items.find(item => item.href === pathname);
      if (currentItem) {
        setActiveItem(currentItem.id);
        setExpandedGroups(prev => new Set([...prev, group.id]));
        break;
      }
    }
  }, [pathname]);

  // لا تعرض السايدبار حتى يتم تحميل المكون على العميل
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={isMobile ? { x: '100%' } : { width: isSidebarCollapsed ? 64 : 256 }}
        animate={isMobile ? { x: isSidebarOpen ? 0 : '100%' } : { width: isSidebarCollapsed ? (isTablet ? 56 : 64) : (isTablet ? 224 : 256) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 right-0 h-full bg-gradient-to-b ${accountInfo.color} z-50 shadow-xl backdrop-blur-xl border-l border-white/20 ${
          isMobile ? 'w-72' : sidebarWidth
        }`}
        dir="rtl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${accountInfo.bgColor}`}>
                <IconComponent className={`w-5 h-5 ${accountInfo.textColor}`} />
              </div>
              <AnimatePresence>
                {showText && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                  >
                    <h2 className="text-white font-bold text-base">{accountInfo.title}</h2>
                    <p className="text-white/70 text-xs">{accountInfo.subtitle}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-white hover:bg-white/20"
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              )}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebar}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-3 border-b border-white/20">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 ring-2 ring-white/30">
                <AvatarImage src={getUserAvatar() || '/default-avatar.png'} alt={getUserDisplayName()} />
                <AvatarFallback className={`${accountInfo.bgColor} ${accountInfo.textColor} font-bold text-sm`}>
                  {getUserDisplayName().slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <AnimatePresence>
                {showText && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-white font-semibold truncate text-sm">{getUserDisplayName()}</h3>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className={`${accountInfo.bgColor} ${accountInfo.textColor} border-0 text-xs px-1.5 py-0.5`}>
                        {accountInfo.emoji} {accountInfo.subtitle}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3">
            <div className="px-3 space-y-1">
              {menuGroups.map((group, groupIndex) => {
                const isGroupExpanded = expandedGroups.has(group.id);
                const GroupIcon = group.icon;
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.05 }}
                    className="space-y-1"
                  >
                    {/* Group Header */}
                    <Button
                      variant="ghost"
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full justify-between h-8 px-2 text-white hover:bg-white/20 ${
                        group.id === 'main' ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GroupIcon className="w-3.5 h-3.5" />
                        <AnimatePresence>
                          {showText && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="text-xs"
                            >
                              {group.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <AnimatePresence>
                        {showText && (
                          <motion.div
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={{ opacity: 1, rotate: isGroupExpanded ? 180 : 0 }}
                            exit={{ opacity: 0, rotate: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>

                    {/* Group Items */}
                    <AnimatePresence>
                      {isGroupExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pr-3">
                            {group.items.map((item, itemIndex) => {
                              const isActive = activeItem === item.id;
                              const IconComponent = item.icon;
                              
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: itemIndex * 0.05 }}
                                >
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleNavigation(item.href, item.id)}
                                    className={`w-full justify-start gap-2 h-8 px-2 transition-all duration-200 ${
                                      isActive
                                        ? 'bg-white text-gray-900 shadow-lg'
                                        : 'text-white hover:bg-white/20'
                                    }`}
                                  >
                                    <div className={`p-1 rounded-md transition-colors ${
                                      isActive ? item.bgColor : 'bg-white/10'
                                    }`}>
                                      <IconComponent className={`w-3 h-3 ${
                                        isActive ? item.color : 'text-white'
                                      }`} />
                                    </div>
                                    
                                    <AnimatePresence>
                                      {showText && (
                                        <motion.span
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -10 }}
                                          className="text-xs font-medium"
                                        >
                                          {item.label}
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                    
                                    {isActive && (
                                      <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 w-1 h-5 bg-white rounded-r-full"
                                      />
                                    )}
                                  </Button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-white/20">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 h-10 px-3 text-white hover:bg-red-600/20 hover:text-red-200"
            >
              <div className="p-1.5 rounded-md bg-red-600/20">
                <LogOut className="w-3.5 h-3.5 text-red-200" />
              </div>
              
              <AnimatePresence>
                {showText && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm"
                  >
                    تسجيل الخروج
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ===== مكون الهيدر المحسن =====
const ResponsiveHeader: React.FC = () => {
  const { user, userData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar, isMobile, isTablet, isDesktop, isSidebarCollapsed, isClient } = useLayout();
  
  // حالة للرسائل والإشعارات الحقيقية
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [isMessagesActive, setIsMessagesActive] = useState(false);
  const [isNotificationsActive, setIsNotificationsActive] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const getUserDisplayName = () => {
    return userData?.displayName || userData?.name || user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
  };

  // تحديد margin للهيدر ليتناسق مع السايدبار - أحجام مصغرة
  const getHeaderMargin = () => {
    if (!isClient) return ''; // لا نطبق margin في الـ server
    if (isMobile) return '';
    if (isSidebarCollapsed) {
      if (isTablet) return 'mr-14'; // 56px - يتطابق مع motion.div
      return 'mr-16'; // 64px - يتطابق مع motion.div
    }
    if (isTablet) return 'mr-56'; // 224px - يتطابق مع motion.div
    return 'mr-64'; // 256px - يتطابق مع motion.div
  };

  // الحصول على نوع الحساب من المسار
  const getAccountTypeFromPath = () => {
    const pathSegments = pathname.split('/');
    if (pathSegments.length >= 3 && pathSegments[1] === 'dashboard') {
      return pathSegments[2];
    }
    return 'player';
  };

  const accountType = getAccountTypeFromPath();

  // دالة لتنسيق الوقت
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    
    return date.toLocaleDateString('ar-EG');
  };

  // التعامل مع قائمة الرسائل المنسدلة
  const toggleMessagesDropdown = () => {
    setShowMessagesDropdown(!showMessagesDropdown);
    setShowNotificationsDropdown(false); // إغلاق قائمة الإشعارات
  };

  // التعامل مع قائمة الإشعارات المنسدلة
  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
    setShowMessagesDropdown(false); // إغلاق قائمة الرسائل
  };

  // التنقل إلى صفحة الرسائل
  const navigateToMessages = () => {
    setIsMessagesActive(true);
    setShowMessagesDropdown(false);
    setNewMessagesCount(0);
    router.push('/dashboard/messages');
  };

  // التنقل إلى صفحة الإشعارات
  const navigateToNotifications = () => {
    setIsNotificationsActive(true);
    setShowNotificationsDropdown(false);
    setNewNotificationsCount(0);
    router.push(`/dashboard/${accountType}/notifications`);
  };

  // جلب الرسائل الأخيرة من Firebase
  const fetchRecentMessages = async () => {
    if (!user?.uid) return;
    
    setMessagesLoading(true);
    try {
      const messagesQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc'),
        limit(5)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          const otherParticipantId = data.participants.find((id: string) => id !== user.uid);
          return {
            id: doc.id,
            sender: data.participantNames?.[otherParticipantId] || 'مستخدم',
            message: data.lastMessage || 'لا توجد رسائل',
            time: data.lastMessageTime?.toDate ? data.lastMessageTime.toDate() : new Date(),
            unread: data.unreadCount?.[user.uid] > 0,
            conversationId: doc.id
          };
        });
        
        setRecentMessages(messages);
        const unreadCount = messages.filter(msg => msg.unread).length;
        setNewMessagesCount(unreadCount);
      });

      return unsubscribe;
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  // جلب الإشعارات الأخيرة من Firebase
  const fetchRecentNotifications = async () => {
    if (!user?.uid) return;
    
    setNotificationsLoading(true);
    try {
      // محاولة جلب من مجموعة interaction_notifications أولاً
      const interactionNotificationsQuery = query(
        collection(db, 'interaction_notifications'),
        where('userId', '==', user.uid),
        limit(5)
      );

      const unsubscribe = onSnapshot(interactionNotificationsQuery, (snapshot) => {
        const notifications = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'إشعار جديد',
            message: data.message || 'لا توجد تفاصيل',
            time: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            type: data.type || 'general',
            read: data.isRead || false,
            notificationId: doc.id
          };
        });
        
        // ترتيب البيانات يدوياً حسب التاريخ
        const sortedNotifications = notifications.sort((a, b) => {
          return b.time.getTime() - a.time.getTime();
        });
        
        setRecentNotifications(sortedNotifications);
        const unreadCount = sortedNotifications.filter(notif => !notif.read).length;
        setNewNotificationsCount(unreadCount);
      }, (error) => {
        console.error('خطأ في جلب interaction_notifications:', error);
        // إذا فشل، جرب مجموعة notifications العادية
        fetchRegularNotifications();
      });

      return unsubscribe;
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      // إذا فشل، جرب مجموعة notifications العادية
      fetchRegularNotifications();
    } finally {
      setNotificationsLoading(false);
    }
  };

  // جلب الإشعارات العادية كبديل
  const fetchRegularNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'إشعار جديد',
            message: data.message || 'لا توجد تفاصيل',
            time: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            type: data.type || 'general',
            read: data.isRead || false,
            notificationId: doc.id
          };
        });
        
        // ترتيب البيانات يدوياً حسب التاريخ
        const sortedNotifications = notifications.sort((a, b) => {
          return b.time.getTime() - a.time.getTime();
        });
        
        setRecentNotifications(sortedNotifications);
        const unreadCount = sortedNotifications.filter(notif => !notif.read).length;
        setNewNotificationsCount(unreadCount);
      });

      return unsubscribe;
    } catch (error) {
      console.error('خطأ في جلب notifications العادية:', error);
    }
  };

  // التعامل مع الرسالة
  const handleMessageClick = async (message: any) => {
    try {
      // تحديد الرسالة كمقروءة
      if (message.unread && message.conversationId) {
        const conversationRef = doc(db, 'conversations', message.conversationId);
        await updateDoc(conversationRef, {
          [`unreadCount.${user?.uid}`]: 0
        });
      }
      
      setShowMessagesDropdown(false);
      router.push('/dashboard/messages');
    } catch (error) {
      console.error('خطأ في تحديث حالة الرسالة:', error);
      router.push('/dashboard/messages');
    }
  };

  // التعامل مع الإشعار
  const handleNotificationClick = async (notification: any) => {
    try {
      // تحديد الإشعار كمقروء
      if (!notification.read && notification.notificationId) {
        // محاولة تحديث في interaction_notifications أولاً
        try {
          const interactionNotificationRef = doc(db, 'interaction_notifications', notification.notificationId);
          await updateDoc(interactionNotificationRef, {
            isRead: true
          });
        } catch (error) {
          // إذا فشل، جرب notifications العادية
          const notificationRef = doc(db, 'notifications', notification.notificationId);
          await updateDoc(notificationRef, {
            isRead: true
          });
        }
      }
      
      setShowNotificationsDropdown(false);
      router.push('/dashboard/notifications');
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
      router.push('/dashboard/notifications');
    }
  };

  // تحديد إذا كانت الصفحة الحالية هي صفحة الرسائل أو الإشعارات
  useEffect(() => {
    setIsMessagesActive(pathname.includes('/messages'));
    setIsNotificationsActive(pathname.includes('/notifications'));
  }, [pathname]);

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    if (user?.uid) {
      let unsubscribeMessages: (() => void) | undefined;
      let unsubscribeNotifications: (() => void) | undefined;

      // جلب الرسائل
      fetchRecentMessages().then(unsubscribe => {
        unsubscribeMessages = unsubscribe;
      }).catch(error => {
        console.error('خطأ في جلب الرسائل:', error);
      });

      // جلب الإشعارات
      fetchRecentNotifications().then(unsubscribe => {
        unsubscribeNotifications = unsubscribe;
      }).catch(error => {
        console.error('خطأ في جلب الإشعارات:', error);
      });

      return () => {
        if (typeof unsubscribeMessages === 'function') {
          unsubscribeMessages();
        }
        if (typeof unsubscribeNotifications === 'function') {
          unsubscribeNotifications();
        }
      };
    }
  }, [user?.uid]);

  // إغلاق القوائم المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.messages-dropdown') && !target.closest('.notifications-dropdown')) {
        setShowMessagesDropdown(false);
        setShowNotificationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 transition-all duration-300 ease-in-out ${getHeaderMargin()}`}>
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 relative">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-gray-100"
            title={isMobile ? "إظهار القائمة الجانبية" : (isSidebarCollapsed ? "إظهار القائمة الجانبية" : "إخفاء القائمة الجانبية")}
          >
            {isMobile ? <Menu className="w-5 h-5" /> : (isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />)}
          </Button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">لوحة التحكم</h1>
            <p className="text-sm text-gray-600">
              مرحباً بك في {accountType === 'admin' ? 'منصة الإدارة' : 
                           accountType === 'academy' ? 'منصة الأكاديمية' :
                           accountType === 'club' ? 'منصة النادي' :
                           accountType === 'trainer' ? 'منصة المدرب' :
                           accountType === 'agent' ? 'منصة الوكيل' :
                           accountType === 'marketer' ? 'منصة المسوق' :
                           'منصة اللاعب'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 overflow-visible">
          {/* أيقونة الرسائل مع القائمة المنسدلة */}
          <div className="relative messages-dropdown inline-block">
          <Button
            variant="ghost"
            size="icon"
              onClick={toggleMessagesDropdown}
              className={`relative transition-all duration-200 group ${
                isMessagesActive 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={`الرسائل${newMessagesCount > 0 ? ` (${newMessagesCount} جديدة)` : ''}`}
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {/* مؤشر الرسائل الجديدة */}
              {newMessagesCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full animate-pulse flex items-center justify-center shadow-lg">
                  <span className="text-[10px] text-white font-bold">
                    {newMessagesCount > 9 ? '9+' : newMessagesCount}
                  </span>
                </div>
              )}
              {/* مؤشر الصفحة النشطة */}
              {isMessagesActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full shadow-sm"></div>
              )}
          </Button>

            {/* قائمة الرسائل المنسدلة */}
            {showMessagesDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-50 min-w-max transform origin-top-right">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">الرسائل الأخيرة</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateToMessages}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      عرض الكل
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto max-w-full">
                  {messagesLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm">جاري تحميل الرسائل...</p>
                    </div>
                  ) : recentMessages.length > 0 ? (
                    recentMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        className={`p-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                          message.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {message.sender}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {message.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(message.time)}
                            </p>
                          </div>
                          {message.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">لا توجد رسائل جديدة</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* أيقونة الإشعارات مع القائمة المنسدلة */}
          <div className="relative notifications-dropdown inline-block">
          <Button
            variant="ghost"
            size="icon"
              onClick={toggleNotificationsDropdown}
              className={`relative transition-all duration-200 group ${
                isNotificationsActive 
                  ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              title={`الإشعارات${newNotificationsCount > 0 ? ` (${newNotificationsCount} جديدة)` : ''}`}
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {/* مؤشر الإشعارات الجديدة */}
              {newNotificationsCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-orange-500 rounded-full animate-pulse flex items-center justify-center shadow-lg">
                  <span className="text-[10px] text-white font-bold">
                    {newNotificationsCount > 9 ? '9+' : newNotificationsCount}
                  </span>
                </div>
              )}
              {/* مؤشر الصفحة النشطة */}
              {isNotificationsActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-600 rounded-full shadow-sm"></div>
              )}
          </Button>

            {/* قائمة الإشعارات المنسدلة */}
            {showNotificationsDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-50 min-w-max transform origin-top-right">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">الإشعارات الأخيرة</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateToNotifications}
                      className="text-orange-600 hover:text-orange-700 text-sm"
                    >
                      عرض الكل
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto max-w-full">
                  {notificationsLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                      <p className="text-sm">جاري تحميل الإشعارات...</p>
                    </div>
                  ) : recentNotifications.length > 0 ? (
                    recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                          !notification.read ? 'bg-orange-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'message' ? 'bg-blue-500' :
                            notification.type === 'payment' ? 'bg-green-500' :
                            notification.type === 'system' ? 'bg-gray-500' :
                            notification.type === 'match' ? 'bg-purple-500' :
                            'bg-orange-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 truncate mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTime(notification.time)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">لا توجد إشعارات جديدة</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* فاصل */}
          <div className="w-px h-6 bg-gray-300"></div>

          {/* صورة المستخدم */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 cursor-pointer hover:scale-105 transition-transform duration-200">
            <AvatarImage src={userData?.photoURL || '/default-avatar.png'} alt={getUserDisplayName()} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
              {getUserDisplayName().slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
            {!isMobile && (
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-500 capitalize">{accountType}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// ===== مكون الفوتر المحسن =====
const ResponsiveFooter: React.FC = () => {
  const { isMobile, isTablet, isDesktop, isSidebarCollapsed, isClient } = useLayout();

  // تحديد margin للفوتر ليتناسق مع السايدبار - أحجام مصغرة
  const getFooterMargin = () => {
    if (!isClient) return ''; // لا نطبق margin في الـ server
    if (isMobile) return '';
    if (isSidebarCollapsed) {
      if (isTablet) return 'mr-14'; // 56px - يتطابق مع motion.div
      return 'mr-16'; // 64px - يتطابق مع motion.div
    }
    if (isTablet) return 'mr-56'; // 224px - يتطابق مع motion.div
    return 'mr-64'; // 256px - يتطابق مع motion.div
  };

  return (
    <footer className={`bg-white border-t border-gray-200 py-4 px-4 lg:px-6 transition-all duration-300 ease-in-out ${getFooterMargin()}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          © 2024 منصة الحلم. جميع الحقوق محفوظة.
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>الإصدار 1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

// ===== المكون الرئيسي للتخطيط =====
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  accountType?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  accountType = 'player',
  showSidebar = true,
  showHeader = true,
  showFooter = true
}) => {
  const { isSidebarOpen, isSidebarCollapsed, isMobile, isTablet, isDesktop, isClient } = useLayout();

  // تحديد margin للمحتوى الرئيسي - أحجام مصغرة
  const getMainContentMargin = () => {
    if (!isClient) return '';
    if (!showSidebar) return '';
    if (isMobile) return '';
    if (isSidebarCollapsed) {
      if (isTablet) return 'mr-14'; // 56px - يتطابق مع motion.div
      return 'mr-16'; // 64px - يتطابق مع motion.div
    }
    if (isTablet) return 'mr-56'; // 224px - يتطابق مع motion.div
    return 'mr-64'; // 256px - يتطابق مع motion.div
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {showHeader && <ResponsiveHeader />}
      
      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        {showSidebar && <ResponsiveSidebar accountType={accountType} />}
        
        {/* Content */}
        <main 
          className={`flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out ${getMainContentMargin()}`}
          style={{ direction: 'rtl' }}
        >
          <div className="p-4 lg:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* Footer */}
      {showFooter && <ResponsiveFooter />}
    </div>
  );
};

// ===== المكون الرئيسي المصدر =====
interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode;
  accountType?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const ResponsiveLayoutWrapper: React.FC<ResponsiveLayoutWrapperProps> = (props) => {
  return (
    <LayoutProvider>
      <ResponsiveLayout {...props} />
    </LayoutProvider>
  );
};

export default ResponsiveLayoutWrapper;
