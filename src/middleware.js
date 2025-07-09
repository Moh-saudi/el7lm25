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
  
  // Prevent redirect loops by allowing default images to pass through
  if (url.includes('default-avatar.png') || 
      url.includes('club-avatar.png') || 
      url.includes('agent-avatar.png')) {
    return false;
  }
  
  // Allow local URLs (starting with /)
  if (url.startsWith('/')) {
    return BROKEN_IMAGE_PATTERNS.some(pattern => url.includes(pattern));
  }
  
  // For external URLs, must start with http
  return BROKEN_IMAGE_PATTERNS.some(pattern => url.includes(pattern)) ||
         url.length < 10 || !url.startsWith('http');
};

export function middleware(request) {
  try {
    const { pathname, searchParams } = request.nextUrl;
    
    // Filter broken image requests
    if (pathname.startsWith('/_next/image')) {
      const imageUrl = searchParams.get('url');
      
      if (imageUrl) {
        const decodedUrl = decodeURIComponent(imageUrl);
        
        // Only redirect if it's not already a fallback image
        if (isBrokenImageUrl(decodedUrl) && !decodedUrl.includes('default-avatar.png')) {
          console.warn('🚨 Blocked broken image URL:', decodedUrl);
          
          // Redirect to default avatar
          const newUrl = new URL('/_next/image', request.url);
          newUrl.searchParams.set('url', '/default-avatar.png');
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
  } catch (error) {
    console.error('Middleware error:', error);
    // في حالة حدوث خطأ، نمرر الطلب كما هو
    return NextResponse.next();
  }
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
