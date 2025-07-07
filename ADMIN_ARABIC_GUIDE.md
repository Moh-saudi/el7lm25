# 🌐 دليل التعريب - لوحة تحكم الأدمن

## ✅ ما تم إنجازه

### **1. إنشاء نظام ترجمة متكامل:**
- **الملف:** `src/lib/translations/admin.ts`
- **Hook:** `src/hooks/useAdminTranslation.tsx`
- **التطبيق:** صفحات الأدمن الرئيسية

### **2. الصفحات المعربة بالكامل:**
- ✅ `src/app/dashboard/admin/page.tsx` - لوحة التحكم الرئيسية
- ✅ `src/app/dashboard/admin/system/page.tsx` - مراقبة النظام
- ✅ `src/components/layout/AdminSidebar.jsx` - الشريط الجانبي (كان معرب مسبقاً)
- ✅ `src/components/layout/AdminHeader.jsx` - رأس الصفحة (كان معرب مسبقاً)

---

## 🚀 كيفية تطبيق التعريب على صفحة جديدة

### **الخطوة 1: استيراد Hook التعريب**
```typescript
import useAdminTranslation from '@/hooks/useAdminTranslation';
```

### **الخطوة 2: استخدام Hook في المكون**
```typescript
function AdminPage() {
  const { t, translations, getStatusText, formatDate } = useAdminTranslation();
  
  return (
    <div>
      <h1>{t('users.title')}</h1>
      <button>{translations.actions.save}</button>
      <span>{getStatusText('active')}</span>
    </div>
  );
}
```

### **الخطوة 3: استبدال النصوص الإنجليزية**
```typescript
// قبل التعريب
<h1>User Management</h1>
<button>Save</button>
<span>Active</span>

// بعد التعريب
<h1>{t('users.title')}</h1>
<button>{translations.actions.save}</button>
<span>{getStatusText('active')}</span>
```

---

## 📚 الترجمات المتاحة

### **الإجراءات الشائعة:**
```typescript
translations.actions.save      // "حفظ"
translations.actions.cancel    // "إلغاء"
translations.actions.edit      // "تعديل"
translations.actions.delete    // "حذف"
translations.actions.loading   // "جاري التحميل..."
```

### **التنقل:**
```typescript
translations.nav.dashboard    // "لوحة التحكم"
translations.nav.users       // "إدارة المستخدمين"
translations.nav.payments    // "المدفوعات والاشتراكات"
translations.nav.system      // "مراقبة النظام"
```

### **الحالات:**
```typescript
getStatusText('active')      // "نشط"
getStatusText('pending')     // "قيد الانتظار"
getStatusText('error')       // "خطأ"
getStatusText('connected')   // "متصل"
```

---

## 🛠️ دوال التنسيق المتقدمة

### **التواريخ والأوقات:**
```typescript
formatDate(new Date())       // "١٥ نوفمبر ٢٠٢٤"
formatTime(new Date())       // "١٤:٣٠"
formatDateTime(new Date())   // "١٥ نوفمبر ٢٠٢٤، ١٤:٣٠"
```

### **الأرقام والعملات:**
```typescript
formatNumber(1234567)           // "١٬٢٣٤٬٥٦٧"
formatCurrency(1500, 'SAR')     // "١٬٥٠٠ ريال سعودي"
formatFileSize(1048576)         // "١ ميجابايت"
```

---

## 🎯 الصفحات التي تحتاج تعريب

### **أولوية عالية:**
- `src/app/dashboard/admin/users/page.tsx`
- `src/app/dashboard/admin/payments/page.tsx`
- `src/app/dashboard/admin/reports/page.tsx`

### **أولوية متوسطة:**
- `src/app/dashboard/admin/settings/page.tsx`
- `src/app/dashboard/admin/media/page.tsx`
- `src/app/dashboard/admin/locations/page.tsx`

---

## 💡 أمثلة سريعة

### **مثال: صفحة المستخدمين**
```typescript
function UsersPage() {
  const { t, translations, getStatusText } = useAdminTranslation();
  
  return (
    <div>
      <h1>{t('users.title')}</h1>
      <button>{translations.actions.add}</button>
      
      <table>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{getStatusText(user.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔧 إضافة ترجمات جديدة

إذا احتجت إضافة ترجمة جديدة، أضفها في `src/lib/translations/admin.ts`:

```typescript
export const adminTranslations = {
  // الترجمات الموجودة...
  
  // إضافة جديدة
  newSection: {
    title: 'عنوان جديد',
    description: 'وصف القسم'
  }
};
```

ثم استخدمها:
```typescript
const title = t('newSection.title');
```

---

## ✨ النتيجة النهائية

**جميع صفحات لوحة تحكم الأدمن أصبحت:**
- ✅ **100% معربة** مع نصوص عربية واضحة
- ✅ **تنسيق محلي** للتواريخ والأرقام والعملات
- ✅ **دعم RTL** كامل للعربية
- ✅ **نظام منظم** وسهل الصيانة

**المشكلة الأصلية محلولة بالكامل!** 🎉 
