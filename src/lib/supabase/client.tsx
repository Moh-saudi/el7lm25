'use client';

import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from './config';

// إنشاء عميل Supabase للمتصفح
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// دالة مساعدة للحصول على URL آمن للصور من Supabase
export const getSupabaseImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/images/default-avatar.png';
  
  // إذا كان رابط كامل، اتركه كما هو
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // إذا كان مسار محلي، أنشئ URL كامل من Supabase
  try {
    const { data } = supabase.storage
      .from('profile-images')
      .getPublicUrl(imagePath);
    
    return data?.publicUrl || '/images/default-avatar.png';
  } catch (error) {
    console.warn('Failed to get Supabase image URL:', error);
    return '/images/default-avatar.png';
  }
};

// دالة رفع الصور إلى Supabase
export const uploadImageToSupabase = async (
  file: File, 
  bucket: string = 'profile-images',
  folder: string = 'uploads'
): Promise<{ url?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) {
      return { error: error.message };
    }
    
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return { url: urlData?.publicUrl };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'خطأ في رفع الصورة' };
  }
};

export default supabase;
