'use client';

import { auth } from '@/lib/firebase/config';
import {
  BarChart,
  ChevronRight,
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Search,
  User,
  Menu,
  X,
  VideoIcon,
  Users,
  Megaphone,
  BarChart3,
  DollarSign,
  Handshake,
  Star,
  Bell,
  MessageSquare,
  KeyRound,
  Play
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useTranslation } from '@/lib/translations/simple-context';
import { useAuth } from '@/lib/firebase/auth-provider';

const Sidebar = () => {
  const { user, userData } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();
  const { t, direction } = useTranslation();

  // قائمة اللاعب مع الترجمة
  const playerMenuItems = [
    {
      title: t('sidebar.player.home'),
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard/player'
    },
    {
      title: t('sidebar.player.profile'),
      icon: <User className="w-5 h-5" />,
      path: '/dashboard/player/profile'
    },
    {
      title: t('sidebar.player.reports'),
      icon: <FileText className="w-5 h-5" />,
      path: '/dashboard/player/reports'
    },
    {
      title: t('sidebar.player.videos'),
      icon: <VideoIcon className="w-5 h-5" />,
      path: '/dashboard/player/videos'
    },
    {
      title: t('sidebar.player.playerVideos'),
      icon: <Play className="w-5 h-5" />,
      path: '/dashboard/player/player-videos'
    },
    {
      title: t('sidebar.player.search'),
      icon: <Search className="w-5 h-5" />,
      path: '/dashboard/player/search'
    },
    {
      title: t('sidebar.player.stats'),
      icon: <BarChart className="w-5 h-5" />,
      path: '/dashboard/player/stats'
    },
    {
      title: t('sidebar.common.messages'),
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    },
    {
      title: t('sidebar.player.subscriptions'),
      icon: <CreditCard className="w-5 h-5" />,
      path: '/dashboard/player/bulk-payment'
    },
    {
      title: t('sidebar.player.subscriptionStatus'),
      icon: <Clock className="w-5 h-5" />,
      path: '/dashboard/subscription'
    }
  ];

  // قائمة النادي مع الترجمة
  const clubMenuItems = [
      {
        title: t('sidebar.club.home'),
        icon: <Home className="w-5 h-5" />,
        path: '/dashboard/club'
      },
      {
        title: t('sidebar.club.profile'),
        icon: <User className="w-5 h-5" />,
        path: '/dashboard/club/profile'
      },
    {
      title: t('sidebar.club.searchPlayers'),
      icon: <Search className="w-5 h-5" />, 
      path: '/dashboard/club/search'
      },
      {
        title: t('sidebar.club.players'),
        icon: <Users className="w-5 h-5" />,
        path: '/dashboard/club/players'
      },
    {
      title: t('sidebar.club.videos'),
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/club/videos'
      },
      {
        title: t('sidebar.club.playerVideos'),
      icon: <Play className="w-5 h-5" />, 
        path: '/dashboard/club/player-videos'
      },
      {
      title: t('sidebar.club.stats'),
        icon: <BarChart3 className="w-5 h-5" />,
      path: '/dashboard/club/stats'
      },
      {
      title: t('sidebar.club.finances'),
        icon: <DollarSign className="w-5 h-5" />,
      path: '/dashboard/club/finances'
      },
      {
        title: t('sidebar.common.messages'),
        icon: <MessageSquare className="w-5 h-5" />,
        path: '/dashboard/messages'
    }
  ];

  // قائمة الوكيل مع الترجمة
  const agentMenuItems = [
      {
        title: t('sidebar.agent.home'),
        icon: <Home className="w-5 h-5" />,
        path: '/dashboard/agent'
      },
      {
        title: t('sidebar.agent.profile'),
        icon: <User className="w-5 h-5" />,
        path: '/dashboard/agent/profile'
      },
      {
        title: t('sidebar.agent.players'),
        icon: <Users className="w-5 h-5" />,
        path: '/dashboard/agent/players'
      },
    {
      title: t('sidebar.agent.clubs'),
      icon: <Handshake className="w-5 h-5" />, 
      path: '/dashboard/agent/clubs'
      },
      {
        title: t('sidebar.agent.negotiations'),
      icon: <MessageSquare className="w-5 h-5" />, 
        path: '/dashboard/agent/negotiations'
      },
      {
      title: t('sidebar.agent.contracts'),
      icon: <FileText className="w-5 h-5" />, 
      path: '/dashboard/agent/contracts'
    },
    {
      title: t('sidebar.agent.commissions'),
      icon: <DollarSign className="w-5 h-5" />, 
      path: '/dashboard/agent/commissions'
    },
    {
      title: t('sidebar.agent.stats'),
      icon: <BarChart3 className="w-5 h-5" />, 
      path: '/dashboard/agent/stats'
    }
  ];

  // قائمة الأكاديمية مع الترجمة
  const academyMenuItems = [
    {
      title: t('sidebar.academy.home'),
      icon: <Home className="w-5 h-5" />, 
      path: '/dashboard/academy'
    },
    {
      title: t('sidebar.academy.profile'),
      icon: <User className="w-5 h-5" />, 
      path: '/dashboard/academy/profile'
    },
    {
      title: t('sidebar.academy.students'),
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/academy/students'
    },
    {
      title: t('sidebar.academy.courses'),
        icon: <FileText className="w-5 h-5" />,
      path: '/dashboard/academy/courses'
    },
    {
      title: t('sidebar.academy.videos'),
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/academy/videos'
    },
    {
      title: t('sidebar.academy.trainers'),
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/academy/trainers'
    },
    {
      title: t('sidebar.academy.stats'),
      icon: <BarChart3 className="w-5 h-5" />, 
      path: '/dashboard/academy/stats'
    },
    {
      title: t('sidebar.academy.finances'),
      icon: <DollarSign className="w-5 h-5" />, 
      path: '/dashboard/academy/finances'
    }
  ];

  // قائمة المدرب مع الترجمة
  const trainerMenuItems = [
    {
      title: t('sidebar.trainer.home'),
      icon: <Home className="w-5 h-5" />, 
      path: '/dashboard/trainer'
    },
    {
      title: t('sidebar.trainer.profile'),
      icon: <User className="w-5 h-5" />, 
      path: '/dashboard/trainer/profile'
    },
    {
      title: t('sidebar.trainer.sessions'),
      icon: <Clock className="w-5 h-5" />, 
      path: '/dashboard/trainer/sessions'
    },
    {
      title: t('sidebar.trainer.players'),
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/trainer/players'
    },
    {
      title: t('sidebar.trainer.videos'),
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/trainer/videos'
    },
    {
      title: t('sidebar.trainer.programs'),
      icon: <FileText className="w-5 h-5" />, 
      path: '/dashboard/trainer/programs'
    },
    {
      title: t('sidebar.trainer.stats'),
      icon: <BarChart3 className="w-5 h-5" />, 
      path: '/dashboard/trainer/stats'
    }
  ];

  // تحديد القائمة المناسبة حسب نوع الحساب
  const getMenuItems = () => {
    if (!user) return playerMenuItems;
    
    // استخدام userData إذا كان متاحاً
    const accountType = userData?.accountType || 'player';
    
    switch (accountType) {
      case 'club':
        return clubMenuItems;
      case 'agent':
        return agentMenuItems;
      case 'academy':
        return academyMenuItems;
      case 'trainer':
        return trainerMenuItems;
      case 'marketer':
        return playerMenuItems; // استخدام قائمة اللاعب للمسوق مؤقتاً
      default:
        return playerMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          rtl: { x: isOpen ? 0 : '100%' }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 right-0 rtl:left-0 w-64 bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] z-40 shadow-xl`}
        dir={direction}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-400">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">E</span>
              </div>
              <span className="text-white font-bold text-lg">El7hm</span>
            </div>
        <button
          onClick={toggleSidebar}
              className="text-white hover:text-blue-200 transition-colors md:hidden"
            >
              <X className="w-6 h-6" />
        </button>
        </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-4">
              {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-blue-600 hover:bg-opacity-20'
                      }`}
                    >
                      <div className={`transition-colors ${
                        isActive ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'
                      }`}>
                      {item.icon}
                  </div>
                      <span className="font-medium">{item.title}</span>
                      {isActive && (
                      <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 rtl:right-0 w-1 h-8 bg-white rounded-r-full rtl:rounded-l-full"
                        />
                      )}
                </Link>
                  </motion.li>
            );
          })}
            </ul>
        </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-400">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-white hover:bg-red-600 hover:bg-opacity-20 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-red-300 group-hover:text-red-200" />
              <span className="font-medium">{t('sidebar.common.logout')}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
