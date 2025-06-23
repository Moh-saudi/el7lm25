# 🔤 دليل نظام خط Cairo

## 🎯 نظرة عامة

تم تحديث نظام الخطوط لاستخدام خط **Cairo** فقط في جميع أنحاء التطبيق.

## 📝 الخط المستخدم

### خط Cairo:
- **الاستخدام**: جميع النصوص (عربي وإنجليزي)
- **الأماكن**: الأزرار، العناوين، النصوص، حقول الإدخال، الروابط
- **الأوزان**: 300, 400, 500, 600, 700, 800, 900
- **اللغات**: العربية والإنجليزية

## 🚀 كيفية الاستخدام

### Classes الأساسية:

```css
.font-cairo          /* خط Cairo (افتراضي) */
font-light           /* وزن 300 */
font-normal          /* وزن 400 (افتراضي) */
font-medium          /* وزن 500 */
font-semibold        /* وزن 600 */
font-bold            /* وزن 700 */
font-extrabold       /* وزن 800 */
font-black           /* وزن 900 */
```

## ✅ أمثلة عملية

### العناوين:
```jsx
<h1 className="text-4xl font-bold">
  عنوان رئيسي - Main Heading
</h1>

<h2 className="text-2xl font-semibold">
  عنوان فرعي - Subheading
</h2>
```

### النصوص:
```jsx
<p className="text-lg">
  نص عادي عربي و English text
</p>

<p className="text-base font-medium">
  نص متوسط الوزن
</p>
```

### الأزرار:
```jsx
<button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
  زر بخط Cairo
</button>

<button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold">
  Cairo Font Button
</button>
```

### حقول الإدخال:
```jsx
<input 
  placeholder="أدخل النص هنا..."
  className="px-4 py-2 border rounded-lg"
/>

<input 
  placeholder="Enter text here..."
  className="px-4 py-2 border rounded-lg"
/>
```

## 🎨 Tailwind Configuration

تم تحديث `tailwind.config.js`:

```js
fontFamily: {
  'sans': ['var(--font-cairo)', 'Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  'cairo': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
  // جميع الخطوط الأخرى تؤدي إلى Cairo
  'noto-arabic': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
  'poppins': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
  'inter': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
}
```

## ⚡ تحسينات الأداء

- **Font Display: swap** - تحميل سريع وعرض فوري
- **Font Feature Settings** - تحسين الكيرنينغ
- **Font Smoothing** - نصوص ناعمة وواضحة
- **خط واحد فقط** - تحميل أسرع وأداء أفضل

## 📱 الاستجابة

النظام متوافق مع جميع الأحجام:
- **Mobile**: خط واضح ومقروء
- **Tablet**: توازن مثالي
- **Desktop**: تجربة قراءة متميزة

## 🔧 المميزات

### ✅ المزايا:
- خط واحد موحد في كل مكان
- دعم مثالي للعربية والإنجليزية
- أداء سريع (ملف خط واحد)
- مظهر متسق ومهني
- سهولة الصيانة

### 🎯 الاستخدامات:
- العناوين الرئيسية والفرعية
- النصوص العادية والمهمة  
- الأزرار وعناصر التحكم
- حقول الإدخال والنماذج
- الروابط والقوائم
- الجداول والبيانات

## 🎯 اختبار النظام

زر الصفحة التجريبية: `/fonts-test`

لرؤية خط Cairo في جميع الاستخدامات.

## 🚀 التطبيق العملي

### جميع العناصر تستخدم Cairo:
```jsx
// العناوين
<h1>عنوان - Heading</h1>

// النصوص  
<p>نص - Text</p>

// الأزرار
<button>زر - Button</button>

// الحقول
<input placeholder="نص - Text" />

// الروابط
<a href="#">رابط - Link</a>
```

### لا حاجة لـ classes خاصة:
- Cairo هو الافتراضي
- جميع العناصر تستخدمه تلقائياً
- التركيز على الوزن (font-weight) بدلاً من النوع

---

## 📞 دعم

- مكون `FontShowcase.tsx` للأمثلة
- ملف `globals.css` للتعريفات  
- صفحة `/fonts-test` للاختبار

**النتيجة**: خط واحد موحد، أداء ممتاز، مظهر مهني! 🎉 