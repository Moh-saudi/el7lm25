import { supabase } from '@/lib/supabase/client';
import { User } from 'firebase/auth';

// تعريف أسماء buckets التخزين في Supabase
const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  ADDITIONAL_IMAGES: 'additional-images',
  PLAYER_AVATAR: 'avatars',
  PLAYER_ADDITIONAL_IMAGES: 'avatars',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents'
};

export async function uploadProfileImage(file: File, user: User) {
  const fileExt = file.name.split('.').pop();
  const filePath = `profile-images/${user.uid}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file, { upsert: true });
    
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

export async function deleteProfileImage(imageUrl: string, user: User) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    await supabase.storage
      .from('profile-images')
      .remove([filePath.replace('profile-images/', '')]);
  }
}

export async function uploadAdditionalImage(file: File, user: User) {
  const fileExt = file.name.split('.').pop();
  const filePath = `additional-images/${user.uid}/${Date.now()}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: false });
    
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

export async function deleteAdditionalImage(imageUrl: string, user: User) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    await supabase.storage
      .from('avatars')
      .remove([filePath.replace('avatars/', '')]);
  }
}

// رفع صورة البروفايل للاعب
export async function uploadPlayerProfileImage(file: File, user: User): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.uid}.${fileExt}`;
  // طباعة للتشخيص
  console.log('رفع صورة البروفايل:', { bucket: STORAGE_BUCKETS.PLAYER_AVATAR, filePath, file });
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.PLAYER_AVATAR)
      .upload(filePath, file, { upsert: true });
      
    if (error) throw error;
  } catch (error) {
    console.error('رفع الصورة فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.PLAYER_AVATAR)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

// حذف صورة البروفايل للاعب
export async function deletePlayerProfileImage(imageUrl: string) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    await supabase.storage
      .from(STORAGE_BUCKETS.PLAYER_AVATAR)
      .remove([filePath.replace(`${STORAGE_BUCKETS.PLAYER_AVATAR}/`, '')]);
  }
}

// رفع صورة إضافية للاعب
export async function uploadPlayerAdditionalImage(file: File, user: User): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.uid}/${Date.now()}.${fileExt}`;
  // طباعة للتشخيص
  console.log('رفع صورة إضافية:', { bucket: STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES, filePath, file });
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES)
      .upload(filePath, file, { upsert: false });
      
    if (error) throw error;
  } catch (error) {
    console.error('رفع الصورة الإضافية فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

// حذف صورة إضافية للاعب
export async function deletePlayerAdditionalImage(imageUrl: string) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    await supabase.storage
      .from(STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES)
      .remove([filePath.replace(`${STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES}/`, '')]);
  }
} 