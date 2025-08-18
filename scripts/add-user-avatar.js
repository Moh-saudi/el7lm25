const admin = require('firebase-admin');

// تهيئة Firebase Admin
try {
  const serviceAccount = require('./el7hm-87884-cfa610cfcb73.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('❌ خطأ في تحميل ملف الخدمة:', error.message);
  console.log('💡 تأكد من وجود ملف el7hm-87884-cfa610cfcb73.json في مجلد scripts');
  process.exit(1);
}

const db = admin.firestore();

async function addUserAvatar() {
  try {
    console.log('🔍 إضافة صورة شخصية للمستخدم...');
    
    // البحث عن المستخدم بالبريد الإلكتروني
    const userEmail = '0555555555@hagzzgo.com';
    
    // البحث في مجموعة users
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('email', '==', userEmail).get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();
      
      console.log('✅ تم العثور على المستخدم:', userDoc.id);
      console.log('📊 اسم المستخدم:', userData.full_name || userData.name);
      
      // إضافة صورة شخصية افتراضية
      const avatarUrl = '/user-avatar.svg';
      
      // تحديث بيانات المستخدم
      await userDoc.ref.update({
        profile_image_url: avatarUrl,
        profile_image: avatarUrl,
        avatar: avatarUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✅ تم إضافة الصورة الشخصية بنجاح');
      console.log('🖼️ مسار الصورة:', avatarUrl);
      
      // التحقق من التحديث
      const updatedDoc = await userDoc.ref.get();
      const updatedData = updatedDoc.data();
      
      console.log('\n📊 البيانات المحدثة:');
      console.log('profile_image_url:', updatedData.profile_image_url);
      console.log('profile_image:', updatedData.profile_image);
      console.log('avatar:', updatedData.avatar);
      
    } else {
      console.log('❌ لم يتم العثور على المستخدم');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    process.exit(0);
  }
}

addUserAvatar(); 