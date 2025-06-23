import { NextResponse } from 'next/server';

// أنماط الروابط المكسورة
const BROKEN_IMAGE_PATTERNS = [
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
];

// فحص الروابط المكسورة
const isBrokenImageUrl = (url) => {
  if (!url || typeof url !== 'string') return true;
  return BROKEN_IMAGE_PATTERNS.some(pattern => url.includes(pattern)) ||
         url.length < 10 || !url.startsWith('http');
};

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  
  // فلتر طلبات الصور المكسورة
  if (pathname.startsWith('/_next/image')) {
    const imageUrl = searchParams.get('url');
    
    if (imageUrl) {
      const decodedUrl = decodeURIComponent(imageUrl);
      
      if (isBrokenImageUrl(decodedUrl)) {
        console.warn('🚨 حجب رابط صورة مكسور:', decodedUrl);
        
        // إعادة توجيه إلى الصورة الافتراضية
        const newUrl = new URL('/_next/image', request.url);
        newUrl.searchParams.set('url', '/images/default-avatar.png');
        newUrl.searchParams.set('w', searchParams.get('w') || '96');
        newUrl.searchParams.set('q', searchParams.get('q') || '75');
        
        return NextResponse.redirect(newUrl);
      }
    }
  }
  
  // إضافة المسار الحالي إلى headers للطلبات الأخرى
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths including:
     * - all pages (for pathname header)
     * - _next/image (for image filtering)
     * - api routes (excluded)
     * - _next/static (excluded)
     * - favicon.ico (excluded)
     */
    '/((?!api|_next/static|favicon.ico).*)',
    '/_next/image',
  ],
}; 