// تخزين OTP في الذاكرة - أكثر استقراراً
const otpStorage = new Map<string, { otp: string; timestamp: number; attempts: number }>();

// دالة لتطبيع رقم الهاتف
function normalizePhoneNumber(phone: string): string {
  // إزالة المسافات والرموز
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // إضافة + إذا لم تكن موجودة
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}

// تخزين OTP جديد
export function storeOTP(phone: string, otp: string): void {
  const normalizedPhone = normalizePhoneNumber(phone);
  const timestamp = Date.now();
  otpStorage.set(normalizedPhone, { otp, timestamp, attempts: 0 });
  console.log('💾 OTP stored for phone:', normalizedPhone, 'OTP:', otp);
  console.log('💾 Storage size:', otpStorage.size);
  
  // فحص فوري للتأكد من التخزين
  const checkStored = otpStorage.get(normalizedPhone);
  if (checkStored) {
    console.log('✅ OTP confirmed stored:', normalizedPhone, checkStored.otp);
  } else {
    console.log('❌ OTP storage failed for:', normalizedPhone);
  }
}

// الحصول على OTP مخزن
export function getOTP(phone: string): { otp: string; timestamp: number; attempts: number } | undefined {
  const normalizedPhone = normalizePhoneNumber(phone);
  const stored = otpStorage.get(normalizedPhone);
  
  if (stored) {
    console.log('🔍 Found OTP for phone:', normalizedPhone, 'OTP:', stored.otp);
    
    // التحقق من انتهاء الصلاحية (5 دقائق)
    const age = Date.now() - stored.timestamp;
    const maxAge = 5 * 60 * 1000; // 5 دقائق
    
    if (age > maxAge) {
      console.log('⏰ OTP expired for phone:', normalizedPhone, 'Age:', age + 'ms');
      otpStorage.delete(normalizedPhone);
      return undefined;
    }
    
    return stored;
  } else {
    console.log('🔍 No OTP found for phone:', normalizedPhone);
    return undefined;
  }
}

// مسح OTP
export function clearOTP(phone: string): void {
  const normalizedPhone = normalizePhoneNumber(phone);
  const deleted = otpStorage.delete(normalizedPhone);
  if (deleted) {
    console.log('🗑️ OTP cleared for phone:', normalizedPhone);
  } else {
    console.log('🗑️ No OTP to clear for phone:', normalizedPhone);
  }
}

// زيادة عدد المحاولات
export function incrementAttempts(phone: string): void {
  const normalizedPhone = normalizePhoneNumber(phone);
  const stored = otpStorage.get(normalizedPhone);
  if (stored) {
    stored.attempts++;
    otpStorage.set(normalizedPhone, stored);
    console.log('📈 Attempts incremented for phone:', normalizedPhone, 'Total:', stored.attempts);
  }
}

// فحص حالة التخزين
export function getOTPStatus(): void {
  const totalOTPs = otpStorage.size;
  const phones = Array.from(otpStorage.keys());
  
  console.log('📊 OTP Storage Status:');
  console.log('📊 Total OTPs:', totalOTPs);
  console.log('📊 Available phones:', phones);
  
  if (totalOTPs > 0) {
    for (const [phone, data] of otpStorage.entries()) {
      const age = Date.now() - data.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 دقائق
      const isExpired = age > maxAge;
      console.log('📊 Phone:', phone, 'OTP:', data.otp, 'Age:', age + 'ms', 'Expired:', isExpired, 'Attempts:', data.attempts);
    }
  }
} 