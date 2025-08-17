interface BeOnWhatsAppConfig {
  token: string;
  baseUrl: string;
}

interface BeOnWhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  link?: string;
  fallback?: boolean;
}

interface OTPResponse {
  success: boolean;
  otp?: string;
  error?: string;
  message?: string;
}

class BeOnWhatsAppService {
  private config: BeOnWhatsAppConfig;

  constructor() {
    this.config = {
      token: process.env.BEON_SMS_TOKEN || process.env.BEON_WHATSAPP_TOKEN || '',
      baseUrl: 'https://beon.chat/api'
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    const isValid = !!this.config.token;
    if (!isValid) {
      console.warn('⚠️ BeOn WhatsApp configuration is missing');
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
        return { success: true, otp, message: result.message };
      } else {
        console.error('❌ BeOn WhatsApp OTP failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: unknown) {
      console.error('❌ BeOn WhatsApp OTP error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
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

  // إرسال رسالة WhatsApp عبر BeOn API الجديد
  async sendMessage(phoneNumber: string, message: string, type?: 'whatsapp' | 'sms'): Promise<BeOnWhatsAppResponse> {
    if (!this.validateConfig()) {
      return { success: false, error: 'WhatsApp configuration is missing' };
    }

    try {
      // استخدام API الجديد لإرسال OTP
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('name', 'El7hm User');
      formData.append('type', type || 'whatsapp'); // استخدام WhatsApp كافتراضي
      formData.append('otp_length', '6');
      formData.append('lang', 'ar');

      console.log('📱 Sending request to BeOn WhatsApp API:', {
        phoneNumber,
        type: type || 'whatsapp',
        otp_length: 6,
        lang: 'ar'
      });

      const response = await fetch(`${this.config.baseUrl}/send/message/otp`, {
        method: 'POST',
        headers: {
          'beon-token': this.config.token
        },
        body: formData
      });

      console.log('📱 BeOn WhatsApp response status:', response.status);
      const result = await response.json();
      console.log('📱 BeOn WhatsApp response data:', result);

      if (response.ok && result.status === 200) {
        console.log('✅ BeOn WhatsApp message sent successfully to:', phoneNumber);
        return { 
          success: true, 
          message: result.message || 'WhatsApp message sent successfully',
          link: result.link // إذا كان هناك رابط WhatsApp
        };
      } else {
        console.error('❌ BeOn WhatsApp sending failed:', result);
        
        // إذا فشل WhatsApp، جرب SMS كبديل
        if (type !== 'sms') {
          console.log('📱 Trying SMS fallback...');
          const smsResult = await this.sendSMSFallback(phoneNumber, message);
          if (smsResult.success) {
            return { 
              success: true, 
              message: 'تم إرسال الرسالة عبر SMS (WhatsApp غير متاح)',
              fallback: true
            };
          }
        }
        
        return { 
          success: false, 
          error: result.message || `HTTP ${response.status}: Failed to send WhatsApp message` 
        };
      }
    } catch (error: unknown) {
      console.error('❌ BeOn WhatsApp error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // إرسال SMS كبديل عند فشل WhatsApp
  private async sendSMSFallback(phoneNumber: string, message: string): Promise<BeOnWhatsAppResponse> {
    try {
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('name', 'El7hm User');
      formData.append('type', 'sms');
      formData.append('otp_length', '6');
      formData.append('lang', 'ar');

      const response = await fetch(`${this.config.baseUrl}/send/message/otp`, {
        method: 'POST',
        headers: {
          'beon-token': this.config.token
        },
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        console.log('✅ SMS fallback sent successfully to:', phoneNumber);
        return { 
          success: true, 
          message: 'SMS sent successfully as fallback'
        };
      } else {
        console.error('❌ SMS fallback failed:', result);
        return { 
          success: false, 
          error: result.message || 'SMS fallback failed' 
        };
      }
    } catch (error: unknown) {
      console.error('❌ SMS fallback error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // تنسيق رقم الهاتف
  formatPhoneNumber(phoneNumber: string): string {
    // إزالة جميع الأحرف غير الرقمية
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // إذا لم يبدأ بـ +، أضف +966 كافتراضي
    if (!phoneNumber.startsWith('+')) {
      cleaned = '+966' + cleaned;
      } else {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  // التحقق من صحة رقم الهاتف
  validatePhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // التحقق من أن الرقم يحتوي على رمز الدولة و 9-15 رقم
    return /^\+\d{1,3}\d{9,15}$/.test(formatted);
  }

  // توليد OTP عشوائي
  generateOTP(): string {
    return Math.random().toString().substring(2, 8);
  }
}

// دالة وهمية لإرسال OTP عبر BeOn WhatsApp (لتجنب خطأ الاستيراد)
export async function sendBeOnWhatsAppOTP(phone: string, otp: string, name?: string) {
  const service = new BeOnWhatsAppService();
  return await service.sendOTP(phone, otp, name, 'whatsapp');
}