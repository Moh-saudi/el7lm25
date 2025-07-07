'use client';
import MessageCenter from '@/components/messaging/MessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function ClubMessagesPage() {
  return (
    <>
      <ClientOnlyToaster position="top-center" />
      <div className="container mx-auto p-6">
        <div className="mb-6 mt-10">
          <h1 className="text-3xl font-bold text-green-700">مركز الرسائل</h1>
          <p className="text-gray-600 mt-2">تواصل مع اللاعبين والوكلاء والأكاديميات</p>
        </div>
      </div>
      <div className="container mx-auto px-0">
        <MessageCenter />
      </div>
    </>
  );
} 