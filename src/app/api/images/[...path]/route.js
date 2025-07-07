import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  try {
    const path = params.path.join('/');
    console.log('🖼️ طلب صورة:', path);

    // إضافة timeout للطلبات
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 ثواني

    try {
      const { data, error } = await supabase.storage
        .from('playerclub')
        .download(path, {
          signal: controller.signal
        });

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ خطأ في تحميل الصورة:', error);
        // إرجاع صورة افتراضية بدلاً من خطأ
        return new NextResponse(null, {
          status: 302,
          headers: {
            'Location': '/images/agent-avatar.png',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      if (!data) {
        console.log('⚠️ لم يتم العثور على الصورة:', path);
        return new NextResponse(null, {
          status: 302,
          headers: {
            'Location': '/images/agent-avatar.png',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      const buffer = await data.arrayBuffer();
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': data.type || 'image/png',
          'Cache-Control': 'public, max-age=86400', // يوم واحد
          'Content-Length': buffer.byteLength.toString()
        }
      });

    } catch (timeoutError) {
      clearTimeout(timeoutId);
      console.error('⏱️ انتهت مهلة تحميل الصورة:', path);
      
      return new NextResponse(null, {
        status: 302,
        headers: {
          'Location': '/images/agent-avatar.png',
          'Cache-Control': 'public, max-age=300' // 5 دقائق للصور المعطلة
        }
      });
    }

  } catch (error) {
    console.error('💥 خطأ عام في معالج الصور:', error);
    
    return new NextResponse(null, {
      status: 302,
      headers: {
        'Location': '/images/agent-avatar.png',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
} 