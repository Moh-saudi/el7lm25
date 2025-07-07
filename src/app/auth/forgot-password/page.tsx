'use client';

import { useRouter } from 'next/navigation';
import PasswordReset from '@/components/auth/PasswordReset';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Password reset email sent successfully');
  };

  const handleError = (error: string) => {
    console.error('Password reset error:', error);
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <PasswordReset
          onSuccess={handleSuccess}
          onError={handleError}
          backButtonAction={handleBackToLogin}
          className="w-full"
        />

        {/* Additional Navigation */}
        <div className="text-center">
          <div className="text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium">
              إنشاء حساب جديد
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 el7lm. جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
} 