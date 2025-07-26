'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// استيراد المكونات الأصلية بشكل ديناميكي مع تحسين التحميل
const Header = dynamic(() => import('@/components/layout/UnifiedHeader'), {
  loading: () => (
    <div className="h-16 bg-white shadow-lg border-b border-gray-200 flex items-center justify-center">
      <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
    </div>
  ),
  ssr: true
});

const Sidebar = dynamic(() => import('@/components/layout/Sidebar'), {
  loading: () => (
    <div className="w-64 bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] h-full animate-pulse">
      <div className="p-4 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-blue-600 rounded-lg"></div>
        ))}
      </div>
    </div>
  ),
  ssr: true
});

const AcademySidebar = dynamic(() => import('@/components/layout/AcademySidebar'), {
  loading: () => (
    <div className="w-64 bg-white h-full animate-pulse">
      <div className="p-4 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  ),
  ssr: true
});

const TrainerSidebar = dynamic(() => import('@/components/layout/TrainerSidebar'), {
  loading: () => (
    <div className="w-64 bg-white h-full animate-pulse">
      <div className="p-4 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  ),
  ssr: true
});

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  loading: () => (
    <div className="h-16 bg-white border-t flex items-center justify-center">
      <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
    </div>
  ),
  ssr: true
});

import { SidebarProvider } from '@/lib/context/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userData: authUserData, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // يجب أن تكون جميع الـ hooks هنا
  const accountType = useMemo(() => {
    if (!authUserData?.accountType) return 'player';
    return authUserData.accountType;
  }, [authUserData?.accountType]);

  // بعد جميع الـ hooks، ضع الشروط
  if (
    pathname.startsWith('/dashboard/admin') ||
    pathname.startsWith('/dashboard/trainer') ||
    pathname.startsWith('/dashboard/club') ||
    pathname.startsWith('/dashboard/academy') ||
    pathname.startsWith('/dashboard/agent') ||
    pathname.startsWith('/dashboard/player/reports') ||
    pathname.startsWith('/dashboard/marketer')
  ) {
    return <>{children}</>;
  }

  // عرض شاشة تحميل إذا كانت المصادقة تحمل
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ إذا لم يكن هناك مستخدم
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </div>
    );
  }

  // تحديد القائمة الجانبية المناسبة
  const renderSidebar = () => {
    switch (accountType) {
      case 'academy':
        return (
          <AcademySidebar 
            collapsed={isSidebarCollapsed}
            setCollapsed={setIsSidebarCollapsed}
          />
        );
      case 'trainer':
        return (
          <TrainerSidebar 
            collapsed={isSidebarCollapsed}
            setCollapsed={setIsSidebarCollapsed}
          />
        );
      default:
        return <Sidebar />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Header 
          variant="default"
          showLanguageSwitcher={true}
          showNotifications={true}
          showUserMenu={true}
          title="El7hm Dashboard"
        />
        <div className="flex flex-1 min-h-0 pt-16 pb-16" style={{ direction: 'rtl' }}>
          {renderSidebar()}
          <main 
            className="flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out"
            style={{ direction: 'rtl' }}
          >
            <div className="w-full max-w-full p-6 mx-auto">
              <div className="min-h-full p-6 bg-white rounded-lg shadow-sm">
                {children}
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </SidebarProvider>
  );
} 
