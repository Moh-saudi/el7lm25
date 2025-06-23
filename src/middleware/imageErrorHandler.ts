/**
 * معالج أخطاء الصور لـ Next.js
 * Image Error Handler Middleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * معالج أخطاء تحسين الصور
 * يتعامل مع الصور المكسورة ويوجه إلى fallback
 */
export function imageErrorHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  
  // إذا لم يكن هناك URL للصورة
  if (!imageUrl) {
    return NextResponse.redirect(new URL('/images/default-avatar.png', request.url));
  }
  
  // فحص الروابط المحظورة
  const blockedDomains = ['test-url.com', 'example.com', 'placeholder.com'];
  const isBlocked = blockedDomains.some(domain => imageUrl.includes(domain));
  
  if (isBlocked) {
    console.warn(`تم حظر رابط الصورة: ${imageUrl}`);
    return NextResponse.redirect(new URL('/images/default-avatar.png', request.url));
  }
  
  // السماح للصور الصحيحة بالمرور
  return NextResponse.next();
}

/**
 * فحص إضافي للصور المكسورة
 */
export async function validateImageResponse(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // timeout بعد 5 ثواني
    });
    
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch (error) {
    console.warn(`فشل فحص الصورة: ${imageUrl}`, error);
    return false;
  }
}

/**
 * تنظيف headers للصور المحسنة
 */
export function sanitizeImageHeaders(headers: Headers): Headers {
  const cleanHeaders = new Headers();
  
  // نسخ headers الضرورية فقط
  const allowedHeaders = [
    'cache-control',
    'content-type',
    'content-length',
    'etag',
    'last-modified',
    'date'
  ];
  
  allowedHeaders.forEach(header => {
    const value = headers.get(header);
    if (value) {
      cleanHeaders.set(header, value);
    }
  });
  
  // إضافة headers للأمان
  cleanHeaders.set('x-content-type-options', 'nosniff');
  
  return cleanHeaders;
} 