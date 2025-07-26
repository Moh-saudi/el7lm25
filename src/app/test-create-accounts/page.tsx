'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, User, Building2, GraduationCap, Phone, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const testAccounts = [
  {
    email: 'marwan.fedail@el7hm.com',
    password: 'Marwan123!@#',
    name: 'مروان فضيل',
    accountType: 'player',
    phone: '+966501234567',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    position: 'مهاجم صريح',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    email: 'ahmed.player@el7hm.com',
    password: 'Ahmed123!@#',
    name: 'أحمد اللاعب',
    accountType: 'player',
    phone: '+966502345678',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    position: 'وسط دفاعي',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    email: 'mohammed.club@el7hm.com',
    password: 'Mohammed123!@#',
    name: 'محمد النادي',
    accountType: 'club',
    phone: '+966503456789',
    country: 'Saudi Arabia',
    city: 'Dammam',
    clubName: 'نادي النصر',
    icon: Building2,
    color: 'bg-green-500'
  },
  {
    email: 'sara.academy@el7hm.com',
    password: 'Sara123!@#',
    name: 'سارة الأكاديمية',
    accountType: 'academy',
    phone: '+966504567890',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    academyName: 'أكاديمية النجوم',
    icon: GraduationCap,
    color: 'bg-purple-500'
  },
  {
    email: 'ali.agent@el7hm.com',
    password: 'Ali123!@#',
    name: 'علي الوكيل',
    accountType: 'agent',
    phone: '+966505678901',
    country: 'Saudi Arabia',
    city: 'Jeddah',
    agencyName: 'وكالة النجوم الرياضية',
    icon: Phone,
    color: 'bg-orange-500'
  },
  {
    email: 'fatima.trainer@el7hm.com',
    password: 'Fatima123!@#',
    name: 'فاطمة المدرب',
    accountType: 'trainer',
    phone: '+966506789012',
    country: 'Saudi Arabia',
    city: 'Riyadh',
    specialization: 'تدريب بدني',
    icon: Trophy,
    color: 'bg-cyan-500'
  }
];

export default function TestCreateAccountsPage() {
  const [creatingAccounts, setCreatingAccounts] = useState<string[]>([]);
  const [createdAccounts, setCreatedAccounts] = useState<string[]>([]);
  const [failedAccounts, setFailedAccounts] = useState<string[]>([]);

  const createAccount = async (account: any) => {
    setCreatingAccounts(prev => [...prev, account.email]);
    
    try {
      // إنشاء المستخدم في Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        account.email, 
        account.password
      );

      // إنشاء بيانات المستخدم في Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: account.email,
        name: account.name,
        full_name: account.name,
        phone: account.phone,
        accountType: account.accountType,
        country: account.country,
        city: account.city,
        isActive: true,
        verified: true,
        profileCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // إضافة بيانات خاصة حسب نوع الحساب
      if (account.accountType === 'player') {
        userData.primary_position = account.position;
        userData.nationality = 'Saudi';
      } else if (account.accountType === 'club') {
        userData.club_name = account.clubName;
      } else if (account.accountType === 'academy') {
        userData.academy_name = account.academyName;
      } else if (account.accountType === 'agent') {
        userData.agency_name = account.agencyName;
      } else if (account.accountType === 'trainer') {
        userData.specialization = account.specialization;
      }

      // حفظ في مجموعة users
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // حفظ في مجموعة خاصة حسب نوع الحساب
      const collectionName = account.accountType === 'player' ? 'players' : 
                           account.accountType === 'club' ? 'clubs' :
                           account.accountType === 'academy' ? 'academies' :
                           account.accountType === 'agent' ? 'agents' :
                           account.accountType === 'trainer' ? 'trainers' : 'users';

      await setDoc(doc(db, collectionName, userCredential.user.uid), userData);

      setCreatedAccounts(prev => [...prev, account.email]);
      toast.success(`تم إنشاء حساب ${account.name} بنجاح!`);
      
    } catch (error: any) {
      console.error(`خطأ في إنشاء حساب ${account.name}:`, error);
      
      if (error.code === 'auth/email-already-in-use') {
        setCreatedAccounts(prev => [...prev, account.email]);
        toast.info(`الحساب ${account.name} موجود بالفعل`);
      } else {
        setFailedAccounts(prev => [...prev, account.email]);
        toast.error(`فشل في إنشاء حساب ${account.name}: ${error.message}`);
      }
    } finally {
      setCreatingAccounts(prev => prev.filter(email => email !== account.email));
    }
  };

  const createAllAccounts = async () => {
    for (const account of testAccounts) {
      await createAccount(account);
      // انتظار قليلاً بين كل حساب
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getAccountTypeLabel = (accountType: string) => {
    const labels = {
      player: 'لاعب',
      club: 'نادي',
      academy: 'أكاديمية',
      agent: 'وكيل',
      trainer: 'مدرب'
    };
    return labels[accountType as keyof typeof labels] || accountType;
  };

  const getAccountTypeColor = (accountType: string) => {
    const colors = {
      player: 'bg-blue-100 text-blue-800',
      club: 'bg-green-100 text-green-800',
      academy: 'bg-purple-100 text-purple-800',
      agent: 'bg-orange-100 text-orange-800',
      trainer: 'bg-cyan-100 text-cyan-800'
    };
    return colors[accountType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            إنشاء حسابات تجريبية لاختبار الإشعارات
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            هذه الصفحة تساعدك في إنشاء حسابات حقيقية لاختبار نظام الإشعارات الذكية.
            يمكنك إنشاء حسابات مختلفة وأنواع مختلفة من الحسابات.
          </p>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-4 justify-center mb-8">
          <Button 
            onClick={createAllAccounts}
            disabled={creatingAccounts.length > 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {creatingAccounts.length > 0 ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                إنشاء جميع الحسابات
              </>
            )}
          </Button>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الحسابات</p>
                  <p className="text-2xl font-bold text-gray-900">{testAccounts.length}</p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تم إنشاؤها</p>
                  <p className="text-2xl font-bold text-green-600">{createdAccounts.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">فشلت</p>
                  <p className="text-2xl font-bold text-red-600">{failedAccounts.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الحسابات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testAccounts.map((account, index) => {
            const Icon = account.icon;
            const isCreating = creatingAccounts.includes(account.email);
            const isCreated = createdAccounts.includes(account.email);
            const isFailed = failedAccounts.includes(account.email);
            
            return (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-2 h-full ${account.color}`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${account.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <Badge className={getAccountTypeColor(account.accountType)}>
                          {getAccountTypeLabel(account.accountType)}
                        </Badge>
                      </div>
                    </div>
                    
                    {isCreating && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    )}
                    {isCreated && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {isFailed && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">البريد:</span>
                      <span className="font-mono text-xs">{account.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">كلمة المرور:</span>
                      <span className="font-mono text-xs">{account.password}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="text-sm">{account.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المدينة:</span>
                      <span className="text-sm">{account.city}</span>
                    </div>
                    {account.position && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">المركز:</span>
                        <span className="text-sm">{account.position}</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => createAccount(account)}
                    disabled={isCreating || isCreated}
                    variant={isCreated ? "outline" : "default"}
                    className="w-full"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        جاري الإنشاء...
                      </>
                    ) : isCreated ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        تم الإنشاء
                      </>
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        إنشاء الحساب
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* تعليمات الاختبار */}
        {createdAccounts.length > 0 && (
          <Card className="mt-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                تعليمات اختبار الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">الخطوات:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-green-700">
                    <li>سجل دخول بحساب واحد من الحسابات المنشأة</li>
                    <li>اذهب لصفحة البحث عن اللاعبين</li>
                    <li>ابحث عن لاعب آخر وافتح ملفه الشخصي</li>
                    <li>ستصل إشعارات للاعب الذي تم فتح ملفه</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">الحسابات المتاحة:</h4>
                  <div className="space-y-1 text-sm text-green-700">
                    {createdAccounts.map((email, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{email}</span>
                        <Badge variant="outline" className="text-xs">متاح</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 