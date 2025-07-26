'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/translations/simple-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Users,
  Trophy,
  Calendar,
  FileText,
  Bell
} from 'lucide-react';

interface PlayerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: t('sidebar.player.dashboard'),
      href: '/dashboard/player',
      icon: Home,
      description: t('sidebar.player.dashboardDesc')
    },
    {
      title: t('sidebar.player.profile'),
      href: '/dashboard/player/profile',
      icon: User,
      description: t('sidebar.player.profileDesc')
    },
    {
      title: t('sidebar.player.messages'),
      href: '/dashboard/player/messages',
      icon: MessageSquare,
      description: t('sidebar.player.messagesDesc')
    },
    {
      title: t('sidebar.player.connections'),
      href: '/dashboard/player/connections',
      icon: Users,
      description: t('sidebar.player.connectionsDesc')
    },
    {
      title: t('sidebar.player.achievements'),
      href: '/dashboard/player/achievements',
      icon: Trophy,
      description: t('sidebar.player.achievementsDesc')
    },
    {
      title: t('sidebar.player.schedule'),
      href: '/dashboard/player/schedule',
      icon: Calendar,
      description: t('sidebar.player.scheduleDesc')
    },
    {
      title: t('sidebar.player.documents'),
      href: '/dashboard/player/documents',
      icon: FileText,
      description: t('sidebar.player.documentsDesc')
    },
    {
      title: t('sidebar.player.notifications'),
      href: '/dashboard/player/notifications',
      icon: Bell,
      description: t('sidebar.player.notificationsDesc')
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <img
                  src="/images/logoclublandingpage/agman.png"
                  alt="الحلم el7lm"
                  className="h-8 w-auto"
                />
                <span className="font-bold text-lg text-gray-900">اللاعب</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                    "hover:bg-gray-100 hover:text-gray-900",
                    isActive 
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                      : "text-gray-600"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-700" : "text-gray-500"
                  )} />
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && (
              <div className="space-y-2">
                <Link href="/dashboard/player/settings">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('sidebar.settings')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('sidebar.signOut')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerSidebar; 