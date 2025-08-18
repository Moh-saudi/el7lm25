'use client';

import { useTranslation } from '@/lib/translations/simple-context';
import ResponsiveMessageCenter from '@/components/messaging/ResponsiveMessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function SharedMessagesPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <ClientOnlyToaster position="top-center" />
      <ResponsiveMessageCenter />
    </>
  );
} 