'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase/config';

export default function MessagesRedirectPage() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;
    // جلب نوع الحساب من localStorage أو من بيانات المستخدم
    const accountType = localStorage.getItem('accountType') || user.accountType;
    let path = '/dashboard/player/messages';
    if (accountType === 'club') path = '/dashboard/club/messages';
    else if (accountType === 'agent') path = '/dashboard/agent/messages';
    else if (accountType === 'academy') path = '/dashboard/academy/messages';
    else if (accountType === 'trainer') path = '/dashboard/trainer/messages';
    else if (accountType === 'admin') path = '/dashboard/admin/messages';
    router.replace(path);
  }, [user, router]);

  return <div style={{padding: 40, textAlign: 'center'}}>جاري التحويل إلى مركز الرسائل...</div>;
} 