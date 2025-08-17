// src/lib/beon/sms-service.ts

interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

interface OTPResponse {
  success: boolean;
  otp?: string;
  message?: string;
  error?: string;
}

interface BeOnSMSConfig {
  token: string;
  smsToken: string;
  templateToken: string;
  bulkToken: string;
  baseUrl: string;
  senderName: string;
}

function normalizePhone(countryCode: string, phone: string) {
  const local = phone.replace(/\D/g, '');
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

class BeOnSMSService {
  private config: BeOnSMSConfig;

  constructor() {
    this.config = {
      token: process.env.BEON_SMS_TOKEN || 'SPb4sgedfe', // Token الافتراضي من الوثائق
      smsToken: process.env.BEON_SMS_TOKEN || 'SPb4sgedfe',
      templateToken: process.env.BEON_SMS_TOKEN_TEMPLATE || 'SPb4sbemr5bwb7sjzCqTcL',
      bulkToken: process.env.BEON_SMS_TOKEN_BULK || 'nzQ7ytW8q6yfQdJRFM57yRfR',
      baseUrl: process.env.BEON_BASE_URL || 'https://beon.chat/api',
      senderName: process.env.BEON_SENDER_NAME || 'el7lm'
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    console.log('🔍 Validating SMS config...');
    console.log('🔍 SMS Token:', this.config.smsToken ? '✅ Set' : '❌ Missing');
    console.log('🔍 Template Token:', this.config.templateToken ? '✅ Set' : '❌ Missing');
    console.log('🔍 Bulk Token:', this.config.bulkToken ? '✅ Set' : '❌ Missing');
    console.log('🔍 Base URL:', this.config.baseUrl);
    console.log('🔍 Sender Name:', this.config.senderName);

    return true;
  }

  // إرسال SMS عادي - حسب الوثائق الرسمية
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
          'beon-token': this.config.smsToken // ✅ Header الصحيح حسب الوثائق
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ SMS sent successfully to:', phoneNumber);
        return { success: true, message: 'SMS sent successfully' };
      } else {
        console.error('❌ SMS sending failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال OTP عبر SMS Template - حسب الوثائق الرسمية
  async sendOTP(phoneNumber: string, templateId: number, otp: string, name?: string): Promise<OTPResponse> {
    console.log('📱 sendOTP called with:', { phoneNumber, templateId, otp, name });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const requestBody = {
        template_id: templateId,
        phoneNumber: phoneNumber,
        name: name || this.config.senderName,
        vars: [otp] // OTP كمتغير أول
      };
      
      console.log('📱 SMS Template request body:', requestBody);
      console.log('📱 SMS Template endpoint:', `${this.config.baseUrl}/send/message/sms/template`);

      const response = await fetch(`${this.config.baseUrl}/send/message/sms/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': this.config.templateToken // ✅ Header الصحيح حسب الوثائق
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS Template response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ SMS OTP sent successfully to:', phoneNumber);
        return { success: true, otp: otp, message: 'SMS OTP sent successfully' };
      } else {
        console.error('❌ SMS OTP sending failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS OTP sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال SMS Bulk - حسب الوثائق الرسمية
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<SMSResponse> {
    console.log('📱 sendBulkSMS called with:', { phoneNumbersCount: phoneNumbers.length, messageLength: message.length });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const requestBody = {
        phoneNumbers: phoneNumbers,
        message: message
      };
      
      console.log('📱 SMS Bulk request body:', requestBody);
      console.log('📱 SMS Bulk endpoint:', `${this.config.baseUrl}/send/message/sms/bulk`);

      const response = await fetch(`${this.config.baseUrl}/send/message/sms/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': this.config.bulkToken // ✅ Header الصحيح حسب الوثائق
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS Bulk response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ SMS Bulk sent successfully to:', phoneNumbers.length, 'numbers');
        return { success: true, message: `SMS Bulk sent successfully to ${phoneNumbers.length} numbers` };
      } else {
        console.error('❌ SMS Bulk sending failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS Bulk sending error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default BeOnSMSService;