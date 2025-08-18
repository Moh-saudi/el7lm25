'use client';

import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useTranslation } from '@/lib/translations/simple-context';
import { 
  Menu,
  X,
  User,
  LogOut,
  Globe,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMediaQuery } from 'react-responsive';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

// ===== Context للتحكم في التخطيط العام =====
interface PublicLayoutContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isClient: boolean;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
}

const PublicLayoutContext = createContext<PublicLayoutContextType | undefined>(undefined);

export const usePublicLayout = () => {
  const context = useContext(PublicLayoutContext);
  if (!context) {
    throw new Error('usePublicLayout must be used within a PublicLayoutProvider');
  }
  return context;
};

// ===== Provider للتحكم في التخطيط العام =====
interface PublicLayoutProviderProps {
  children: React.ReactNode;
}

export const PublicLayoutProvider: React.FC<PublicLayoutProviderProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // استخدام react-responsive للكشف عن حجم الشاشة
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const value: PublicLayoutContextType = {
    isMobile,
    isTablet,
    isDesktop,
    isClient,
    isMenuOpen,
    toggleMenu,
    closeMenu,
  };

  return (
    <PublicLayoutContext.Provider value={value}>
      {children}
    </PublicLayoutContext.Provider>
  );
};

// ===== مكون الهيدر العام المتجاوب =====
const PublicResponsiveHeader: React.FC = () => {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const { t, direction } = useTranslation();
  const { isMobile, isTablet, isDesktop, isClient, isMenuOpen, toggleMenu, closeMenu } = usePublicLayout();

  const getUserDisplayName = () => {
    return userData?.displayName || userData?.name || user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      await logout();
      router.push('/');
    }
  };

  const navigationItems = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/careers', label: t('nav.careers') },
    { href: '/contact', label: t('nav.contact') },
    { href: '/support', label: t('nav.support') }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 space-x-reverse"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">El7lm</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu / Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userData?.photoURL || '/default-avatar.png'} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                    {getUserDisplayName().slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/dashboard/player')}
                  className="text-gray-700 hover:text-blue-600"
                >
                  لوحة التحكم
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 space-x-reverse">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                  className="text-gray-700 hover:text-blue-600"
                >
                  تسجيل الدخول
                </Button>
                <Button
                  onClick={() => router.push('/auth/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  التسجيل
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="lg:hidden"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && !isDesktop && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navigationItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    closeMenu();
                  }}
                  className="block w-full text-right text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// ===== مكون الفوتر العام المتجاوب =====
const PublicResponsiveFooter: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isDesktop } = usePublicLayout();

  const footerLinks = {
    company: [
      { label: t('footer.company.about'), href: '/about' },
      { label: t('footer.company.careers'), href: '/careers' },
      { label: t('footer.company.contact'), href: '/contact' },
      { label: t('footer.company.support'), href: '/support' }
    ],
    services: [
      { label: t('footer.services.players'), href: '/services/players' },
      { label: t('footer.services.clubs'), href: '/services/clubs' },
      { label: t('footer.services.academies'), href: '/services/academies' },
      { label: t('footer.services.agents'), href: '/services/agents' }
    ],
    legal: [
      { label: t('footer.legal.privacy'), href: '/privacy' },
      { label: t('footer.legal.terms'), href: '/terms' },
      { label: t('footer.legal.cookies'), href: '/cookies' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">El7lm</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              منصة شاملة لإدارة كرة القدم واللاعبين والأندية. نساعد في تطوير المواهب وربط اللاعبين بالفرص العالمية.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.company.title')}</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.services.title')}</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contact.title')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">+966 50 123 4567</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">info@el7lm.com</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © 2024 El7lm. جميع الحقوق محفوظة.
          </p>
          <div className="flex space-x-6 space-x-reverse">
            {footerLinks.legal.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ===== المكون الرئيسي للتخطيط العام =====
interface PublicResponsiveLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const PublicResponsiveLayout: React.FC<PublicResponsiveLayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      {showHeader && <PublicResponsiveHeader />}
      
      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Footer */}
      {showFooter && <PublicResponsiveFooter />}
    </div>
  );
};

// ===== المكون الرئيسي المصدر =====
interface PublicResponsiveLayoutWrapperProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const PublicResponsiveLayoutWrapper: React.FC<PublicResponsiveLayoutWrapperProps> = (props) => {
  return (
    <PublicLayoutProvider>
      <PublicResponsiveLayout {...props} />
    </PublicLayoutProvider>
  );
};

export default PublicResponsiveLayoutWrapper;
