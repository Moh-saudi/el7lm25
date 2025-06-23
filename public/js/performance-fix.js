/**
 * 🚀 HAGZZ GO - نظام تحسين الأداء الشامل
 * حل مشكلة التحميل البطيء وتحسين تجربة المستخدم
 */

// 🚀 نظام تحسين الأداء الشامل (بدون console logs مزعجة)

class PerformanceOptimizer {
  constructor() {
    this.startTime = performance.now();
    this.isOptimized = false;
    this.init();
  }

  async init() {
    // تحسينات فورية
    this.immediateOptimizations();
    
    // تحسينات مؤجلة بعد تحميل الصفحة
    window.addEventListener('load', () => {
      setTimeout(() => this.deferredOptimizations(), 100);
    });
    
    // تحسينات تفاعلية
    this.setupInteractiveOptimizations();
    
    // مراقبة الأداء
    this.setupPerformanceMonitoring();
  }

  immediateOptimizations() {
    // تطبيق التحسينات الفورية
    this.optimizeFontLoading();
    this.optimizeImageLoading();
    this.optimizeCSS();
    this.removeUnusedResources();
  }

  deferredOptimizations() {
    // تطبيق التحسينات المؤجلة
    this.cleanupDOM();
    this.optimizeEventListeners();
    this.optimizeMemory();
    this.optimizeNetwork();
    
    this.isOptimized = true;
    // تم اكتمال تحسين الأداء بنجاح
  }

  optimizeFontLoading() {
    // تحميل مسبق للخطوط الأساسية فقط
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap'
    ];
    
    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'style';
      link.onload = () => link.rel = 'stylesheet';
      document.head.appendChild(link);
    });
  }

  optimizeImageLoading() {
    // Lazy loading لجميع الصور
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.loading = 'lazy';
      img.decoding = 'async';
    });

    // تحسين أحجام الصور
    const largeImages = document.querySelectorAll('img[src*="logo"], img[src*="avatar"]');
    largeImages.forEach(img => {
      if (img.naturalWidth > 200) {
        img.style.maxWidth = '200px';
        img.style.height = 'auto';
      }
    });
  }

  optimizeCSS() {
    // إزالة الـ CSS غير المستخدم
    const unusedSelectors = [
      '.hidden-element',
      '.old-class',
      '.unused-component'
    ];
    
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach((rule, index) => {
          if (rule.selectorText && unusedSelectors.some(sel => 
            rule.selectorText.includes(sel))) {
            sheet.deleteRule(index);
          }
        });
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    });
  }

  removeUnusedResources() {
    // إزالة الـ scripts غير الضرورية
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.src;
      if (src.includes('analytics') || src.includes('tracking')) {
        // تأجيل تحميل Analytics
        script.defer = true;
      }
    });
  }

  cleanupDOM() {
    // إزالة العناصر المخفية نهائياً
    const hiddenElements = document.querySelectorAll('[style*="display: none"]');
    hiddenElements.forEach(el => {
      if (!el.classList.contains('important')) {
        el.remove();
      }
    });

    // تنظيف التعليقات
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );
    
    const comments = [];
    let node;
    while (node = walker.nextNode()) {
      comments.push(node);
    }
    
    comments.forEach(comment => {
      comment.parentNode?.removeChild(comment);
    });
  }

  optimizeEventListeners() {
    // استخدام Event Delegation للأداء الأفضل
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // معالجة أزرار الدفع
      if (target && target.matches && target.matches('[data-payment-button]')) {
        this.handlePaymentButtonClick(target);
      }
      
      // معالجة اختيار اللاعبين
      if (target && target.matches && target.matches('[data-player-select]')) {
        this.handlePlayerSelection(target);
      }
    }, { passive: true });
  }

  optimizeMemory() {
    // تنظيف دوري للذاكرة
    setInterval(() => {
      // إزالة Event Listeners المعطلة
      const elements = document.querySelectorAll('[data-cleanup]');
      elements.forEach(el => {
        const clone = el.cloneNode(true);
        el.parentNode?.replaceChild(clone, el);
      });
      
      // تنظيف الـ cache
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('old') || name.includes('temp')) {
              caches.delete(name);
            }
          });
        });
      }
    }, 300000); // كل 5 دقائق
  }

  optimizeNetwork() {
    // Prefetch للصفحات المهمة
    const importantUrls = [
      '/dashboard/club/players',
      '/dashboard/club/payment',
      '/api/geidea/config'
    ];
    
    importantUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

    // تحسين Fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      return originalFetch(url, {
        ...options,
        keepalive: true,
        cache: 'force-cache'
      });
    };
  }

  setupInteractiveOptimizations() {
    // تحسين التمرير
    let ticking = false;
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // تحسينات التمرير هنا
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', optimizeScroll, { passive: true });
    
    // تحسين تغيير الحجم
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 150);
    }, { passive: true });
  }

  setupPerformanceMonitoring() {
    // مراقبة الأداء في الوقت الفعلي
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 100) {
          console.warn(`⚠️ عملية بطيئة: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    // تقرير دوري عن الأداء
    setInterval(() => {
      this.reportPerformance();
    }, 30000); // كل 30 ثانية
  }

  handlePaymentButtonClick(button) {
    // تحسين معالجة أزرار الدفع
    if (button && button.style) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    }
  }

  handlePlayerSelection(element) {
    // تحسين اختيار اللاعبين
    if (element && element.classList) {
      element.classList.add('selecting');
      setTimeout(() => {
        element.classList.remove('selecting');
      }, 200);
    }
  }

  handleResize() {
    // إعادة حساب التخطيطات
    const cards = document.querySelectorAll('.payment-card');
    cards.forEach(card => {
      if (card && card.style) {
        card.style.transform = 'translateZ(0)';
      }
    });
  }

  reportPerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      if (loadTime > 10000) { // فقط للحالات البطيئة جداً
        this.suggestOptimizations();
      }
    }
  }

  suggestOptimizations() {
    // اقتراحات تحسين متاحة داخلياً (بدون console logs)
    return [
      'تفعيل ضغط GZIP على الخادم',
      'استخدام CDN للملفات الثابتة',
      'تحسين أحجام الصور',
      'تقليل عدد طلبات HTTP',
      'استخدام Service Worker للتخزين المؤقت'
    ];
  }

  // API عامة للاستخدام الخارجي
  getPerformanceScore() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return 50; // نقاط افتراضية
    
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    
    let score = 100;
    if (loadTime > 1000) score -= 10;
    if (loadTime > 3000) score -= 20;
    if (loadTime > 5000) score -= 30;
    if (loadTime > 10000) score -= 40;
    
    return Math.max(0, score);
  }

  forceOptimize() {
    this.immediateOptimizations();
    this.deferredOptimizations();
  }
}

// تشغيل المحسن
const performanceOptimizer = new PerformanceOptimizer();

// إتاحة عامة للتحكم
window.performanceOptimizer = performanceOptimizer;
window.optimizeNow = () => performanceOptimizer.forceOptimize();
window.getPerformanceScore = () => performanceOptimizer.getPerformanceScore();

// نظام تحسين الأداء جاهز وجميع الأدوات متاحة 