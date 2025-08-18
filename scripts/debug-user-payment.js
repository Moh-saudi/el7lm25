// scripts/debug-user-payment.js
console.log('🔍 فحص حالة المستخدم: 0555555555@hagzzgo.com');
console.log('==============================================\n');

// محاكاة البيانات المتوقعة
const expectedData = {
  userEmail: '0555555555@hagzzgo.com',
  possibleUserIds: [
    'user_with_phone_0555555555',
    'user_with_email_0555555555@hagzzgo.com',
    'converted_player_0555555555'
  ],
  collections: [
    'users',
    'players', 
    'clubs',
    'academies',
    'agents',
    'trainers'
  ],
  paymentCollections: [
    'bulkPayments',
    'subscriptions',
    'bulk_payments'
  ]
};

console.log('📋 البيانات المتوقعة:');
console.log('====================');
console.log(`البريد الإلكتروني: ${expectedData.userEmail}`);
console.log(`المجموعات المحتملة: ${expectedData.collections.join(', ')}`);
console.log(`مجموعات المدفوعات: ${expectedData.paymentCollections.join(', ')}`);

console.log('\n🔍 المشاكل المحتملة:');
console.log('===================');
console.log('1. المستخدم قد يكون في مجموعة مختلفة (players بدلاً من users)');
console.log('2. البريد الإلكتروني قد يكون محفوظ بتنسيق مختلف');
console.log('3. المدفوعات قد تكون محفوظة بدون userId صحيح');
console.log('4. معالج الـ callback قد لا يعمل بشكل صحيح');

console.log('\n🎯 الحلول المقترحة:');
console.log('===================');
console.log('1. فحص جميع المجموعات للبحث عن المستخدم');
console.log('2. البحث بالهاتف بدلاً من البريد الإلكتروني');
console.log('3. فحص معالج الـ callback في /api/geidea/callback/route.ts');
console.log('4. فحص صفحة الاشتراك في /dashboard/subscription/page.tsx');

console.log('\n🧪 خطوات الاختبار:');
console.log('==================');
console.log('1. افتح المتصفح على: http://localhost:3001');
console.log('2. اذهب إلى: http://localhost:3001/dashboard/subscription');
console.log('3. سجل دخول بحساب: 0555555555@hagzzgo.com');
console.log('4. افتح Developer Tools ومراقبة Console');
console.log('5. افحص Network tab للـ API calls');

console.log('\n🔧 فحص قاعدة البيانات:');
console.log('=====================');
console.log('1. افتح Firebase Console');
console.log('2. اذهب إلى Firestore Database');
console.log('3. ابحث في مجموعة "users" عن: 0555555555@hagzzgo.com');
console.log('4. ابحث في مجموعة "players" عن نفس البريد');
console.log('5. افحص مجموعة "bulkPayments" للبحث عن مدفوعات هذا المستخدم');

console.log('\n📊 النتائج المتوقعة:');
console.log('===================');
console.log('✅ إذا وجد المستخدم:');
console.log('   - فحص subscriptionStatus في بيانات المستخدم');
console.log('   - فحص subscriptionEndDate');
console.log('   - فحص lastPaymentDate و lastPaymentAmount');

console.log('❌ إذا لم يوجد المستخدم:');
console.log('   - البحث في مجموعة "players"');
console.log('   - البحث بالهاتف بدلاً من البريد الإلكتروني');
console.log('   - فحص إذا كان المستخدم محول من نظام قديم');

console.log('\n🚨 إذا وجدت مدفوعات ولكن لا توجد اشتراك:');
console.log('==========================================');
console.log('1. فحص معالج الـ callback في /api/geidea/callback/route.ts');
console.log('2. التأكد من أن updateUserSubscription تعمل بشكل صحيح');
console.log('3. فحص أن userId يتم استخراجه بشكل صحيح من merchantReferenceId');

console.log('\n✨ الخطوات التالية:');
console.log('==================');
console.log('1. فتح التطبيق في المتصفح');
console.log('2. تسجيل دخول المستخدم');
console.log('3. فحص صفحة الاشتراك');
console.log('4. مراقبة Console للأخطاء');
console.log('5. فحص قاعدة البيانات مباشرة');

console.log('\n🎯 إذا لم تظهر البيانات في صفحة الاشتراك:');
console.log('==========================================');
console.log('1. فحص fetchSubscriptionStatus في صفحة الاشتراك');
console.log('2. التأكد من أن البحث في المجموعات الصحيحة');
console.log('3. فحص أن userId يتم تمريره بشكل صحيح');
console.log('4. إضافة console.log لمراقبة عملية البحث');

console.log('\n✅ السكريبت جاهز للاستخدام!'); 