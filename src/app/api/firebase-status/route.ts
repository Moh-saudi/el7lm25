import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdminStatus, isFirebaseAdminAvailable } from '@/lib/firebase/admin-safe';

export async function GET(request: NextRequest) {
  try {
    const status = getFirebaseAdminStatus();
    const isAvailable = isFirebaseAdminAvailable();
    
    return NextResponse.json({
      success: true,
      isAvailable,
      status,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 