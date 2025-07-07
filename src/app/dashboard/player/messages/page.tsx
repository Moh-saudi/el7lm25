'use client';
import MessageCenter from '@/components/messaging/MessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function PlayerMessagesPage() {
  return (
    <>
      <ClientOnlyToaster position="top-center" />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-700">مركز الرسائل</h1>
          <p className="text-gray-600 mt-2">تواصل مع الأندية والوكلاء والأكاديميات</p>
        </div>
        <MessageCenter />
      </div>
    </>
  );
} 