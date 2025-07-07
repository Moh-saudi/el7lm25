# 🔧 دليل إصلاح صور Supabase

## 🚨 المشكلة الحالية:
أخطاء مستمرة في تحميل الصور من Supabase:
- `⨯ upstream image response failed for https://ekyerljzfokqimbabzxm.supabase.co/.../ 400`
- `⨯ upstream image response failed for https://test-url.com/test-image.jpg 403`

## 🎯 الحل السريع (3 دقائق):

### الطريقة الأولى - الصفحة التفاعلية:
1. **افتح المتصفح:** `http://localhost:3000/supabase-fix.html`
2. **انتظر تحميل النظام** (سيظهر "النظام جاهز")
3. **اضغط "فحص الصور"** لرؤية المشاكل
4. **اضغط "إصلاح الصور"** للحل الفوري
5. **أعد تشغيل الخادم:** `npm run dev`

### الطريقة الثانية - Console:
1. **افتح المتصفح** على `http://localhost:3000`
2. **اضغط F12** لفتح Developer Tools
3. **اذهب لتبويب Console**
4. **انسخ والصق الكود التالي:**

```javascript
// إصلاح سريع لصور Supabase
(async function() {
    console.log('🚀 بدء الإصلاح...');
    try {
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
        const supabase = createClient(
            'https://ekyerljzfokqimbabzxm.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY'
        );
        
        const { data: players, error } = await supabase
            .from('players')
            .select('id, full_name, profile_image_url, profile_image, avatar_url');
        
        if (error) throw error;
        console.log(`📊 فحص ${players.length} لاعب`);
        
        let fixed = 0;
        for (const player of players) {
            const updates = {};
            let needsUpdate = false;
            
            const isBad = (url) => !url || url.includes('test-url.com') || 
                url.includes('undefined') || url.includes('null');
            
            if (isBad(player.profile_image_url)) {
                updates.profile_image_url = '/images/default-avatar.png';
                needsUpdate = true;
            }
            if (isBad(player.profile_image)) {
                updates.profile_image = '/images/default-avatar.png';
                needsUpdate = true;
            }
            if (isBad(player.avatar_url)) {
                updates.avatar_url = '/images/default-avatar.png';
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await supabase.from('players').update(updates).eq('id', player.id);
                fixed++;
                console.log(`✅ ${player.full_name || player.id}`);
            }
        }
        
        console.log(`🎉 تم إصلاح ${fixed} صورة!`);
        if (fixed > 0) {
            console.log('💡 أعد تشغيل الخادم: npm run dev');
            setTimeout(() => window.location.reload(), 3000);
        }
    } catch (error) {
        console.error('❌', error);
    }
})();
```

5. **اضغط Enter** وانتظر النتائج
6. **أعد تشغيل الخادم** بعد الانتهاء

## 📊 النتائج المتوقعة:
- ✅ اختفاء جميع أخطاء الصور
- ✅ ظهور الصور الافتراضية بدلاً من المكسورة
- ✅ تحسن أداء التطبيق
- ✅ عدم ظهور 404 errors في الكونسول

## 🔄 بعد الإصلاح:
1. **أعد تشغيل الخادم:** `npm run dev`
2. **امسح cache المتصفح:** `Ctrl + Shift + R`
3. **تحقق من الصفحات المختلفة**
4. **تأكد من اختفاء الأخطاء**

## 🛠️ للمستقبل:
- استخدم مكون `SafeImage` للصور الجديدة
- فحص الروابط قبل حفظها في قاعدة البيانات
- استخدم `image-url-validator` utility

## 📞 في حالة المشاكل:
1. تأكد من اتصال الإنترنت
2. تحقق من صحة مفاتيح Supabase
3. تأكد من وجود جدول `players` في قاعدة البيانات
4. جرّب مسح cache: `.next` folder

---

💡 **نصيحة:** احفظ هذا الدليل لاستخدامه مستقبلاً عند ظهور مشاكل مشابهة. 
