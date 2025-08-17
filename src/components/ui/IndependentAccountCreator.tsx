'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPlayerLoginAccount, checkPlayerHasLoginAccount } from '@/lib/utils/player-login-account';
import { UserPlus, Lock, CheckCircle, AlertTriangle, Mail, Phone, User, Building, Copy, Eye, EyeOff, MessageCircle, Send, Printer } from 'lucide-react';
import { toast } from 'sonner';

// الدول المدعومة مع رموز الهاتف
const COUNTRIES_WITH_PHONE_CODES = {
  QA: { name: 'قطر', code: '+974', flag: '🇶🇦', example: '+974XXXXXXXX' },
  SA: { name: 'السعودية', code: '+966', flag: '🇸🇦', example: '+966XXXXXXXXX' },
  AE: { name: 'الإمارات', code: '+971', flag: '🇦🇪', example: '+971XXXXXXXXX' },
  EG: { name: 'مصر', code: '+20', flag: '🇪🇬', example: '+20XXXXXXXXXX' },
  KW: { name: 'الكويت', code: '+965', flag: '🇰🇼', example: '+965XXXXXXXX' },
  BH: { name: 'البحرين', code: '+973', flag: '🇧🇭', example: '+973XXXXXXXX' },
  OM: { name: 'عمان', code: '+968', flag: '🇴🇲', example: '+968XXXXXXXX' },
  JO: { name: 'الأردن', code: '+962', flag: '🇯🇴', example: '+962XXXXXXXXX' },
  LB: { name: 'لبنان', code: '+961', flag: '🇱🇧', example: '+961XXXXXXXX' },
  TR: { name: 'تركيا', code: '+90', flag: '🇹🇷', example: '+90XXXXXXXXXX' },
  GB: { name: 'بريطانيا', code: '+44', flag: '🇬🇧', example: '+44XXXXXXXXXX' },
  US: { name: 'أمريكا', code: '+1', flag: '🇺🇸', example: '+1XXXXXXXXXX' },
  MA: { name: 'المغرب', code: '+212', flag: '🇲🇦', example: '+212XXXXXXXXX' },
  DZ: { name: 'الجزائر', code: '+213', flag: '🇩🇿', example: '+213XXXXXXXXX' },
  TN: { name: 'تونس', code: '+216', flag: '🇹🇳', example: '+216XXXXXXXX' }
};

interface IndependentAccountCreatorProps {
  playerId: string;
  playerData: {
    full_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    club_id?: string;
    academy_id?: string;
    trainer_id?: string;
    agent_id?: string;
    [key: string]: any;
  };
  source?: 'players' | 'player';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export default function IndependentAccountCreator({
  playerId,
  playerData,
  source = 'players',
  variant = 'outline',
  size = 'sm',
  className = ''
}: IndependentAccountCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [customEmail, setCustomEmail] = useState(playerData.email || '');
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<keyof typeof COUNTRIES_WITH_PHONE_CODES>('QA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // تحليل رقم الهاتف الموجود لتحديد الدولة تلقائياً
  const detectCountryFromPhone = (phone: string) => {
    if (!phone) return 'QA';
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    for (const [countryCode, countryInfo] of Object.entries(COUNTRIES_WITH_PHONE_CODES)) {
      const code = countryInfo.code.replace(/\D/g, '');
      if (cleanPhone.startsWith(code)) {
        return countryCode as keyof typeof COUNTRIES_WITH_PHONE_CODES;
      }
    }
    
    return 'QA'; // افتراضي
  };

  // استخراج الرقم المحلي من الرقم الكامل
  const extractLocalNumber = (phone: string, country: keyof typeof COUNTRIES_WITH_PHONE_CODES) => {
    if (!phone) return '';
    
    const cleanPhone = phone.replace(/\D/g, '');
    const countryCode = COUNTRIES_WITH_PHONE_CODES[country].code.replace(/\D/g, '');
    
    if (cleanPhone.startsWith(countryCode)) {
      return cleanPhone.substring(countryCode.length);
    }
    
    return cleanPhone;
  };

  // التحقق من وجود حساب عند فتح المودال
  React.useEffect(() => {
    const checkAccount = async () => {
      if (playerData.email) {
        const hasLoginAccount = await checkPlayerHasLoginAccount(playerData.email);
        setHasAccount(hasLoginAccount);
      }
    };
    
    // تعيين الدولة والرقم تلقائياً من بيانات اللاعب
    const playerPhone = playerData.whatsapp || playerData.phone || '';
    if (playerPhone) {
      const detectedCountry = detectCountryFromPhone(playerPhone);
      setSelectedCountry(detectedCountry);
      setPhoneNumber(extractLocalNumber(playerPhone, detectedCountry));
    }
    
    if (isOpen) {
      checkAccount();
    }
  }, [isOpen, playerData.email, playerData.phone, playerData.whatsapp]);

  const organizationInfo = () => {
    if (playerData.club_id) return 'تابع لنادي';
    if (playerData.academy_id) return 'تابع لأكاديمية';
    if (playerData.trainer_id) return 'تابع لمدرب';
    if (playerData.agent_id) return 'تابع لوكيل';
    return 'غير محدد';
  };

  const canCreateAccount = customEmail && (playerData.full_name || playerData.name);

  const handleCreateAccount = async () => {
    if (!canCreateAccount) {
      toast.error('يرجى التأكد من وجود الإيميل والاسم');
      return;
    }

    setIsCreating(true);
    
    try {
      // استخدام الإيميل المعدل إذا تم تغييره
      const updatedPlayerData = {
        ...playerData,
        email: customEmail
      };

      const result = await createPlayerLoginAccount(playerId, updatedPlayerData, source);
      
      if (result.success) {
        setCreatedPassword(result.tempPassword || 'Player123!@#');
        setHasAccount(true);
        toast.success('تم إنشاء حساب تسجيل الدخول بنجاح!');
      } else {
        toast.error(`فشل في إنشاء الحساب: ${result.message}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء الحساب:', error);
      toast.error('حدث خطأ في إنشاء حساب تسجيل الدخول');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ للحافظة');
  };

  // إنشاء رسالة تسجيل الدخول
  const createLoginMessage = () => {
    const playerName = playerData.full_name || playerData.name || 'اللاعب';
    
    if (hasAccount && !createdPassword) {
      // رسالة تذكير للحسابات الموجودة
      return `مرحباً ${playerName}! 👋

تذكير ببيانات حسابك:

📧 الإيميل: ${customEmail}
🔑 كلمة المرور: استخدم كلمة المرور الخاصة بك

إذا نسيت كلمة المرور:
1. اذهب لصفحة تسجيل الدخول
2. اضغط على "نسيت كلمة المرور"
3. أدخل إيميلك لإعادة تعيين كلمة المرور

أو تواصل معنا للمساعدة! 🎯`;
    } else {
      // رسالة للحسابات الجديدة
      const password = createdPassword || '123456789';
      return `مرحباً ${playerName}! 🎉

تم إنشاء حساب تسجيل الدخول الخاص بك:

📧 الإيميل: ${customEmail}
🔑 كلمة المرور: ${password}

للدخول:
1. اذهب لصفحة تسجيل الدخول
2. استخدم الإيميل وكلمة المرور أعلاه
3. يمكنك تغيير كلمة المرور بعد الدخول

مرحباً بك! 🎯`;
    }
  };

  // تنسيق رقم الهاتف
  const formatPhoneNumber = (country: keyof typeof COUNTRIES_WITH_PHONE_CODES, number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    const countryCode = COUNTRIES_WITH_PHONE_CODES[country].code;
    return `${countryCode}${cleanNumber}`;
  };

  // التحقق من صحة الرقم
  const isValidPhoneNumber = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return cleanNumber.length >= 7 && cleanNumber.length <= 15;
  };

  // الحصول على الرقم الكامل
  const getFullPhoneNumber = () => {
    return formatPhoneNumber(selectedCountry, phoneNumber);
  };

  // إرسال رسالة واتساب
  const sendWhatsAppMessage = () => {
    const message = createLoginMessage();
    const encodedMessage = encodeURIComponent(message);
    const fullNumber = getFullPhoneNumber().replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${fullNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    toast.success('تم فتح الواتساب!');
    setShowWhatsAppDialog(false);
  };

  // إرسال رسمي عبر API
  const sendOfficialWhatsApp = async () => {
    setSendingWhatsApp(true);
    try {
      const response = await fetch('/api/whatsapp/send-official', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: getFullPhoneNumber(),
          message: createLoginMessage(),
          senderPhone: '+97472053188',
          organizationName: 'المنظمة',
          accountType: 'club'
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('تم إرسال الرسالة بنجاح!');
        setShowWhatsAppDialog(false);
      } else {
        throw new Error(result.message || 'فشل في الإرسال');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error('فشل في إرسال الرسالة');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const resetAndClose = () => {
    setIsOpen(false);
    setCreatedPassword(null);
    setShowPassword(false);
    setCustomEmail(playerData.email || '');
    setShowWhatsAppDialog(false);
    setSelectedCountry('QA');
    setPhoneNumber('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetAndClose();
      else setIsOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`text-purple-600 hover:bg-purple-50 ${className}`}
          title="إنشاء حساب تسجيل دخول منفصل للاعب"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline mr-1">حساب منفصل</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            إنشاء حساب تسجيل دخول منفصل
          </DialogTitle>
          <DialogDescription>
            إنشاء حساب تسجيل دخول منفصل للاعب للوصول لملفه الشخصي والإشعارات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* معلومات اللاعب */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              معلومات اللاعب
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">الاسم الكامل</Label>
                <div className="font-medium">{playerData.full_name || playerData.name || 'غير محدد'}</div>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">الانتماء</Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Building className="w-3 h-3 mr-1" />
                  {organizationInfo()}
                </Badge>
              </div>
              
              {playerData.phone && (
                <div>
                  <Label className="text-sm text-gray-600">رقم الهاتف</Label>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-500" />
                    <span className="font-medium">{playerData.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* حالة الحساب */}
          {hasAccount !== null && (
            <div className={`p-4 rounded-lg border ${hasAccount ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {hasAccount ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">يوجد حساب تسجيل دخول بالفعل</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">لا يوجد حساب تسجيل دخول</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {hasAccount 
                  ? 'اللاعب لديه حساب تسجيل دخول ويمكنه الوصول لملفه الشخصي'
                  : 'يمكن إنشاء حساب تسجيل دخول جديد للاعب'
                }
              </p>

              {/* أزرار مشاركة للحساب الموجود */}
              {hasAccount && (
                <div className="space-y-3">
                  <h4 className="font-medium text-green-800 text-center text-sm">
                    📤 تذكير اللاعب ببيانات حسابه:
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* نسخ الإيميل */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`الإيميل: ${customEmail}\n\nاستخدم كلمة المرور التي تم إرسالها لك سابقاً أو اطلب إعادة تعيين كلمة المرور`)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-3 h-3" />
                      نسخ الإيميل
                    </Button>

                    {/* تذكير واتساب */}
                    <Button
                      size="sm"
                      onClick={() => setShowWhatsAppDialog(true)}
                      disabled={!playerData.phone && !playerData.whatsapp}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <MessageCircle className="w-3 h-3" />
                      تذكير واتساب
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* إعداد الإيميل */}
          {!hasAccount && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  الإيميل لتسجيل الدخول
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="أدخل إيميل صحيح للاعب"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  سيستخدم اللاعب هذا الإيميل لتسجيل الدخول
                </p>
              </div>

              {/* متطلبات إنشاء الحساب */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-medium text-yellow-800 mb-2">متطلبات إنشاء الحساب:</h4>
                <div className="space-y-1 text-sm">
                  <div className={`flex items-center gap-2 ${(playerData.full_name || playerData.name) ? 'text-green-600' : 'text-red-600'}`}>
                    {(playerData.full_name || playerData.name) ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>الاسم الكامل: {(playerData.full_name || playerData.name) ? 'متوفر' : 'مطلوب'}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${customEmail ? 'text-green-600' : 'text-red-600'}`}>
                    {customEmail ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    <span>الإيميل: {customEmail ? 'متوفر' : 'مطلوب'}</span>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateAccount}
                  disabled={!canCreateAccount || isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري إنشاء الحساب...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      إنشاء حساب تسجيل الدخول
                    </>
                  )}
                </Button>
                
                <Button variant="outline" onClick={resetAndClose}>
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {/* عرض كلمة المرور بعد الإنشاء */}
          {createdPassword && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">تم إنشاء الحساب بنجاح!</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">بيانات تسجيل الدخول:</Label>
                  <div className="bg-white border rounded-lg p-3 mt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">الإيميل:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{customEmail}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(customEmail)}
                          className="p-1 h-auto"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">كلمة المرور:</span>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {showPassword ? createdPassword : '••••••••••'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 h-auto"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(createdPassword)}
                          className="p-1 h-auto"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2">تعليمات للاعب:</h4>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                    <li>اذهب إلى صفحة تسجيل الدخول</li>
                    <li>أدخل الإيميل: <code className="bg-white px-1 rounded">{customEmail}</code></li>
                    <li>أدخل كلمة المرور المؤقتة</li>
                    <li>ستُطلب منك تغيير كلمة المرور عند الدخول الأول</li>
                    <li>يمكنك الآن الوصول لملفك الشخصي والإشعارات</li>
                  </ol>
                </div>

                {/* أزرار مشاركة بيانات الدخول */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 text-center">
                    📤 مشاركة بيانات الدخول مع اللاعب:
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* نسخ البيانات */}
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(createLoginMessage())}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      نسخ البيانات
                    </Button>

                    {/* إرسال واتساب */}
                    <Button
                      onClick={() => setShowWhatsAppDialog(true)}
                      disabled={!playerData.phone && !playerData.whatsapp}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={resetAndClose}
                  className="w-full"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* مودال إرسال الواتساب */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              إرسال بيانات الدخول عبر الواتساب
            </DialogTitle>
            <DialogDescription>
              سيتم إرسال بيانات تسجيل الدخول للاعب عبر الواتساب
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* اختيار الدولة */}
            <div>
              <Label htmlFor="country-select">الدولة:</Label>
              <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value as keyof typeof COUNTRIES_WITH_PHONE_CODES)}>
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span>{COUNTRIES_WITH_PHONE_CODES[selectedCountry].flag}</span>
                      <span>{COUNTRIES_WITH_PHONE_CODES[selectedCountry].name}</span>
                      <span className="text-gray-500">({COUNTRIES_WITH_PHONE_CODES[selectedCountry].code})</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNTRIES_WITH_PHONE_CODES).map(([code, country]) => (
                    <SelectItem key={code} value={code}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-gray-500">({country.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* إدخال الرقم */}
            <div>
              <Label htmlFor="phone-number">رقم الهاتف:</Label>
              <div className="flex gap-2 mt-1">
                <div className="bg-gray-50 border rounded-lg px-3 py-2 text-sm font-mono text-gray-600 min-w-fit">
                  {COUNTRIES_WITH_PHONE_CODES[selectedCountry].code}
                </div>
                <Input
                  id="phone-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setPhoneNumber(value);
                  }}
                  placeholder={COUNTRIES_WITH_PHONE_CODES[selectedCountry].example.replace(COUNTRIES_WITH_PHONE_CODES[selectedCountry].code, '')}
                  className="font-mono"
                  dir="ltr"
                />
              </div>
              
              {/* عرض الرقم الكامل */}
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 font-medium">الرقم الكامل:</span>
                  <code className="text-blue-800 font-mono bg-white px-2 py-1 rounded">
                    {phoneNumber ? getFullPhoneNumber() : COUNTRIES_WITH_PHONE_CODES[selectedCountry].example}
                  </code>
                </div>
                {!isValidPhoneNumber() && phoneNumber && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ الرقم غير صحيح. يجب أن يكون بين 7-15 رقم
                  </p>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">معاينة الرسالة:</span>
              </div>
              <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-32 overflow-y-auto">
                {createLoginMessage()}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={sendWhatsAppMessage}
                disabled={!phoneNumber || !isValidPhoneNumber()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                فتح الواتساب
              </Button>
              
              <Button
                onClick={sendOfficialWhatsApp}
                disabled={!phoneNumber || !isValidPhoneNumber() || sendingWhatsApp}
                variant="outline"
                className="flex-1"
              >
                {sendingWhatsApp ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    إرسال رسمي
                  </>
                )}
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setShowWhatsAppDialog(false)}
              className="w-full"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
} 