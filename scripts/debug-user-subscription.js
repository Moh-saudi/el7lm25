const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// تهيئة Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugUserSubscription(userEmail) {
  console.log('🔍 فحص حالة اشتراك المستخدم:', userEmail);
  console.log('=====================================\n');

  try {
    // البحث عن المستخدم في جميع المجموعات
    const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
    let foundUser = null;
    let foundCollection = '';

    for (const collectionName of collections) {
      try {
        console.log(`🔍 البحث في مجموعة ${collectionName}...`);
        const collectionRef = collection(db, collectionName);
        const userQuery = query(collectionRef, where('email', '==', userEmail));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          foundUser = userSnapshot.docs[0].data();
          foundCollection = collectionName;
          console.log(`✅ تم العثور على المستخدم في مجموعة ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ خطأ في البحث في مجموعة ${collectionName}:`, error.message);
      }
    }

    if (!foundUser) {
      console.log('❌ لم يتم العثور على المستخدم في أي مجموعة');
      return;
    }

    console.log('\n📊 بيانات المستخدم:');
    console.log(`   - المجموعة: ${foundCollection}`);
    console.log(`   - الاسم: ${foundUser.displayName || foundUser.name || 'غير محدد'}`);
    console.log(`   - البريد الإلكتروني: ${foundUser.email}`);
    console.log(`   - نوع الحساب: ${foundUser.accountType || 'غير محدد'}`);
    console.log(`   - حالة الاشتراك: ${foundUser.subscriptionStatus || 'غير محدد'}`);
    console.log(`   - تاريخ انتهاء الاشتراك: ${foundUser.subscriptionEndDate || 'غير محدد'}`);
    console.log(`   - آخر دفع: ${foundUser.lastPaymentDate || 'غير محدد'}`);
    console.log(`   - مبلغ آخر دفع: ${foundUser.lastPaymentAmount || 'غير محدد'}`);
    console.log(`   - طريقة آخر دفع: ${foundUser.lastPaymentMethod || 'غير محدد'}`);

    // البحث في مجموعة bulkPayments
    console.log('\n🔍 البحث في مجموعة bulkPayments...');
    const bulkPaymentsRef = collection(db, 'bulkPayments');
    const paymentsQuery = query(bulkPaymentsRef, where('userId', '==', foundUser.uid || foundUser.id));
    const paymentsSnapshot = await getDocs(paymentsQuery);

    if (!paymentsSnapshot.empty) {
      console.log(`✅ تم العثور على ${paymentsSnapshot.size} مدفوعات في bulkPayments`);
      
      paymentsSnapshot.docs.forEach((doc, index) => {
        const payment = doc.data();
        console.log(`\n💰 المدفوعة ${index + 1}:`);
        console.log(`   - المعرف: ${doc.id}`);
        console.log(`   - الحالة: ${payment.status}`);
        console.log(`   - المبلغ: ${payment.amount} ${payment.currency}`);
        console.log(`   - معرف الجلسة: ${payment.sessionId}`);
        console.log(`   - معرف التاجر: ${payment.merchantReferenceId}`);
        console.log(`   - رمز الاستجابة: ${payment.responseCode}`);
        console.log(`   - رسالة الاستجابة: ${payment.responseMessage}`);
        console.log(`   - تاريخ الإنشاء: ${payment.createdAt}`);
        console.log(`   - تاريخ الإكمال: ${payment.completedAt}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات في bulkPayments');
    }

    // البحث في مجموعة subscriptions
    console.log('\n🔍 البحث في مجموعة subscriptions...');
    const subscriptionRef = doc(db, 'subscriptions', foundUser.uid || foundUser.id);
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (subscriptionDoc.exists()) {
      const subscription = subscriptionDoc.data();
      console.log('✅ تم العثور على بيانات اشتراك:');
      console.log(`   - الحالة: ${subscription.status}`);
      console.log(`   - تاريخ البداية: ${subscription.startDate}`);
      console.log(`   - تاريخ الانتهاء: ${subscription.endDate}`);
      console.log(`   - طريقة الدفع: ${subscription.paymentMethod}`);
      console.log(`   - المبلغ: ${subscription.amount} ${subscription.currency}`);
      console.log(`   - معرف المعاملة: ${subscription.transactionId}`);
    } else {
      console.log('❌ لم يتم العثور على بيانات اشتراك في مجموعة subscriptions');
    }

    // فحص حالة الاشتراك الحالية
    console.log('\n🔍 فحص حالة الاشتراك الحالية...');
    const now = new Date();
    const endDate = foundUser.subscriptionEndDate;
    
    if (endDate) {
      const endDateObj = endDate.toDate ? endDate.toDate() : new Date(endDate);
      const isActive = endDateObj > now;
      
      console.log(`   - تاريخ انتهاء الاشتراك: ${endDateObj}`);
      console.log(`   - التاريخ الحالي: ${now}`);
      console.log(`   - الحالة: ${isActive ? 'نشط' : 'منتهي'}`);
      
      if (!isActive) {
        console.log('⚠️ الاشتراك منتهي الصلاحية');
      }
    } else {
      console.log('⚠️ لا يوجد تاريخ انتهاء للاشتراك');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص حالة الاشتراك:', error);
  }
}

// تشغيل السكريبت
const userEmail = process.argv[2];
if (!userEmail) {
  console.log('❌ يرجى توفير البريد الإلكتروني للمستخدم');
  console.log('مثال: node scripts/debug-user-subscription.js user@example.com');
  process.exit(1);
}

debugUserSubscription(userEmail); 