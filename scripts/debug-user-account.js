// ============================================
// سكريبت فحص تفاصيل حساب المستخدم
// ============================================

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: "hagzzgo-87884.firebaseapp.com",
  projectId: "hagzzgo-87884",
  storageBucket: "hagzzgo-87884.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugUserAccount(userId) {
  console.log('🔍 بدء فحص تفاصيل حساب المستخدم:', userId);
  
  try {
    // البحث في جميع المجموعات المحتملة
    const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
    
    console.log('\n1️⃣ البحث في جميع المجموعات...');
    
    for (const collectionName of collections) {
      try {
        console.log(`\n📋 فحص مجموعة ${collectionName}...`);
        
        // البحث بواسطة المعرف
        const docRef = doc(db, collectionName, userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log(`✅ تم العثور على المستخدم في مجموعة ${collectionName}`);
          const data = docSnap.data();
          
          console.log('📊 بيانات المستخدم:');
          console.log(`   - المعرف: ${docSnap.id}`);
          console.log(`   - البريد الإلكتروني: ${data.email || 'غير محدد'}`);
          console.log(`   - رقم الهاتف: ${data.phone || 'غير محدد'}`);
          console.log(`   - الاسم: ${data.name || data.displayName || 'غير محدد'}`);
          console.log(`   - نوع الحساب: ${data.accountType || 'غير محدد'}`);
          console.log(`   - نوع الباقة: ${data.packageType || data.selectedPackage || 'غير محدد'}`);
          console.log(`   - حالة الاشتراك: ${data.subscriptionStatus || 'غير محدد'}`);
          console.log(`   - تاريخ انتهاء الاشتراك: ${data.subscriptionEndDate?.toDate?.() || data.subscriptionEndDate || 'غير محدد'}`);
          console.log(`   - آخر دفع: ${data.lastPaymentDate?.toDate?.() || data.lastPaymentDate || 'غير محدد'}`);
          console.log(`   - مبلغ آخر دفع: ${data.lastPaymentAmount || 'غير محدد'}`);
          console.log(`   - طريقة آخر دفع: ${data.lastPaymentMethod || 'غير محدد'}`);
          
          // فحص البيانات الإضافية
          if (data.role) console.log(`   - الدور: ${data.role}`);
          if (data.status) console.log(`   - الحالة: ${data.status}`);
          if (data.createdAt) console.log(`   - تاريخ الإنشاء: ${data.createdAt?.toDate?.() || data.createdAt}`);
          if (data.updatedAt) console.log(`   - آخر تحديث: ${data.updatedAt?.toDate?.() || data.updatedAt}`);
          
          // فحص البيانات المحددة حسب نوع الحساب
          if (collectionName === 'academies') {
            console.log('🏫 بيانات الأكاديمية:');
            console.log(`   - اسم الأكاديمية: ${data.academyName || 'غير محدد'}`);
            console.log(`   - العنوان: ${data.address || 'غير محدد'}`);
            console.log(`   - عدد اللاعبين: ${data.playerCount || 0}`);
          }
          
          if (collectionName === 'players') {
            console.log('⚽ بيانات اللاعب:');
            console.log(`   - المركز: ${data.position || 'غير محدد'}`);
            console.log(`   - العمر: ${data.age || 'غير محدد'}`);
            console.log(`   - الطول: ${data.height || 'غير محدد'}`);
            console.log(`   - الوزن: ${data.weight || 'غير محدد'}`);
          }
          
          if (collectionName === 'clubs') {
            console.log('🏆 بيانات النادي:');
            console.log(`   - اسم النادي: ${data.clubName || 'غير محدد'}`);
            console.log(`   - المدينة: ${data.city || 'غير محدد'}`);
            console.log(`   - عدد اللاعبين: ${data.playerCount || 0}`);
          }
          
        } else {
          console.log(`❌ المستخدم غير موجود في مجموعة ${collectionName}`);
        }
        
      } catch (error) {
        console.log(`⚠️ خطأ في فحص مجموعة ${collectionName}:`, error.message);
      }
    }
    
    // البحث في جميع المجموعات بواسطة البريد الإلكتروني
    console.log('\n2️⃣ البحث بواسطة البريد الإلكتروني...');
    const email = '0555555555@hagzzgo.com';
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const emailQuery = query(collectionRef, where('email', '==', email));
        const emailSnapshot = await getDocs(emailQuery);
        
        if (!emailSnapshot.empty) {
          console.log(`✅ تم العثور على مستخدم بالبريد الإلكتروني في مجموعة ${collectionName}`);
          emailSnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`\n📋 المستخدم ${index + 1}:`);
            console.log(`   - المعرف: ${doc.id}`);
            console.log(`   - نوع الحساب: ${data.accountType || 'غير محدد'}`);
            console.log(`   - الاسم: ${data.name || data.displayName || 'غير محدد'}`);
          });
        }
        
      } catch (error) {
        console.log(`⚠️ خطأ في البحث بالبريد الإلكتروني في ${collectionName}:`, error.message);
      }
    }
    
    // فحص بيانات الاشتراك
    console.log('\n3️⃣ فحص بيانات الاشتراك...');
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (subscriptionDoc.exists()) {
      console.log('✅ تم العثور على سجل اشتراك');
      const data = subscriptionDoc.data();
      console.log('📊 بيانات الاشتراك:');
      console.log(`   - الحالة: ${data.status}`);
      console.log(`   - المبلغ: ${data.amount} ${data.currency}`);
      console.log(`   - طريقة الدفع: ${data.paymentMethod}`);
      console.log(`   - تاريخ البداية: ${data.startDate?.toDate?.() || data.startDate}`);
      console.log(`   - تاريخ الانتهاء: ${data.endDate?.toDate?.() || data.endDate}`);
      console.log(`   - معرف المعاملة: ${data.transactionId}`);
    } else {
      console.log('❌ لم يتم العثور على سجل اشتراك');
    }
    
    // فحص مدفوعات جيديا
    console.log('\n4️⃣ فحص مدفوعات جيديا...');
    const bulkPaymentsRef = collection(db, 'bulkPayments');
    const bulkPaymentsQuery = query(
      bulkPaymentsRef, 
      where('userId', '==', userId),
      where('status', '==', 'completed')
    );
    const bulkPaymentsSnapshot = await getDocs(bulkPaymentsQuery);
    
    if (!bulkPaymentsSnapshot.empty) {
      console.log(`✅ تم العثور على ${bulkPaymentsSnapshot.docs.length} مدفوعة من جيديا`);
      bulkPaymentsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n📋 المدفوعة ${index + 1}:`);
        console.log(`   - المبلغ: ${data.amount} ${data.currency}`);
        console.log(`   - طريقة الدفع: ${data.paymentMethod}`);
        console.log(`   - معرف الجلسة: ${data.sessionId}`);
        console.log(`   - معرف التاجر: ${data.merchantReferenceId}`);
        console.log(`   - تاريخ الدفع: ${data.createdAt?.toDate?.() || data.createdAt}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات من جيديا');
    }
    
    // تحليل المشكلة
    console.log('\n5️⃣ تحليل المشكلة...');
    console.log('🔍 المشكلة المحددة:');
    console.log('   - المستخدم لديه accountType: "academy"');
    console.log('   - لكنه يفتح لوحة تحكم اللاعب');
    console.log('   - هذا يشير إلى مشكلة في منطق التوجيه أو نوع الحساب');
    
    console.log('\n💡 الحلول المقترحة:');
    console.log('   1. التحقق من منطق التوجيه في التطبيق');
    console.log('   2. تصحيح نوع الحساب في قاعدة البيانات');
    console.log('   3. التأكد من أن المستخدم مسجل في المجموعة الصحيحة');
    
  } catch (error) {
    console.error('❌ خطأ في فحص حساب المستخدم:', error);
  }
}

// تشغيل الفحص
if (process.argv.length < 3) {
  console.log('استخدام: node scripts/debug-user-account.js <user_id>');
  console.log('مثال: node scripts/debug-user-account.js TnSvLJgehmftXNY024Y0cjib6NI3');
  process.exit(1);
}

const userId = process.argv[2];
debugUserAccount(userId).then(() => {
  console.log('\n✅ انتهى فحص حساب المستخدم');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ في تشغيل السكريبت:', error);
  process.exit(1);
}); 