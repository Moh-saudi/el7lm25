// El7hm Service Worker - Optimized Caching
const CACHE_NAME = 'el7hm-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;

// ملفات للتخزين المؤقت الفوري
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/_next/static/css/',
  '/images/default-avatar.png',
  '/images/club-avatar.png',
  '/manifest.json'
];

// استراتيجيات التخزين المؤقت
const CACHE_STRATEGIES = {
  // الصفحات الرئيسية: Network First
  pages: ['/', '/dashboard', '/auth/login'],
  // الـ API: Network Only
  api: ['/api/'],
  // الملفات الثابتة: Cache First
  static: ['/_next/static/', '/images/', '/icons/'],
  // الخطوط: Cache First
  fonts: ['.woff2', '.woff', '.ttf']
};

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/_next/static/css/')); // تجنب URL غير صحيح
      })
      .then(() => {
        console.log('✅ SW: Installation complete');
        return self.skipWaiting(); // تفعيل فوري
      })
      .catch((error) => {
        console.error('❌ SW: Installation failed:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // حذف cache القديم
            if (cacheName.startsWith('el7hm-') && cacheName !== CACHE_NAME) {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ SW: Activation complete');
        return self.clients.claim(); // السيطرة الفورية
      })
  );
});

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // تخطي طلبات غير GET
  if (method !== 'GET') return;

  // تخطي طلبات chrome-extension
  if (url.startsWith('chrome-extension://')) return;

  // تحديد نوع الطلب
  const requestType = getRequestType(url);

  event.respondWith(
    handleRequest(request, requestType)
      .catch((error) => {
        console.error('❌ SW: Request failed:', url, error);
        return handleOffline(request);
      })
  );
});

// تحديد نوع الطلب
function getRequestType(url) {
  if (url.includes('/api/')) return 'api';
  if (url.includes('/_next/static/')) return 'static';
  if (url.includes('/images/') || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
  if (url.match(/\.(woff2|woff|ttf)$/)) return 'font';
  if (url.includes('firebase') || url.includes('google')) return 'external';
  return 'page';
}

// معالجة الطلبات حسب النوع
async function handleRequest(request, type) {
  const url = request.url;

  switch (type) {
    case 'static':
    case 'font':
      return cacheFirst(request, STATIC_CACHE);
    
    case 'image':
      return cacheFirst(request, IMAGE_CACHE);
    
    case 'api':
      return networkOnly(request);
    
    case 'external':
      return networkFirst(request, DYNAMIC_CACHE);
    
    case 'page':
    default:
      return networkFirst(request, DYNAMIC_CACHE);
  }
}

// استراتيجية Cache First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('📋 SW: Cache hit:', request.url);
    return cached;
  }

  console.log('🌐 SW: Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// استراتيجية Network First
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('🌐 SW: Network first:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('📋 SW: Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// استراتيجية Network Only
async function networkOnly(request) {
  console.log('🌐 SW: Network only:', request.url);
  return fetch(request);
}

// معالجة حالة عدم الاتصال
async function handleOffline(request) {
  const url = new URL(request.url);
  
  // للصفحات: إرجاع صفحة offline
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline');
    
    if (offlinePage) {
      return offlinePage;
    }
  }

  // للصور: إرجاع صورة افتراضية
  if (request.destination === 'image') {
    const cache = await caches.open(IMAGE_CACHE);
    const defaultImage = await cache.match('/images/default-avatar.png');
    
    if (defaultImage) {
      return defaultImage;
    }
  }

  // استجابة افتراضية
  return new Response(
    JSON.stringify({ error: 'Offline - no cached content available' }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// معالجة رسائل من الصفحة الرئيسية
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      if (payload && payload.urls) {
        cacheUrls(payload.urls);
      }
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
  }
});

// تخزين URLs مؤقتاً
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  for (const url of urls) {
    try {
      await cache.add(url);
      console.log('📦 SW: Pre-cached:', url);
    } catch (error) {
      console.warn('⚠️ SW: Failed to pre-cache:', url, error);
    }
  }
}

// مسح جميع التخزين المؤقت
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  
  await Promise.all(
    cacheNames.map(cacheName => {
      console.log('🗑️ SW: Clearing cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
  
  console.log('✅ SW: All caches cleared');
}

// تحديث دوري للـ cache
setInterval(() => {
  console.log('🔄 SW: Performing cache maintenance...');
  
  // تنظيف الـ cache القديم (أكثر من 7 أيام)
  caches.open(DYNAMIC_CACHE).then(cache => {
    // هنا يمكن إضافة منطق تنظيف الـ cache القديم
  });
}, 24 * 60 * 60 * 1000); // كل 24 ساعة

console.log('🚀 SW: Service Worker loaded successfully!'); 
