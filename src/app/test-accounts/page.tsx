'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building2, GraduationCap, Phone, Trophy, Copy, CheckCircle } from 'lucide-react';
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
    color: 'bg-blue-500',
    description: 'لاعب محترف يبحث عن فرص جديدة'
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
    color: 'bg-blue-500',
    description: 'لاعب موهوب في خط الوسط'
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
    color: 'bg-green-500',
    description: 'نادي محترف يبحث عن مواهب جديدة'
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
    color: 'bg-purple-500',
    description: 'أكاديمية متخصصة في تطوير المواهب'
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
    color: 'bg-orange-500',
    description: 'وكيل محترف للاعبين'
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
    color: 'bg-cyan-500',
    description: 'مدربة محترفة متخصصة في التدريب البدني'
  }
];

export default function TestAccountsPage() {
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(text);
      toast.success(`تم نسخ ${label} إلى الحافظة`);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (error) {
      toast.error('فشل في نسخ النص');
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
            حسابات تجريبية لاختبار الإشعارات
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            هذه الحسابات جاهزة للاستخدام في اختبار نظام الإشعارات الذكية.
            يمكنك استخدام أي من هذه الحسابات للتسجيل والدخول.
          </p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(testAccounts.reduce((acc, account) => {
            acc[account.accountType] = (acc[account.accountType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)).map(([type, count]) => (
            <Card key={type}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{getAccountTypeLabel(type)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* قائمة الحسابات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testAccounts.map((account, index) => {
            const Icon = account.icon;
            
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute top-0 right-0 w-2 h-full ${account.color}`}></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${account.color} text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge className={getAccountTypeColor(account.accountType)}>
                        {getAccountTypeLabel(account.accountType)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{account.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">البريد:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs max-w-32 truncate">{account.email}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(account.email, 'البريد الإلكتروني')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedEmail === account.email ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">كلمة المرور:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{account.password}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(account.password, 'كلمة المرور')}
                          className="h-6 w-6 p-0"
                        >
                          {copiedEmail === account.password ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
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
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(`${account.email}\n${account.password}`, 'بيانات الحساب')}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      نسخ البيانات
                    </Button>
                    
                    <Button
                      onClick={() => window.open('/auth/login', '_blank')}
                      className="flex-1"
                      size="sm"
                    >
                      <User className="w-4 h-4 mr-2" />
                      تسجيل الدخول
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* تعليمات الاختبار */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              🧪 تعليمات اختبار الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">الخطوات:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                  <li>اختر حساب من القائمة أعلاه وانسخ بياناته</li>
                  <li>اذهب إلى صفحة تسجيل الدخول: <a href="/auth/login" className="underline">تسجيل الدخول</a></li>
                  <li>سجل دخول بالحساب المختار</li>
                  <li>اذهب لصفحة البحث عن اللاعبين</li>
                  <li>ابحث عن لاعب آخر وافتح ملفه الشخصي</li>
                  <li>ستصل إشعارات للاعب الذي تم فتح ملفه</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">نصائح للاختبار:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
                  <li>استخدم حسابات مختلفة لاختبار أنواع مختلفة من الإشعارات</li>
                  <li>جرب فتح ملفات لاعبين من حسابات مختلفة</li>
                  <li>تحقق من الإشعارات في لوحة التحكم</li>
                  <li>اختبر الإشعارات على أجهزة مختلفة</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">روابط سريعة:</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open('/auth/login', '_blank')}>
                  تسجيل الدخول
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('/dashboard/player/search', '_blank')}>
                  البحث عن اللاعبين
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('/dashboard/notifications', '_blank')}>
                  الإشعارات
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 