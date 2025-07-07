'use client';
import MessageCenter from '@/components/messaging/MessageCenter';
import ClientOnlyToaster from '@/components/ClientOnlyToaster';

export default function AdminMessagesPage() {
  return (
    <>
      <ClientOnlyToaster position="top-center" />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-red-700">مركز الرسائل - الإدارة</h1>
          <p className="text-gray-600 mt-2">مراقبة وإدارة جميع المحادثات في النظام</p>
        </div>
        <MessageCenter />
      </div>
    </>
  );
} 