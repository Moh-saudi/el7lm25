# 🌐 دليل نظام التعريب المتقدم - لوحة تحكم الأدمن

## 📋 نظرة عامة

تم إنشاء نظام تعريب شامل ومتقدم لتحويل جميع صفحات لوحة تحكم الأدمن من الإنجليزية إلى العربية مع دعم التنسيق المحلي والتواريخ والأرقام.

---

## 🗂️ بنية النظام

### **1. ملف الترجمة الأساسي**
```
src/lib/translations/admin.ts
```
- يحتوي على جميع الترجمات المنظمة في مجموعات
- دوال مساعدة للترجمة مع المتغيرات
- دعم المسارات المتداخلة للترجمات

### **2. Hook التعريب**
```
src/hooks/useAdminTranslation.tsx
```
- Hook React مخصص للاستخدام السهل
- دوال تنسيق للتواريخ والأرقام والعملات
- ترجمات جاهزة للاستخدام المباشر

---

## 🚀 كيفية الاستخدام

### **استيراد Hook التعريب**
```typescript
import useAdminTranslation from '@/hooks/useAdminTranslation';

function AdminComponent() {
  const { t, translations, getStatusText, formatDate } = useAdminTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{translations.actions.save}</p>
      <span>{getStatusText('active')}</span>
      <time>{formatDate(new Date())}</time>
    </div>
  );
}
```

### **الاستخدام المباشر للترجمة**
```typescript
import { t } from '@/lib/translations/admin';

// ترجمة بسيطة
const title = t('dashboard.title');

// ترجمة مع قيمة احتياطية
const subtitle = t('dashboard.subtitle', 'Default subtitle');
```

---

## 📚 مجموعات الترجمة المتاحة

### **1. التنقل (nav)**
```typescript
nav: {
  dashboard: 'لوحة التحكم',
  users: 'إدارة المستخدمين',
  payments: 'المدفوعات والاشتراكات',
  reports: 'التقارير',
  settings: 'الإعدادات',
  system: 'مراقبة النظام'
}
```

### **2. الإجراءات (actions)**
```typescript
actions: {
  save: 'حفظ',
  cancel: 'إلغاء',
  edit: 'تعديل',
  delete: 'حذف',
  loading: 'جاري التحميل...'
}
```

### **3. لوحة التحكم (dashboard)**
```typescript
dashboard: {
  title: 'لوحة التحكم الإدارية متعددة العملات',
  welcome: 'أهلاً بك في نظام إدارة المنصة العالمية',
  stats: {
    totalUsers: 'إجمالي المستخدمين',
    players: 'اللاعبين'
  }
}
```

### **4. إدارة المستخدمين (users)**
```typescript
users: {
  title: 'إدارة المستخدمين',
  types: {
    players: 'اللاعبين',
    clubs: 'الأندية',
    academies: 'الأكاديميات'
  },
  status: {
    active: 'نشط',
    verified: 'متحقق'
  }
}
```

---

## 🛠️ دوال المساعدة المتقدمة

### **1. تنسيق التواريخ**
```typescript
const { formatDate, formatTime, formatDateTime } = useAdminTranslation();

// تنسيق التاريخ
formatDate(new Date()) // "١٥ نوفمبر ٢٠٢٤"

// تنسيق الوقت
formatTime(new Date()) // "١٤:٣٠"

// تنسيق التاريخ والوقت
formatDateTime(new Date()) // "١٥ نوفمبر ٢٠٢٤، ١٤:٣٠"
```

### **2. تنسيق الأرقام والعملات**
```typescript
const { formatNumber, formatCurrency } = useAdminTranslation();

// تنسيق الأرقام
formatNumber(1234567) // "١٬٢٣٤٬٥٦٧"

// تنسيق العملات
formatCurrency(1500, 'SAR') // "١٬٥٠٠ ريال سعودي"
formatCurrency(2000, 'EGP') // "٢٬٠٠٠ جنيه مصري"
```

### **3. تنسيق أحجام الملفات**
```typescript
const { formatFileSize } = useAdminTranslation();

formatFileSize(1024) // "١ كيلوبايت"
formatFileSize(1048576) // "١ ميجابايت"
```

### **4. الوقت النسبي**
```typescript
const { getRelativeTime } = useAdminTranslation();

getRelativeTime(new Date(Date.now() - 60000)) // "منذ ١ دقيقة"
getRelativeTime(new Date(Date.now() - 3600000)) // "منذ ١ ساعة"
```

### **5. ترجمة الحالات**
```typescript
const { getStatusText, getUserTypeText } = useAdminTranslation();

getStatusText('active') // "نشط"
getStatusText('pending') // "قيد الانتظار"

getUserTypeText('player') // "لاعب"
getUserTypeText('club') // "نادي"
```

---

## 🎯 أمثلة عملية للاستخدام

### **مثال 1: صفحة إدارة المستخدمين**
```typescript
function UsersPage() {
  const { t, translations, getStatusText, getUserTypeText } = useAdminTranslation();
  
  return (
    <div>
      <h1>{t('users.title')}</h1>
      <p>{t('users.subtitle')}</p>
      
      {/* أزرار الإجراءات */}
      <button>{translations.actions.add}</button>
      <button>{translations.actions.export}</button>
      
      {/* جدول المستخدمين */}
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>النوع</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{getUserTypeText(user.type)}</td>
              <td>{getStatusText(user.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### **مثال 2: لوحة التحكم الرئيسية**
```typescript
function Dashboard() {
  const { t, formatNumber, formatCurrency } = useAdminTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      
      {/* بطاقات الإحصائيات */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{t('dashboard.stats.totalUsers')}</h3>
          <p>{formatNumber(12500)}</p>
        </div>
        
        <div className="stat-card">
          <h3>{t('dashboard.stats.totalRevenue')}</h3>
          <p>{formatCurrency(150000, 'EGP')}</p>
        </div>
      </div>
    </div>
  );
}
```

### **مثال 3: صفحة مراقبة النظام**
```typescript
function SystemMonitoring() {
  const { t, getStatusText, formatFileSize, formatDateTime } = useAdminTranslation();
  
  return (
    <div>
      <h1>{t('system.title')}</h1>
      
      {/* حالة الخدمات */}
      <div className="services-status">
        <div className="service">
          <span>Firebase</span>
          <span>{getStatusText('connected')}</span>
        </div>
        
        <div className="service">
          <span>مساحة التخزين</span>
          <span>{formatFileSize(totalStorage)}</span>
        </div>
      </div>
      
      {/* آخر تحديث */}
      <p>آخر تحديث: {formatDateTime(lastUpdate)}</p>
    </div>
  );
}
```

---

## 🔧 إضافة ترجمات جديدة

### **1. إضافة ترجمة في الملف الأساسي**
```typescript
// في src/lib/translations/admin.ts
export const adminTranslations = {
  // ... الترجمات الموجودة
  
  // إضافة مجموعة جديدة
  newSection: {
    title: 'عنوان القسم الجديد',
    subtitle: 'وصف القسم',
    actions: {
      create: 'إنشاء',
      update: 'تحديث'
    }
  }
};
```

### **2. استخدام الترجمة الجديدة**
```typescript
const { t } = useAdminTranslation();

const title = t('newSection.title');
const createAction = t('newSection.actions.create');
```

---

## 📱 دعم الاتجاه من اليمين لليسار (RTL)

النظام يدعم اتجاه النص العربي تلقائياً:

```css
/* في CSS */
.admin-page {
  direction: rtl;
  text-align: right;
}

/* للعناصر التي تحتاج اتجاه إنجليزي */
.ltr-content {
  direction: ltr;
}
```

---

## 🎨 أفضل الممارسات

### **1. تنظيم الترجمات**
- استخدم مجموعات منطقية للترجمات
- اتبع نمط تسمية واضح ومتسق
- أضف تعليقات للترجمات المعقدة

### **2. استخدام Hook التعريب**
```typescript
// ✅ صحيح
const { t, translations } = useAdminTranslation();

// ❌ خطأ - استيراد مباشر في كل مكان
import { t } from '@/lib/translations/admin';
```

### **3. معالجة القيم الافتراضية**
```typescript
// ✅ صحيح - مع قيمة افتراضية
const title = t('page.title', 'عنوان افتراضي');

// ❌ خطأ - بدون قيمة افتراضية
const title = t('page.title');
```

### **4. تنسيق التواريخ والأرقام**
```typescript
// ✅ صحيح - استخدام دوال التنسيق
const { formatDate, formatNumber } = useAdminTranslation();
const date = formatDate(new Date());
const count = formatNumber(1234);

// ❌ خطأ - تنسيق يدوي
const date = new Date().toLocaleDateString();
const count = 1234.toString();
```

---

## 🚀 التطبيق على الصفحات الموجودة

### **خطوات تطبيق التعريب على صفحة جديدة:**

1. **استيراد Hook التعريب:**
```typescript
import useAdminTranslation from '@/hooks/useAdminTranslation';
```

2. **استخدام Hook في المكون:**
```typescript
function MyAdminPage() {
  const { t, translations, formatDate } = useAdminTranslation();
  // ...
}
```

3. **استبدال النصوص الإنجليزية:**
```typescript
// قبل
<h1>User Management</h1>

// بعد
<h1>{t('users.title')}</h1>
```

4. **تطبيق التنسيق المحلي:**
```typescript
// قبل
<span>{new Date().toLocaleDateString()}</span>

// بعد
<span>{formatDate(new Date())}</span>
```

---

## 📊 الصفحات المعربة حالياً

### ✅ **مكتملة التعريب:**
- `src/app/dashboard/admin/page.tsx` - لوحة التحكم الرئيسية
- `src/app/dashboard/admin/system/page.tsx` - مراقبة النظام
- `src/components/layout/AdminSidebar.jsx` - الشريط الجانبي
- `src/components/layout/AdminHeader.jsx` - رأس الصفحة

### 🔄 **قيد التعريب:**
- صفحات إدارة المستخدمين
- صفحات إدارة المدفوعات
- صفحات التقارير
- صفحات الإعدادات

---

## 🎯 الخطوات التالية

1. **تطبيق التعريب على باقي الصفحات**
2. **إضافة دعم ترجمات متعددة (إنجليزي/عربي)**
3. **تحسين دعم RTL في التصميم**
4. **إضافة اختبارات للترجمات**
5. **تحسين الأداء بتحميل الترجمات حسب الحاجة**

---

## 💡 نصائح للمطورين

### **1. اختبار الترجمات:**
```typescript
// تأكد من وجود الترجمة
console.log(t('users.title')); // يجب أن يطبع النص العربي

// اختبار مع قيمة افتراضية
console.log(t('nonexistent.key', 'قيمة افتراضية'));
```

### **2. تصحيح الأخطاء:**
```typescript
// إذا لم تظهر الترجمة، تحقق من:
// 1. صحة مفتاح الترجمة
// 2. استيراد Hook بشكل صحيح
// 3. وجود الترجمة في الملف الأساسي
```

### **3. إضافة متغيرات للترجمة:**
```typescript
// في ملف الترجمة
welcome: 'مرحباً {{name}} في لوحة التحكم'

// في المكون
const { tWithVars } = useAdminTranslation();
const welcomeMsg = tWithVars('dashboard.welcome', { name: 'أحمد' });
// النتيجة: "مرحباً أحمد في لوحة التحكم"
```

---

## 🎉 الخلاصة

تم تطبيق نظام تعريب شامل ومتقدم يشمل:

✅ **ترجمة شاملة** لجميع النصوص  
✅ **تنسيق محلي** للتواريخ والأرقام  
✅ **دعم RTL** للغة العربية  
✅ **Hook متقدم** للاستخدام السهل  
✅ **دوال مساعدة** للتنسيق  
✅ **نظام منظم** للإضافة والتعديل  

النظام الآن جاهز لتطبيق التعريب على جميع صفحات لوحة تحكم الأدمن! 🚀 
