import { supabase } from './config';

export const getSupabaseImageUrl = (path: string, bucket: string = 'avatars') => {
  if (!path) {
    console.log('⚠️ Empty path provided to getSupabaseImageUrl');
    return '';
  }
  
  if (path.startsWith('http')) {
    console.log('✅ Direct URL provided:', path);
    return path;
  }
  
  try {
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    
    if (!publicUrl) {
      console.log(`❌ No public URL generated for ${bucket}/${path}`);
      return '';
    }
    
    console.log(`🔍 Generated URL for ${bucket}/${path}:`, publicUrl);
    
    // تحقق من أن الرابط صحيح
    if (publicUrl.includes('undefined') || publicUrl.includes('null')) {
      console.log(`❌ Invalid URL generated for ${bucket}/${path}:`, publicUrl);
      return '';
    }
    
    return publicUrl;
  } catch (error) {
    console.error(`❌ Error getting URL for ${bucket}/${path}:`, error);
    return '';
  }
};

// دالة للتحقق من وجود الصورة في Supabase
export const checkImageExists = async (path: string, bucket: string = 'avatars') => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      search: path
    });
    
    if (error) {
      console.error(`❌ Error checking image existence:`, error);
      return false;
    }
    
    const exists = data.some(file => file.name === path);
    console.log(`🔍 Image ${path} exists in ${bucket}:`, exists);
    return exists;
  } catch (error) {
    console.error(`❌ Error checking image existence:`, error);
    return false;
  }
};

// دالة جديدة لجلب صورة المستخدم من Supabase
export const getUserAvatarFromSupabase = async (userId: string, accountType: string) => {
  if (!userId) return null;
  
  try {
    console.log(`🔍 Searching for avatar for user ${userId} (${accountType})`);
    
    // جرب امتدادات مختلفة
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    for (const ext of extensions) {
      const fileName = `${userId}.${ext}`;
      
      try {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        
        // تحقق من وجود الصورة
        const { data: fileExists, error } = await supabase.storage.from('avatars').list('', {
          search: fileName
        });
        
        if (error) {
          console.error(`❌ Error checking file existence for ${fileName}:`, error);
          continue;
        }
        
        if (fileExists && fileExists.length > 0) {
          console.log(`✅ Found avatar: ${fileName}`);
          return publicUrl;
        }
      } catch (error) {
        console.error(`❌ Error checking ${fileName}:`, error);
        continue;
      }
    }
    
    console.log(`❌ No avatar found for user ${userId}`);
    return null;
  } catch (error) {
    console.error(`❌ Error getting avatar for user ${userId}:`, error);
    return null;
  }
};

export const getPlayerAvatarUrl = (userData: any, user?: any) => {
  if (!userData) {
    console.log('❌ No userData provided');
    return null;
  }
  
  // استخدام user object للحصول على uid و email الصحيحين
  const uid = user?.uid || userData.uid;
  const email = user?.email || userData.email;
  const accountType = userData.accountType;
  
  console.log('🔍 getPlayerAvatarUrl - userData:', {
    email: email,
    uid: uid,
    accountType: accountType
  });
  
  // البحث في الحقول المختلفة للصورة
  const imageFields = [
    userData.profile_image_url,
    userData.profile_image,
    userData.avatar,
    userData.photoURL,
    userData.profilePicture,
    userData.image
  ];
  
  for (const field of imageFields) {
    if (field) {
      console.log('🔍 Trying field:', field);
      
      // تحقق من نوع البيانات
      let fieldValue: string;
      
      if (typeof field === 'string') {
        fieldValue = field;
      } else if (typeof field === 'object' && field !== null && 'url' in field) {
        fieldValue = field.url;
      } else {
        console.log('⚠️ Skipping field with invalid type:', typeof field);
        continue;
      }
      
      // تحقق من أن القيمة صحيحة
      if (!fieldValue || fieldValue === 'undefined' || fieldValue === 'null') {
        console.log('⚠️ Skipping invalid field value:', fieldValue);
        continue;
      }
      
      // إذا كان رابط كامل، استخدمه مباشرة
      if (fieldValue.startsWith('http')) {
        console.log('✅ Found direct URL:', fieldValue);
        return fieldValue;
      }
      
      // إذا كان مسار، استخدم getSupabaseImageUrl
      const url = getSupabaseImageUrl(fieldValue, 'avatars');
      if (url && url !== '') {
        console.log('✅ Generated Supabase URL:', url);
        return url;
      }
    }
  }
  
  // إذا لم نجد صورة، جرب البحث في bucket avatars باستخدام معرف المستخدم
  if (uid) {
    console.log('🔍 Trying to find avatar by user ID in avatars bucket');
    
    // جرب امتدادات مختلفة
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    for (const ext of extensions) {
      const fileName = `${uid}.${ext}`;
      const url = getSupabaseImageUrl(fileName, 'avatars');
      
      if (url && url !== '') {
        console.log(`✅ Generated URL for ${fileName}:`, url);
        return url;
      }
    }
  }
  
  // إذا لم نجد صورة، إرجاع null للسماح بعرض الصورة الافتراضية
  console.log('❌ No player avatar found, returning null for fallback');
  return null;
}; 