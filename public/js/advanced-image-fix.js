// 🛠️ أداة إصلاح الصور المتقدمة - HAGZZ GO
// يمكن تشغيلها مباشرة في console المتصفح

// فحص إذا كانت الأداة محملة مسبقاً
if (window.imageFix && window.imageFix.constructor.name === 'ImageFixTool') {
  console.log('⚠️ أداة إصلاح الصور محملة مسبقاً - سيتم استخدام النسخة الموجودة');
} else {
  console.log('🛠️ تحميل أداة إصلاح الصور المتقدمة...');

  class ImageFixTool {
    constructor() {
      this.fixedCount = 0;
      this.brokenUrls = [];
      this.startTime = Date.now();
      
      console.log('✅ أداة إصلاح الصور جاهزة!');
      console.log('💡 الأوامر المتاحة:');
      console.log('   - window.imageFix.scanImages() - فحص الصور');
      console.log('   - window.imageFix.fixAllImages() - إصلاح جميع الصور');
      console.log('   - window.imageFix.fixDomImages() - إصلاح صور DOM فقط');
      console.log('   - window.imageFix.getReport() - تقرير مفصل');
      console.log('   - window.imageFix.clearTestImages() - حذف الصور الوهمية');
    }

    // فحص الروابط المكسورة
    isBrokenUrl(url) {
      if (!url || typeof url !== 'string') return true;
      
      const brokenPatterns = [
        'test-url.com',
        'example.com', 
        'placeholder.com',
        'fake-image',
        'dummy-image',
        'undefined',
        'null',
        '[object Object]',
        '/avatars/undefined/',
        '/avatars/null/',
        '/avatars//',
        '/profile.png', // ملف غير موجود في Supabase
        '/profile.jpg',
        '/avatar.png',
        '/avatar.jpg'
      ];
      
      return brokenPatterns.some(pattern => url.includes(pattern)) ||
             url.length < 10 ||
             !url.startsWith('http');
    }

    // فحص جميع الصور في الصفحة
    scanImages() {
      console.log('🔍 بدء فحص الصور...');
      
      const images = document.querySelectorAll('img');
      const brokenImages = [];
      const goodImages = [];
      
      images.forEach((img, index) => {
        const imageInfo = {
          element: img,
          index: index,
          src: img.src,
          alt: img.alt,
          className: img.className,
          isBroken: this.isBrokenUrl(img.src)
        };
        
        if (imageInfo.isBroken) {
          brokenImages.push(imageInfo);
        } else {
          goodImages.push(imageInfo);
        }
      });
      
      this.brokenUrls = brokenImages.map(img => img.src);
      
      console.log(`📊 نتائج الفحص:`);
      console.log(`   ✅ سليمة: ${goodImages.length}`);
      console.log(`   ❌ مكسورة: ${brokenImages.length}`);
      console.log(`   📦 إجمالي: ${images.length}`);
      
      if (brokenImages.length > 0) {
        console.log('🔍 الصور المكسورة:');
        brokenImages.forEach(img => {
          console.log(`   - ${img.src} (عنصر ${img.index})`);
        });
      }
      
      return {
        total: images.length,
        good: goodImages.length,
        broken: brokenImages.length,
        brokenImages: brokenImages,
        goodImages: goodImages
      };
    }

    // إصلاح صور DOM
    fixDomImages() {
      console.log('🚀 بدء إصلاح الصور في DOM...');
      
      const images = document.querySelectorAll('img');
      let fixedCount = 0;
      
      images.forEach((img, index) => {
        if (this.isBrokenUrl(img.src)) {
          const oldSrc = img.src;
          img.src = '/images/default-avatar.png';
          img.onerror = null; // إزالة معالج الخطأ
          fixedCount++;
          
          console.log(`✅ إصلاح صورة ${index + 1}: ${oldSrc} → /images/default-avatar.png`);
        }
      });
      
      this.fixedCount += fixedCount;
      console.log(`🎉 تم إصلاح ${fixedCount} صورة في DOM`);
      
      return fixedCount;
    }

    // إصلاح شامل (DOM + البيانات)
    async fixAllImages() {
      console.log('🚀 بدء الإصلاح الشامل...');
      
      // إصلاح DOM أولاً
      const domFixed = this.fixDomImages();
      
      // محاولة إصلاح قاعدة البيانات
      try {
        console.log('🔧 محاولة إصلاح قاعدة البيانات...');
        
        if (typeof window.fixDatabaseImages === 'function') {
          await window.fixDatabaseImages();
          console.log('✅ تم إصلاح قاعدة البيانات');
        } else {
          console.log('⚠️ دالة إصلاح قاعدة البيانات غير متوفرة');
          console.log('💡 يمكنك الضغط على زر "إصلاح شامل" في الصفحة');
        }
      } catch (error) {
        console.error('❌ خطأ في إصلاح قاعدة البيانات:', error);
      }
      
      // فحص نهائي
      setTimeout(() => {
        const result = this.scanImages();
        console.log('📋 التقرير النهائي:');
        console.log(`   🔧 تم إصلاح: ${domFixed} صورة`);
        console.log(`   ❌ باقي مكسور: ${result.broken} صورة`);
      }, 1000);
      
      return domFixed;
    }

    // حذف الصور الوهمية من البيانات
    clearTestImages() {
      console.log('🧹 بدء حذف الصور الوهمية...');
      
      const testPatterns = [
        'test-url.com',
        'example.com',
        'placeholder.com'
      ];
      
      let clearedCount = 0;
      
      // فحص Local Storage
      Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        if (value && testPatterns.some(pattern => value.includes(pattern))) {
          localStorage.removeItem(key);
          clearedCount++;
          console.log(`🗑️ حذف من localStorage: ${key}`);
        }
      });
      
      // فحص Session Storage
      Object.keys(sessionStorage).forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value && testPatterns.some(pattern => value.includes(pattern))) {
          sessionStorage.removeItem(key);
          clearedCount++;
          console.log(`🗑️ حذف من sessionStorage: ${key}`);
        }
      });
      
      console.log(`🎉 تم حذف ${clearedCount} عنصر وهمي من التخزين`);
      
      return clearedCount;
    }

    // تقرير مفصل
    getReport() {
      const scanResult = this.scanImages();
      const elapsedTime = ((Date.now() - this.startTime) / 1000).toFixed(1);
      
      console.log('📋 تقرير إصلاح الصور المفصل:');
      console.log('='.repeat(50));
      console.log(`⏱️  وقت التشغيل: ${elapsedTime} ثانية`);
      console.log(`🔧 إجمالي الإصلاحات: ${this.fixedCount}`);
      console.log(`📊 الصور الحالية:`);
      console.log(`   ✅ سليمة: ${scanResult.good}`);
      console.log(`   ❌ مكسورة: ${scanResult.broken}`);
      console.log(`   📦 إجمالي: ${scanResult.total}`);
      
      if (scanResult.broken > 0) {
        console.log('🔍 الصور المكسورة المتبقية:');
        scanResult.brokenImages.forEach((img, index) => {
          console.log(`   ${index + 1}. ${img.src}`);
        });
      }
      
      console.log('='.repeat(50));
      
      return {
        elapsedTime: elapsedTime,
        totalFixed: this.fixedCount,
        currentStats: scanResult,
        brokenUrls: this.brokenUrls
      };
    }

    // تشغيل فحص دوري
    startAutoScan(intervalSeconds = 30) {
      console.log(`🔄 بدء الفحص الدوري كل ${intervalSeconds} ثانية...`);
      
      const interval = setInterval(() => {
        const result = this.scanImages();
        if (result.broken > 0) {
          console.log(`⚠️ تم العثور على ${result.broken} صورة مكسورة - إصلاح تلقائي...`);
          this.fixDomImages();
        }
      }, intervalSeconds * 1000);
      
      this.autoScanInterval = interval;
      return interval;
    }

    // إيقاف الفحص الدوري
    stopAutoScan() {
      if (this.autoScanInterval) {
        clearInterval(this.autoScanInterval);
        console.log('⏹️ تم إيقاف الفحص الدوري');
      }
    }

    // إعادة تعيين الإحصائيات
    reset() {
      this.fixedCount = 0;
      this.brokenUrls = [];
      this.startTime = Date.now();
      if (this.autoScanInterval) {
        this.stopAutoScan();
      }
      console.log('🔄 تم إعادة تعيين الأداة');
    }
  }

  // إنشاء instance عالمي إذا لم يكن موجود
  if (!window.imageFix) {
    window.imageFix = new ImageFixTool();
    
    // اختصارات سريعة
    window.scanImages = () => window.imageFix.scanImages();
    window.fixImages = () => window.imageFix.fixAllImages();
    window.quickFix = () => window.imageFix.fixDomImages();
    
    console.log('🎯 جاهز للاستخدام! جرب: window.imageFix.scanImages()');
    
    // فحص تلقائي عند التحميل
    setTimeout(() => {
      console.log('🔍 فحص تلقائي عند التحميل...');
      const result = window.imageFix.scanImages();
      
      // إصلاح تلقائي إذا وُجدت صور مكسورة
      if (result.broken > 0) {
        console.log('🚀 بدء الإصلاح التلقائي للصور المكسورة...');
        window.imageFix.fixDomImages();
      }
    }, 2000);
  }
} 