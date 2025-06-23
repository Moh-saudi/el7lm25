import { NextRequest, NextResponse } from 'next/server';

// أنماط الروابط المكسورة المعروفة
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

// فحص إذا كان رابط الصورة مكسور
const isBrokenImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  
  return BROKEN_IMAGE_PATTERNS.some(pattern => url.includes(pattern)) ||
         url.length < 10 ||
         !url.startsWith('http');
};

// معالج middleware للصور
export function imageFilterMiddleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // التحقق من طلبات Next.js image optimization
  if (pathname.startsWith('/_next/image')) {
    const imageUrl = searchParams.get('url');
    
    if (imageUrl) {
      const decodedUrl = decodeURIComponent(imageUrl);
      
      // إذا كان الرابط مكسور، أعد توجيه إلى الصورة الافتراضية
      if (isBrokenImageUrl(decodedUrl)) {
        console.warn('🚨 تم حجب رابط صورة مكسور:', decodedUrl);
        
        // إنشاء URL للصورة الافتراضية
        const defaultImageUrl = new URL(request.nextUrl);
        defaultImageUrl.searchParams.set('url', encodeURIComponent('/images/default-avatar.png'));
        defaultImageUrl.searchParams.set('w', '96');
        defaultImageUrl.searchParams.set('q', '75');
        
        return NextResponse.redirect(defaultImageUrl);
      }
    }
  }
  
  return NextResponse.next();
}

export default imageFilterMiddleware; 