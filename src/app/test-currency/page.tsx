'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calculator, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import CurrencyStatusPanel from '@/components/CurrencyStatusPanel';
import { getCurrencyRates, convertCurrency, getCurrencyInfo } from '@/lib/currency-rates';

export default function TestCurrencyPage() {
  const [rates, setRates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  // اختبار التحويل
  const [fromAmount, setFromAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EGP');
  const [convertedAmount, setConvertedAmount] = useState(0);

  // تحميل الأسعار
  const loadRates = async () => {
    try {
      setLoading(true);
      const currentRates = await getCurrencyRates();
      setRates(currentRates);
    } catch (error) {
      console.error('خطأ في تحميل الأسعار:', error);
    } finally {
      setLoading(false);
    }
  };

  // حساب التحويل
  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      const result = convertCurrency(fromAmount, fromCurrency, toCurrency, rates);
      setConvertedAmount(result);
    }
  }, [fromAmount, fromCurrency, toCurrency, rates]);

  // تحميل الأسعار عند تحميل الصفحة
  useEffect(() => {
    loadRates();
  }, []);

  // العملات الأساسية للاختبار
  const testCurrencies = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP', 'KWD', 'QAR'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">اختبار نظام أسعار العملات</h1>
                <p className="text-gray-600">تجربة النظام الجديد مع التحديث التلقائي</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'جاري التحميل...' : 'جاهز'}
              </span>
              <button
                onClick={loadRates}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* مكون حالة الأسعار */}
        <CurrencyStatusPanel />

        {/* آلة حاسبة التحويل */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">آلة حاسبة التحويل</h2>
              <p className="text-sm text-gray-600">جرب تحويل العملات مع النظام الجديد</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* المبلغ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل المبلغ"
              />
            </div>

            {/* من العملة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">من العملة</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {testCurrencies.map(currency => {
                  const info = getCurrencyInfo(currency, rates);
                  return (
                    <option key={currency} value={currency}>
                      {currency} - {info?.name || 'غير متاح'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* إلى العملة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إلى العملة</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {testCurrencies.map(currency => {
                  const info = getCurrencyInfo(currency, rates);
                  return (
                    <option key={currency} value={currency}>
                      {currency} - {info?.name || 'غير متاح'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* النتيجة */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">النتيجة</p>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {convertedAmount.toLocaleString()} {getCurrencyInfo(toCurrency, rates)?.symbol || toCurrency}
              </div>
              <p className="text-sm text-gray-500">
                {fromAmount} {getCurrencyInfo(fromCurrency, rates)?.symbol || fromCurrency} = {convertedAmount.toLocaleString()} {getCurrencyInfo(toCurrency, rates)?.symbol || toCurrency}
              </p>
              
              {/* معدل الصرف */}
              {fromCurrency !== toCurrency && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    معدل الصرف: 1 {fromCurrency} = {(convertedAmount / fromAmount).toFixed(4)} {toCurrency}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* جدول الأسعار */}
        {Object.keys(rates).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">📊 جدول أسعار العملات الحية</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-medium text-gray-700">العملة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الاسم</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">الرمز</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">السعر (مقابل USD)</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">آخر تحديث</th>
                  </tr>
                </thead>
                <tbody>
                  {testCurrencies.map(currency => {
                    const info = getCurrencyInfo(currency, rates);
                    return (
                      <tr key={currency} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{currency}</td>
                        <td className="py-3 px-4 text-gray-600">{info?.name || 'غير متاح'}</td>
                        <td className="py-3 px-4 text-gray-600">{info?.symbol || '-'}</td>
                        <td className="py-3 px-4 text-gray-900 font-mono">
                          {info?.rate ? info.rate.toFixed(4) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {info?.lastUpdated ? new Date(info.lastUpdated).toLocaleString('ar-EG') : 'غير متاح'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* أمثلة سريعة */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">⚡ أمثلة سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { from: 100, fromCur: 'USD', toCur: 'EGP', label: 'دولار إلى جنيه' },
              { from: 1000, fromCur: 'SAR', toCur: 'EGP', label: 'ريال إلى جنيه' },
              { from: 50, fromCur: 'EUR', toCur: 'SAR', label: 'يورو إلى ريال' },
              { from: 20, fromCur: 'GBP', toCur: 'USD', label: 'جنيه إلى دولار' },
              { from: 500, fromCur: 'AED', toCur: 'EGP', label: 'درهم إلى جنيه' },
              { from: 100, fromCur: 'KWD', toCur: 'USD', label: 'دينار إلى دولار' }
            ].map((example, index) => {
              const result = convertCurrency(example.from, example.fromCur, example.toCur, rates);
              const fromInfo = getCurrencyInfo(example.fromCur, rates);
              const toInfo = getCurrencyInfo(example.toCur, rates);
              
              return (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{example.label}</h4>
                  <div className="text-sm text-gray-600">
                    {example.from} {fromInfo?.symbol || example.fromCur}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {result.toLocaleString()} {toInfo?.symbol || example.toCur}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    معدل: 1 {example.fromCur} = {(result / example.from).toFixed(4)} {example.toCur}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ملاحظات */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-3">📝 ملاحظات مهمة</h3>
          <ul className="space-y-2 text-sm text-yellow-700">
            <li>• يتم تحديث الأسعار تلقائياً من ExchangeRate-API مجاناً</li>
            <li>• البيانات محفوظة في Cache لمدة 24 ساعة لتحسين الأداء</li>
            <li>• في حالة فشل التحديث، يتم استخدام أسعار افتراضية محدثة</li>
            <li>• جميع الأسعار مُقدَّمة مقابل الدولار الأمريكي كعملة أساسية</li>
            <li>• يمكن إجراء تحديث يدوي باستخدام زر التحديث</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 