// سكريبت فحص سريع للنظام
// يمكن تشغيله من المتصفح أو Node.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, limit } = require('firebase/firestore');

// تكوين Firebase (يستخدم نفس التكوين من المشروع)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

async function quickSystemCheck() {
  console.log('🔍 بدء الفحص السريع للنظام...\n');

  try {
    // تهيئة Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const report = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      collections: {},
      issues: [],
      recommendations: []
    };

    // 1. فحص المجموعات الرئيسية
    console.log('📊 فحص المجموعات الرئيسية...');
    const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        report.collections[collectionName] = {
          status: 'healthy',
          count: snapshot.size,
          message: `مجموعة ${collectionName}: ${snapshot.size} حساب`
        };
        console.log(`✅ ${collectionName}: ${snapshot.size} حساب`);
      } catch (error) {
        report.collections[collectionName] = {
          status: 'error',
          message: error.message
        };
        report.issues.push(`${collectionName} collection error`);
        console.log(`❌ خطأ في ${collectionName}:`, error.message);
      }
    }

    // 2. فحص المدفوعات
    console.log('\n💳 فحص المدفوعات...');
    try {
      const paymentsSnapshot = await getDocs(collection(db, 'bulkPayments'));
      const totalPayments = paymentsSnapshot.size;
      const completedPayments = paymentsSnapshot.docs.filter(doc => 
        doc.data().status === 'completed'
      ).length;
      
      report.payments = {
        status: 'healthy',
        total: totalPayments,
        completed: completedPayments,
        message: `${totalPayments} مدفوعات، ${completedPayments} مكتملة`
      };
      console.log(`✅ ${totalPayments} مدفوعات، ${completedPayments} مكتملة`);
    } catch (error) {
      report.payments = {
        status: 'error',
        message: error.message
      };
      report.issues.push('Payments check failed');
      console.log('❌ خطأ في فحص المدفوعات:', error.message);
    }

    // 3. فحص الاشتراكات
    console.log('\n📋 فحص الاشتراكات...');
    try {
      const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
      const totalSubscriptions = subscriptionsSnapshot.size;
      const activeSubscriptions = subscriptionsSnapshot.docs.filter(doc => 
        doc.data().status === 'active'
      ).length;
      
      report.subscriptions = {
        status: 'healthy',
        total: totalSubscriptions,
        active: activeSubscriptions,
        message: `${totalSubscriptions} اشتراك، ${activeSubscriptions} نشط`
      };
      console.log(`✅ ${totalSubscriptions} اشتراك، ${activeSubscriptions} نشط`);
    } catch (error) {
      report.subscriptions = {
        status: 'error',
        message: error.message
      };
      report.issues.push('Subscriptions check failed');
      console.log('❌ خطأ في فحص الاشتراكات:', error.message);
    }

    // 4. فحص الحسابات النشطة
    console.log('\n👥 فحص الحسابات النشطة...');
    try {
      const activeUsersQuery = query(
        collection(db, 'users'),
        where('isActive', '==', true)
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;
      
      const playersSnapshot = await getDocs(collection(db, 'players'));
      const totalPlayers = playersSnapshot.size;
      
      report.activeAccounts = {
        status: 'healthy',
        activeUsers,
        totalPlayers,
        message: `${activeUsers} مستخدم نشط، ${totalPlayers} لاعب`
      };
      console.log(`✅ ${activeUsers} مستخدم نشط، ${totalPlayers} لاعب`);
    } catch (error) {
      report.activeAccounts = {
        status: 'error',
        message: error.message
      };
      report.issues.push('Active accounts check failed');
      console.log('❌ خطأ في فحص الحسابات النشطة:', error.message);
    }

    // 5. تحديد الحالة العامة
    const errorComponents = Object.values(report.collections).filter(
      comp => comp.status === 'error'
    ).length;
    
    const healthyComponents = Object.values(report.collections).filter(
      comp => comp.status === 'healthy'
    ).length;

    if (errorComponents > 0) {
      report.status = 'warning';
      report.recommendations.push('بعض المجموعات تحتاج فحص');
    } else {
      report.status = 'healthy';
      report.recommendations.push('النظام يعمل بشكل جيد');
    }

    // 6. إحصائيات نهائية
    console.log('\n📊 إحصائيات نهائية:');
    console.log('═══════════════════════════════════════');
    console.log(`الحالة العامة: ${report.status}`);
    console.log(`المجموعات الصحية: ${healthyComponents}`);
    console.log(`المجموعات المعطوبة: ${errorComponents}`);
    console.log(`المشاكل المكتشفة: ${report.issues.length}`);

    // 7. التوصيات
    console.log('\n💡 التوصيات:');
    console.log('═══════════════════════════════════════');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    return report;

  } catch (error) {
    console.error('❌ خطأ في الفحص السريع:', error);
    return {
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// تشغيل الفحص
if (require.main === module) {
  quickSystemCheck()
    .then(report => {
      console.log('\n🎉 تم إكمال الفحص السريع بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ فشل في الفحص السريع:', error);
      process.exit(1);
    });
}

module.exports = { quickSystemCheck }; 