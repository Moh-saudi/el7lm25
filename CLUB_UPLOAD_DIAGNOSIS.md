# 🔍 تشخيص مشاكل رفع الفيديوهات والصور للأندية

## اللاعب المتأثر
- **ID**: `hChYVnu04cXe3KK8JJQu`
- **صفحة التعديل**: `http://localhost:3000/dashboard/club/players/add?edit=hChYVnu04cXe3KK8JJQu`

## المشاكل المكتشفة

### 1. ❌ مشكلة في دالة رفع الفيديو
**الموقع**: `src/app/dashboard/club/players/add/page.tsx:323-350`

**المشكلة الحالية**:
```typescript
const result = await clubUpload.document(file, user.uid, 'video');
```

**المشاكل**:
- يستخدم `clubUpload.document` بدلاً من دالة مخصصة للفيديوهات
- `clubUpload.video` تتطلب `playerId` كمعامل ثالث غير متوفر
- لا يوجد معالجة صحيحة لأنواع الفيديوهات المختلفة

### 2. ❌ مشكلة في بوكتات Supabase
**الموقع**: `src/lib/firebase/upload-media.ts:1-20`

**البوكتات المطلوبة**:
- `playerclub` - للأندية
- `playertrainer` - للمدربين  
- `playeragent` - للوكلاء
- `playeracademy` - للأكاديميات

**المشكلة**: هذه البوكتات قد لا تكون موجودة في Supabase Dashboard

### 3. ❌ مشكلة في تعريف الأنواع (TypeScript)
**الموقع**: `src/app/dashboard/club/players/add/page.tsx:90,131`

**الأخطاء**:
- `Type 'null' is not assignable to type 'Date | undefined'`
- `videos` و `additional_images` قد تكون `undefined`

## الحلول المقترحة

### 1. 🔧 إصلاح دالة رفع الفيديو

```typescript
// الحل الأول: إنشاء دالة مخصصة
const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user?.uid) return;

  setIsUploadingMedia(true);
  try {
    // استخدام دالة مخصصة لرفع الفيديوهات
    const result = await uploadVideoForClub(file, user.uid);
    
    if (result?.url) {
      const newVideo = {
        url: result.url,
        desc: file.name || 'فيديو مرفوع',
        type: 'file',
        uploaded_at: new Date().toISOString(),
        size: file.size,
        format: file.type
      };

      setFormData(prev => ({
        ...prev,
        videos: [...(prev.videos || []), newVideo]
      }));

      toast.success('تم رفع الفيديو بنجاح');
    }
  } catch (error) {
    console.error('خطأ في رفع الفيديو:', error);
    toast.error('فشل في رفع الفيديو: ' + error.message);
  } finally {
    setIsUploadingMedia(false);
  }
};

// دالة مخصصة لرفع الفيديوهات
async function uploadVideoForClub(file: File, clubId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `videos/${clubId}/${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('playerclub')
    .upload(filePath, file, { upsert: false });
    
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('playerclub')
    .getPublicUrl(filePath);
    
  return { url: data.publicUrl, name: file.name };
}
```

### 2. 🔧 إنشاء البوكتات في Supabase

**الخطوات**:
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر المشروع
3. اذهب إلى Storage -> Buckets
4. أنشئ البوكتات التالية:

```sql
-- في SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('playerclub', 'playerclub', true),
  ('playertrainer', 'playertrainer', true),
  ('playeragent', 'playeragent', true),
  ('playeracademy', 'playeracademy', true);
```

### 3. 🔧 إعداد Storage Policies

```sql
-- Policy للقراءة العامة
CREATE POLICY "Allow public read access" ON storage.objects 
FOR SELECT USING (true);

-- Policy للرفع للمستخدمين المسجلين
CREATE POLICY "Allow authenticated uploads" ON storage.objects 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy للتحديث للمستخدمين المسجلين
CREATE POLICY "Allow authenticated updates" ON storage.objects 
FOR UPDATE WITH CHECK (auth.uid() IS NOT NULL);

-- Policy للحذف للمستخدمين المسجلين
CREATE POLICY "Allow authenticated deletes" ON storage.objects 
FOR DELETE WITH CHECK (auth.uid() IS NOT NULL);
```

## خطوات التشخيص

### 1. 🔍 فحص البوكتات
```javascript
// في Browser Console
const { data: buckets, error } = await supabase.storage.listBuckets();
console.log('البوكتات المتاحة:', buckets);
```

### 2. 🔍 اختبار الرفع
```javascript
// اختبار رفع ملف تجريبي
const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
const { data, error } = await supabase.storage
  .from('playerclub')
  .upload('test.txt', testFile);
console.log('نتيجة الاختبار:', { data, error });
```

### 3. 🔍 فحص الصلاحيات
```javascript
// فحص صلاحيات الرفع
const { data: user } = await supabase.auth.getUser();
console.log('المستخدم الحالي:', user);
```

## الاختبار النهائي

### الخطوات:
1. اذهب إلى الصفحة: `http://localhost:3000/dashboard/club/players/add?edit=hChYVnu04cXe3KK8JJQu`
2. افتح Developer Tools (F12)
3. اذهب إلى تبويب Console
4. نفذ ملف التشخيص: `public/js/supabase-buckets-test.js`
5. اتبع التعليمات في الكونسول

### النتائج المتوقعة:
- ✅ البوكتات موجودة ويمكن الوصول إليها
- ✅ الرفع يعمل بنجاح
- ✅ الروابط العامة تعمل
- ✅ لا توجد أخطاء في الكونسول

## الملفات المتأثرة

1. `src/app/dashboard/club/players/add/page.tsx` - الصفحة الرئيسية
2. `src/lib/firebase/upload-media.ts` - دوال الرفع
3. `src/lib/supabase/client.tsx` - إعدادات Supabase
4. `public/js/supabase-buckets-test.js` - ملف التشخيص

## الخطوات التالية

1. **نفذ ملف التشخيص** لتحديد المشكلة بدقة
2. **أنشئ البوكتات المطلوبة** في Supabase Dashboard
3. **اختبر الرفع** مع ملف تجريبي
4. **طبق الإصلاحات** المقترحة للكود
5. **اختبر الوظائف** مع ملفات حقيقية

---

**تاريخ التشخيص**: اليوم  
**الأولوية**: عالية  
**الحالة**: في انتظار التنفيذ 
