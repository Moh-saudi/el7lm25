// src/lib/beon/sms-service.ts

interface BeOnSMSConfig {
  token: string;
  smsToken: string;
  templateToken: string;
  bulkToken: string;
  baseUrl: string;
  senderName: string;
}

interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

interface OTPResponse {
  success: boolean;
  otp?: string;
  error?: string;
  messageId?: string;
}

function normalizePhone(countryCode: string, phone: string) {
  let local = phone.replace(/^0+/, '');
  local = local.replace(/\D/g, '');
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

class BeOnSMSService {
  private config: BeOnSMSConfig;

  constructor() {
    this.config = {
      token: process.env.BEON_SMS_TOKEN || process.env.BEON_WHATSAPP_TOKEN || '',
      smsToken: process.env.BEON_SMS_TOKEN_REGULAR || process.env.BEON_SMS_TOKEN || process.env.BEON_WHATSAPP_TOKEN || '',
      templateToken: process.env.BEON_SMS_TOKEN_TEMPLATE || process.env.BEON_SMS_TOKEN || process.env.BEON_WHATSAPP_TOKEN || '',
      bulkToken: process.env.BEON_SMS_TOKEN_BULK || process.env.BEON_SMS_TOKEN || process.env.BEON_WHATSAPP_TOKEN || '',
      baseUrl: 'https://beon.chat/api',
      senderName: process.env.BEON_SENDER_NAME || 'El7hm'
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    console.log('🔍 Validating SMS config...');
    console.log('🔍 SMS Token:', this.config.smsToken ? '✅ Present' : '❌ Missing');
    console.log('🔍 Template Token:', this.config.templateToken ? '✅ Present' : '❌ Missing');
    console.log('🔍 Bulk Token:', this.config.bulkToken ? '✅ Present' : '❌ Missing');
    console.log('🔍 OTP Token:', this.config.token ? '✅ Present' : '❌ Missing');
    console.log('🔍 Sender Name:', this.config.senderName ? '✅ Present' : '❌ Missing');
    
    // التحقق من وجود على الأقل token واحد صالح
    const hasValidToken = this.config.smsToken || this.config.templateToken || this.config.bulkToken || this.config.token;
    
    if (!hasValidToken) {
      console.error('❌ BeOn SMS tokens are missing');
      console.error('SMS Token:', !!this.config.smsToken);
      console.error('Template Token:', !!this.config.templateToken);
      console.error('Bulk Token:', !!this.config.bulkToken);
      console.error('OTP Token:', !!this.config.token);
      console.error('Please configure BEON_SMS_TOKEN environment variable');
      return false;
    }
    console.log('✅ SMS config validation passed');
    return true;
  }

  // إرسال SMS عادي
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
    console.log('📱 sendSMS called with:', { phoneNumber, messageLength: message.length });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const requestBody = {
        name: this.config.senderName,
        phoneNumber: phoneNumber,
        message: message
      };
      
      console.log('📱 SMS request body:', requestBody);
      console.log('📱 SMS endpoint:', `${this.config.baseUrl}/send/message/sms`);

      const response = await fetch(`${this.config.baseUrl}/send/message/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': this.config.smsToken
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS response status:', response.status);

      if (response.ok) {
        const responseText = await response.text();
        console.log('📱 SMS response:', responseText);
        console.log('✅ SMS sent successfully to:', phoneNumber);
        return { success: true, message: 'SMS sent successfully' };
      } else {
        const errorText = await response.text();
        console.error('❌ SMS sending failed:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال OTP عبر SMS Template
  async sendOTP(phoneNumber: string, templateId: number, otp: string, name?: string): Promise<OTPResponse> {
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/send/message/sms/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': this.config.templateToken
        },
        body: JSON.stringify({
          template_id: templateId,
          phoneNumber: phoneNumber,
          name: name || this.config.senderName,
          vars: [otp] // OTP كمتغير أول
        })
      });

      if (response.ok) {
        console.log('✅ OTP sent successfully to:', phoneNumber);
        return { success: true, otp, message: 'OTP sent successfully' };
      } else {
        const errorText = await response.text();
        console.error('❌ OTP sending failed:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error: any) {
      console.error('❌ OTP sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال OTP باستخدام API الجديد
  async sendOTPNew(phoneNumber: string, name?: string, otpLength: number = 6, lang: string = 'ar'): Promise<OTPResponse> {
    console.log('📱 sendOTPNew called with:', { phoneNumber, name, otpLength, lang });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      // إنشاء FormData
      const formData = new FormData();
      formData.append('phoneNumber', phoneNumber);
      formData.append('name', name || this.config.senderName);
      formData.append('type', 'sms');
      formData.append('otp_length', otpLength.toString());
      formData.append('lang', lang);

      console.log('📱 Sending request to:', `${this.config.baseUrl}/send/message/otp`);
      console.log('📱 Request data:', {
        phoneNumber,
        name: name || this.config.senderName,
        type: 'sms',
        otp_length: otpLength,
        lang
      });

      const response = await fetch(`${this.config.baseUrl}/send/message/otp`, {
        method: 'POST',
        headers: {
          'beon-token': this.config.token
        },
        body: formData
      });

      console.log('📱 Response status:', response.status);
      const result = await response.json();
      console.log('📱 Response data:', result);

      if (response.ok && result.status === 200) {
        console.log('✅ OTP sent successfully to:', phoneNumber);
        return { 
          success: true, 
          otp: result.data, 
          message: result.message || 'OTP sent successfully' 
        };
      } else {
        console.error('❌ OTP sending failed:', result);
        return { 
          success: false, 
          error: result.message || `HTTP ${response.status}: Failed to send OTP` 
        };
      }
    } catch (error: any) {
      console.error('❌ OTP sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال OTP عبر SMS عادي (بديل للقوالب)
  async sendOTPPlain(phoneNumber: string, otp: string, name?: string): Promise<OTPResponse> {
    console.log('📱 sendOTPPlain called with:', { phoneNumber, otp, name });
    
    const message = `رمز التحقق الخاص بك هو: ${otp}\n\nلا تشارك هذا الرمز مع أي شخص.\n\nEl7hm Team`;
    console.log('📱 Plain SMS message:', message);
    
    const result = await this.sendSMS(phoneNumber, message);
    
    if (result.success) {
      console.log('✅ Plain SMS OTP sent successfully');
      return { success: true, otp, message: result.message };
    } else {
      console.error('❌ Plain SMS OTP failed:', result.error);
      return { success: false, error: result.error };
    }
  }

  // إرسال رسائل جماعية
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<SMSResponse> {
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/send/message/sms/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': this.config.bulkToken
        },
        body: JSON.stringify({
          phoneNumbers: phoneNumbers,
          message: message
        })
      });

      if (response.ok) {
        console.log('✅ Bulk SMS sent successfully to:', phoneNumbers.length, 'numbers');
        return { success: true, message: 'Bulk SMS sent successfully' };
      } else {
        const errorText = await response.text();
        console.error('❌ Bulk SMS sending failed:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error: any) {
      console.error('❌ Bulk SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // توليد OTP عشوائي
  generateOTP(): string {
    return Math.random().toString().substring(2, 8);
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
}

// إنشاء instance واحد للخدمة
const beonSMSService = new BeOnSMSService();

export default beonSMSService;
export type { SMSResponse, OTPResponse, BeOnSMSConfig }; 