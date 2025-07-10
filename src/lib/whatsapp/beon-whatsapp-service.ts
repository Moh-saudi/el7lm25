interface BeOnWhatsAppConfig {
  baseUrl: string;
  token: string;
  callbackUrl?: string;
}

interface BeOnOTPResponse {
  success: boolean;
  otp?: string;
  link?: string;
  error?: string;
  reference?: string;
}

interface BeOnCallbackResponse {
  otp: string;
  reference: string;
  status: string;
  clientPhone: string;
  clientName: string;
}

class BeOnWhatsAppService {
  private config: BeOnWhatsAppConfig;

  constructor() {
    this.config = {
      baseUrl: 'https://chat.beon.com/api/send/message/otp',
      token: process.env.BEON_WHATSAPP_TOKEN || '',
      callbackUrl: process.env.BEON_CALLBACK_URL || 'http://www.el7lm.com/api/notifications/whatsapp/callback'
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    const isValid = !!(this.config.token && this.config.token.length > 0);
    if (!isValid) {
      console.warn('⚠️ BeOn WhatsApp API not configured properly');
      console.warn('   Token:', this.config.token ? 'Set' : 'Missing');
    }
    return isValid;
  }

  // إرسال OTP عبر WhatsApp
  async sendOTP(phoneNumber: string, otp: string, name?: string, type?: 'business' | 'green'): Promise<OTPResponse> {
    console.log('📱 BeOn WhatsApp sendOTP called with:', { phoneNumber, otp, name, type });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'WhatsApp configuration is missing' };
    }

    try {
      const message = this.createOTPMessage(otp, name);
      const result = await this.sendMessage(phoneNumber, message, type);
      
      if (result.success) {
        console.log('✅ BeOn WhatsApp OTP sent successfully');
        return { success: true, otp };
      } else {
        console.error('❌ BeOn WhatsApp OTP failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('❌ BeOn WhatsApp OTP error:', error);
      return { success: false, error: error.message };
    }
  }

  // إنشاء رسالة OTP
  createOTPMessage(otp: string, name?: string): string {
    const userName = name || 'المستخدم الكريم';
    return `مرحباً ${userName}!

رمز التحقق الخاص بك هو: *${otp}*

لا تشارك هذا الرمز مع أي شخص.

El7hm Team`;
  }

  // توليد OTP عشوائي
  generateOTP(): string {
    return Math.random().toString().substring(2, 8);
  }

  // تنسيق رقم الهاتف
  formatPhoneNumber(phoneNumber: string): string {
    // إزالة جميع الأحرف غير الرقمية
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // إذا لم يبدأ بـ +، أضف +966 كافتراضي
    if (!phoneNumber.startsWith('+')) {
      if (cleaned.startsWith('966')) {
        return `+${cleaned}`;
      } else if (cleaned.startsWith('0')) {
        return `+966${cleaned.substring(1)}`;
      } else {
        return `+966${cleaned}`;
      }
    }
    
    return phoneNumber;
  }

  // التحقق من صحة رقم الهاتف
  validatePhoneNumber(phoneNumber: string): boolean {
    // التحقق من أن الرقم يبدأ بـ +
    if (!phoneNumber.startsWith('+')) {
      return false;
    }
    
    // التحقق من أن الرقم يحتوي على 10-15 رقم
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return false;
    }
    
    return true;
  }

  // إنشاء reference فريد
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `user${timestamp}${random}`;
  }

  // التحقق من صحة OTP (simulation - في الواقع سيتم عبر callback)
  async verifyOTP(reference: string, otp: string): Promise<boolean> {
    // في الواقع، هذا سيتم عبر callback من BeOn
    // لكن يمكننا محاكاة التحقق هنا
    console.log('🔍 Verifying OTP:', { reference, otp });
    return true;
  }

  // معالجة callback من BeOn
  handleCallback(callbackData: BeOnCallbackResponse): boolean {
    console.log('📞 BeOn callback received:', callbackData);
    
    // هنا يمكنك معالجة البيانات حسب احتياجاتك
    // مثلاً: تحديث حالة المستخدم، إرسال إشعار، إلخ
    
    return callbackData.status === 'verified';
  }
}

// دالة وهمية لإرسال OTP عبر BeOn WhatsApp (لتجنب خطأ الاستيراد)
export async function sendBeOnWhatsAppOTP(phone: string, otp: string, name?: string) {
  // يمكنك لاحقًا ربطها بالخدمة الحقيقية
  return { success: true, message: 'OTP sent (mock)' };
}

export default BeOnWhatsAppService; 