const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// تكوين Firebase
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

async function testPaymentSearch(phoneNumber) {
  console.log('🔍 اختبار البحث عن المدفوعات بالهاتف:', phoneNumber);
  console.log('='.repeat(60));

  try {
    // البحث في مجموعة bulk_payments
    console.log('\n📊 البحث في مجموعة bulk_payments:');
    const bulkPaymentsRef = collection(db, 'bulk_payments');
    
    // البحث بـ customerPhone
    const q1 = query(bulkPaymentsRef, where('customerPhone', '==', phoneNumber));
    const snapshot1 = await getDocs(q1);
    
    if (!snapshot1.empty) {
      console.log(`✅ تم العثور على ${snapshot1.size} عملية دفع بـ customerPhone`);
      snapshot1.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات بـ customerPhone');
    }
    
    // البحث بـ phone
    const q2 = query(bulkPaymentsRef, where('phone', '==', phoneNumber));
    const snapshot2 = await getDocs(q2);
    
    if (!snapshot2.empty) {
      console.log(`✅ تم العثور على ${snapshot2.size} عملية دفع بـ phone`);
      snapshot2.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات بـ phone');
    }
    
    // البحث في مجموعة bulkPayments
    console.log('\n📊 البحث في مجموعة bulkPayments:');
    const bulkPaymentsRef2 = collection(db, 'bulkPayments');
    
    // البحث بـ customerPhone
    const q3 = query(bulkPaymentsRef2, where('customerPhone', '==', phoneNumber));
    const snapshot3 = await getDocs(q3);
    
    if (!snapshot3.empty) {
      console.log(`✅ تم العثور على ${snapshot3.size} عملية دفع بـ customerPhone`);
      snapshot3.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات بـ customerPhone');
    }
    
    // البحث بـ phone
    const q4 = query(bulkPaymentsRef2, where('phone', '==', phoneNumber));
    const snapshot4 = await getDocs(q4);
    
    if (!snapshot4.empty) {
      console.log(`✅ تم العثور على ${snapshot4.size} عملية دفع بـ phone`);
      snapshot4.forEach((doc) => {
        const data = doc.data();
        console.log(`\n   💳 عملية دفع (ID: ${doc.id}):`);
        console.log(`      - رقم الطلب: ${data.orderId || data.merchantReferenceId || 'غير محدد'}`);
        console.log(`      - المبلغ: ${data.amount || data.totalAmount || 0} ${data.currency || 'EGP'}`);
        console.log(`      - الحالة: ${data.paymentStatus || data.status || 'غير محدد'}`);
        console.log(`      - تاريخ الدفع: ${data.createdAt || 'غير محدد'}`);
        console.log(`      - عدد اللاعبين: ${data.players?.length || data.selectedPlayerIds?.length || 0}`);
        console.log(`      - نوع الباقة: ${data.subscriptionType || data.selectedPackage || 'غير محدد'}`);
      });
    } else {
      console.log('❌ لم يتم العثور على مدفوعات بـ phone');
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن المدفوعات:', error);
  }
}

// تشغيل الاختبار
testPaymentSearch('0333333333');













