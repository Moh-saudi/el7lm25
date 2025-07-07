# دليل نظام البوكتات المنفصلة

## نظرة عامة

تم تحديث نظام رفع الملفات ليدعم البوكتات المنفصلة لكل نوع حساب:

- **playertrainer** - للمدربين
- **playerclub** - للأندية  
- **playeragent** - للوكلاء
- **playeracademy** - للأكاديميات

## كيفية الاستخدام

### 1. الاستيراد

```typescript
import { 
  uploadPlayerProfileImage, 
  uploadPlayerAdditionalImage, 
  uploadPlayerDocument, 
  uploadPlayerVideo,
  // الدوال المساعدة لكل نوع حساب
  trainerUpload,
  clubUpload,
  agentUpload,
  academyUpload,
  AccountType 
} from '@/lib/firebase/upload-media';
```

### 2. استخدام الدوال المباشرة مع تحديد نوع الحساب

```typescript
// رفع صورة البروفايل
const result = await uploadPlayerProfileImage(file, userId, 'club');

// رفع صورة إضافية
const result = await uploadPlayerAdditionalImage(file, userId, 'agent');

// رفع مستند
const result = await uploadPlayerDocument(file, userId, 'passport', 'academy');

// رفع فيديو
const result = await uploadPlayerVideo(file, ownerId, playerId, 'trainer');
```

### 3. استخدام الدوال المساعدة (أسهل)

```typescript
// للمدربين
const result = await trainerUpload.profileImage(file, userId);
const result = await trainerUpload.additionalImage(file, userId);
const result = await trainerUpload.document(file, userId, 'passport');
const result = await trainerUpload.video(file, trainerId, playerId);

// للأندية
const result = await clubUpload.profileImage(file, userId);
const result = await clubUpload.additionalImage(file, userId);
const result = await clubUpload.document(file, userId, 'contract');
const result = await clubUpload.video(file, clubId, playerId);

// للوكلاء
const result = await agentUpload.profileImage(file, userId);
const result = await agentUpload.additionalImage(file, userId);
const result = await agentUpload.document(file, userId, 'license');
const result = await agentUpload.video(file, agentId, playerId);

// للأكاديميات
const result = await academyUpload.profileImage(file, userId);
const result = await academyUpload.additionalImage(file, userId);
const result = await academyUpload.document(file, userId, 'certificate');
const result = await academyUpload.video(file, academyId, playerId);
```

### 4. التحديد التلقائي لنوع الحساب

النظام يحدد نوع الحساب تلقائياً من المسار الحالي:

```typescript
// إذا كان المسار يحتوي على /club/ سيستخدم playerclub
// إذا كان المسار يحتوي على /agent/ سيستخدم playeragent
// إذا كان المسار يحتوي على /academy/ سيستخدم playeracademy
// إذا كان المسار يحتوي على /trainer/ سيستخدم playertrainer

// يمكنك الاعتماد على التحديد التلقائي:
const result = await uploadPlayerProfileImage(file, userId); // سيحدد البوكت تلقائياً
```

## أمثلة التطبيق

### في صفحة إضافة لاعب للنادي

```typescript
const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !user?.uid) return;

  setUploadingImage(true);
  try {
    // استخدام الدالة المخصصة للأندية
    const result = await clubUpload.profileImage(file, user.uid);
    if (result?.url) {
      setFormData(prev => ({
        ...prev,
        profile_image: result.url
      }));
      toast.success('تم رفع الصورة الشخصية بنجاح إلى بوكت الأندية');
    }
  } catch (error) {
    console.error('Error uploading profile image:', error);
    toast.error('فشل في رفع الصورة الشخصية');
  } finally {
    setUploadingImage(false);
  }
};
```

### في صفحة إضافة لاعب للوكيل

```typescript
const handleDocumentUpload = async (file: File, documentType: string) => {
  if (!file || !user?.uid) return;

  setUploadingDocument(true);
  try {
    // استخدام الدالة المخصصة للوكلاء
    const result = await agentUpload.document(file, user.uid, documentType);
    if (result?.url) {
      setFormData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), {
          type: documentType,
          url: result.url,
          name: result.name
        }]
      }));
      toast.success(`تم رفع ${documentType} بنجاح إلى بوكت الوكلاء`);
    }
  } catch (error) {
    console.error('Error uploading document:', error);
    toast.error(`فشل في رفع ${documentType}`);
  } finally {
    setUploadingDocument(false);
  }
};
```

## تحديد نوع الحساب من بيانات اللاعب

```typescript
// في صفحة البروفايل للاعب
const getAccountType = (): AccountType => {
  if (playerData?.trainer_id || playerData?.trainerId) return 'trainer';
  if (playerData?.club_id || playerData?.clubId) return 'club';
  if (playerData?.agent_id || playerData?.agentId) return 'agent';
  if (playerData?.academy_id || playerData?.academyId) return 'academy';
  return 'trainer'; // افتراضي
};

// استخدام نوع الحساب المحدد
const handleUpload = async (file: File) => {
  const accountType = getAccountType();
  const result = await uploadPlayerProfileImage(file, user.uid, accountType);
  
  const accountTypeText = accountType === 'trainer' ? 'المدربين' : 
                         accountType === 'club' ? 'الأندية' :
                         accountType === 'agent' ? 'الوكلاء' : 'الأكاديميات';
  
  toast.success(`تم رفع الملف بنجاح إلى بوكت ${accountTypeText}`);
};
```

## الميزات الجديدة

### 1. الحماية من الأخطاء
- يتم رفع الملفات تلقائياً إلى البوكت الصحيح
- رسائل تأكيد توضح البوكت المستخدم
- تحديد تلقائي لنوع الحساب من المسار

### 2. المرونة
- يمكن تحديد نوع الحساب يدوياً
- دوال مساعدة لكل نوع حساب للسهولة
- إمكانية الاعتماد على التحديد التلقائي

### 3. التنظيم
- كل نوع حساب له بوكت منفصل
- تنظيم أفضل للملفات
- سهولة الصيانة والإدارة

## الملفات التي تم تحديثها

1. `src/lib/firebase/upload-media.ts` - النظام الأساسي الجديد
2. `src/app/dashboard/club/players/add/page.tsx` - صفحة إضافة لاعبين للأندية
3. `src/app/dashboard/agent/players/add/page.tsx` - صفحة إضافة لاعبين للوكلاء
4. `src/app/dashboard/academy/players/add/page.tsx` - صفحة إضافة لاعبين للأكاديميات
5. `src/app/dashboard/trainer/players/add/page.tsx` - صفحة إضافة لاعبين للمدربين
6. `src/app/dashboard/player/profile/page.tsx` - صفحة البروفايل للاعبين

## ملاحظات مهمة

1. **البوكتات يجب أن تكون موجودة على Supabase** - تأكد من إنشاء البوكتات التالية:
   - `playertrainer`
   - `playerclub`
   - `playeragent`
   - `playeracademy`

2. **الصلاحيات** - تأكد من أن البوكتات لها صلاحيات القراءة والكتابة المناسبة

3. **التوافق مع النظام القديم** - النظام الجديد متوافق مع الملفات القديمة في `playertrainer`

## البوكتات المطلوبة على Supabase

```sql
-- إنشاء البوكتات المطلوبة
INSERT INTO storage.buckets (id, name, public) VALUES 
('playertrainer', 'Player Trainer Files', true),
('playerclub', 'Player Club Files', true),
('playeragent', 'Player Agent Files', true),
('playeracademy', 'Player Academy Files', true);
```

## نهاية الدليل

النظام الآن جاهز للاستخدام مع البوكتات المنفصلة. كل نوع حساب سيرفع ملفات لاعبيه في بوكت منفصل، مما يضمن تنظيم أفضل وتجنب الأخطاء. 
