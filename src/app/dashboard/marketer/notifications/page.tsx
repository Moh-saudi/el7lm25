'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function MarketerNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات المسوق"
      description="تابع جميع الإشعارات والتنبيهات المهمة لعملك"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={true}
      accountType="marketer"
    />
  );
}
