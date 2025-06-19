import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Geidea callback received:', {
      orderId: body.orderId,
      merchantReferenceId: body.merchantReferenceId,
      status: body.status,
      responseCode: body.responseCode,
      amount: body.amount,
      currency: body.currency
    });

    // التحقق من نجاح العملية
    const isSuccess = body.responseCode === '000' && body.status === 'SUCCESS';
    
    if (isSuccess) {
      console.log('Payment successful:', {
        orderId: body.orderId,
        amount: body.amount,
        currency: body.currency,
        transactionId: body.transactionId
      });

      // هنا يمكنك إضافة منطق تحديث قاعدة البيانات
      // مثلاً: تحديث حالة الطلب، إضافة الرصيد للمستخدم، إلخ
      
      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        orderId: body.orderId,
        transactionId: body.transactionId
      });
    } else {
      console.log('Payment failed:', {
        orderId: body.orderId,
        responseCode: body.responseCode,
        status: body.status,
        message: body.responseMessage
      });

      return NextResponse.json({
        success: false,
        message: 'Payment failed',
        orderId: body.orderId,
        error: body.responseMessage
      });
    }

  } catch (error) {
    console.error('Error processing Geidea callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// دعم GET requests أيضاً (لـ return URL)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('orderId');
  const status = searchParams.get('status');
  const responseCode = searchParams.get('responseCode');

  console.log('Geidea return URL accessed:', {
    orderId,
    status,
    responseCode
  });

  // إعادة توجيه المستخدم لصفحة النجاح أو الفشل
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  if (responseCode === '000' && status === 'SUCCESS') {
    return NextResponse.redirect(`${baseUrl}/dashboard/payment/success?orderId=${orderId}`);
  } else {
    return NextResponse.redirect(`${baseUrl}/dashboard/payment/failed?orderId=${orderId}`);
  }
} 