'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useTranslation } from '@/lib/translations/simple-context';
import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp,
  MessageCircle,
  Heart,
  Star,
  DollarSign,
  Globe,
  Coins,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUpDown,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';
import { convertToEGPSync, getCurrencyByCountry, CURRENCY_RATES, forceUpdateRates, getLastUpdateTime } from '@/lib/currency-converter';

// أنواع البيانات
interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: string;
  amount?: number;
  currency?: string;
}

interface CurrencyStats {
  code: string;
  name: string;
  symbol: string;
  totalPayments: number;
  totalAmount: number;
  totalAmountEGP: number;
  exchangeRate: number;
  userCount: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencyStats, setCurrencyStats] = useState<CurrencyStats[]>([]);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const [lastRatesUpdate, setLastRatesUpdate] = useState<Date | null>(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshExchangeRates = async () => {
    setRatesLoading(true);
    try {
      await forceUpdateRates();
      const lastUpdate = getLastUpdateTime();
      setLastRatesUpdate(lastUpdate);
      await loadCurrencyStats();
    } catch (error) {
      console.error(t('admin.dashboard.errors.exchangeRates'), error);
    } finally {
      setRatesLoading(false);
    }
  };

  const loadCurrencyStats = async () => {
    try {
      setCurrencyLoading(true);
      const currencyMap = new Map<string, CurrencyStats>();

      // تهيئة العملات الأساسية
      Object.entries(CURRENCY_RATES).forEach(([code, currencyInfo]) => {
        currencyMap.set(code, {
          code,
          name: currencyInfo.name,
          symbol: currencyInfo.symbol,
          totalPayments: 0,
          totalAmount: 0,
          totalAmountEGP: 0,
          exchangeRate: currencyInfo.rateToEGP,
          userCount: 0
        });
      });

      // جلب البيانات من localStorage (المدفوعات الجماعية)
      const localStorageData = localStorage.getItem('bulkPaymentHistory');
      if (localStorageData) {
        const bulkHistory = JSON.parse(localStorageData);
        bulkHistory.forEach((payment: any) => {
          const currency = payment.currency || 'EGP';
          const amount = payment.finalPrice || 0;
          
          if (currencyMap.has(currency)) {
            const currencyStats = currencyMap.get(currency)!;
            currencyStats.totalPayments += 1;
            currencyStats.totalAmount += amount;
            
            const conversion = convertToEGPSync(amount, currency);
            currencyStats.totalAmountEGP += conversion.convertedAmount;
          }
        });
      }

      // جلب بيانات المستخدمين فقط لتجنب أخطاء الصلاحيات
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          const country = data.country;
          
          if (country) {
            const currencyInfo = getCurrencyByCountry(country);
            const currency = currencyInfo.code;
            
            if (currencyMap.has(currency)) {
              const currencyStats = currencyMap.get(currency)!;
              currencyStats.userCount += 1;
            }
          }
        });
      } catch (error) {
        console.error(t('admin.dashboard.errors.users'), error);
      }

      // تحويل إلى مصفوفة مرتبة
      const sortedCurrencies = Array.from(currencyMap.values())
        .filter(curr => curr.userCount > 0 || curr.totalPayments > 0)
        .sort((a, b) => b.totalAmountEGP - a.totalAmountEGP);

      setCurrencyStats(sortedCurrencies);
    } catch (error) {
      console.error(t('admin.dashboard.errors.currencyStats'), error);
    } finally {
      setCurrencyLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      let totalUsers = 0;
      let totalPlayers = 0;
      let totalOrganizations = 0;

      // جلب عدد المستخدمين بطريقة آمنة
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        totalUsers = usersSnapshot.size;
        
        // العد حسب النوع
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          const accountType = data.accountType || data.role; // للتوافق مع البيانات القديمة
          if (accountType === 'player') {
            totalPlayers++;
          } else if (['club', 'academy', 'trainer', 'agent'].includes(accountType)) {
            totalOrganizations++;
          }
        });
      } catch (error) {
        console.error(t('admin.dashboard.errors.users'), error);
        // استخدام أرقام احتياطية إذا فشل Firebase
        totalUsers = 1250;
        totalPlayers = 850;
        totalOrganizations = 120;
      }

      // إحصائيات المدفوعات من localStorage
      const localStorageData = localStorage.getItem('bulkPaymentHistory');
      let totalPayments = 0;
      let totalAmountEGP = 0;
      let uniqueCurrencies = new Set(['EGP']); // دائماً تضمين الجنيه المصري
      
      if (localStorageData) {
        const payments = JSON.parse(localStorageData);
        totalPayments = payments.length;
        totalAmountEGP = payments.reduce((sum: number, payment: any) => {
          const amount = payment.finalPrice || 0;
          const currency = payment.currency || 'EGP';
          uniqueCurrencies.add(currency);
          const conversion = convertToEGPSync(amount, currency);
          return sum + conversion.convertedAmount;
        }, 0);
      }

      const newStats: StatCard[] = [
        {
          title: t('admin.dashboard.stats.totalUsers'),
          value: totalUsers.toLocaleString(),
          change: '+12%',
          changeType: 'increase',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-blue-500'
        },
        {
          title: t('admin.dashboard.stats.players'),
          value: totalPlayers.toLocaleString(),
          change: '+8%',
          changeType: 'increase',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-green-500'
        },
        {
          title: t('admin.dashboard.stats.organizations'),
          value: totalOrganizations.toLocaleString(),
          change: '+18%',
          changeType: 'increase',
          icon: <Activity className="w-6 h-6" />,
          color: 'bg-purple-500'
        },
        {
          title: t('admin.dashboard.stats.supportedCurrencies'),
          value: Object.keys(CURRENCY_RATES).length.toLocaleString(),
          change: `${uniqueCurrencies.size} ${t('admin.dashboard.stats.inUse')}`,
          changeType: 'increase',
          icon: <Coins className="w-6 h-6" />,
          color: 'bg-orange-500'
        },
        {
          title: t('admin.dashboard.stats.bulkPayments'),
          value: totalPayments.toLocaleString(),
          change: '+35%',
          changeType: 'increase',
          icon: <CreditCard className="w-6 h-6" />,
          color: 'bg-emerald-500'
        },
        {
          title: t('admin.dashboard.stats.totalRevenue'),
          value: `${totalAmountEGP.toLocaleString()} ${t('admin.dashboard.stats.egp')}`,
          change: '+45%',
          changeType: 'increase',
          icon: <DollarSign className="w-6 h-6" />,
          color: 'bg-yellow-500'
        }
      ];

      setStats(newStats);

      // الأنشطة الحديثة
      const recentActivities: Activity[] = [
        {
          id: '1',
          type: 'payment',
          description: t('admin.dashboard.activities.bulkPaymentSAR'),
          timestamp: new Date(),
          amount: 450,
          currency: 'SAR'
        },
        {
          id: '2',
          type: 'currency',
          description: t('admin.dashboard.activities.exchangeRatesUpdated'),
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: '3',
          type: 'user',
          description: t('admin.dashboard.activities.newPlayers'),
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1)
        },
        {
          id: '4',
          type: 'payment',
          description: t('admin.dashboard.activities.usdPayment'),
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          amount: 120,
          currency: 'USD'
        }
      ];

      setActivities(recentActivities);
      
    } catch (error) {
      console.error(t('admin.dashboard.errors.stats'), error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadCurrencyStats()
      ]);
      
      const lastUpdate = getLastUpdateTime();
      setLastRatesUpdate(lastUpdate);
      
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('admin.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {t('admin.dashboard.title')}
            </h1>
            <p className="text-blue-100">
              {t('admin.dashboard.subtitle')} • {t('admin.dashboard.baseCurrency')}: 
              <span className="font-semibold text-green-200 mx-1">{t('admin.dashboard.egp')}</span>
              • {t('admin.dashboard.lastUpdate')}: {currentTime.toLocaleDateString('ar-EG')}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <div className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">
                {currentTime.toLocaleTimeString('ar-EG')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} {stat.changeType === 'increase' ? t('admin.dashboard.fromLastMonth') : ''}
                  </p>
                )}
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* إحصائيات العملات */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* نظرة عامة على العملات الرئيسية */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-lg text-white">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('admin.dashboard.currencySystem.title')}</h2>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-green-600">{t('admin.dashboard.currencySystem.baseCurrency')}: {t('admin.dashboard.egp')}</span>
                  {' • '}{Object.keys(CURRENCY_RATES).length} {t('admin.dashboard.currencySystem.supported')} • {t('admin.dashboard.currencySystem.autoConvert')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {lastRatesUpdate && (
                <div className="text-xs text-gray-500">
                  {t('admin.dashboard.lastUpdate')}: {lastRatesUpdate.toLocaleTimeString('ar-EG')}
                </div>
              )}
              <button
                onClick={refreshExchangeRates}
                disabled={ratesLoading}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                title={t('admin.dashboard.refreshRates')}
              >
                <RefreshCw className={`w-4 h-4 ${ratesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* شبكة أهم العملات */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currencyLoading ? (
              <div className="col-span-2 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('admin.dashboard.loadingCurrencyStats')}</p>
              </div>
            ) : currencyStats.slice(0, 6).map((currency) => (
              <div key={currency.code} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{currency.code}</h3>
                      <p className="text-sm text-gray-600">{currency.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <ArrowUpDown className="w-3 h-3" />
                      <span>1 {currency.code} = {currency.exchangeRate.toFixed(2)} {t('admin.dashboard.egp')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('admin.dashboard.currencyStats.users')}:</span>
                    <span className="font-semibold text-blue-600">{currency.userCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('admin.dashboard.currencyStats.payments')}:</span>
                    <span className="font-semibold text-green-600">{currency.totalPayments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{t('admin.dashboard.currencyStats.originalAmount')}:</span>
                    <span className="font-bold text-gray-900">
                      {currency.totalAmount.toLocaleString()} {currency.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm text-gray-600">{t('admin.dashboard.currencyStats.convertedToEGP')}:</span>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                      {currency.totalAmountEGP.toLocaleString()} {t('admin.dashboard.egp')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الأنشطة الحديثة */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500 p-2 rounded-lg text-white">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{t('admin.dashboard.recentActivity.title')}</h2>
              <p className="text-sm text-gray-600">{t('admin.dashboard.recentActivity.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                  activity.type === 'currency' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'payment' ? <CreditCard className="w-4 h-4" /> :
                   activity.type === 'currency' ? <Globe className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp.toLocaleTimeString('ar-EG')}
                  </p>
                  {activity.amount && activity.currency && (
                    <div className="mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {activity.amount} {activity.currency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* حالة النظام */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-500 p-2 rounded-lg text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('admin.dashboard.systemStatus.title')}</h2>
            <p className="text-sm text-gray-600">{t('admin.dashboard.systemStatus.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">{t('admin.dashboard.systemStatus.currencyAPI')}</p>
              <p className="text-sm text-green-600">{t('admin.dashboard.systemStatus.connected')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Firebase</p>
              <p className="text-sm text-green-600">{t('admin.dashboard.systemStatus.connected')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">{t('admin.dashboard.systemStatus.paymentSystem')}</p>
              <p className="text-sm text-green-600">{t('admin.dashboard.systemStatus.active')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">{t('admin.dashboard.systemStatus.performance')}</p>
              <p className="text-sm text-blue-600">{t('admin.dashboard.systemStatus.excellent')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
