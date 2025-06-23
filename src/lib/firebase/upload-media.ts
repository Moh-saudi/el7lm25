import { supabase } from '@/lib/supabase/client';
import { User } from 'firebase/auth';

// تعريف أسماء buckets التخزين في Supabase حسب نوع الحساب
const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  ADDITIONAL_IMAGES: 'avatars',
  // بوكتات اللاعبين المنفصلة لكل نوع حساب
  PLAYER_TRAINER: 'playertrainer',
  PLAYER_CLUB: 'playerclub', 
  PLAYER_AGENT: 'playeragent',
  PLAYER_ACADEMY: 'playeracademy',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents'
};

// أنواع الحسابات المدعومة
export type AccountType = 'trainer' | 'club' | 'agent' | 'academy';

// دالة لتحديد البوكت المناسب بناءً على نوع الحساب
function getPlayerBucket(accountType: AccountType): string {
  switch (accountType) {
    case 'trainer':
      return STORAGE_BUCKETS.PLAYER_TRAINER;
    case 'club':
      return STORAGE_BUCKETS.PLAYER_CLUB;
    case 'agent':
      return STORAGE_BUCKETS.PLAYER_AGENT;
    case 'academy':
      return STORAGE_BUCKETS.PLAYER_ACADEMY;
    default:
      return STORAGE_BUCKETS.PLAYER_TRAINER; // افتراضي
  }
}

// دالة لتحديد نوع الحساب من المسار الحالي
function detectAccountTypeFromPath(): AccountType {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/club/')) return 'club';
    if (path.includes('/agent/')) return 'agent';
    if (path.includes('/academy/')) return 'academy';
    if (path.includes('/trainer/')) return 'trainer';
  }
  return 'trainer'; // افتراضي
}

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
  
  // تحديد البوكت بناءً على نوع الحساب
  const accountType = detectAccountTypeFromPath();
  const bucket = getPlayerBucket(accountType);
  
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false });
    
  if (error) throw error;
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
}

export async function deleteAdditionalImage(imageUrl: string, user: User) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    // تحديد البوكت من URL الصورة
    const bucketName = filePath.split('/')[0];
    await supabase.storage
      .from(bucketName)
      .remove([filePath.replace(`${bucketName}/`, '')]);
  }
}

// رفع صورة البروفايل للاعب مع تحديد نوع الحساب
export async function uploadPlayerProfileImage(
  file: File, 
  userId: string, 
  accountType?: AccountType
): Promise<{ url: string }> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}.${fileExt}`;
  
  // تحديد نوع الحساب والبوكت المناسب
  const detectedAccountType = accountType || detectAccountTypeFromPath();
  const bucket = getPlayerBucket(detectedAccountType);
  
  console.log('رفع صورة البروفايل:', { 
    bucket, 
    accountType: detectedAccountType,
    filePath, 
    file 
  });
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });
      
    if (error) throw error;
  } catch (error) {
    console.error('رفع الصورة فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return { url: data.publicUrl };
}

// حذف صورة البروفايل للاعب
export async function deletePlayerProfileImage(imageUrl: string, accountType?: AccountType) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    // تحديد البوكت من URL أو نوع الحساب
    let bucketName = filePath.split('/')[0];
    
    // إذا لم نتمكن من استخراج البوكت من URL، استخدم نوع الحساب
    if (!bucketName.startsWith('player')) {
      const detectedAccountType = accountType || detectAccountTypeFromPath();
      bucketName = getPlayerBucket(detectedAccountType);
    }
    
    await supabase.storage
      .from(bucketName)
      .remove([filePath.replace(`${bucketName}/`, '')]);
  }
}

// رفع صورة إضافية للاعب مع تحديد نوع الحساب
export async function uploadPlayerAdditionalImage(
  file: File, 
  userId: string, 
  accountType?: AccountType
): Promise<{ url: string }> {
  const fileExt = file.name.split('.').pop();
  const filePath = `additional-images/${userId}/${Date.now()}.${fileExt}`;
  
  // تحديد نوع الحساب والبوكت المناسب
  const detectedAccountType = accountType || detectAccountTypeFromPath();
  const bucket = getPlayerBucket(detectedAccountType);
  
  console.log('رفع صورة إضافية:', { 
    bucket, 
    accountType: detectedAccountType,
    filePath, 
    file 
  });
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });
      
    if (error) throw error;
  } catch (error) {
    console.error('رفع الصورة الإضافية فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return { url: data.publicUrl };
}

// حذف صورة إضافية للاعب
export async function deletePlayerAdditionalImage(imageUrl: string, accountType?: AccountType) {
  const filePath = imageUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    // تحديد البوكت من URL أو نوع الحساب
    let bucketName = filePath.split('/')[0];
    
    // إذا لم نتمكن من استخراج البوكت من URL، استخدم نوع الحساب
    if (!bucketName.startsWith('player')) {
      const detectedAccountType = accountType || detectAccountTypeFromPath();
      bucketName = getPlayerBucket(detectedAccountType);
    }
    
    await supabase.storage
      .from(bucketName)
      .remove([filePath.replace(`${bucketName}/`, '')]);
  }
}

// رفع مستند للاعب مع تحديد نوع الحساب
export async function uploadPlayerDocument(
  file: File, 
  userId: string, 
  documentType: string, 
  accountType?: AccountType
): Promise<{ url: string, name: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = file.name.split('.').slice(0, -1).join('.');
  const filePath = `documents/${userId}/${documentType}_${Date.now()}.${fileExt}`;
  
  // تحديد نوع الحساب والبوكت المناسب
  const detectedAccountType = accountType || detectAccountTypeFromPath();
  const bucket = getPlayerBucket(detectedAccountType);
  
  console.log('رفع مستند:', { 
    bucket, 
    accountType: detectedAccountType,
    filePath, 
    file 
  });
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });
      
    if (error) throw error;
  } catch (error) {
    console.error('رفع المستند فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return { 
    url: data.publicUrl,
    name: fileName 
  };
}

// حذف مستند للاعب
export async function deletePlayerDocument(documentUrl: string, accountType?: AccountType) {
  const filePath = documentUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    // تحديد البوكت من URL أو نوع الحساب
    let bucketName = filePath.split('/')[0];
    
    // إذا لم نتمكن من استخراج البوكت من URL، استخدم نوع الحساب
    if (!bucketName.startsWith('player')) {
      const detectedAccountType = accountType || detectAccountTypeFromPath();
      bucketName = getPlayerBucket(detectedAccountType);
    }
    
    await supabase.storage
      .from(bucketName)
      .remove([filePath.replace(`${bucketName}/`, '')]);
  }
} 

// رفع فيديو للاعب مع تحديد نوع الحساب
export async function uploadPlayerVideo(
  file: File, 
  ownerId: string, 
  playerId: string, 
  accountType?: AccountType
): Promise<{ url: string, name: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = file.name.split('.').slice(0, -1).join('.');
  const filePath = `videos/${ownerId}/${playerId}/${Date.now()}.${fileExt}`;
  
  // تحديد نوع الحساب والبوكت المناسب
  const detectedAccountType = accountType || detectAccountTypeFromPath();
  const bucket = getPlayerBucket(detectedAccountType);
  
  console.log('رفع فيديو:', { 
    bucket, 
    accountType: detectedAccountType,
    filePath, 
    file 
  });
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });
      
    if (error) throw error;
  } catch (error) {
    console.error('رفع الفيديو فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
    
  return { 
    url: data.publicUrl,
    name: fileName 
  };
}

// حذف فيديو للاعب
export async function deletePlayerVideo(videoUrl: string, accountType?: AccountType) {
  const filePath = videoUrl.split('/storage/v1/object/public/')[1];
  if (filePath) {
    // تحديد البوكت من URL أو نوع الحساب
    let bucketName = filePath.split('/')[0];
    
    // إذا لم نتمكن من استخراج البوكت من URL، استخدم نوع الحساب
    if (!bucketName.startsWith('player')) {
      const detectedAccountType = accountType || detectAccountTypeFromPath();
      bucketName = getPlayerBucket(detectedAccountType);
    }
    
    await supabase.storage
      .from(bucketName)
      .remove([filePath.replace(`${bucketName}/`, '')]);
  }
}

// دوال مساعدة لكل نوع حساب للسهولة في الاستخدام

// للمدربين
export const trainerUpload = {
  profileImage: (file: File, userId: string) => uploadPlayerProfileImage(file, userId, 'trainer'),
  additionalImage: (file: File, userId: string) => uploadPlayerAdditionalImage(file, userId, 'trainer'),
  document: (file: File, userId: string, documentType: string) => uploadPlayerDocument(file, userId, documentType, 'trainer'),
  video: (file: File, trainerId: string, playerId: string) => uploadPlayerVideo(file, trainerId, playerId, 'trainer')
};

// دالة محسنة لرفع الفيديوهات للأندية (بدون playerId مطلوب)
export async function uploadClubVideo(
  file: File, 
  clubId: string
): Promise<{ url: string, name: string }> {
  const fileExt = file.name.split('.').pop();
  const fileName = file.name.split('.').slice(0, -1).join('.');
  const filePath = `videos/${clubId}/${Date.now()}.${fileExt}`;
  
  console.log('رفع فيديو للنادي:', { 
    bucket: 'playerclub',
    filePath, 
    file: { name: file.name, size: file.size, type: file.type }
  });
  
  try {
    const { error } = await supabase.storage
      .from('playerclub')
      .upload(filePath, file, { 
        upsert: false,
        cacheControl: '3600',
        contentType: file.type
      });
      
    if (error) {
      console.error('رفع الفيديو فشل:', error);
      throw error;
    }
  } catch (error) {
    console.error('رفع الفيديو فشل:', error instanceof Error ? error.message : 'Unknown error', error);
    throw error;
  }
  
  const { data } = supabase.storage
    .from('playerclub')
    .getPublicUrl(filePath);
    
  console.log('✅ تم رفع الفيديو بنجاح:', data.publicUrl);
    
  return { 
    url: data.publicUrl,
    name: fileName 
  };
}

// للأندية
export const clubUpload = {
  profileImage: (file: File, userId: string) => uploadPlayerProfileImage(file, userId, 'club'),
  additionalImage: (file: File, userId: string) => uploadPlayerAdditionalImage(file, userId, 'club'),
  document: (file: File, userId: string, documentType: string) => uploadPlayerDocument(file, userId, documentType, 'club'),
  video: (file: File, clubId: string, playerId: string) => uploadPlayerVideo(file, clubId, playerId, 'club'),
  // دالة جديدة لرفع الفيديوهات بدون playerId
  videoFile: (file: File, clubId: string) => uploadClubVideo(file, clubId)
};

// للوكلاء
export const agentUpload = {
  profileImage: (file: File, userId: string) => uploadPlayerProfileImage(file, userId, 'agent'),
  additionalImage: (file: File, userId: string) => uploadPlayerAdditionalImage(file, userId, 'agent'),
  document: (file: File, userId: string, documentType: string) => uploadPlayerDocument(file, userId, documentType, 'agent'),
  video: (file: File, agentId: string, playerId: string) => uploadPlayerVideo(file, agentId, playerId, 'agent')
};

// للأكاديميات
export const academyUpload = {
  profileImage: (file: File, userId: string) => uploadPlayerProfileImage(file, userId, 'academy'),
  additionalImage: (file: File, userId: string) => uploadPlayerAdditionalImage(file, userId, 'academy'),
  document: (file: File, userId: string, documentType: string) => uploadPlayerDocument(file, userId, documentType, 'academy'),
  video: (file: File, academyId: string, playerId: string) => uploadPlayerVideo(file, academyId, playerId, 'academy')
};
