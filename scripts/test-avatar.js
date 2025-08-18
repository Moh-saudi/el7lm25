// سكريبت لاختبار الصورة الشخصية
console.log('🧪 Testing avatar functionality...');

// محاكاة بيانات المستخدم
const testUserData = {
  email: '1234567893@hagzzgo.com',
  uid: '2hLPCeQszng4TQrjQlpYZ3PtYmm2',
  accountType: 'player',
  profile_image_url: '2hLPCeQszng4TQrjQlpYZ3PtYmm2.jpg',
  profile_image: '2hLPCeQszng4TQrjQlpYZ3PtYmm2.jpg',
  avatar: '2hLPCeQszng4TQrjQlpYZ3PtYmm2.jpg'
};

console.log('📊 Test user data:', testUserData);

// محاكاة دالة getPlayerAvatarUrl
function getPlayerAvatarUrl(userData) {
  if (!userData) {
    console.log('❌ No userData provided');
    return '/user-avatar.svg';
  }
  
  console.log('🔍 getPlayerAvatarUrl - userData:', {
    email: userData.email,
    uid: userData.uid,
    accountType: userData.accountType
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
      
      // إذا كان رابط كامل، استخدمه مباشرة
      if (field.startsWith('http')) {
        console.log('✅ Found direct URL:', field);
        return field;
      }
      
      // إذا كان مسار، جرب في bucket avatars
      const url = `https://ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/avatars/${field}`;
      console.log('✅ Generated URL for avatars bucket:', url);
      return url;
    }
  }
  
  // إذا لم نجد صورة، جرب البحث في bucket avatars باستخدام معرف المستخدم
  if (userData.uid) {
    console.log('🔍 Trying to find avatar by user ID in avatars bucket');
    
    // جرب امتدادات مختلفة
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    for (const ext of extensions) {
      const fileName = `${userData.uid}.${ext}`;
      const url = `https://ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/avatars/${fileName}`;
      
      console.log(`🔍 Generated URL for ${fileName}:`, url);
      return url;
    }
  }
  
  console.log('❌ No player avatar found, using default');
  return '/user-avatar.svg';
}

// اختبار الدالة
const result = getPlayerAvatarUrl(testUserData);
console.log('🎯 Final result:', result);

// اختبار URL النهائي
console.log('🔗 Testing URL:', result);
console.log('📝 Expected URL format: https://ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/avatars/2hLPCeQszng4TQrjQlpYZ3PtYmm2.jpg'); 