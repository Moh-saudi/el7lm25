import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekyerljzfokqimbabzxm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY';

// Singleton pattern with global window storage to prevent multiple client instances
let supabaseClient: any = null;

// تخزين العميل في النافذة لمنع التكرار عبر النماذج المختلفة
if (typeof window !== 'undefined') {
  if (!(window as any).__supabaseClient) {
    (window as any).__supabaseClient = null;
  }
}

const getSupabaseClient = () => {
  // التحقق من وجود عميل في الذاكرة المحلية أولاً
  if (supabaseClient) {
    return supabaseClient;
  }

  // التحقق من وجود عميل في النافذة (للمتصفح)
  if (typeof window !== 'undefined' && (window as any).__supabaseClient) {
    supabaseClient = (window as any).__supabaseClient;
    return supabaseClient;
  }

  // إنشاء عميل جديد فقط إذا لم يكن موجوداً
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // منع التحقق من URL لتجنب التحذيرات
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'hagzz-go-app'
      }
    }
  });
  
  // حفظ العميل في النافذة للمشاركة عبر النماذج
  if (typeof window !== 'undefined') {
    (window as any).__supabaseClient = supabaseClient;
    
    // رسالة تأكيد واحدة فقط
    if (!((window as any).__supabaseClientInitialized)) {
      console.log('🔌 Supabase client initialized (singleton pattern)');
      (window as any).__supabaseClientInitialized = true;
    }
  }
  
  return supabaseClient;
};

// تصدير العميل الافتراضي
export const supabase = getSupabaseClient();

// Export the URL and key for other components that need them
export { supabaseUrl, supabaseKey };

// Export the factory function for cases where a new client is needed
export { getSupabaseClient };

// دالة لإعادة تعيين العميل (للاختبار أو إعادة التهيئة)
export const resetSupabaseClient = () => {
  supabaseClient = null;
  if (typeof window !== 'undefined') {
    (window as any).__supabaseClient = null;
    (window as any).__supabaseClientInitialized = false;
  }
};

// تحذير عند محاولة إنشاء عميل إضافي (للتطوير)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalCreateClient = createClient;
  
  // تتبع عدد المرات التي يتم فيها استدعاء createClient
  let createClientCallCount = 0;
  
  (window as any).createClient = (...args: any[]) => {
    createClientCallCount++;
    if (createClientCallCount > 1) {
      console.warn(`🚨 Multiple Supabase clients detected! This is call #${createClientCallCount}. Use getSupabaseClient() instead.`);
    }
    return originalCreateClient(...(args as [string, string, any?]));
  };
}