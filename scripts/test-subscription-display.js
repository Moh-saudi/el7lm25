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

async function testSubscriptionDisplay(userEmail) {
  console.log('🧪 اختبار عرض حالة الاشتراك للمستخدم:', userEmail);
  console.log('=====================================\n');

  try {
    // البحث عن المستخدم في مجموعة users
    console.log('1️⃣ البحث عن المستخدم في مجموعة users...');
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', userEmail));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      console.log('❌ لم يتم العثور على المستخدم في مجموعة users');
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    console.log('✅ تم العثور على المستخدم:');
    console.log(`   - ID: ${userId}`);
    console.log(`   - الاسم: ${userData.displayName || 'غير محدد'}`);
    console.log(`   - البريد الإلكتروني: ${userData.email}`);
    console.log(`   - نوع الحساب: ${userData.accountType || 'غير محدد'}`);
    console.log(`   - حالة الاشتراك: ${userData.subscriptionStatus || 'غير محدد'}`);
    console.log(`   - تاريخ انتهاء الاشتراك: ${userData.subscriptionEndDate || 'غير محدد'}`);
    console.log(`   - آخر دفع: ${userData.lastPaymentDate || 'غير محدد'}`);
    console.log(`   - مبلغ آخر دفع: ${userData.lastPaymentAmount || 'غير محدد'}`);
    console.log(`   - طريقة آخر دفع: ${userData.lastPaymentMethod || 'غير محدد'}`);

    // محاكاة عملية البحث في bulkPayments
    console.log('\n2️⃣ محاكاة البحث في مجموعة bulkPayments...');
    try {
      const bulkPaymentsRef = collection(db, 'bulkPayments');
      const paymentsQuery = query(bulkPaymentsRef, where('userId', '==', userId));
      const paymentsSnapshot = await getDocs(paymentsQuery);

      if (!paymentsSnapshot.empty) {
        console.log(`✅ تم العثور على ${paymentsSnapshot.size} مدفوعات في bulkPayments`);
        paymentsSnapshot.docs.forEach((doc, index) => {
          const payment = doc.data();
          console.log(`   - المدفوعة ${index + 1}: ${payment.status} - ${payment.amount} ${payment.currency}`);
        });
      } else {
        console.log('❌ لم يتم العثور على مدفوعات في bulkPayments');
      }
    } catch (error) {
      console.log('⚠️ خطأ في البحث في bulkPayments:', error.message);
    }

    // محاكاة عملية البحث في subscriptions
    console.log('\n3️⃣ محاكاة البحث في مجموعة subscriptions...');
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await getDoc(subscriptionRef);

      if (subscriptionDoc.exists()) {
        const subscription = subscriptionDoc.data();
        console.log('✅ تم العثور على بيانات اشتراك في subscriptions');
        console.log(`   - الحالة: ${subscription.status}`);
        console.log(`   - تاريخ البداية: ${subscription.startDate}`);
        console.log(`   - تاريخ الانتهاء: ${subscription.endDate}`);
      } else {
        console.log('❌ لم يتم العثور على بيانات اشتراك في subscriptions');
      }
    } catch (error) {
      console.log('⚠️ خطأ في البحث في subscriptions:', error.message);
    }

    // فحص حالة الاشتراك الحالية
    console.log('\n4️⃣ فحص حالة الاشتراك الحالية...');
    const now = new Date();
    const endDate = userData.subscriptionEndDate;
    
    if (endDate) {
      const endDateObj = endDate.toDate ? endDate.toDate() : new Date(endDate);
      const isActive = endDateObj > now;
      
      console.log(`   - تاريخ انتهاء الاشتراك: ${endDateObj}`);
      console.log(`   - التاريخ الحالي: ${now}`);
      console.log(`   - الحالة: ${isActive ? 'نشط' : 'منتهي'}`);
      
      if (isActive && userData.subscriptionStatus === 'active') {
        console.log('✅ الاشتراك نشط ويجب أن يظهر في الواجهة');
      } else {
        console.log('⚠️ هناك مشكلة في عرض حالة الاشتراك');
      }
    } else {
      console.log('⚠️ لا يوجد تاريخ انتهاء للاشتراك');
    }

    // محاكاة إنشاء بيانات الاشتراك للعرض
    console.log('\n5️⃣ محاكاة إنشاء بيانات الاشتراك للعرض...');
    if (userData.subscriptionStatus === 'active' && userData.subscriptionEndDate) {
      const subscriptionData = {
        plan_name: userData.selectedPackage || userData.packageType || 'اشتراك أساسي',
        start_date: userData.lastPaymentDate || new Date().toISOString(),
        end_date: userData.subscriptionEndDate.toDate?.() || userData.subscriptionEndDate,
        status: 'active',
        payment_method: userData.lastPaymentMethod || 'بطاقة ائتمان',
        amount: userData.lastPaymentAmount || 0,
        currency: 'EGP',
        currencySymbol: 'ج.م',
        receipt_url: '',
        autoRenew: false,
        transaction_id: 'N/A',
        invoice_number: `INV-${Date.now()}`,
        customer_name: userData.displayName || userData.name || 'مستخدم',
        customer_email: userData.email || userEmail || '',
        customer_phone: userData.phone || '',
        payment_date: userData.lastPaymentDate || new Date().toISOString(),
        accountType: userData.accountType || 'player',
        packageType: userData.selectedPackage || userData.packageType,
        selectedPackage: userData.selectedPackage || userData.packageType
      };
      
      console.log('✅ بيانات الاشتراك المحاكاة:');
      console.log(`   - الخطة: ${subscriptionData.plan_name}`);
      console.log(`   - الحالة: ${subscriptionData.status}`);
      console.log(`   - المبلغ: ${subscriptionData.amount} ${subscriptionData.currency}`);
      console.log(`   - طريقة الدفع: ${subscriptionData.payment_method}`);
      console.log(`   - تاريخ البداية: ${subscriptionData.start_date}`);
      console.log(`   - تاريخ الانتهاء: ${subscriptionData.end_date}`);
    }

  } catch (error) {
    console.error('❌ خطأ في اختبار عرض الاشتراك:', error);
  }
}

// تشغيل السكريبت
const userEmail = process.argv[2];
if (!userEmail) {
  console.log('❌ يرجى توفير البريد الإلكتروني للمستخدم');
  console.log('مثال: node scripts/test-subscription-display.js user@example.com');
  process.exit(1);
}

testSubscriptionDisplay(userEmail); 