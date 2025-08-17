import { getAdminDb } from '@/lib/firebase/admin';

// دالة لتطبيع رقم الهاتف
function normalizePhoneNumber(phone: string): string {
  // إزالة كل الأحرف غير الرقمية ما عدا +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // إذا لم يبدأ بـ +، نضيف 966
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('966')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      cleaned = '+966' + cleaned.substring(1);
    } else {
      cleaned = '+966' + cleaned;
    }
  }
  
  return cleaned;
}

// تخزين OTP جديد
export async function storeOTP(phone: string, otp: string, source: 'whatsapp' | 'sms' = 'sms'): Promise<void> {
  console.log('📝 Storing OTP:', { phone, otp, source });
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log('📱 Normalized phone:', normalizedPhone);
  
  // مسح أي OTP قديم أولاً
  await clearOTP(normalizedPhone);
  
  // تخزين OTP الجديد
  await db.collection('otps').doc(normalizedPhone).set({
    otp,
    timestamp: Date.now(),
    attempts: 0,
    expired: false,
    source,
    originalPhone: phone // نحتفظ برقم الهاتف الأصلي للتتبع
  });
  
  console.log('✅ OTP stored successfully');
}

// الحصول على OTP مخزن
export async function getOTP(phone: string): Promise<any | undefined> {
  console.log('🔍 Getting OTP for:', phone);
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log('📱 Normalized phone:', normalizedPhone);
  
  const docSnap = await db.collection('otps').doc(normalizedPhone).get();
  if (!docSnap.exists) {
    console.log('❌ No OTP found for:', normalizedPhone);
    return undefined;
  }
  
  const data = docSnap.data();
  console.log('📋 Found OTP data:', { ...data, otp: '***' });
  
  // التحقق من انتهاء الصلاحية (5 دقائق)
  const age = Date.now() - data.timestamp;
  const maxAge = 5 * 60 * 1000;
  
  if (age > maxAge) {
    console.log('⏰ OTP expired. Age:', age, 'ms');
    await db.collection('otps').doc(normalizedPhone).update({ expired: true });
    data.expired = true;
  }
  
  return data;
}

// الحصول على OTP حسب النوع
export async function getOTPBySource(phone: string, source: 'whatsapp' | 'sms'): Promise<any | undefined> {
  console.log('🔍 Getting OTP by source:', { phone, source });
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log('📱 Normalized phone:', normalizedPhone);
  
  const docSnap = await db.collection('otps').doc(normalizedPhone).get();
  if (!docSnap.exists) {
    console.log('❌ No OTP found for:', normalizedPhone);
    return undefined;
  }
  
  const data = docSnap.data();
  if (data.source !== source) {
    console.log('❌ OTP source mismatch. Expected:', source, 'Found:', data.source);
    return undefined;
  }
  
  // التحقق من انتهاء الصلاحية (5 دقائق)
  const age = Date.now() - data.timestamp;
  const maxAge = 5 * 60 * 1000;
  
  if (age > maxAge) {
    console.log('⏰ OTP expired. Age:', age, 'ms');
    await db.collection('otps').doc(normalizedPhone).update({ expired: true });
    data.expired = true;
  }
  
  return data;
}

// مسح OTP
export async function clearOTP(phone: string): Promise<void> {
  console.log('🗑️ Clearing OTP for:', phone);
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log('📱 Normalized phone:', normalizedPhone);
  
  await db.collection('otps').doc(normalizedPhone).delete();
  console.log('✅ OTP cleared successfully');
}

// زيادة عدد المحاولات
export async function incrementAttempts(phone: string): Promise<void> {
  console.log('📈 Incrementing attempts for:', phone);
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log('📱 Normalized phone:', normalizedPhone);
  
  const docRef = db.collection('otps').doc(normalizedPhone);
  
  await db.runTransaction(async (t) => {
    const docSnap = await t.get(docRef);
    if (!docSnap.exists) {
      console.log('❌ No OTP found to increment attempts');
      return;
    }
    
    const data = docSnap.data();
    const attempts = (data.attempts || 0) + 1;
    console.log('📊 New attempts count:', attempts);
    
    t.update(docRef, { 
      attempts,
      expired: attempts >= 3 // تعطيل بعد 3 محاولات
    });
  });
}

// فحص حالة التخزين (للتشخيص فقط)
export async function getOTPStatus(): Promise<any> {
  console.log('📊 Getting OTP storage status');
  const db = getAdminDb();
  const snapshot = await db.collection('otps').get();
  const all = snapshot.docs.map(doc => ({ 
    phone: doc.id, 
    ...doc.data(),
    otp: '***' // إخفاء OTP في السجلات
  }));
  console.log('📊 Current OTP storage:', all);
  return all;
}