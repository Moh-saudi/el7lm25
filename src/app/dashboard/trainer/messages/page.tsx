'use client';
import { useTranslation } from '@/lib/translations/simple-context';
import WorkingMessageCenter from '@/components/messaging/WorkingMessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function TrainerMessagesPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <ClientOnlyToaster position="top-center" />
      <WorkingMessageCenter />
    </>
  );
} 