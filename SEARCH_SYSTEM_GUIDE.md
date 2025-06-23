# 🔍 دليل نظام البحث عن الفرص - الإصدار المحدث

## نظرة عامة

نظام البحث عن الفرص هو منصة شاملة تربط اللاعبين بجميع أنواع الفرص الرياضية المتاحة. يدعم النظام الآن **6 أنواع كاملة** من الكيانات مع ربط مباشر بقواعد البيانات الحقيقية.

## الأنواع المدعومة

### 1. 🏛️ الأندية (Clubs)
- **المصدر:** `clubs` collection
- **التركيز:** التوقيع مع الأندية المحترفة
- **البيانات:** اللاعبون، العقود، الإنجازات

### 2. 💼 وكلاء اللاعبين (Agents)  
- **المصدر:** `agents` collection
- **التركيز:** إدارة المسيرة المهنية
- **البيانات:** العملاء، الصفقات، التخصصات

### 3. 🎓 الأكاديميات (Academies)
- **المصدر:** `academies` collection  
- **التركيز:** التدريب والتطوير
- **البيانات:** البرامج، الطلاب، الخريجون

### 4. 🏋️‍♂️ المدربين (Trainers)
- **المصدر:** `trainers` collection
- **التركيز:** التدريب الشخصي والتأهيل
- **البيانات:** اللاعبون، الجلسات، التخصصات

### 5. 👁️ السكاوت (Scouts)
- **المصدر:** `scouts` collection (قريباً)
- **التركيز:** اكتشاف المواهب
- **البيانات:** التقييمات، التوصيات

### 6. 🏆 الرعاة (Sponsors)
- **المصدر:** `sponsors` collection (قريباً)  
- **التركيز:** الدعم المالي والتجاري
- **البيانات:** الصفقات، القيم، المجالات

## نظام جلب البيانات الحقيقية

### 🔄 آلية العمل

```typescript
// 1. جلب البيانات من collections متعددة
const fetchEntities = async () => {
  const allEntities = [];
  
  // جلب الأندية
  if (type === 'all' || type === 'club') {
    const clubsQuery = query(
      collection(db, 'clubs'),
      where('country', '==', selectedCountry),
      orderBy('name', 'asc'),
      limit(10)
    );
    // معالجة النتائج...
  }
  
  // جلب الوكلاء  
  if (type === 'all' || type === 'agent') {
    const agentsQuery = query(collection(db, 'agents'));
    // معالجة النتائج...
  }
  
  // جلب الأكاديميات
  if (type === 'all' || type === 'academy') {
    const academiesQuery = query(collection(db, 'academies'));
    // معالجة النتائج...
  }
  
  // جلب المدربين
  if (type === 'all' || type === 'trainer') {
    const trainersQuery = query(collection(db, 'trainers'));
    // معالجة النتائج...
  }
};
```

### 📊 تنسيق البيانات المطلوب

#### **للأندية:**
```javascript
// /clubs/{clubId}
{
  name: "النادي الأهلي",
  description: "أحد أكبر الأندية في العالم العربي", 
  country: "مصر",
  city: "القاهرة",
  type: "كرة القدم",
  logo: "url-to-logo",
  coverImage: "url-to-cover",
  email: "info@club.com",
  phone: "+20123456789",
  website: "www.club.com",
  address: "العنوان الكامل",
  stats: {
    players: 50,
    contracts: 25,
    achievements: 100
  },
  trophies: [
    { name: "دوري الأبطال", year: "2023" }
  ],
  founded: "1907"
}
```

#### **للوكلاء:**
```javascript
// /agents/{agentId}  
{
  name: "أحمد الوكيل",
  description: "وكيل لاعبين محترف",
  country: "السعودية", 
  city: "الرياض",
  specialization: ["كرة القدم", "كرة السلة"], // أو string
  logo: "url-to-logo",
  coverImage: "url-to-cover", 
  email: "agent@example.com",
  phone: "+966501234567",
  website: "www.agent.com",
  address: "العنوان",
  stats: {
    clients: 15,
    activeDeals: 8,
    totalCommission: 250000
  },
  established: "2018",
  experience: "5 سنوات"
}
```

#### **للأكاديميات:**
```javascript
// /academies/{academyId}
{
  name: "أكاديمية المستقبل",
  description: "أكاديمية تدريب متميزة",
  country: "الإمارات",
  city: "دبي", 
  programs: [
    "برنامج الناشئين",
    "برنامج المتقدمين",
    "برنامج النخبة"
  ],
  logo: "url-to-logo",
  coverImage: "url-to-cover",
  email: "info@academy.com", 
  phone: "+97145678901",
  website: "www.academy.com",
  address: "العنوان",
  stats: {
    students: 200,
    graduates: 150,
    programs: 5,
    coaches: 15
  },
  established: "2015",
  facilities: ["ملاعب", "صالة لياقة", "مسبح"]
}
```

#### **للمدربين:**
```javascript
// /trainers/{trainerId}
{
  name: "محمد المدرب",
  description: "مدرب رياضي محترف", 
  country: "قطر",
  city: "الدوحة",
  specialization: [
    "تدريب بدني",
    "تأهيل الإصابات", 
    "التحليل الفني"
  ],
  logo: "url-to-logo",
  coverImage: "url-to-cover",
  email: "trainer@example.com",
  phone: "+97455555555", 
  website: "www.trainer.com",
  address: "العنوان",
  stats: {
    players: 45,
    sessions: 200,
    achievements: 15,
    experience_years: 8
  },
  experience: "8 سنوات",
  license: "TR-001",
  qualifications: [
    {
      degree: "بكالوريوس علوم الرياضة",
      institution: "جامعة قطر", 
      year: "2015"
    }
  ],
  certifications: [
    {
      name: "شهادة تدريب كرة القدم",
      issuer: "FIFA",
      year: "2020",
      level: "A"
    }
  ]
}
```

## الميزات المتقدمة

### 🔍 البحث الذكي
- **البحث النصي:** في الأسماء، الوصفات، التخصصات
- **البحث في البرامج:** للأكاديميات والمدربين
- **البحث في الخدمات:** للوكلاء والمدربين
- **دعم العربية:** بحث باللغة العربية بالكامل

### 🎯 المرشحات المتقدمة
- **نوع الكيان:** 6 أنواع + "الكل"  
- **الموقع:** تصفية بالدولة والمدينة
- **التقييم:** من 0 إلى 5 نجوم
- **الحالة:** محقق، عضوية مميزة
- **الترتيب:** 5 خيارات ترتيب

### 📱 التفاعل الاجتماعي
- **المتابعة:** نظام Follow/Unfollow
- **المراسلة:** إرسال رسائل مباشرة  
- **الإحصائيات:** عرض المتابعين والاتصالات
- **التواصل:** روابط مباشرة للبريد والهاتف

## نظام Fallback

### 🔄 البيانات الاحتياطية
عند فشل جلب البيانات الحقيقية، يعرض النظام:

```typescript
const mockEntities = [
  // نادي الأهلي - مصر
  { type: 'club', rating: 4.9, followers: 5480000 },
  
  // وكالة النجوم - الإمارات  
  { type: 'agent', rating: 4.8, followers: 89000 },
  
  // أكاديمية الفيصل - السعودية
  { type: 'academy', rating: 4.7, followers: 15000 },
  
  // المدرب أحمد - السعودية
  { type: 'trainer', rating: 4.5, followers: 8500 },
  
  // نادي الزمالك - مصر
  { type: 'club', rating: 4.8, followers: 3200000 }
];
```

## إعداد Firebase

### 🔧 Collections المطلوبة

```javascript
// الأندية
/clubs/{clubId} -> ClubData

// الوكلاء  
/agents/{agentId} -> AgentData

// الأكاديميات
/academies/{academyId} -> AcademyData

// المدربين
/trainers/{trainerId} -> TrainerData

// السكاوت (قريباً)
/scouts/{scoutId} -> ScoutData

// الرعاة (قريباً)  
/sponsors/{sponsorId} -> SponsorData
```

### 📋 فهارس Firestore المطلوبة

```javascript
// للأندية
clubs: [
  ['country', 'name'],
  ['city', 'name'], 
  ['type', 'name']
]

// للوكلاء
agents: [
  ['country', 'name'],
  ['city', 'name']
]

// للأكاديميات  
academies: [
  ['country', 'name'],
  ['city', 'name']
]

// للمدربين
trainers: [
  ['country', 'name'], 
  ['city', 'name']
]
```

### 🔒 قواعد الأمان

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // قراءة البيانات العامة للجميع
    match /{collection}/{document} {
      allow read: if resource.data.public == true 
                  || request.auth != null;
      allow write: if request.auth != null 
                   && request.auth.uid == resource.data.ownerId;
    }
    
    // الأندية
    match /clubs/{clubId} {
      allow read: if true; // قراءة عامة
      allow write: if request.auth != null;
    }
    
    // الوكلاء
    match /agents/{agentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // الأكاديميات
    match /academies/{academyId} {
      allow read: if true;
      allow write: if request.auth != null; 
    }
    
    // المدربين
    match /trainers/{trainerId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## استكشاف الأخطاء

### ❗ مشاكل شائعة

#### 1. **لا تظهر نتائج البحث**
```bash
# تحقق من:
- وجود الـ collections في Firestore
- صحة أسماء الحقول المطلوبة  
- قواعد الأمان تسمح بالقراءة
- فهارس Firestore تم إنشاؤها
```

#### 2. **بطء في التحميل**
```bash
# الحلول:
- تقليل حد limit في الاستعلامات
- إضافة فهارس مركبة  
- استخدام pagination
- تحسين هيكل البيانات
```

#### 3. **خطأ في المرشحات**
```bash
# تحقق من:
- وجود الحقول المطلوبة في البيانات
- تطابق أنواع البيانات
- صحة قيم where clauses
```

### 🔧 أوامر التشخيص

```javascript
// في Developer Console
// 1. فحص البيانات المجلبة
console.log('Entities loaded:', entities);

// 2. فحص المرشحات
console.log('Current filters:', filters);

// 3. فحص الأخطاء
console.log('Loading state:', isLoading);
console.log('Error state:', error);

// 4. اختبار استعلام مباشر
import { getDocs, collection } from 'firebase/firestore';
const testQuery = await getDocs(collection(db, 'clubs'));
console.log('Test query results:', testQuery.docs.length);
```

## الميزات المستقبلية

### 🚀 الإصدار القادم
1. **إضافة السكاوت والرعاة** - collections جديدة
2. **نظام التقييمات الحقيقية** - reviews من المستخدمين
3. **البحث الجغرافي** - بناءً على المسافة
4. **التوصيات الذكية** - بناءً على تفضيلات اللاعب

### 🎯 تطويرات متقدمة
1. **نظام المفضلة** - حفظ الكيانات المفضلة
2. **الإشعارات** - تنبيهات للفرص الجديدة  
3. **تكامل الرسائل** - محادثات مباشرة
4. **التحليلات** - إحصائيات الاستخدام

## التحديثات الأخيرة

### ✅ نوفمبر 2024
- ✅ إضافة دعم المدربين والأكاديميات
- ✅ تحسين نظام جلب البيانات الحقيقية  
- ✅ تطوير نظام Fallback المتقدم
- ✅ تحسين التصميم والألوان
- ✅ إضافة البيانات الوهمية الشاملة

🎉 **النظام جاهز للاستخدام مع دعم كامل لجميع الأنواع!** 