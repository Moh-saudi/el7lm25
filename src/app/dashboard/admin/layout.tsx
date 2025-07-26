'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';
import DashboardFontWrapper from '@/components/layout/DashboardFontWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // التحقق من حجم الشاشة
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // التحقق من الصلاحيات
  useEffect(() => {
    if (!loading && (!user || userData?.accountType !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, userData, loading, router]);

  // عرض شاشة تحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // التحقق من الصلاحيات
  if (!user || userData?.accountType !== 'admin') {
    return null;
  }

  return (
    <DashboardFontWrapper className="bg-gray-50">
      {/* Header */}
      <UnifiedHeader 
        variant="default"
        showLanguageSwitcher={true}
        showNotifications={true}
        showUserMenu={true}
        title="لوحة تحكم المدير"
        logo="/admin-avatar.png"
      />
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        adminData={userData}
        isMobile={isMobile}
      />
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 pt-16 ${
        isSidebarOpen ? 'mr-64' : 'mr-20'
      }`}>
        {/* Content wrapper */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </DashboardFontWrapper>
  );
} 
