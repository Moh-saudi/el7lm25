'use client';
import { useTranslation } from '@/lib/translations/simple-context';
import MessageCenter from '@/components/messaging/MessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function PlayerMessagesPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <ClientOnlyToaster position="top-center" />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-700">{t('dashboard.player.messages.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dashboard.player.messages.subtitle')}</p>
        </div>
        <MessageCenter />
      </div>
    </>
  );
} 