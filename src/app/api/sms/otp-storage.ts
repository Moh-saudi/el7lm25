import { getAdminDb } from '@/lib/firebase/admin';

// دالة لتطبيع رقم الهاتف
function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

// تخزين OTP جديد
export async function storeOTP(phone: string, otp: string, source: 'whatsapp' | 'sms' = 'sms'): Promise<void> {
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  await db.collection('otps').doc(normalizedPhone).set({
    otp,
    timestamp: Date.now(),
    attempts: 0,
    expired: false,
    source
  });
}

// الحصول على OTP مخزن (الأولوية للواتساب ثم SMS)
export async function getOTP(phone: string): Promise<any | undefined> {
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  const docSnap = await db.collection('otps').doc(normalizedPhone).get();
  if (!docSnap.exists) return undefined;
  const data = docSnap.data();
  // التحقق من انتهاء الصلاحية (5 دقائق)
  const age = Date.now() - data.timestamp;
  const maxAge = 5 * 60 * 1000;
  if (age > maxAge) {
    await db.collection('otps').doc(normalizedPhone).update({ expired: true });
    data.expired = true;
  }
  return data;
}

// الحصول على OTP حسب النوع
export async function getOTPBySource(phone: string, source: 'whatsapp' | 'sms'): Promise<any | undefined> {
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  const docSnap = await db.collection('otps').doc(normalizedPhone).get();
  if (!docSnap.exists) return undefined;
  const data = docSnap.data();
  if (data.source !== source) return undefined;
    // التحقق من انتهاء الصلاحية (5 دقائق)
  const age = Date.now() - data.timestamp;
  const maxAge = 5 * 60 * 1000;
    if (age > maxAge) {
    await db.collection('otps').doc(normalizedPhone).update({ expired: true });
    data.expired = true;
    }
  return data;
}

// مسح OTP
export async function clearOTP(phone: string): Promise<void> {
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  await db.collection('otps').doc(normalizedPhone).delete();
}

// زيادة عدد المحاولات
export async function incrementAttempts(phone: string): Promise<void> {
  const db = getAdminDb();
  const normalizedPhone = normalizePhoneNumber(phone);
  const docRef = db.collection('otps').doc(normalizedPhone);
  await db.runTransaction(async (t) => {
    const docSnap = await t.get(docRef);
    if (!docSnap.exists) return;
    const data = docSnap.data();
    const attempts = (data.attempts || 0) + 1;
    t.update(docRef, { attempts });
  });
}

// فحص حالة التخزين (للتشخيص فقط)
export async function getOTPStatus(): Promise<any> {
  const db = getAdminDb();
  const snapshot = await db.collection('otps').get();
  const all = snapshot.docs.map(doc => ({ phone: doc.id, ...doc.data() }));
  console.log('📊 Firestore OTP Storage:', all);
  return all;
} 