// نظام إدارة أسعار العملات المتطور
// يستخدم ExchangeRate-API مع نظام cache ذكي

interface CurrencyInfo {
  rate: number;
  symbol: string;
  name: string;
  lastUpdated: string;
}

interface CurrencyRatesCache {
  rates: Record<string, CurrencyInfo>;
  lastUpdated: string;
  expiresAt: string;
}

// أسعار العملات الافتراضية (احتياطية)
const DEFAULT_CURRENCY_RATES: Record<string, CurrencyInfo> = {
  USD: { rate: 1, symbol: '$', name: 'دولار أمريكي', lastUpdated: new Date().toISOString() },
  EUR: { rate: 0.85, symbol: '€', name: 'يورو', lastUpdated: new Date().toISOString() },
  GBP: { rate: 0.73, symbol: '£', name: 'جنيه استرليني', lastUpdated: new Date().toISOString() },
  SAR: { rate: 3.75, symbol: 'ر.س', name: 'ريال سعودي', lastUpdated: new Date().toISOString() },
  AED: { rate: 3.67, symbol: 'د.إ', name: 'درهم إماراتي', lastUpdated: new Date().toISOString() },
  KWD: { rate: 0.30, symbol: 'د.ك', name: 'دينار كويتي', lastUpdated: new Date().toISOString() },
  QAR: { rate: 3.64, symbol: 'ر.ق', name: 'ريال قطري', lastUpdated: new Date().toISOString() },
  BHD: { rate: 0.38, symbol: 'د.ب', name: 'دينار بحريني', lastUpdated: new Date().toISOString() },
  OMR: { rate: 0.38, symbol: 'ر.ع', name: 'ريال عماني', lastUpdated: new Date().toISOString() },
  JOD: { rate: 0.71, symbol: 'د.أ', name: 'دينار أردني', lastUpdated: new Date().toISOString() },
  LBP: { rate: 15000, symbol: 'ل.ل', name: 'ليرة لبنانية', lastUpdated: new Date().toISOString() },
  TRY: { rate: 27, symbol: '₺', name: 'ليرة تركية', lastUpdated: new Date().toISOString() },
  MAD: { rate: 10, symbol: 'د.م', name: 'درهم مغربي', lastUpdated: new Date().toISOString() },
  DZD: { rate: 135, symbol: 'د.ج', name: 'دينار جزائري', lastUpdated: new Date().toISOString() },
  TND: { rate: 3.1, symbol: 'د.ت', name: 'دينار تونسي', lastUpdated: new Date().toISOString() },
  EGP: { rate: 49, symbol: 'ج.م', name: 'جنيه مصري', lastUpdated: new Date().toISOString() }
};

// cache في الذاكرة
let cachedRates: CurrencyRatesCache | null = null;

// دالة التحقق من انتهاء صلاحية cache
function isCacheExpired(cache: CurrencyRatesCache): boolean {
  return new Date() > new Date(cache.expiresAt);
}

// دالة جلب الأسعار من الخادم
async function fetchRatesFromServer(): Promise<Record<string, CurrencyInfo>> {
  try {
    console.log('🔄 جلب أسعار العملات من الخادم...');
    
    const response = await fetch('/api/update-currency-rates', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.data?.rates) {
      console.log('✅ تم جلب أسعار محدثة من الخادم');
      return data.data.rates;
    } else {
      throw new Error(data.message || 'فشل في جلب الأسعار');
    }
  } catch (error) {
    console.error('❌ خطأ في جلب الأسعار من الخادم:', error);
    throw error;
  }
}

// دالة الحصول على أسعار العملات مع cache
export async function getCurrencyRates(): Promise<Record<string, CurrencyInfo>> {
  try {
    // التحقق من وجود cache صالح
    if (cachedRates && !isCacheExpired(cachedRates)) {
      console.log('📦 استخدام أسعار من cache');
      return cachedRates.rates;
    }

    // محاولة جلب أسعار جديدة
    try {
      const freshRates = await fetchRatesFromServer();
      
      // تحديث cache
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // ينتهي بعد 24 ساعة
      
      cachedRates = {
        rates: freshRates,
        lastUpdated: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };

      console.log('💾 تم تحديث cache بأسعار جديدة');
      return freshRates;
      
    } catch (error) {
      console.warn('⚠️ فشل في جلب أسعار جديدة، استخدام الأسعار الافتراضية');
      
      // في حالة الفشل، استخدم الأسعار الافتراضية
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // ينتهي بعد ساعة للمحاولة مرة أخرى قريباً
      
      cachedRates = {
        rates: DEFAULT_CURRENCY_RATES,
        lastUpdated: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };

      return DEFAULT_CURRENCY_RATES;
    }
  } catch (error) {
    console.error('❌ خطأ عام في الحصول على أسعار العملات:', error);
    return DEFAULT_CURRENCY_RATES;
  }
}

// دالة تحويل العملة المحسنة
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  rates: Record<string, CurrencyInfo>
): number {
  if (fromCurrency === toCurrency) return amount;

  const fromRate = rates[fromCurrency]?.rate || 1;
  const toRate = rates[toCurrency]?.rate || 1;
  
  // تحويل من العملة الأصلية للدولار ثم للعملة المطلوبة
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;
  
  return Math.round(convertedAmount * 100) / 100; // تقريب لأقرب قرشين
}

// دالة الحصول على معلومات عملة
export function getCurrencyInfo(
  currencyCode: string,
  rates: Record<string, CurrencyInfo>
): CurrencyInfo | null {
  return rates[currencyCode] || null;
}

// دالة التحقق من حداثة الأسعار
export function getRatesAge(): { 
  lastUpdated: string | null; 
  ageInHours: number | null; 
  isStale: boolean;
} {
  if (!cachedRates) {
    return { lastUpdated: null, ageInHours: null, isStale: true };
  }

  const lastUpdate = new Date(cachedRates.lastUpdated);
  const now = new Date();
  const ageInMs = now.getTime() - lastUpdate.getTime();
  const ageInHours = ageInMs / (1000 * 60 * 60);
  
  return {
    lastUpdated: cachedRates.lastUpdated,
    ageInHours: Math.round(ageInHours * 100) / 100,
    isStale: ageInHours > 24 // قديم إذا كان أكثر من 24 ساعة
  };
}

// دالة إعادة تعيين cache (للتطوير)
export function clearRatesCache(): void {
  cachedRates = null;
  console.log('🗑️ تم مسح cache أسعار العملات');
}

// دالة تحديث قسري للأسعار
export async function forceUpdateRates(): Promise<Record<string, CurrencyInfo>> {
  console.log('🔄 تحديث قسري لأسعار العملات...');
  
  // مسح cache الحالي
  clearRatesCache();
  
  // جلب أسعار جديدة
  return await getCurrencyRates();
}

// دالة للحصول على معلومات حالة النظام
export function getSystemStatus(): {
  cacheStatus: 'valid' | 'expired' | 'missing';
  lastUpdated: string | null;
  expiresAt: string | null;
  ageInHours: number | null;
  totalCurrencies: number;
} {
  if (!cachedRates) {
    return {
      cacheStatus: 'missing',
      lastUpdated: null,
      expiresAt: null,
      ageInHours: null,
      totalCurrencies: 0
    };
  }

  const isExpired = isCacheExpired(cachedRates);
  const { ageInHours } = getRatesAge();

  return {
    cacheStatus: isExpired ? 'expired' : 'valid',
    lastUpdated: cachedRates.lastUpdated,
    expiresAt: cachedRates.expiresAt,
    ageInHours,
    totalCurrencies: Object.keys(cachedRates.rates).length
  };
} 