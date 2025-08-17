import { NextRequest, NextResponse } from 'next/server';
import BeOnWhatsAppOTPService from '@/lib/beon/whatsapp-otp-service';

// تنسيق رقم الهاتف المصري + تحديد الدولة
const normalizePhone = (phone: string): { formatted: string; isEgypt: boolean } => {
	let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
	let isEgypt = false;
	if (cleaned.startsWith('+20')) {
		isEgypt = true;
		return { formatted: cleaned, isEgypt };
	}
	if (cleaned.startsWith('20')) {
		isEgypt = true;
		return { formatted: '+' + cleaned, isEgypt };
	}
	if (cleaned.startsWith('0') && cleaned.length === 11 && cleaned.startsWith('01')) {
		isEgypt = true;
		return { formatted: '+20' + cleaned.substring(1), isEgypt };
	}
	// باقي الدول تُعاد كما هي
	return { formatted: cleaned, isEgypt };
};

export async function POST(request: NextRequest) {
	try {
		const { phoneNumber, reference, name, lang = 'ar', otp_length } = await request.json();
		if (!phoneNumber) {
			return NextResponse.json({ error: 'رقم الهاتف مطلوب' }, { status: 400 });
		}

		const { formatted, isEgypt } = normalizePhone(phoneNumber);
		const type: 'sms' | 'whatsapp_link' = isEgypt ? 'sms' : 'whatsapp_link';
		const otpLength = typeof otp_length !== 'undefined' ? Number(otp_length) : undefined;

		console.log('🔐 Unified OTP send:', { original: phoneNumber, formatted, isEgypt, chosenType: type, reference, name, lang, otpLength });

		const service = new BeOnWhatsAppOTPService();
		const result = await service.sendOTP(formatted, reference, { type, name, lang, otpLength });

		if (result.success) {
			return NextResponse.json({
				success: true,
				message: result.message || 'تم إرسال رمز التحقق بنجاح',
				method: type,
				originalPhone: phoneNumber,
				formattedPhone: formatted,
				otp: result.otp,
				reference: result.reference,
				link: result.link,
				data: result.data
			});
		}

		return NextResponse.json({ error: result.error || 'فشل في إرسال رمز التحقق' }, { status: 500 });
	} catch (error) {
		console.error('❌ Unified OTP send error:', error);
		return NextResponse.json({ error: 'حدث خطأ في إرسال رمز التحقق' }, { status: 500 });
	}
}

