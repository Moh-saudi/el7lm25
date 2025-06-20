// Console Filter - إخفاء أخطاء Geidea والأخطاء المتكررة
// يعمل في جميع البيئات (development & production)

if (typeof window !== 'undefined') {
  // حفظ console methods الأصلية
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // قائمة شاملة للأخطاء المراد إخفاؤها
  const hiddenErrors = [
    // Geidea errors
    'geidea',
    'geideaCheckout',
    'geideaCheckoutHPP',
    'x-correlation-id',
    'refused to get unsafe header',
    
    // Frame errors
    'frame-ancestors',
    'refused to frame',
    'blocked a frame with origin',
    'accessing a cross-origin frame',
    'failed to read a named property',
    
    // CSP errors
    'content security policy',
    'x-frame-options may only be set via an http header',
    'is ignored when delivered via a <meta> element',
    
    // Payment gateway errors
    'mastercard.com',
    'gateway.mastercard',
    'ap.gateway.mastercard',
    
    // Generic CORS/Security errors
    'securityerror',
    'cors',
    'cross-origin',
    'report only',
    '[report only]',
    
    // Network errors
    'failed to fetch',
    'refused to connect',
    'err_blocked_by_client',
    'err_network',
    
    // Firebase errors
    'auth/network-request-failed',
    
    // Development logs
    'hpp started',
    'environment: prod',
    'gateway url',
    'hpp url',
    'build version',
    
    // Null reading errors
    'cannot read properties of null',
    'reading \'style\'',
    'reading \'document\'',
  ];

  // فحص إذا كانت الرسالة يجب إخفاؤها
  const shouldHideMessage = (message: string) => {
    const lowerMessage = message.toLowerCase();
    return hiddenErrors.some(error => lowerMessage.includes(error));
  };

  // الرسائل التي تظهر مرة واحدة فقط
  const shownOnce = new Set();
  
  const showOnceOnly = (key: string, replacement: string) => {
    if (!shownOnce.has(key)) {
      shownOnce.add(key);
      originalConsoleLog(replacement);
    }
  };

  // استبدال console.error
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldHideMessage(message)) {
      originalConsoleError(...args);
    }
  };

  // استبدال console.warn  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldHideMessage(message)) {
      originalConsoleWarn(...args);
    }
  };

  // استبدال console.log مع تنظيف الرسائل المتكررة
  console.log = (...args: any[]) => {
    const message = args.join(' ');
    
    // إخفاء الرسائل المتكررة
    if (message.includes('AuthProvider: State updated')) {
      showOnceOnly('auth-state', '🔐 AuthProvider: State management started (further updates hidden)');
      return;
    }
    
    if (message.includes('PlayerProfile: Rendering main form')) {
      showOnceOnly('player-profile', '🔄 PlayerProfile: Rendering started (further renders hidden)');
      return;
    }
    
    if (message.includes('user:') && message.includes('UserImpl')) {
      showOnceOnly('user-state', '👤 User state logging started (further logs hidden)');
      return;
    }
    
    if (message.includes('userCountry:') || message.includes('💰 عملة المستخدم')) {
      showOnceOnly('currency-logs', '💰 Currency system started (further logs hidden)');
      return;
    }
    
    // إظهار الرسائل المهمة
    originalConsoleLog(...args);
  };

  // رسائل تأكيد تحميل الفلتر
  originalConsoleLog('🔇 Console Filter: Activated for all environments');
  originalConsoleLog('✅ Geidea, CORS, and repetitive errors will be hidden');
  originalConsoleLog('🎯 Console cleaned for better debugging experience');
}

export default {}; 