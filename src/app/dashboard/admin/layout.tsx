'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarOpen(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check user permissions with detailed logging
  React.useEffect(() => {
    console.log('🔍 Admin Layout - Permission Check:', {
      hasUser: !!user,
      hasUserData: !!userData,
      userEmail: user?.email,
      accountType: userData?.accountType,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.log('❌ Admin Layout - No user, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (!userData) {
      console.log('❌ Admin Layout - No userData, redirecting to login');
      router.push('/auth/login');
      return;
    }
    
    if (userData.accountType !== 'admin') {
      console.log('❌ Admin Layout - User is not admin:', {
        accountType: userData.accountType,
        email: user.email,
        redirectingToLogin: true
      });
      router.push('/auth/login');
      return;
    }

    console.log('✅ Admin Layout - Access granted for admin user');
  }, [user, userData, router]);

  if (!user) {
    console.log('🚫 Admin Layout Render - No user');
    return null;
  }

  if (!userData) {
    console.log('🚫 Admin Layout Render - No userData');
    return null;
  }

  if (userData.accountType !== 'admin') {
    console.log('🚫 Admin Layout Render - Not admin:', userData.accountType);
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        adminData={userData}
        isMobile={isMobile}
      />
      
      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarOpen ? 'mr-64' : 'mr-20'
      }`}>
        {/* Content wrapper */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
} 
