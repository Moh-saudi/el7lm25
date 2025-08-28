'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function ClubNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات النادي"
      description="تابع جميع الإشعارات والتنبيهات المهمة لناديك"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={true}
      accountType="club"
    />
  );
} 
