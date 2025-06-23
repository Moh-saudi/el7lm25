# 🛠️ دليل إصلاح أخطاء الصور

## 📋 نظرة عامة

هذا الدليل يشرح كيفية حل مشاكل أخطاء الصور في Next.js والتخلص من رسائل الخطأ:
- `⨯ upstream image response failed for https://test-url.com/test-image.jpg 403`
- `⨯ upstream image response failed for https://ekyerljzfokqimbabzxm.supabase.co/.../ 400`

## 🔍 أسباب المشاكل

### 1. روابط وهمية (Test URLs)
- `test-url.com` - روابط اختبار غير حقيقية
- تم إضافتها أثناء التطوير والاختبار

### 2. صور Supabase مكسورة
- ملفات غير موجودة في التخزين
- أذونات خاطئة أو منتهية الصلاحية
- روابط تحتوي على `undefined` أو `null`

## 🚀 خطوات الإصلاح

### الخطوة 1: تنظيف البيانات
```bash
# افتح المتصفح واذهب إلى:
http://localhost:3000/fix-image-errors.html

# أو استخدم الكونسول مباشرة:
# افتح Developer Tools > Console
window.checkTestImages()    # فحص الصور الوهمية
window.cleanTestImages()    # تنظيف الصور الوهمية
window.fixSupabaseImages()  # إصلاح صور Supabase
window.fullFix()           # إصلاح شامل
```

### الخطوة 2: استخدام المكونات الجديدة

#### أ) SafeImage Component
```tsx
import SafeImage from '@/components/shared/SafeImage';

// استخدام بسيط
<SafeImage 
  src={player.profile_image_url}
  alt={player.full_name}
  width={100}
  height={100}
  className="rounded-full"
/>

// مع fallback مخصص
<SafeImage 
  src={player.avatar}
  alt="صورة اللاعب"
  width={200}
  height={200}
  fallbackSrc="/images/player-avatar.png"
  className="object-cover"
/>
```

#### ب) Image URL Validator
```tsx
import { sanitizeImageUrl, isValidImageUrl } from '@/utils/image-url-validator';

// تنظيف رابط واحد
const cleanUrl = sanitizeImageUrl(player.profile_image_url);

// فحص صحة الرابط
if (isValidImageUrl(imageUrl)) {
  // الرابط صحيح، يمكن استخدامه
}

// تنظيف بيانات اللاعب كاملة
const cleanPlayer = sanitizePlayerImages(playerData);
```

### الخطوة 3: التحديثات المطلوبة

#### أ) في المكونات الموجودة
```tsx
// القديم ❌
<Image src={player.profile_image_url} alt="صورة اللاعب" />

// الجديد ✅
<SafeImage src={player.profile_image_url} alt="صورة اللاعب" />
```

#### ب) في API calls
```tsx
// قبل استخدام البيانات
const playersData = await getPlayersFromDB();
const cleanPlayers = playersData.map(player => sanitizePlayerImages(player));
```

## 📁 الملفات المضافة

### 1. المكونات الجديدة:
- `src/components/shared/SafeImage.tsx` - مكون آمن للصور
- `src/utils/image-url-validator.ts` - أداة فحص الروابط
- `src/middleware/imageErrorHandler.ts` - معالج الأخطاء

### 2. أدوات الإصلاح:
- `public/fix-image-errors.html` - أداة تنظيف تفاعلية

### 3. التحديثات:
- `next.config.js` - إزالة test-url.com وتحسين الإعدادات

## 🎯 نتائج الإصلاح

بعد تطبيق هذه الحلول، ستحصل على:

✅ **لن تظهر أخطاء الصور مرة أخرى**
✅ **تحميل أسرع للصفحات**
✅ **تجربة مستخدم أفضل**
✅ **صور بديلة عند فشل التحميل**
✅ **أداء محسن**

## 🔧 استكشاف الأخطاء

### مشكلة: لا تزال الأخطاء تظهر
**الحل:**
1. تأكد من تشغيل أداة التنظيف
2. أعد تشغيل خادم التطوير
3. احذف `.next` folder و `node_modules/.cache`

### مشكلة: الصور لا تظهر
**الحل:**
1. تأكد من وجود `/images/default-avatar.png`
2. فحص أذونات ملفات الصور
3. تأكد من إعدادات next.config.js

### مشكلة: بطء في التحميل
**الحل:**
1. استخدم `priority={true}` للصور المهمة
2. استخدم `sizes` attribute للصور المتجاوبة
3. فعل تحسين الصور في next.config.js

## 📊 مراقبة الأداء

```tsx
// إضافة logging للمراقبة
import { getImageInfo } from '@/utils/image-url-validator';

const imageInfo = getImageInfo(imageUrl);
console.log('معلومات الصورة:', imageInfo);
```

## 🎨 تخصيص إضافي

### إضافة fallback مخصص للنوادي:
```tsx
<SafeImage 
  src={club.logo_url}
  fallbackSrc="/images/club-avatar.png"
  alt="شعار النادي"
/>
```

### إضافة placeholder للتحميل:
```tsx
<SafeImage 
  src={image.url}
  className="bg-gray-200 animate-pulse"
  alt="صورة"
/>
```

## 📱 للهواتف المحمولة

```tsx
<SafeImage 
  src={player.image}
  sizes="(max-width: 768px) 100vw, 50vw"
  className="w-full h-auto"
  alt="صورة اللاعب"
/>
```

## 🔄 الصيانة الدورية

### أسبوعياً:
- تشغيل `window.checkTestImages()` للفحص

### شهرياً:
- مراجعة logs للصور المكسورة
- تنظيف روابط Supabase القديمة

### عند التحديث:
- فحص الروابط الجديدة قبل النشر
- اختبار الصور على أجهزة مختلفة

---

💡 **نصيحة:** احتفظ بهذا الدليل مرجعاً لك ولفريقك عند التعامل مع مشاكل الصور مستقبلاً. 