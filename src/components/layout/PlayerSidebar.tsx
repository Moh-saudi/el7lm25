'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/translations/simple-context';
import { cn } from '@/lib/utils';
import { 
  Home,
  User,
  MessageSquare,
  FileText,
  Search,
  Video,
  BarChart3,
  CreditCard,
  CheckCircle,
  LogOut
} from 'lucide-react';

interface PlayerSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const menuItems = [
    {
      title: 'الملف الشخصي',
      href: '/dashboard/player/profile',
      icon: User,
      description: 'إدارة معلوماتك الشخصية'
    },
    {
      title: 'التقارير',
      href: '/dashboard/player/reports',
      icon: FileText,
      description: 'عرض تقارير الأداء والتقدم'
    },
    {
      title: 'إدارة الفيديوهات',
      href: '/dashboard/player/videos',
      icon: Video,
      description: 'رفع وإدارة الفيديوهات'
    },
    {
      title: 'فيديوهات اللاعبين',
      href: '/dashboard/player/player-videos',
      icon: Video,
      description: 'مشاهدة فيديوهات اللاعبين'
    },
    {
      title: 'البحث عن الفرص والأندية',
      href: '/dashboard/player/search',
      icon: Search,
      description: 'البحث عن فرص جديدة'
    },
    {
      title: 'الإحصائيات',
      href: '/dashboard/player/statistics',
      icon: BarChart3,
      description: 'عرض الإحصائيات والأداء'
    },
    {
      title: 'الرسائل',
      href: '/dashboard/player/messages',
      icon: MessageSquare,
      description: 'إدارة المحادثات والرسائل'
    },
    {
      title: 'إدارة الاشتراكات',
      href: '/dashboard/player/subscriptions',
      icon: CreditCard,
      description: 'إدارة اشتراكاتك'
    },
    {
      title: 'حالة الاشتراك',
      href: '/dashboard/player/subscription-status',
      icon: CheckCircle,
      description: 'عرض حالة اشتراكك'
    }
  ];

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">El7hm</h2>
                  <p className="text-xs text-gray-500">KUWAIT CLUB</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
            >
              <div className="w-4 h-4 flex flex-col justify-center items-center">
                <div className="w-3 h-0.5 bg-gray-600 mb-0.5"></div>
                <div className="w-3 h-0.5 bg-gray-600 mb-0.5"></div>
                <div className="w-3 h-0.5 bg-gray-600"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/auth/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerSidebar; 