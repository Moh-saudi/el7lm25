// BeOn OTP Service - للتأكيد عند التسجيل
// منفصل عن SMS العادي لتجنب التضارب

interface OTPResponse {
  success: boolean;
  message?: string;
  error?: string;
  otpId?: string;
}

class BeOnOTPService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = process.env.BEON_OTP_BASE_URL || 'https://beon.chat/api/send/message/otp';
    this.token = process.env.BEON_OTP_TOKEN || 'vSCuMzZwLjDxzR882YphwEgW';
  }

  // إرسال رمز OTP للتأكيد
  async sendOTP(phoneNumber: string, templateId?: string): Promise<OTPResponse> {
    try {
      console.log('🔐 Sending OTP to:', phoneNumber);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          templateId: templateId || 'default'
        })
      });

      const result = await response.json();
      console.log('🔐 OTP API Response:', result);

      if (response.ok) {
        return {
          success: true,
          message: 'تم إرسال رمز التأكيد بنجاح',
          otpId: result.otpId
        };
      } else {
        return {
          success: false,
          error: result.error || 'فشل في إرسال رمز التأكيد'
        };
      }
    } catch (error) {
      console.error('❌ OTP sending error:', error);
      return {
        success: false,
        error: 'حدث خطأ في إرسال رمز التأكيد'
      };
    }
  }

  // التحقق من رمز OTP
  async verifyOTP(otpId: string, otpCode: string): Promise<OTPResponse> {
    try {
      console.log('🔐 Verifying OTP:', otpId);
      
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otpId: otpId,
          otpCode: otpCode
        })
      });

      const result = await response.json();
      console.log('🔐 OTP Verification Response:', result);

      if (response.ok && result.verified) {
        return {
          success: true,
          message: 'تم التحقق من رمز التأكيد بنجاح'
        };
      } else {
        return {
          success: false,
          error: result.error || 'رمز التأكيد غير صحيح'
        };
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      return {
        success: false,
        error: 'حدث خطأ في التحقق من رمز التأكيد'
      };
    }
  }
}

export default new BeOnOTPService();












