const admin = require('firebase-admin');

// تهيئة Firebase Admin
try {
  const serviceAccount = require('../el7hm-87884-cfa610cfcb73.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('❌ خطأ في تحميل ملف الخدمة:', error.message);
  console.log('💡 تأكد من وجود ملف el7hm-87884-cfa610cfcb73.json في المجلد الجذر');
  process.exit(1);
}

const db = admin.firestore();

async function checkPlayerAvatar() {
  try {
    console.log('🔍 فحص بيانات اللاعب...');
    
    // البحث عن المستخدم بالبريد الإلكتروني
    const userEmail = '1234567893@hagzzgo.com';
    const userId = '2hLPCeQszng4TQrjQlpYZ3PtYmm2';
    
    // البحث في مجموعة users
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('email', '==', userEmail).get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();
      
      console.log('✅ تم العثور على المستخدم:', userDoc.id);
      console.log('📊 اسم المستخدم:', userData.full_name || userData.name);
      console.log('📧 البريد الإلكتروني:', userData.email);
      console.log('🎭 نوع الحساب:', userData.accountType);
      
      console.log('\n🖼️ بيانات الصورة الشخصية:');
      console.log('profile_image_url:', userData.profile_image_url);
      console.log('profile_image:', userData.profile_image);
      console.log('avatar:', userData.avatar);
      console.log('photoURL:', userData.photoURL);
      console.log('profilePicture:', userData.profilePicture);
      console.log('image:', userData.image);
      
      // فحص إذا كانت الصورة موجودة في Supabase
      if (userData.profile_image_url || userData.profile_image || userData.avatar) {
        console.log('\n✅ يبدو أن اللاعب لديه صورة شخصية محفوظة');
        console.log('🔗 مسار الصورة:', userData.profile_image_url || userData.profile_image || userData.avatar);
      } else {
        console.log('\n❌ لا توجد صورة شخصية محفوظة في Firestore');
      }
      
    } else {
      console.log('❌ لم يتم العثور على المستخدم');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    process.exit(0);
  }
}

checkPlayerAvatar(); 