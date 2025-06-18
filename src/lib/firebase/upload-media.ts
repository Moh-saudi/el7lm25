import { getSupabaseClient, uploadFile, getPublicUrl, STORAGE_BUCKETS } from '@/lib/supabase/config';
import { User } from 'firebase/auth';

export async function uploadProfileImage(file: File, user: User) {
  const fileExt = file.name.split('.').pop();
  const filePath = `profile-images/${user.uid}.${fileExt}`;
  await uploadFile('profile-images', filePath, file, { upsert: true });
  const { publicUrl } = getPublicUrl('profile-images', filePath);
  return publicUrl;
}

export async function deleteProfileImage(imageUrl: string, user: User) {
  const supabase = getSupabaseClient();
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) await supabase.storage.from('profile-images').remove([filePath.replace('profile-images/', '')]);
}

export async function uploadAdditionalImage(file: File, user: User) {
  const fileExt = file.name.split('.').pop();
  const filePath = `additional-images/${user.uid}/${Date.now()}.${fileExt}`;
  await uploadFile('avatars', filePath, file, { upsert: false });
  const { publicUrl } = getPublicUrl('avatars', filePath);
  return publicUrl;
}

export async function deleteAdditionalImage(imageUrl: string, user: User) {
  const supabase = getSupabaseClient();
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) await supabase.storage.from('avatars').remove([filePath.replace('avatars/', '')]);
}

// رفع صورة البروفايل للاعب
export async function uploadPlayerProfileImage(file: File, user: User): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.uid}.${fileExt}`;
  // طباعة للتشخيص
  console.log('رفع صورة البروفايل:', { bucket: STORAGE_BUCKETS.PLAYER_AVATAR, filePath, file });
  try {
    await uploadFile(STORAGE_BUCKETS.PLAYER_AVATAR, filePath, file, { upsert: true });
  } catch (error) {
    console.error('رفع الصورة فشل:', error.message, error.details, error);
    throw error;
  }
  const { publicUrl } = getPublicUrl(STORAGE_BUCKETS.PLAYER_AVATAR, filePath);
  return publicUrl;
}

// حذف صورة البروفايل للاعب
export async function deletePlayerProfileImage(imageUrl: string) {
  const supabase = getSupabaseClient();
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) await supabase.storage.from(STORAGE_BUCKETS.PLAYER_AVATAR).remove([filePath.replace(`${STORAGE_BUCKETS.PLAYER_AVATAR}/`, '')]);
}

// رفع صورة إضافية للاعب
export async function uploadPlayerAdditionalImage(file: File, user: User): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${user.uid}/${Date.now()}.${fileExt}`;
  // طباعة للتشخيص
  console.log('رفع صورة إضافية:', { bucket: STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES, filePath, file });
  try {
    await uploadFile(STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES, filePath, file, { upsert: false });
  } catch (error) {
    console.error('رفع الصورة الإضافية فشل:', error.message, error.details, error);
    throw error;
  }
  const { publicUrl } = getPublicUrl(STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES, filePath);
  return publicUrl;
}

// حذف صورة إضافية للاعب
export async function deletePlayerAdditionalImage(imageUrl: string) {
  const supabase = getSupabaseClient();
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) await supabase.storage.from(STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES).remove([filePath.replace(`${STORAGE_BUCKETS.PLAYER_ADDITIONAL_IMAGES}/`, '')]);
} 