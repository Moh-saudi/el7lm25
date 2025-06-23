// دالة حساب العمر المشتركة لجميع أجزاء التطبيق
export const calculateAge = (birthDate: any): number | null => {
  if (!birthDate) return null;
  
  try {
    let d: Date;
    
    // معالجة أنواع مختلفة من تواريخ الميلاد
    if (typeof birthDate === 'object' && birthDate.toDate && typeof birthDate.toDate === 'function') {
      // Firestore Timestamp
      d = birthDate.toDate();
    } else if (birthDate instanceof Date) {
      // Date object
      d = birthDate;
    } else if (typeof birthDate === 'string' || typeof birthDate === 'number') {
      // String or number
      d = new Date(birthDate);
    } else {
      return null;
    }
    
    // التحقق من صحة التاريخ
    if (isNaN(d.getTime())) return null;
    
    // حساب العمر بدقة
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    
    // تعديل العمر إذا لم يأت عيد الميلاد بعد هذا العام
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    
    return age >= 0 ? age : null; // التأكد من عدم إرجاع عمر سالب
  } catch (error) {
    console.warn('خطأ في حساب العمر:', error);
    return null;
  }
};

// دالة مساعدة لعرض العمر مع النص
export const formatAge = (birthDate: any): string => {
  const age = calculateAge(birthDate);
  return age !== null ? `${age} سنة` : 'العمر غير محدد';
};

// دالة للتحقق من صحة العمر للتسجيل
export const validateAge = (birthDate: any, minAge: number = 7, maxAge: number = 50): { valid: boolean; message?: string } => {
  const age = calculateAge(birthDate);
  
  if (age === null) {
    return { valid: false, message: 'تاريخ الميلاد غير صالح' };
  }
  
  if (age < minAge) {
    return { valid: false, message: `يجب أن يكون العمر ${minAge} سنوات على الأقل` };
  }
  
  if (age > maxAge) {
    return { valid: false, message: `يجب أن يكون العمر أقل من ${maxAge} سنة` };
  }
  
  return { valid: true };
}; 