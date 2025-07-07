# 👑 El7hm - Admin Panel Documentation
## دليل لوحة التحكم الإدارية الشامل

---

## 🔐 Admin Access / الوصول الإداري

### Admin Credentials / بيانات الأدمن:
```
Email: admin@el7hm.com
Password: Admin123!@#
UID: hWAd3JRCJnXAowZKJ5W9qSJlA7i1
Role: admin
```

### Login Pages / صفحات تسجيل الدخول:
1. **Standard Login** - `/admin/login`
2. **Advanced Diagnostics** - `/admin/login-advanced`
3. **New Interface** - `/admin/login-new`

---

## 📊 Admin Dashboard Features / ميزات لوحة التحكم

### Main Dashboard (`/dashboard/admin`)
#### Real-time Statistics / الإحصائيات الفورية:
- **Total Users** by role (Players, Clubs, Academies, etc.)
- **Currency Statistics** (60+ supported currencies)
- **Payment Analytics** (Daily, Weekly, Monthly)
- **System Health** (Database, Storage, APIs)
- **Live Clock** with system uptime

#### Multi-Currency Overview / نظرة عامة على العملات:
```typescript
const currencyStats = {
  totalCurrencies: 60,
  baseCurrency: 'EGP',
  mostUsedCurrencies: ['EGP', 'USD', 'SAR', 'AED', 'EUR'],
  dailyConversions: 1247,
  totalVolume: '2.5M EGP'
};
```

---

## 👥 User Management / إدارة المستخدمين

### All Users Page (`/dashboard/admin/users`)
#### Features / المميزات:
- **Search & Filter** by role, country, status
- **User Details** with complete profile information
- **Account Actions** (Activate, Deactivate, Delete)
- **Login History** and security logs
- **Currency Preferences** and payment history

#### User Roles / أدوار المستخدمين:
- 🏃‍♂️ **Players** (اللاعبين)
- ⚽ **Clubs** (الأندية)
- 🏫 **Academies** (الأكاديميات)
- 🤝 **Agents** (الوكلاء)
- 👨‍🏫 **Trainers** (المدربين)

### Player Management (`/dashboard/admin/users/players`)
#### Specialized Features / ميزات متخصصة:
- **Player Statistics** (Height, Weight, Position)
- **Skill Ratings** (Technical, Physical, Mental)
- **Career History** and achievements
- **Media Library** (Videos, Images, Certificates)
- **Market Value** tracking in multiple currencies

---

## 💳 Payment Management / إدارة المدفوعات

### Payments Overview (`/dashboard/admin/payments`)
#### Analytics Dashboard / لوحة التحليلات:
- **Revenue by Currency** with conversion to EGP
- **Payment Methods** breakdown (Geidea, Apple Pay, SkipCash)
- **Success Rate** monitoring
- **Failed Transactions** analysis
- **Geographic Distribution** of payments

### Bulk Payments (`/dashboard/admin/payments/bulk`)
#### Advanced Features / ميزات متقدمة:
```typescript
interface BulkPaymentAnalytics {
  totalPayments: number;
  totalAmount: {
    original: { amount: number; currency: string }[];
    converted: { amount: number; currency: 'EGP' };
  };
  paymentMethods: {
    geidea: number;
    applePay: number;
    skipCash: number;
  };
  statusBreakdown: {
    completed: number;
    pending: number;
    failed: number;
  };
  currencyDistribution: Record<string, number>;
}
```

### Subscription Management (`/dashboard/admin/subscriptions/manage`)
#### Subscription Plans / خطط الاشتراك:
- **Basic Plan** - Free tier with limited features
- **Premium Plan** - Enhanced features and priority support
- **Professional Plan** - Full access with advanced analytics
- **Enterprise Plan** - Custom solutions for large organizations

---

## 🗄️ System Monitoring / مراقبة النظام

### System Health (`/dashboard/admin/system`)
#### Monitoring Components / مكونات المراقبة:

1. **Firebase Status** / حالة Firebase:
   - Firestore connection and response time
   - Authentication service status
   - Storage usage and limits
   - Security rules validation

2. **Supabase Monitoring** / مراقبة Supabase:
   - Storage buckets health
   - API response times
   - Upload/download statistics
   - Error rates

3. **Payment Gateways** / بوابات الدفع:
   - Geidea API status
   - Apple Pay service health
   - Transaction success rates
   - Average processing time

4. **Currency API** / واجهة العملات:
   - ExchangeRate-API connectivity
   - Rate update frequency
   - Conversion accuracy
   - Cache performance

### Database Analytics / تحليلات قاعدة البيانات:
```typescript
interface DatabaseMetrics {
  collections: {
    users: { count: number; size: string };
    players: { count: number; size: string };
    payments: { count: number; size: string };
    security_logs: { count: number; size: string };
  };
  operations: {
    reads: number;
    writes: number;
    deletes: number;
  };
  performance: {
    averageReadTime: number;
    averageWriteTime: number;
    indexEfficiency: number;
  };
}
```

---

## 🗺️ Geographic Management / الإدارة الجغرافية

### Locations Page (`/dashboard/admin/locations`)
#### Country & Currency Management / إدارة البلدان والعملات:

```typescript
interface CountryData {
  name: string;
  currency: string;
  symbol: string;
  users: number;
  payments: {
    total: number;
    volume: number;
  };
  popular_cities: string[];
}

const supportedCountries = [
  { name: 'Egypt', currency: 'EGP', symbol: 'ج.م', users: 15420 },
  { name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س', users: 8930 },
  { name: 'UAE', currency: 'AED', symbol: 'د.إ', users: 6540 },
  { name: 'USA', currency: 'USD', symbol: '$', users: 4320 },
  // ... 56 more countries
];
```

#### Features / المميزات:
- **Country Statistics** with user distribution
- **Currency Analytics** per country
- **Payment Volume** by geographic region
- **City-level Data** for major locations
- **Registration Trends** by country

---

## 📁 Media Management / إدارة الوسائط

### Media Overview (`/dashboard/admin/media`)
#### Supabase Storage Monitoring / مراقبة تخزين Supabase:

```typescript
interface StorageBucketInfo {
  name: string;
  description: string;
  fileCount: number;
  totalSize: string;
  lastUpload: Date;
  publicAccess: boolean;
}

const monitoredBuckets = [
  {
    name: 'profile-images',
    description: 'User profile pictures',
    fileCount: 12547,
    totalSize: '2.3 GB',
    publicAccess: true
  },
  {
    name: 'player-videos',
    description: 'Player skill demonstration videos',
    fileCount: 3421,
    totalSize: '15.7 GB',
    publicAccess: true
  },
  {
    name: 'payment-receipts',
    description: 'Payment receipt uploads',
    fileCount: 8934,
    totalSize: '892 MB',
    publicAccess: false
  }
];
```

#### Media Analytics / تحليلات الوسائط:
- **Upload Statistics** (Daily, Weekly, Monthly)
- **Storage Usage** per bucket
- **File Type Distribution** 
- **Broken Links** detection and cleanup
- **Bandwidth Usage** monitoring

---

## 🛡️ Security Features / ميزات الأمان

### Security Logs / سجلات الأمان:
```typescript
interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: 'login' | 'logout' | 'failed_login' | 'password_change' | 
            'admin_access' | 'suspicious_activity';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  location: {
    country: string;
    city: string;
  };
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  metadata: any;
}
```

### Admin Security Features / ميزات أمان الأدمن:
- **Failed Login Attempts** monitoring
- **IP Address Tracking** with geolocation
- **Session Management** with automatic timeouts
- **Role-based Access Control**
- **Audit Trail** for all admin actions
- **Suspicious Activity** alerts

---

## 📈 Financial Reports / التقارير المالية

### Financial Dashboard (`/dashboard/admin/reports/financial`)
#### Core Metrics / المقاييس الأساسية:

```typescript
interface FinancialMetrics {
  overview: {
    totalRevenue: { amount: number; currency: 'EGP' };
    transactionCount: number;
    averageTransaction: number;
    topCurrency: string;
  };
  performance: {
    dailyGrowth: number;
    weeklyGrowth: number;
    monthlyGrowth: number;
    yearToDate: number;
  };
  currencies: {
    [currency: string]: {
      volume: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  geographic: {
    [country: string]: {
      revenue: number;
      transactions: number;
      users: number;
    };
  };
}
```

#### Revenue Analytics / تحليلات الإيرادات:
- **Multi-Currency Revenue** with auto-conversion to EGP
- **Payment Method Performance** comparison
- **Geographic Revenue Distribution**
- **Subscription Revenue** vs one-time payments
- **Refund and Chargeback** tracking

---

## 🔄 Bulk Payment System / نظام الدفع الجماعي

### Bulk Payment Features / ميزات الدفع الجماعي:
```typescript
interface BulkPaymentSystem {
  features: {
    multiPlayerSelection: boolean;
    currencyConversion: boolean;
    receiptUpload: boolean;
    paymentSplitting: boolean;
    statusTracking: boolean;
  };
  paymentMethods: ['geidea', 'apple_pay', 'skip_cash'];
  supportedCurrencies: string[]; // 60+ currencies
  maxPayees: number; // 100 players per transaction
}
```

### Process Flow / تدفق العملية:
1. **Select Recipients** - Choose multiple players
2. **Set Amount & Currency** - Define payment details
3. **Upload Receipt** - Proof of payment
4. **Review & Confirm** - Final verification
5. **Process Payment** - Execute transaction
6. **Track Status** - Monitor completion

---

## 🔧 Admin Tools & Scripts / أدوات ونصوص الأدمن

### Emergency Scripts / نصوص الطوارئ:
```bash
# Create admin user
node scripts/create-admin-complete.js

# Emergency admin access (bypasses normal auth)
node scripts/emergency-admin-session.js

# Check admin authentication status
node scripts/check-admin-auth.js

# Reset admin password
node scripts/reset-admin-password.js
```

### Database Management / إدارة قاعدة البيانات:
```typescript
// Admin utilities for database operations
export const adminUtils = {
  // Bulk user operations
  async bulkUpdateUsers(updates: UserUpdate[]): Promise<void> {
    // Implementation for bulk user updates
  },
  
  // Currency rate management
  async updateCurrencyRates(rates: CurrencyRates): Promise<void> {
    // Manual currency rate updates
  },
  
  // System maintenance
  async performMaintenance(): Promise<MaintenanceReport> {
    // Database cleanup, index optimization, etc.
  },
  
  // Data export
  async exportData(collection: string, filters?: any): Promise<ExportResult> {
    // Export data for analysis or backup
  }
};
```

---

## 🎛️ Configuration Management / إدارة التكوين

### Environment Variables / متغيرات البيئة:
```bash
# Admin-specific configurations
NEXT_PUBLIC_ADMIN_EMAIL=admin@el7hm.com
ADMIN_DEFAULT_PASSWORD=Admin123!@#
ADMIN_SESSION_TIMEOUT=3600000
ADMIN_RATE_LIMIT=1000

# Security settings
ADMIN_IP_WHITELIST=192.168.1.0/24
ADMIN_2FA_ENABLED=true
ADMIN_AUDIT_LOG_RETENTION=90

# Feature flags
ENABLE_BULK_PAYMENTS=true
ENABLE_MULTI_CURRENCY=true
ENABLE_ADVANCED_ANALYTICS=true
```

### Feature Toggles / مفاتيح الميزات:
```typescript
interface AdminFeatureFlags {
  bulkPayments: boolean;
  multiCurrency: boolean;
  advancedAnalytics: boolean;
  userExport: boolean;
  systemMaintenance: boolean;
  emergencyMode: boolean;
}
```

---

## 📱 Mobile Admin Interface / واجهة الأدمن للهاتف

### Responsive Design / التصميم المتجاوب:
- **Mobile-first** approach for admin panel
- **Touch-friendly** controls and navigation
- **Simplified dashboards** for mobile screens
- **Quick actions** for common admin tasks
- **Offline capabilities** for critical functions

### Mobile-specific Features / ميزات خاصة بالهاتف:
- **Push notifications** for urgent alerts
- **Quick stats** widget for dashboard
- **Emergency actions** accessible offline
- **Biometric authentication** support

---

## 🔄 Backup & Recovery / النسخ الاحتياطي والاستعادة

### Automated Backups / النسخ الاحتياطية التلقائية:
```typescript
interface BackupStrategy {
  frequency: {
    database: 'daily';
    media: 'weekly';
    configurations: 'on-change';
  };
  retention: {
    daily: '30 days';
    weekly: '12 weeks';
    monthly: '12 months';
  };
  storage: {
    primary: 'Firebase Storage';
    secondary: 'Google Cloud Storage';
    offsite: 'AWS S3';
  };
}
```

### Recovery Procedures / إجراءات الاستعادة:
1. **Identify Issue** - Determine what needs recovery
2. **Select Backup** - Choose appropriate backup point
3. **Validate Backup** - Ensure backup integrity
4. **Execute Recovery** - Restore data/configuration
5. **Verify System** - Confirm successful recovery
6. **Update Logs** - Document recovery process

---

**Version**: 3.1.0  
**Last Updated**: December 2024  
**Maintained by**: El7hm Development Team

For technical support or questions, contact: admin@el7hm.com 
