// سكريبت الإصلاح الشامل لربط اللاعب علي فراس بنادي أسوان العام
console.log(' سكريپت الإصلاح الشامل - النسخة المضمونة');

window.executeCompleteFix = async function() {
  console.log(' بدء الإصلاح الشامل للاعب علي فراس...');
  
  try {
    // فحص Firebase
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase غير متاح');
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    if (!auth.currentUser) {
      throw new Error('يرجى تسجيل الدخول أولاً');
    }
    
    console.log(' Firebase متاح');
    console.log(' المستخدم مصادق:', auth.currentUser.uid);
    
    // البيانات المستهدفة
    const playerId = 'hChYVnu04cXe3KK8JJQu';
    const clubId = 'Nwr78w2YdYQhsKqHzPlCPGwGN2B3';
    const clubName = 'نادي أسوان العام';
    
    console.log(' اللاعب:', playerId);
    console.log(' النادي:', clubId);
    
    // فحص البيانات الحالية
    const playerDoc = await db.collection('players').doc(playerId).get();
    if (!playerDoc.exists) {
      throw new Error('اللاعب غير موجود');
    }
    
    const playerData = playerDoc.data();
    console.log(' اللاعب موجود:', playerData.full_name);
    
    // تحضير بيانات الإصلاح
    const updateData = {
      club_id: clubId,
      clubId: clubId,
      current_club: clubName,
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      fixed_club_link: true,
      fixed_at: new Date().toISOString(),
      fix_version: '2.0'
    };
    
    // تأكيد من المستخدم
    const confirmMessage = 'إصلاح ربط اللاعب ' + playerData.full_name + ' بـ ' + clubName + '. هل تريد المتابعة؟';
    
    if (!confirm(confirmMessage)) {
      console.log(' تم إلغاء العملية');
      return;
    }
    
    // تطبيق الإصلاح
    console.log(' تطبيق الإصلاح...');
    
    try {
      await db.collection('players').doc(playerId).update(updateData);
      console.log(' تم التحديث بنجاح');
    } catch (updateError) {
      if (updateError.code === 'permission-denied') {
        console.log(' خطأ في الأذونات - محاولة الحل البديل...');
        await db.collection('players').doc(playerId).set(updateData, { merge: true });
        console.log(' تم التحديث بالطريقة البديلة');
      } else {
        throw updateError;
      }
    }
    
    // التحقق من النتيجة
    const updatedDoc = await db.collection('players').doc(playerId).get();
    const updatedData = updatedDoc.data();
    
    console.log(' النتيجة النهائية:');
    console.log('    club_id:', updatedData.club_id);
    console.log('    clubId:', updatedData.clubId);
    console.log('    current_club:', updatedData.current_club);
    
    alert(' تم إصلاح ربط اللاعب بالنادي بنجاح!\n\nسيتم إعادة تحميل الصفحة خلال 3 ثوانٍ...');
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error(' خطأ في الإصلاح:', error);
    alert(' فشل الإصلاح: ' + error.message);
  }
};

window.quickCheck = async function() {
  try {
    const db = firebase.firestore();
    const playerId = 'hChYVnu04cXe3KK8JJQu';
    
    const doc = await db.collection('players').doc(playerId).get();
    const data = doc.data();
    
    console.log(' الحالة الحالية:');
    console.log('   - الاسم:', data.full_name);
    console.log('   - club_id:', data.club_id || ' غير موجود');
    console.log('   - clubId:', data.clubId || ' غير موجود');
    console.log('   - current_club:', data.current_club || 'غير محدد');
    
    if (!data.club_id && !data.clubId) {
      console.log(' اللاعب يحتاج إلى إصلاح');
    } else {
      console.log(' اللاعب مرتبط بجهة');
    }
    
  } catch (error) {
    console.error(' خطأ في الفحص:', error);
  }
};

console.log(' سكريپت الإصلاح الشامل جاهز!');
console.log(' الأوامر المتاحة:');
console.log('executeCompleteFix() - تنفيذ الإصلاح');
console.log('quickCheck() - فحص سريع');
console.log(' للبدء: executeCompleteFix()');

setTimeout(() => {
  quickCheck();
}, 1000);
