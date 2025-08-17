interface WhatsAppConfig {
  businessToken?: string;
  businessPhoneId?: string;
  greenApiToken?: string;
  greenApiInstance?: string;
  defaultType: 'business' | 'green';
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface OTPResponse {
  success: boolean;
  otp?: string;
  error?: string;
}

function normalizePhone(countryCode: string, phone: string) {
  let local = phone.replace(/^0+/, '');
  local = local.replace(/\D/g, '');
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      businessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      businessPhoneId: process.env.WHATSAPP_PHONE_ID,
      greenApiToken: process.env.GREEN_API_TOKEN,
      greenApiInstance: process.env.GREEN_API_INSTANCE,
      defaultType: 'business' // أو 'green' حسب التفضيل
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    if (this.config.defaultType === 'business') {
      const isValid = !!(this.config.businessToken && this.config.businessPhoneId);
      if (!isValid) {
        console.warn('⚠️ WhatsApp Business API not configured properly');
        console.warn('   Business Token:', this.config.businessToken ? 'Set' : 'Missing');
        console.warn('   Phone ID:', this.config.businessPhoneId ? 'Set' : 'Missing');
      }
      return isValid;
    } else {
      const isValid = !!(this.config.greenApiToken && this.config.greenApiInstance);
      if (!isValid) {
        console.warn('⚠️ WhatsApp Green API not configured properly');
        console.warn('   Green Token:', this.config.greenApiToken ? 'Set' : 'Missing');
        console.warn('   Instance:', this.config.greenApiInstance ? 'Set' : 'Missing');
      }
      return isValid;
    }
  }

  // إرسال OTP عبر WhatsApp
  async sendOTP(phoneNumber: string, otp: string, name?: string, type?: 'business' | 'green'): Promise<OTPResponse> {
    console.log('📱 WhatsApp sendOTP called with:', { phoneNumber, otp, name, type });
    
    const message = this.createOTPMessage(otp, name);
    const result = await this.sendMessage(phoneNumber, message, type);
    
    if (result.success) {
      console.log('✅ WhatsApp OTP sent successfully');
      return { success: true, otp };
    } else {
      console.error('❌ WhatsApp OTP failed:', result.error);
      return { success: false, error: result.error };
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

  // إرسال رسالة WhatsApp عادية
  async sendMessage(phoneNumber: string, message: string, type?: 'business' | 'green'): Promise<WhatsAppResponse> {
    if (!this.validateConfig()) {
      return { success: false, error: 'WhatsApp configuration is missing' };
    }

    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    if (!this.validatePhoneNumber(formattedPhone)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const serviceType = type || this.config.defaultType;

    try {
      if (serviceType === 'business') {
        return await this.sendBusinessMessage(formattedPhone, message);
      } else {
        return await this.sendGreenMessage(formattedPhone, message);
      }
    } catch (error: unknown) {
      console.error('WhatsApp sending error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // إرسال عبر WhatsApp Business API
  private async sendBusinessMessage(phone: string, message: string): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${this.config.businessPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.businessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone.replace('+', ''),
          type: 'text',
          text: { body: message }
        })
      });

      const result = await response.json();
      
      if (response.ok && result.messages) {
        console.log('✅ WhatsApp Business message sent successfully to:', phone);
        return { success: true, messageId: result.messages[0].id };
      } else {
        console.error('❌ WhatsApp Business sending failed:', result.error);
        return { success: false, error: result.error?.message || 'Unknown error' };
      }
    } catch (error: unknown) {
      console.error('❌ WhatsApp Business API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // إرسال عبر Green API
  private async sendGreenMessage(phone: string, message: string): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(
        `https://api.green-api.com/waInstance${this.config.greenApiInstance}/sendMessage/${this.config.greenApiToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${phone.replace('+', '')}@c.us`,
            message: message
          })
        }
      );

      const result = await response.json();
      
      if (response.ok && result.idMessage) {
        console.log('✅ WhatsApp Green API message sent successfully to:', phone);
        return { success: true, messageId: result.idMessage };
      } else {
        console.error('❌ WhatsApp Green API sending failed:', result.error);
        return { success: false, error: result.error || 'Unknown error' };
      }
    } catch (error: unknown) {
      console.error('❌ WhatsApp Green API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  // إرسال رسائل جماعية
  async sendBulkMessages(phoneNumbers: string[], message: string, type?: 'business' | 'green'): Promise<WhatsAppResponse> {
    if (!this.validateConfig()) {
      return { success: false, error: 'WhatsApp configuration is missing' };
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const phone of phoneNumbers) {
      const result = await this.sendMessage(phone, message, type);
      results.push({ phone, ...result });
      
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
    }

    console.log(`📱 Bulk WhatsApp: ${successCount} sent, ${errorCount} failed`);

    return {
      success: successCount > 0,
      messageId: `bulk_${Date.now()}`,
      error: errorCount > 0 ? `${errorCount} messages failed` : undefined
    };
  }
}

const instance = new WhatsAppService();
export default instance;
export const sendWhatsAppMessage = (phoneNumber: string, message: string) => instance.sendMessage(phoneNumber, message);