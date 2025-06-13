'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/lib/context/SidebarContext';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleMobileSidebar } = useSidebar();

  const notifications = [
    { id: 1, title: 'تم تحديث ملفك الشخصي', time: 'منذ 5 دقائق' },
    { id: 2, title: 'لديك تقرير جديد', time: 'منذ ساعة' },
    { id: 3, title: 'تم إضافة صورة جديدة', time: 'منذ 3 ساعات' }
  ];

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // Check if we're on a dashboard page
  const isDashboardPage = pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Side - Sidebar Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle for Dashboard Pages */}
            {isDashboardPage && (
              <button 
                onClick={toggleMobileSidebar}
                className="p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            {/* Mobile Menu Button for Non-Dashboard Pages */}
            {!isDashboardPage && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
           
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/hagzz-logo.png" alt="Logo" className="w-auto h-10" />
            <span className="hidden md:block text-xl font-bold text-gray-800">HagzZGo</span>
          </div>
           
          {/* Search Bar */}
          <div className="flex-1 hidden max-w-xl mx-4 lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="بحث..."
                className="w-full px-4 py-2 pr-10 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
           
          {/* Right Side Icons */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-80 z-50"
                  >
                    <div className="p-4">
                      <h3 className="mb-4 text-lg font-semibold text-gray-800">الإشعارات</h3>
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                            <p className="font-medium text-gray-800">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          عرض جميع الإشعارات
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Help */}
            <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <HelpCircle className="w-6 h-6" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <img
                  src="/default-avatar.png"
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                />
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 w-48 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  >
                    <div className="p-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-2 p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span>الإعدادات</span>
                      </Link>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu for Non-Dashboard Pages */}
      {!isDashboardPage && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-3 bg-gray-50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="w-full px-4 py-2 pr-10 text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                <nav className="flex flex-col space-y-2">
                  <Link 
                    href="/dashboard" 
                    className="p-3 text-gray-700 rounded-lg hover:bg-white transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    الرئيسية
                  </Link>
                  <Link 
                    href="/dashboard/profile" 
                    className="p-3 text-gray-700 rounded-lg hover:bg-white transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    الملف الشخصي
                  </Link>
                  <Link 
                    href="/dashboard/settings" 
                    className="p-3 text-gray-700 rounded-lg hover:bg-white transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    الإعدادات
                  </Link>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  );
};

export default Header; 