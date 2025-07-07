# 📱 دليل تكامل الإشعارات الخارجية - El7hm

## 🔄 الوضع الحالي vs المطلوب

### ✅ ما هو مُفعل حالياً:
- **إشعارات داخلية**: عبر Sonner (toast notifications)
- **إشعارات المتصفح**: عداد الرسائل في الهيدر
- **إشعارات فورية**: عبر Firebase real-time
- **مراسلات داخلية**: نظام مراسلات شامل بين جميع المستخدمين

### 🚀 ما تم إضافته الآن:
- **API endpoints**: لإرسال SMS و WhatsApp
- **مكون إعدادات**: لتكوين الإشعارات الخارجية
- **دعم متعدد المقدمين**: Twilio، 4jawaly، WhatsApp Business، Green API
- **واجهة اختبار**: لتجربة الإشعارات قبل التفعيل

---

## 🛠️ التثبيت والإعداد

### 1. 📦 تثبيت المكتبات المطلوبة

```bash
# للـ SMS عبر Twilio
npm install twilio

# للبريد الإلكتروني (اختياري)
npm install nodemailer

# للتشفير (اختياري)
npm install bcryptjs
```

### 2. ⚙️ إعداد متغيرات البيئة

انسخ المتغيرات من `.env.example` إلى `.env.local`:

```env
# SMS - Twilio (عالمي)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SMS - 4jawaly (عربي)
JAWALY_API_KEY=your_4jawaly_api_key

# WhatsApp Business API
WHATSAPP_PHONE_ID=123456789
WHATSAPP_ACCESS_TOKEN=your_access_token

# Green API (بديل سهل)
GREEN_API_INSTANCE=1234567890
GREEN_API_TOKEN=your_green_api_token
```

---

## 📱 إعداد خدمات SMS

### أ) Twilio (الخيار الأفضل عالمياً)

1. **إنشاء حساب**: https://www.twilio.com/
2. **الحصول على Account SID & Auth Token**
3. **شراء رقم هاتف** أو استخدام رقم تجريبي
4. **التكلفة**: ~$0.0075 لكل رسالة SMS

#### ✅ المميزات:
- ✅ موثوق وسريع
- ✅ دعم عالمي (196 دولة)
- ✅ API ممتاز ووثائق شاملة
- ✅ دعم للأرقام السعودية

#### ❌ العيوب:
- ❌ يحتاج تفعيل حساب مدفوع
- ❌ تكلفة أعلى نسبياً

### ب) 4jawaly (خدمة عربية)

1. **إنشاء حساب**: https://www.4jawaly.com/
2. **الحصول على API Key**
3. **شحن الرصيد**
4. **التكلفة**: ~0.05 ريال لكل رسالة

#### ✅ المميزات:
- ✅ خدمة عربية محلية
- ✅ دعم ممتاز للأرقام السعودية
- ✅ أسعار منافسة
- ✅ واجهة باللغة العربية

#### ❌ العيوب:
- ❌ مقتصر على المنطقة العربية
- ❌ API أقل تطوراً من Twilio

---

## 💬 إعداد خدمات WhatsApp

### أ) WhatsApp Business API (الخيار الرسمي)

1. **إنشاء تطبيق Facebook**: https://developers.facebook.com/
2. **إضافة WhatsApp Business API**
3. **الحصول على Phone ID & Access Token**
4. **التكلفة**: مجاني للرسائل المحدودة

#### ✅ المميزات:
- ✅ خدمة رسمية من Meta
- ✅ موثوقية عالية
- ✅ دعم للوسائط المتعددة
- ✅ تكامل مع Facebook Business

#### ❌ العيوب:
- ❌ عملية موافقة معقدة
- ❌ قيود على أنواع الرسائل
- ❌ يحتاج رقم أعمال مُتحقق منه

### ب) Green API (البديل السهل)

1. **إنشاء حساب**: https://green-api.com/
2. **ربط WhatsApp**
3. **الحصول على Instance ID & Token**
4. **التكلفة**: ~$10 شهرياً

#### ✅ المميزات:
- ✅ سهولة الإعداد (5 دقائق)
- ✅ لا يحتاج موافقات معقدة
- ✅ دعم للمجموعات
- ✅ API بسيط وواضح

#### ❌ العيوب:
- ❌ خدمة خارجية (ليست رسمية)
- ❌ مخاطر أمنية نسبية
- ❌ قد يتم حظر الحساب

---

## 🔧 كيفية الاستخدام

### 1. 🎛️ تفعيل الإعدادات

```typescript
// في أي dashboard، أضف رابط للإعدادات
import ExternalNotifications from '@/components/messaging/ExternalNotifications';

// في صفحة إعدادات المستخدم
<ExternalNotifications />
```

### 2. 📤 إرسال إشعار SMS

```typescript
// من الكود الخلفي
const response = await fetch('/api/notifications/sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+966501234567',
    message: 'لديك رسالة جديدة من El7hm',
    type: 'twilio' // أو '4jawaly'
  })
});
```

### 3. 📲 إرسال إشعار WhatsApp

```typescript
// من الكود الخلفي
const response = await fetch('/api/notifications/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+966501234567',
    message: 'لديك رسالة جديدة من El7hm',
    type: 'green' // أو 'business'
  })
});
```

### 4. 🔄 تكامل مع نظام المراسلات الحالي

```typescript
// في MessageCenter.tsx - إضافة هذه الدالة
const sendExternalNotification = async (recipientId: string, message: string) => {
  try {
    // جلب إعدادات المستلم
    const settingsDoc = await getDoc(doc(db, 'notification_settings', recipientId));
    const settings = settingsDoc.data();
    
    if (!settings) return;
    
    // إرسال SMS إذا كان مُفعل
    if (settings.sms?.enabled && settings.sms?.onNewMessage) {
      await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settings.sms.phone,
          message: `رسالة جديدة: ${message.substring(0, 100)}...`,
          type: settings.sms.provider
        })
      });
    }
    
    // إرسال WhatsApp إذا كان مُفعل
    if (settings.whatsapp?.enabled && settings.whatsapp?.onNewMessage) {
      await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settings.whatsapp.phone,
          message: `رسالة جديدة من El7hm: ${message.substring(0, 200)}`,
          type: settings.whatsapp.provider
        })
      });
    }
    
  } catch (error) {
    console.error('خطأ في إرسال الإشعار الخارجي:', error);
  }
};

// استخدامها عند إرسال رسالة
const handleSendMessage = async () => {
  // ... إرسال الرسالة للـ Firebase ...
  
  // إرسال إشعار خارجي
  await sendExternalNotification(selectedContact.id, messageText);
};
```

---

## 🔐 الأمان والخصوصية

### 1. 🛡️ حماية API Keys

```typescript
// التحقق من وجود المتغيرات
if (!process.env.TWILIO_ACCOUNT_SID) {
  throw new Error('TWILIO_ACCOUNT_SID is required');
}

// تشفير أرقام الهواتف (اختياري)
import bcrypt from 'bcryptjs';

const hashPhone = (phone: string) => {
  return bcrypt.hashSync(phone, 10);
};
```

### 2. 🚫 منع الإشعارات المزعجة

```typescript
// محدد معدل الإرسال
const rateLimiter = new Map();

const checkRateLimit = (userId: string) => {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (userLimit && now - userLimit < 60000) { // دقيقة واحدة
    return false;
  }
  
  rateLimiter.set(userId, now);
  return true;
};
```

### 3. ✅ التحقق من صحة أرقام الهواتف

```typescript
const validatePhone = (phone: string) => {
  // تحقق من تنسيق الرقم السعودي
  const saudiPhoneRegex = /^\+966[0-9]{9}$/;
  return saudiPhoneRegex.test(phone);
};
```

---

## 📊 الإحصائيات والتتبع

### 1. 📈 تتبع إرسال الإشعارات

```typescript
// إضافة collection للإحصائيات
const logNotification = async (type: 'sms' | 'whatsapp', status: 'success' | 'failed', userId: string) => {
  await addDoc(collection(db, 'notification_logs'), {
    type,
    status,
    userId,
    timestamp: new Date(),
    cost: type === 'sms' ? 0.05 : 0.02 // تقدير التكلفة
  });
};
```

### 2. 💰 حساب التكاليف

```typescript
// في لوحة الأدمن
const getNotificationStats = async () => {
  const logs = await getDocs(collection(db, 'notification_logs'));
  
  const stats = {
    totalSent: logs.size,
    smsCount: 0,
    whatsappCount: 0,
    totalCost: 0
  };
  
  logs.forEach(doc => {
    const data = doc.data();
    if (data.type === 'sms') {
      stats.smsCount++;
      stats.totalCost += 0.05;
    } else {
      stats.whatsappCount++;
      stats.totalCost += 0.02;
    }
  });
  
  return stats;
};
```

---

## 🔄 التكامل مع لوحة الأدمن

### 1. 🎛️ إضافة صفحة إعدادات الإشعارات

```typescript
// في src/app/dashboard/admin/notifications/page.tsx
import ExternalNotifications from '@/components/messaging/ExternalNotifications';

export default function AdminNotificationsPage() {
  return (
    <div>
      <h1>إعدادات الإشعارات</h1>
      <ExternalNotifications />
    </div>
  );
}
```

### 2. 📊 إضافة إحصائيات الإشعارات

```typescript
// في dashboard الأدمن
const NotificationStats = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    getNotificationStats().then(setStats);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>إحصائيات الإشعارات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">{stats?.smsCount}</p>
            <p className="text-gray-600">رسائل SMS</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.whatsappCount}</p>
            <p className="text-gray-600">رسائل WhatsApp</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.totalCost} ريال</p>
            <p className="text-gray-600">إجمالي التكلفة</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🚀 الخطوات التالية للتفعيل

### 1. ⚡ تفعيل فوري (البديل السهل)
```bash
# 1. تثبيت Green API
npm install axios

# 2. إنشاء حساب Green API
# 3. ربط WhatsApp في 5 دقائق
# 4. نسخ Instance ID & Token
# 5. اختبار الإرسال
```

### 2. 🏢 تفعيل احترافي (للإنتاج)
```bash
# 1. إنشاء حساب Twilio Business
# 2. التحقق من الهوية والعنوان
# 3. شراء رقم مخصص
# 4. إعداد WhatsApp Business API
# 5. اختبار شامل
```

### 3. 📱 إضافة للتطبيق
- إضافة رابط "إعدادات الإشعارات" في جميع dashboards
- تفعيل الإشعارات التلقائية في MessageCenter
- إضافة إحصائيات في لوحة الأدمن
- اختبار مع المستخدمين الحقيقيين

---

## 💡 نصائح للاستخدام الأمثل

### 1. 🎯 استهداف ذكي
- إرسال إشعارات فقط للرسائل المهمة
- احترام أوقات الراحة (9 مساءً - 8 صباحاً)
- تجميع الإشعارات (digest) للرسائل المتكررة

### 2. 💰 تحسين التكاليف
- استخدام WhatsApp للرسائل الطويلة
- استخدام SMS للرسائل العاجلة
- تجميع الإشعارات اليومية

### 3. 🔧 التطوير المستمر
- مراقبة معدل التفعيل
- جمع feedback من المستخدمين
- تحسين النصوص والتوقيت

---

## ❓ الأسئلة الشائعة

**س: هل يمكن إرسال إشعارات مجانية؟**
ج: نعم، عبر Green API (محدود) أو استخدام Firebase Push Notifications

**س: كيف أحمي أرقام المستخدمين؟**
ج: تشفير البيانات في قاعدة البيانات وعدم تخزين API keys في الكود

**س: ماذا لو فشل الإرسال؟**
ج: النظام يعيد المحاولة تلقائياً ويسجل الأخطاء للمراجعة

**س: هل يدعم النظام المجموعات؟**
ج: حالياً للرسائل الفردية، يمكن إضافة دعم المجموعات لاحقاً

---

## 📞 الدعم والمساعدة

لأي استفسارات أو مساعدة في التكامل:
- 📧 البريد الإلكتروني: support@el7hm.com
- 📱 WhatsApp: +966501234567
- 💬 Discord: #hagzz-go-support

---

**✅ جاهز للتطبيق! النظام مُصمم ليكون مرن وقابل للتوسع حسب احتياجاتك.** 
