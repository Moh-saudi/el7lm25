// فلتر للكونسول لإخفاء الأخطاء غير المهمة في بيئة التطوير

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // حفظ console.error الأصلي
  const originalError = console.error;
  
  // قائمة الأخطاء المسموح بإخفاؤها (أخطاء Geidea CORS الطبيعية)
  const ignoredErrors = [
    'Failed to read a named property',
    'Blocked a frame with origin',
    'Refused to get unsafe header',
    'X-Correlation-ID',
    'SecurityError'
  ];
  
  // استبدال console.error
  console.error = (...args: any[]) => {
    const errorMessage = args.join(' ');
    
    // إذا كان الخطأ في القائمة المسموحة، لا تعرضه
    const shouldIgnore = ignoredErrors.some(ignored => 
      errorMessage.includes(ignored)
    );
    
    if (!shouldIgnore) {
      originalError.apply(console, args);
    }
  };
  
  console.log('🔧 Console filter loaded - Geidea CORS errors will be filtered in development');
} 