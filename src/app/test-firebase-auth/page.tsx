'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestFirebaseAuthPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('test123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testRegistration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔧 Testing Firebase registration with:', { email, password });
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Registration successful:', user);
      setResult({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        }
      });
    } catch (err: any) {
      console.error('❌ Registration failed:', err);
      setError(err.message || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔧 Testing Firebase login with:', { email, password });
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Login successful:', user);
      setResult({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        }
      });
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const testTemporaryEmail = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const tempEmail = `user_test_${timestamp}_${randomSuffix}@el7hm.local`;
      
      console.log('🔧 Testing Firebase registration with temporary email:', tempEmail);
      
      const userCredential = await createUserWithEmailAndPassword(auth, tempEmail, password);
      const user = userCredential.user;
      
      console.log('✅ Temporary email registration successful:', user);
      setResult({
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        },
        tempEmail
      });
    } catch (err: any) {
      console.error('❌ Temporary email registration failed:', err);
      setError(err.message || 'حدث خطأ في التسجيل بالبريد المؤقت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>اختبار Firebase Authentication</CardTitle>
          <CardDescription>
            اختبار إعدادات Firebase Authentication والتسجيل
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              كلمة المرور
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={testRegistration} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'جاري الاختبار...' : 'اختبار التسجيل'}
            </Button>
            
            <Button 
              onClick={testLogin} 
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              اختبار تسجيل الدخول
            </Button>
          </div>

          <Button 
            onClick={testTemporaryEmail} 
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            اختبار البريد المؤقت
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <AlertDescription>
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 