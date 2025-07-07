# 🏗️ El7hm - Technical Architecture
## البنية التقنية المفصلة

---

## 🔧 System Architecture / هندسة النظام

### Overview / نظرة عامة:
The platform follows a modern JAMstack architecture with serverless functions, utilizing Next.js App Router for optimal performance and SEO.

النظام يتبع هندسة JAMstack حديثة مع دوال خادم بلا خادم، يستخدم Next.js App Router للأداء الأمثل و SEO.

### Architecture Diagram / مخطط الهندسة:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Firebase)    │◄──►│   (APIs)        │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Firestore     │    │ • ExchangeRate  │
│ • TypeScript    │    │ • Auth          │    │ • Geidea        │
│ • Tailwind CSS  │    │ • Functions     │    │ • Apple Pay     │
│ • Radix UI      │    │ • Storage       │    │ • Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 Database Schema / مخطط قاعدة البيانات

### Firebase Firestore Collections / مجموعات Firebase Firestore:

#### 1. Users Collection / مجموعة المستخدمين:
```typescript
interface UserDocument {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  role: 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin';
  full_name: string;              // Full name
  phone: string;                  // Phone number
  country: string;                // Country name
  currency: string;               // User's preferred currency
  profile_image: string;          // Profile image URL
  birth_date?: string;            // Birth date (players only)
  position?: string;              // Player position
  club_name?: string;             // Club/Academy name
  created_at: Timestamp;          // Account creation date
  updated_at: Timestamp;          // Last update date
  last_login: Timestamp;          // Last login time
  login_count: number;            // Total login count
  isActive: boolean;              // Account status
  subscription_status?: string;   // Subscription status
  subscription_plan?: string;     // Current plan
}
```

#### 2. Players Collection / مجموعة اللاعبين:
```typescript
interface PlayerDocument {
  uid: string;                    // Reference to user document
  player_stats: {
    height: number;               // Height in cm
    weight: number;               // Weight in kg
    preferred_foot: 'left' | 'right' | 'both';
    market_value: number;         // Market value in EGP
    experience_years: number;     // Years of experience
  };
  positions: string[];            // Playing positions
  skills: {
    technical: number;            // 1-10 rating
    physical: number;             // 1-10 rating
    mental: number;               // 1-10 rating
    overall: number;              // Calculated overall
  };
  career_history: {
    club_name: string;
    start_date: string;
    end_date: string;
    position: string;
    achievements: string[];
  }[];
  media: {
    videos: string[];             // Video URLs
    images: string[];             // Image URLs
    certificates: string[];      // Certificate URLs
  };
}
```

#### 3. Payments Collection / مجموعة المدفوعات:
```typescript
interface PaymentDocument {
  id: string;                     // Payment ID
  user_id: string;                // User who made payment
  recipient_ids: string[];        // Recipients (for bulk payments)
  amount: number;                 // Original amount
  currency: string;               // Original currency
  converted_amount: number;       // Amount in EGP
  exchange_rate: number;          // Used exchange rate
  payment_method: 'geidea' | 'apple_pay' | 'skip_cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string;         // Payment gateway transaction ID
  receipt_url?: string;           // Receipt/proof URL
  bulk_payment_id?: string;       // For bulk payments
  payment_type: 'subscription' | 'bulk' | 'individual';
  description: string;            // Payment description
  created_at: Timestamp;
  updated_at: Timestamp;
  metadata: {
    gateway_response: any;        // Payment gateway response
    user_agent: string;           // User browser info
    ip_address: string;           // User IP
  };
}
```

#### 4. Security Logs Collection / مجموعة سجلات الأمان:
```typescript
interface SecurityLogDocument {
  id: string;
  user_id?: string;               // User involved (if applicable)
  event_type: 'login' | 'logout' | 'failed_login' | 'password_change' | 
             'admin_access' | 'suspicious_activity';
  ip_address: string;             // User IP address
  user_agent: string;             // Browser/device info
  location?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  success: boolean;               // Was the action successful
  error_message?: string;         // Error details if failed
  metadata: any;                  // Additional context
  timestamp: Timestamp;
}
```

---

## 🔐 Authentication System / نظام المصادقة

### Firebase Authentication / مصادقة Firebase:
```typescript
// Custom Claims Structure / هيكل الصلاحيات المخصصة
interface CustomClaims {
  role: 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin';
  admin?: boolean;                // Admin privileges
  subscription_level?: string;    // Subscription tier
  country?: string;               // User country
  currency?: string;              // Default currency
  verified?: boolean;             // Account verification status
}

// Authentication Flow / تدفق المصادقة
const authFlow = {
  1: 'User enters credentials',   // المستخدم يدخل البيانات
  2: 'Firebase Auth validates',   // Firebase يتحقق من البيانات
  3: 'Custom claims checked',     // فحص الصلاحيات المخصصة
  4: 'Role-based redirect',       // توجيه حسب الدور
  5: 'Dashboard loaded'           // تحميل لوحة التحكم
};
```

### Security Rules / قواعد الأمان:
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data only
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == userId;
    }
    
    // Admins have full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
                            request.auth.token.admin == true;
    }
    
    // Public read access for certain collections
    match /players/{playerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.uid;
    }
  }
}
```

---

## 💰 Multi-Currency System / نظام العملات المتعدد

### Currency Converter Implementation / تنفيذ محول العملات:
```typescript
// /src/lib/currency-converter.ts

interface CurrencyRate {
  currency: string;
  rate: number;                   // Rate to EGP
  last_updated: Date;
  symbol: string;
}

interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  baseCurrency: string;           // Always EGP
  exchangeRate: number;
  timestamp: Date;
}

const SUPPORTED_CURRENCIES = {
  'EGP': { name: 'Egyptian Pound', symbol: 'ج.م', rate: 1.00 },
  'USD': { name: 'US Dollar', symbol: '$', rate: 0.032 },
  'EUR': { name: 'Euro', symbol: '€', rate: 0.029 },
  'SAR': { name: 'Saudi Riyal', symbol: 'ر.س', rate: 0.12 },
  'AED': { name: 'UAE Dirham', symbol: 'د.إ', rate: 0.118 },
  // ... 55 more currencies
};

// Convert any currency to EGP
export function convertToEGP(amount: number, fromCurrency: string): ConversionResult {
  const rate = SUPPORTED_CURRENCIES[fromCurrency]?.rate || 1;
  const convertedAmount = amount / rate;
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: parseFloat(convertedAmount.toFixed(2)),
    baseCurrency: 'EGP',
    exchangeRate: rate,
    timestamp: new Date()
  };
}

// Update exchange rates from API
export async function updateExchangeRates(): Promise<void> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/EGP`);
    const data = await response.json();
    
    // Update rates in local storage and database
    Object.keys(SUPPORTED_CURRENCIES).forEach(currency => {
      if (data.rates[currency]) {
        SUPPORTED_CURRENCIES[currency].rate = data.rates[currency];
      }
    });
    
    // Cache rates for 1 hour
    localStorage.setItem('currency_rates', JSON.stringify({
      rates: SUPPORTED_CURRENCIES,
      last_updated: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
  }
}
```

---

## 🔌 API Documentation / توثيق API

### Authentication APIs / واجهات المصادقة:

#### POST `/api/auth/login`
```typescript
// Request Body
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

// Response
interface LoginResponse {
  success: boolean;
  user: UserDocument;
  token: string;
  redirect_url: string;
  message: string;
}
```

#### POST `/api/auth/register`
```typescript
// Request Body
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: 'player' | 'club' | 'academy' | 'agent' | 'trainer';
  country: string;
  additional_data?: any;          // Role-specific data
}

// Response
interface RegisterResponse {
  success: boolean;
  user: UserDocument;
  message: string;
}
```

### Payment APIs / واجهات الدفع:

#### POST `/api/geidea/create-session`
```typescript
// Request Body
interface PaymentSessionRequest {
  amount: number;
  currency: string;
  description: string;
  player_ids?: string[];          // For bulk payments
  return_url: string;
  cancel_url: string;
}

// Response
interface PaymentSessionResponse {
  success: boolean;
  session_id: string;
  payment_url: string;
  expires_at: string;
}
```

#### POST `/api/geidea/callback`
```typescript
// Webhook payload from Geidea
interface PaymentCallback {
  session_id: string;
  transaction_id: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  currency: string;
  signature: string;              // For verification
}
```

### Currency APIs / واجهات العملات:

#### GET `/api/currency/rates`
```typescript
// Response
interface CurrencyRatesResponse {
  success: boolean;
  rates: Record<string, CurrencyRate>;
  base_currency: string;          // Always EGP
  last_updated: string;
}
```

#### POST `/api/currency/convert`
```typescript
// Request Body
interface ConvertRequest {
  amount: number;
  from_currency: string;
  to_currency?: string;           // Defaults to EGP
}

// Response
interface ConvertResponse {
  success: boolean;
  conversion: ConversionResult;
}
```

---

## 🗄️ Storage Architecture / هندسة التخزين

### Supabase Storage Buckets / مجموعات تخزين Supabase:
```typescript
interface StorageBucket {
  name: string;
  description: string;
  max_file_size: string;
  allowed_types: string[];
  public: boolean;
}

const STORAGE_BUCKETS: StorageBucket[] = [
  {
    name: 'profile-images',
    description: 'User profile pictures',
    max_file_size: '5MB',
    allowed_types: ['image/jpeg', 'image/png', 'image/webp'],
    public: true
  },
  {
    name: 'player-videos',
    description: 'Player skill videos',
    max_file_size: '100MB',
    allowed_types: ['video/mp4', 'video/webm'],
    public: true
  },
  {
    name: 'payment-receipts',
    description: 'Payment receipt uploads',
    max_file_size: '10MB',
    allowed_types: ['image/jpeg', 'image/png', 'application/pdf'],
    public: false
  }
];
```

### File Upload System / نظام رفع الملفات:
```typescript
// File upload utility
export async function uploadFile(
  bucket: string,
  file: File,
  userId: string
): Promise<{url: string, path: string}> {
  
  // Validate file
  const validation = validateFile(file, bucket);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Compress if image
  const processedFile = await processFile(file);
  
  // Generate unique path
  const path = `${userId}/${Date.now()}-${file.name}`;
  
  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, processedFile);
    
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return {
    url: urlData.publicUrl,
    path: path
  };
}
```

---

## 🚀 Performance Optimization / تحسين الأداء

### Next.js Optimizations / تحسينات Next.js:
```typescript
// next.config.js
const nextConfig = {
  // Enable experimental features
  experimental: {
    appDir: true,
    serverActions: true,
  },
  
  // Image optimization
  images: {
    domains: ['firebasestorage.googleapis.com', 'supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Bundle analyzer (development only)
  webpack: (config, { dev }) => {
    if (dev) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  }
};
```

### Caching Strategy / استراتيجية التخزين المؤقت:
```typescript
// Cache configuration
const CACHE_CONFIG = {
  // Static assets - 1 year
  static: {
    maxAge: 31536000,
    staleWhileRevalidate: 86400
  },
  
  // API responses - 5 minutes  
  api: {
    maxAge: 300,
    staleWhileRevalidate: 60
  },
  
  // User data - 1 minute
  user: {
    maxAge: 60,
    staleWhileRevalidate: 10
  },
  
  // Currency rates - 1 hour
  currency: {
    maxAge: 3600,
    staleWhileRevalidate: 600
  }
};
```

---

## 🔍 Monitoring & Analytics / المراقبة والتحليلات

### Error Tracking / تتبع الأخطاء:
```typescript
// Error boundary implementation
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to external service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Send to Firebase Analytics
    analytics.logEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      component_stack: errorInfo.componentStack
    });
  }
}
```

### Performance Metrics / مقاييس الأداء:
```typescript
// Performance monitoring
export function trackPagePerformance(pageName: string) {
  // Core Web Vitals
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      analytics.logEvent('performance_metric', {
        page: pageName,
        metric_name: entry.name,
        value: entry.value,
        rating: getVitalsRating(entry.name, entry.value)
      });
    });
  }).observe({ entryTypes: ['measure', 'navigation'] });
}
```

---

## 📝 Development Guidelines / إرشادات التطوير

### Code Standards / معايير الكود:
```typescript
// TypeScript configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", ".next"]
}

// ESLint rules
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### Component Structure / هيكل المكونات:
```typescript
// Component template
interface Props {
  // Define all props with types
}

export function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hooks at the top
  const [state, setState] = useState<Type>(initialValue);
  const { data, loading, error } = useCustomHook();
  
  // 2. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  // 3. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 4. Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 5. Main render
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
}
```

---

**Next File**: See ADMIN_PANEL_DOCUMENTATION.md for detailed admin panel information  
**التالي**: راجع ADMIN_PANEL_DOCUMENTATION.md للحصول على معلومات مفصلة عن لوحة التحكم الإدارية 
