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
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/lib/context/SidebarContext';

const menuItems = [
  {
    title: 'الرئيسية',
    icon: <Home className="w-5 h-5" />,
    path: '/dashboard/player'
  },
  {
    title: 'الملف الشخصي',
    icon: <User className="w-5 h-5" />,
    path: '/dashboard/player/profile'
  },
  {
    title: 'التقارير',
    icon: <FileText className="w-5 h-5" />,
    path: '/dashboard/player/reports'
  },
  {
    title: 'إدارة الفيديوهات',
    icon: <VideoIcon className="w-5 h-5" />,
    path: '/dashboard/player/videos'
  },
  {
    title: 'فيديوهات اللاعبين',
    icon: <Play className="w-5 h-5" />,
    path: '/dashboard/player/player-videos'
  },
  {
    title: 'البحث عن الفرص والأندية',
    icon: <Search className="w-5 h-5" />,
    path: '/dashboard/player/search'
  },
  {
    title: 'الإحصائيات',
    icon: <BarChart className="w-5 h-5" />,
    path: '/dashboard/player/stats'
  },
  {
    title: 'الرسائل',
    icon: <MessageSquare className="w-5 h-5" />,
    path: '/dashboard/messages'
  },
  {
    title: 'إدارة الاشتراكات',
    icon: <CreditCard className="w-5 h-5" />,
    path: '/dashboard/player/bulk-payment'
  },
  {
    title: 'حالة الاشتراك',
    icon: <Clock className="w-5 h-5" />,
    path: '/dashboard/subscription'
  }
];

// قائمة النادي
const clubMenuItems = [
  {
    title: 'الرئيسية',
    icon: <Home className="w-5 h-5" />, path: '/dashboard/club'
  },
  {
    title: 'الملف الشخصي',
    icon: <User className="w-5 h-5" />, path: '/dashboard/club/profile'
  },
  {
    title: 'البحث عن اللاعبين',
    icon: <Users className="w-5 h-5" />, path: '/dashboard/club/players'
  },
  {
    title: 'فيديوهات اللاعبين',
    icon: <VideoIcon className="w-5 h-5" />, path: '/dashboard/club/player-videos'
  },
  {
    title: 'إدارة العقود',
    icon: <FileText className="w-5 h-5" />, path: '/dashboard/club/contracts'
  },
  {
    title: 'تسويق اللاعبين',
    icon: <Megaphone className="w-5 h-5" />, path: '/dashboard/club/marketing'
  },
  {
    title: 'تحليل الأداء',
    icon: <BarChart3 className="w-5 h-5" />, path: '/dashboard/club/ai-analysis'
  },
  {
    title: 'حركة أسعار اللاعبين',
    icon: <DollarSign className="w-5 h-5" />, path: '/dashboard/club/market-values'
  },
  {
    title: 'خدمات التفاوض',
    icon: <Handshake className="w-5 h-5" />, path: '/dashboard/club/negotiations'
  },
  {
    title: 'تقييم اللاعبين',
    icon: <Star className="w-5 h-5" />, path: '/dashboard/club/player-evaluation'
  },
  {
    title: 'الإشعارات',
    icon: <Bell className="w-5 h-5" />, path: '/dashboard/club/notifications'
  },
  {
    title: 'الرسائل',
    icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/messages'
  },
  {
    title: 'دفع جماعي للاعبين',
    icon: <Users className="w-5 h-5" />, path: '/dashboard/club/bulk-payment'
  },
  {
    title: 'الفواتير',
    icon: <FileText className="w-5 h-5" />, path: '/dashboard/club/billing'
  },
  {
    title: 'تغيير كلمة السر',
    icon: <KeyRound className="w-5 h-5" />, path: '/dashboard/club/change-password'
  },
];

// قائمة الوكيل
const agentMenuItems = [
  {
    title: 'الرئيسية',
    icon: <Home className="w-5 h-5" />, path: '/dashboard/agent'
  },
  {
    title: 'الملف الشخصي',
    icon: <User className="w-5 h-5" />, path: '/dashboard/agent/profile'
  },
  {
    title: 'إدارة اللاعبين',
    icon: <Users className="w-5 h-5" />, path: '/dashboard/agent/players'
  },
  {
    title: 'التفاوضات',
    icon: <Handshake className="w-5 h-5" />, path: '/dashboard/agent/negotiations'
  },
  {
    title: 'التقارير',
    icon: <FileText className="w-5 h-5" />, path: '/dashboard/agent/reports'
  },
  {
    title: 'الرسائل',
    icon: <MessageSquare className="w-5 h-5" />, path: '/dashboard/messages'
  },
  {
    title: 'الإشعارات',
    icon: <Bell className="w-5 h-5" />, path: '/dashboard/agent/notifications'
  },
  {
    title: 'تغيير كلمة السر',
    icon: <KeyRound className="w-5 h-5" />, path: '/dashboard/agent/change-password'
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const { isCollapsed, isMobileOpen, toggleSidebar, closeMobileSidebar } = useSidebar();

  // تحديد نوع القائمة حسب نوع الحساب
  let items = menuItems;
  let sidebarTitle = 'منصة اللاعب';
  let messagesPath = '/dashboard/player/messages';
  if (user?.accountType === 'club') {
    items = clubMenuItems;
    sidebarTitle = 'منصة النادي';
    messagesPath = '/dashboard/club/messages';
  } else if (user?.accountType === 'agent') {
    items = agentMenuItems;
    sidebarTitle = 'منصة الوكيل';
    messagesPath = '/dashboard/agent/messages';
  } else if (user?.accountType === 'academy') {
    sidebarTitle = 'منصة الأكاديمية';
    messagesPath = '/dashboard/academy/messages';
  } else if (user?.accountType === 'trainer') {
    sidebarTitle = 'منصة المدرب';
    messagesPath = '/dashboard/trainer/messages';
  } else if (user?.accountType === 'admin') {
    sidebarTitle = 'منصة الإدارة';
    messagesPath = '/dashboard/admin/messages';
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const handleLinkClick = () => {
    closeMobileSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        animate={{ 
          width: isCollapsed ? '80px' : '256px'
        }}
        transition={{ 
          duration: 0.3, 
          ease: 'easeInOut' 
        }}
        className={`h-full flex flex-col bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] text-white shadow-xl sticky top-16 self-start relative order-first
          ${isMobileOpen ? 'fixed top-16 left-0 z-50' : 'hidden lg:flex'}
          `}
        style={{
          direction: 'ltr', // Force LTR for sidebar to maintain left positioning
        }}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeMobileSidebar}
          className="absolute top-4 left-4 p-2 text-white hover:bg-blue-700 rounded-lg lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg transition-colors duration-200 hidden lg:block"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Logo Section */}
        <div className="p-6 text-center border-b border-blue-700">
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden lg:block"
              >
                <Menu className="w-6 h-6 mx-auto text-white" />
              </motion.div>
            ) : (
              <motion.h1
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold text-white"
                style={{ direction: 'rtl' }} // Keep Arabic text RTL
              >
                {sidebarTitle}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 min-h-0 p-2 pt-0 mt-0 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.path;
            return (
              <div key={item.path} className="relative group">
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 group
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-white hover:bg-blue-700 hover:text-white'
                    }`}
                  style={{ direction: 'rtl' }} // Keep Arabic text RTL
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-200 group-hover:scale-110 ${isCollapsed ? 'mx-auto' : ''}
                      ${isActive ? 'text-white' : 'text-blue-200'}`}>
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {(!isCollapsed || isMobileOpen) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium whitespace-nowrap"
                        >
                          {item.title}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {(!isCollapsed || isMobileOpen) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronLeft className={`w-4 h-4 transition-transform duration-200
                          ${isActive ? 'rotate-90' : 'group-hover:-translate-x-1'}`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
                
                {/* Tooltip for collapsed state on desktop */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 hidden lg:block"
                    style={{ direction: 'rtl' }}
                  >
                    {item.title}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto mb-6 border-t border-blue-300">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`flex items-center w-full gap-2 p-3 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700 ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-center'}`}
              style={{ direction: 'rtl' }} // Keep Arabic text RTL
            >
              <LogOut className="w-5 h-5" />
              <AnimatePresence>
                {(!isCollapsed || isMobileOpen) && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap"
                  >
                    تسجيل الخروج
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            
            {/* Tooltip for logout button in collapsed state */}
            {isCollapsed && !isMobileOpen && (
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 hidden lg:block"
                style={{ direction: 'rtl' }}
              >
                تسجيل الخروج
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
