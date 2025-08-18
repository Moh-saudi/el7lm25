'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  ChevronLeft,
  Plus,
  Grid,
  Activity,
  Trophy,
  Target
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';

// HeroUI Components
import { Button, Card, CardBody, Input, Badge, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';

// Shadcn/ui Components
import { Button as ShadcnButton } from '@/components/ui/button';
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ===== CONTEXT للتحكم في التخطيط =====
interface LayoutContextType {
  isSidebarOpen: boolean;
  isHeaderExpanded: boolean;
  isSearchOpen: boolean;
  toggleSidebar: () => void;
  toggleHeader: () => void;
  toggleSearch: () => void;
  closeAll: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within EnhancedMobileLayoutProvider');
  }
  return context;
};

// ===== PROVIDER للتحكم في الحالة =====
interface EnhancedMobileLayoutProviderProps {
  children: React.ReactNode;
}

export const EnhancedMobileLayoutProvider: React.FC<EnhancedMobileLayoutProviderProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleHeader = () => setIsHeaderExpanded(!isHeaderExpanded);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const closeAll = () => {
    setIsSidebarOpen(false);
    setIsHeaderExpanded(false);
    setIsSearchOpen(false);
  };

  return (
    <LayoutContext.Provider value={{
      isSidebarOpen,
      isHeaderExpanded,
      isSearchOpen,
      toggleSidebar,
      toggleHeader,
      toggleSearch,
      closeAll
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// ===== المكون الرئيسي للتخطيط المحسن =====
interface EnhancedMobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onBackClick?: () => void;
  accountType?: string;
}

export default function EnhancedMobileLayout({
  children,
  title = "لوحة التحكم",
  showBackButton = false,
  showSearch = true,
  showAddButton = false,
  onAddClick,
  onBackClick,
  accountType = 'player'
}: EnhancedMobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { 
    isSidebarOpen, 
    isHeaderExpanded, 
    isSearchOpen,
    toggleSidebar, 
    toggleHeader, 
    toggleSearch, 
    closeAll 
  } = useLayout();

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // كشف نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // إغلاق القوائم عند تغيير الصفحة
  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'المستخدم';
  };

  // ===== القائمة الجانبية المحسنة =====
  const EnhancedSidebar = () => (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAll}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 z-50 shadow-2xl sidebar"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white/10 backdrop-blur-sm border-b border-white/20">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={user?.photoURL || undefined}
                  name={getUserDisplayName()}
                  size="lg"
                  className="bg-white/20"
                />
                <div>
                  <h3 className="text-white font-semibold">{getUserDisplayName()}</h3>
                  <Badge color="primary" variant="flat" size="sm">
                    {accountType}
                  </Badge>
                </div>
              </div>
              <Button
                isIconOnly
                variant="light"
                color="default"
                onClick={closeAll}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <SidebarItem
                icon={Home}
                title="الرئيسية"
                href="/dashboard"
                active={pathname === '/dashboard'}
              />
              <SidebarItem
                icon={User}
                title="الملف الشخصي"
                href="/dashboard/profile"
                active={pathname === '/dashboard/profile'}
              />
              <SidebarItem
                icon={Bell}
                title="الإشعارات"
                href="/dashboard/notifications"
                active={pathname === '/dashboard/notifications'}
              />
              <SidebarItem
                icon={Settings}
                title="الإعدادات"
                href="/dashboard/settings"
                active={pathname === '/dashboard/settings'}
              />
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20">
              <Button
                variant="light"
                color="danger"
                startContent={<LogOut className="w-5 h-5" />}
                onClick={handleSignOut}
                className="w-full text-white hover:bg-red-500/20"
              >
                تسجيل الخروج
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // ===== الهيدر المحسن =====
  const EnhancedHeader = () => (
    <motion.header
      layout
      className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-30 header"
    >
      <div className="flex items-center justify-between p-4">
        {/* Left */}
        <div className="flex items-center space-x-3">
          <Button
            isIconOnly
            variant="light"
            color="default"
            onClick={toggleSidebar}
            className="touch-target"
            title="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {showBackButton && (
            <Button
              isIconOnly
              variant="light"
              color="default"
              onClick={onBackClick || (() => router.back())}
              className="touch-target"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-1">
          {showSearch && (
            <Button
              isIconOnly
              variant="light"
              color="default"
              onClick={toggleSearch}
              className="touch-target"
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </Button>
          )}
          
          {showAddButton && (
            <Button
              isIconOnly
              color="primary"
              onClick={onAddClick}
              className="touch-target"
              title="إضافة جديد"
            >
              <Plus className="w-5 h-5" />
            </Button>
          )}
          
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                color="default"
                className="touch-target"
                title="الملف الشخصي"
              >
                <Avatar
                  src={user?.photoURL || undefined}
                  name={getUserDisplayName()}
                  size="sm"
                />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem key="profile">الملف الشخصي</DropdownItem>
              <DropdownItem key="settings">الإعدادات</DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={handleSignOut}>
                تسجيل الخروج
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 bg-white"
          >
            <div className="p-4">
              <Input
                placeholder="البحث..."
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="lg"
                autoFocus
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );

  // ===== الفوتر المحسن =====
  const EnhancedFooter = () => (
    <motion.footer
      layout
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30"
    >
      <div className="flex items-center justify-around p-2">
        <FooterItem
          icon={Home}
          title="الرئيسية"
          href="/dashboard"
          active={pathname === '/dashboard'}
        />
        <FooterItem
          icon={Grid}
          title="القائمة"
          href="/dashboard/list"
          active={pathname === '/dashboard/list'}
        />
        <FooterItem
          icon={Bell}
          title="الإشعارات"
          href="/dashboard/notifications"
          active={pathname === '/dashboard/notifications'}
        />
        <FooterItem
          icon={User}
          title="الملف"
          href="/dashboard/profile"
          active={pathname === '/dashboard/profile'}
        />
      </div>
      
      {/* إضافة مساحة للوجو في الأسفل */}
      <div className="px-4 py-2 border-t border-gray-100 logo-section">
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start space-x-2">
            <span>الحلم</span>
            <span>el7lm</span>
            <span>جميع الحقوق محفوظة</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Avatar
              src="/images/logo.png"
              name="M"
              size="sm"
              className="bg-blue-600"
            />
            <span className="font-medium">Mesk El7lm</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );

  return (
    <div className="mobile-layout min-h-screen bg-gray-50">
      <EnhancedHeader />
      <EnhancedSidebar />
      
      {/* Main Content */}
      <main className="pt-20 pb-32 px-4">
        {children}
      </main>
      
      <EnhancedFooter />
    </div>
  );
}

// ===== المكونات المساعدة المحسنة =====
interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, title, href, active }) => {
  const router = useRouter();
  const { closeAll } = useLayout();

  const handleClick = () => {
    router.push(href);
    closeAll();
  };

  return (
    <Button
      variant={active ? "solid" : "light"}
      color={active ? "primary" : "default"}
      startContent={<Icon className="w-5 h-5" />}
      onClick={handleClick}
      className={`w-full justify-start ${
        active 
          ? 'bg-white/20 text-white' 
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {title}
    </Button>
  );
};

interface FooterItemProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  href: string;
  active?: boolean;
}

const FooterItem: React.FC<FooterItemProps> = ({ icon: Icon, title, href, active }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <Button
      variant="light"
      color={active ? "primary" : "default"}
      startContent={<Icon className="w-5 h-5" />}
      onClick={handleClick}
      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
        active 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      <span className="text-xs">{title}</span>
    </Button>
  );
};
