'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  User, 
  MessageSquare, 
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
  X
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useMobileSidebar } from './MobileSidebarManager';

interface EnhancedSidebarProps {
  accountType: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userData?: any;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  accountType,
  collapsed,
  setCollapsed,
  userData
}) => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const { logout } = useAuth();
  const { isMobileSidebarOpen, closeMobileSidebar } = useMobileSidebar();

  // كشف حجم الشاشة تلقائياً
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
      if (confirmed) {
        await logout();
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // تحديد عناصر القائمة حسب نوع الحساب - باستخدام الصفحات الحقيقية فقط
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'الرئيسية', icon: Home, href: `/dashboard/${accountType}` },
      { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/${accountType}/profile` },
      { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/${accountType}/messages` },
    ];

    switch (accountType) {
      case 'player':
        return [
          ...baseItems,
          { id: 'reports', label: 'التقارير', icon: FileText, href: `/dashboard/player/reports` },
          { id: 'videos', label: 'الفيديوهات', icon: Video, href: `/dashboard/player/videos` },
          { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: ChevronLeft, href: `/dashboard/player/player-videos` },
          { id: 'search', label: 'البحث', icon: Search, href: `/dashboard/player/search` },
          { id: 'stats', label: 'الإحصائيات', icon: ChevronLeft, href: `/dashboard/player/stats` },
          { id: 'bulk-payment', label: 'الدفع الجماعي', icon: ChevronLeft, href: `/dashboard/player/bulk-payment` },
          { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/player/referrals` },
          { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy` },
        ];
      
      case 'club':
        return [
          ...baseItems,
          { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/club/players` },
          { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/club/search-players` },
          { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/club/player-videos` },
          { id: 'contracts', label: 'العقود', icon: FileText, href: `/dashboard/club/contracts` },
          { id: 'marketing', label: 'التسويق', icon: ChevronLeft, href: `/dashboard/club/marketing` },
          { id: 'ai-analysis', label: 'تحليل الذكاء الاصطناعي', icon: ChevronLeft, href: `/dashboard/club/ai-analysis` },
          { id: 'market-values', label: 'قيم السوق', icon: ChevronLeft, href: `/dashboard/club/market-values` },
          { id: 'negotiations', label: 'المفاوضات', icon: ChevronLeft, href: `/dashboard/club/negotiations` },
          { id: 'player-evaluation', label: 'تقييم اللاعبين', icon: ChevronLeft, href: `/dashboard/club/player-evaluation` },
          { id: 'notifications', label: 'الإشعارات', icon: ChevronLeft, href: `/dashboard/club/notifications` },
          { id: 'bulk-payment', label: 'الدفع الجماعي', icon: ChevronLeft, href: `/dashboard/club/bulk-payment` },
          { id: 'billing', label: 'الفواتير', icon: ChevronLeft, href: `/dashboard/club/billing` },
          { id: 'change-password', label: 'تغيير كلمة المرور', icon: ChevronLeft, href: `/dashboard/club/change-password` },
          { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/club/referrals` },
          { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy` },
        ];
      
      case 'academy':
        return [
          ...baseItems,
          { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/academy/players` },
          { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/academy/search-players` },
          { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/academy/player-videos` },
          { id: 'bulk-payment', label: 'الدفع الجماعي', icon: ChevronLeft, href: `/dashboard/academy/bulk-payment` },
          { id: 'billing', label: 'الفواتير', icon: ChevronLeft, href: `/dashboard/academy/billing` },
          { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/academy/referrals` },
          { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy` },
        ];
      
      case 'trainer':
        return [
          ...baseItems,
          { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/trainer/players` },
          { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/trainer/search-players` },
          { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/trainer/player-videos` },
          { id: 'bulk-payment', label: 'الدفع الجماعي', icon: ChevronLeft, href: `/dashboard/trainer/bulk-payment` },
          { id: 'billing', label: 'الفواتير', icon: ChevronLeft, href: `/dashboard/trainer/billing` },
          { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/trainer/referrals` },
          { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy` },
        ];
      
      case 'agent':
        return [
          ...baseItems,
          { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/agent/players` },
          { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/agent/search-players` },
          { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/agent/player-videos` },
          { id: 'bulk-payment', label: 'الدفع الجماعي', icon: ChevronLeft, href: `/dashboard/agent/bulk-payment` },
          { id: 'billing', label: 'الفواتير', icon: ChevronLeft, href: `/dashboard/agent/billing` },
          { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/agent/referrals` },
          { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy` },
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { id: 'users', label: 'المستخدمين', icon: Users, href: `/dashboard/admin/users` },
          { id: 'employees', label: 'الموظفين', icon: User, href: `/dashboard/admin/employees` },
          { id: 'notifications', label: 'إدارة الإشعارات', icon: Bell, href: `/dashboard/admin/notifications` },
          { id: 'careers', label: 'طلبات التوظيف', icon: FileText, href: `/dashboard/admin/careers` },
          { id: 'reports', label: 'التقارير', icon: ChevronLeft, href: `/dashboard/admin/reports` },
          { id: 'payments', label: 'المدفوعات', icon: ChevronLeft, href: `/dashboard/admin/payments` },
          { id: 'subscriptions', label: 'الاشتراكات', icon: ChevronLeft, href: `/dashboard/admin/subscriptions` },
          { id: 'support', label: 'الدعم الفني', icon: Shield, href: `/dashboard/admin/support` },
          { id: 'system', label: 'النظام', icon: ChevronLeft, href: `/dashboard/admin/system` },
          { id: 'email-migration', label: 'ترحيل البريد الإلكتروني', icon: ChevronLeft, href: `/dashboard/admin/email-migration` },
          { id: 'dream-academy-videos', label: 'إدارة أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/admin/dream-academy/videos` },
          { id: 'dream-academy-categories', label: 'فئات الأكاديمية (ديناميكي)', icon: GraduationCap, href: `/dashboard/admin/dream-academy/categories` },
          { id: 'dream-academy-settings', label: 'إعدادات أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/admin/dream-academy/settings` },
          { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy` },
          { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/admin/referrals` },
        ];
      
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  // الحصول على صورة المستخدم
  const getUserAvatar = () => {
    if (userData?.photoURL) {
      return userData.photoURL;
    }
    if (userData?.avatar) {
      return userData.avatar;
    }
    if (userData?.profileImage) {
      return userData.profileImage;
    }
    return null;
  };

  const userAvatar = getUserAvatar();

  // إظهار القائمة الجانبية فقط إذا كانت مفتوحة أو في الديسكتوب/التابلت
  if (screenSize === 'mobile' && !isMobileSidebarOpen) {
    return null;
  }

  // في الموبايل، نريد أن تظهر القائمة الجانبية خارج الشاشة افتراضياً
  const mobileTransform = screenSize === 'mobile' && !isMobileSidebarOpen ? 'translateX(100%)' : 'translateX(0)';

  return (
    <>
      {/* Overlay للموبايل */}
      {screenSize === 'mobile' && isMobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}
      
      <motion.div
        initial={{ x: screenSize === 'mobile' ? '100%' : 0 }}
        animate={{ 
          x: screenSize === 'mobile' ? (isMobileSidebarOpen ? 0 : '100%') : 0 
        }}
        exit={{ x: screenSize === 'mobile' ? '100%' : 0 }}
        className={`fixed top-16 bottom-20 right-0 bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#3b82f6] z-40 shadow-2xl backdrop-blur-sm border-l border-white/10 transition-all duration-300 ease-in-out ${
          // تصميم متجاوب للقائمة الجانبية
          screenSize === 'mobile' ? 'w-80' : // في الموبايل عرض كامل
          screenSize === 'tablet' ? (collapsed ? 'w-16' : 'w-64') : // في التابلت
          collapsed ? 'w-20' : 'w-64' // في الديسكتوب
        }`}
        data-sidebar
        style={{
          transform: mobileTransform
        }}
      >
      {/* أزرار التحكم - تصميم عصري */}
      <div className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm">
        {/* زر إغلاق للموبايل */}
        {screenSize === 'mobile' && (
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            whileTap={{ scale: 0.95 }}
            onClick={closeMobileSidebar}
            className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
          >
            <X size={18} />
          </motion.button>
        )}
        
        {/* زر التطويق/التوسع */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
          data-sidebar-toggle
        >
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="chevron-right"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={18} />
              </motion.div>
            ) : (
              <motion.div
                key="chevron-left"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronLeft size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* قائمة العناصر مع التمرير - تصميم عصري */}
      <div className="flex flex-col h-full">
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.a
                  href={item.href}
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-4 py-3 rounded-xl text-white transition-all duration-200 backdrop-blur-sm border border-white/10 ${
                    activeItem === item.id 
                      ? 'bg-white/20 shadow-lg border-white/30' 
                      : 'hover:bg-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setActiveItem(item.id)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 mr-3 rtl:ml-3">
                    <item.icon size={18} className="flex-shrink-0" />
                  </div>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.a>
              </motion.li>
            ))}
          </ul>
        </nav>

        {/* أزرار تسجيل الخروج والمساعدة - تصميم عصري */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-white/5 backdrop-blur-sm">
          {/* زر المساعدة */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center w-full px-4 py-3 rounded-xl text-white bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 backdrop-blur-sm border border-blue-400/30"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/30 mr-3 rtl:ml-3">
              <Shield size={16} className="flex-shrink-0" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium text-sm"
                >
                  المساعدة
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* زر تسجيل الخروج */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 rounded-xl text-white bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 backdrop-blur-sm border border-red-400/30"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/30 mr-3 rtl:ml-3">
              <LogOut size={16} className="flex-shrink-0" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium text-sm"
                >
                  تسجيل الخروج
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default EnhancedSidebar; 