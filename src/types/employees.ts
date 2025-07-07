// أنواع الوظائف المتاحة
export type EmployeeRole = 
  | 'support' // موظف دعم فني
  | 'finance' // موظف مالية
  | 'sales' // مندوب مبيعات
  | 'content' // محرر محتوى
  | 'admin' // مدير نظام
  | 'supervisor'; // مشرف

// صلاحيات كل وظيفة
export interface RolePermissions {
  canViewUsers: boolean; // عرض المستخدمين
  canEditUsers: boolean; // تعديل بيانات المستخدمين
  canViewFinancials: boolean; // عرض التقارير المالية
  canManagePayments: boolean; // إدارة المدفوعات
  canViewReports: boolean; // عرض التقارير
  canManageContent: boolean; // إدارة المحتوى
  canManageEmployees: boolean; // إدارة الموظفين
  canViewSupport: boolean; // عرض تذاكر الدعم
  canManageSupport: boolean; // إدارة تذاكر الدعم
  allowedLocations: EmployeeLocation[]; // المناطق المسموح بها
}

// بيانات الموقع الجغرافي
export interface EmployeeLocation {
  countryId: string;
  countryName: string;
  cityId: string;
  cityName: string;
}

// بيانات الموظف
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  permissions: RolePermissions;
  isActive: boolean;
  createdAt: any;
  lastLoginAt?: any;
  department?: string; // القسم
  supervisor?: string; // المشرف المباشر
  avatar?: string; // الصورة الشخصية
  authUserId?: string; // معرف حساب المصادقة
  deactivatedAt?: any; // تاريخ تعطيل الحساب
  deactivationReason?: string; // سبب تعطيل الحساب
  locations: EmployeeLocation[]; // المناطق الجغرافية التي يعمل بها الموظف
}

// إحصائيات أداء الموظف
export interface EmployeeStats {
  totalTickets?: number; // عدد التذاكر (للدعم الفني)
  resolvedTickets?: number; // التذاكر المحلولة
  totalSales?: number; // إجمالي المبيعات
  activeClients?: number; // العملاء النشطين
  reportsGenerated?: number; // التقارير المستخرجة
  lastActivity?: Date; // آخر نشاط
}

// حالة الموظف في النظام
export interface EmployeeStatus {
  isOnline: boolean;
  lastSeen?: Date;
  currentTask?: string;
  workingHours?: {
    start: string;
    end: string;
  };
} 