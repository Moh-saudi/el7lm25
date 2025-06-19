'use client';

import React, { useState, useEffect } from 'react';
import { getLastUpdateTime, forceUpdateRates } from '@/lib/currency-converter';

interface CurrencyStatus {
  lastUpdated: string | null;
  cacheAge: number | null;
  nextUpdate: string | null;
  status: string;
}

export default function CurrencyStatusPanel() {
  const [status, setStatus] = useState<CurrencyStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // جلب حالة التحديث
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/update-currency-rates');
      const data = await response.json();
      setStatus(data);
      setLastFetch(new Date());
    } catch (error) {
      console.error('خطأ في جلب حالة العملات:', error);
    }
  };

  // تحديث فوري للعملات
  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/update-currency-rates', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ تم تحديث أسعار الصرف بنجاح!');
      } else {
        alert('⚠️ ' + data.message);
      }
      
      // إعادة جلب الحالة
      await fetchStatus();
    } catch (error) {
      console.error('خطأ في تحديث العملات:', error);
      alert('❌ حدث خطأ أثناء التحديث');
    } finally {
      setIsUpdating(false);
    }
  };

  // تحديث الحالة عند تحميل المكون
  useEffect(() => {
    fetchStatus();
    // تحديث كل 5 دقائق
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // تنسيق الوقت
  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'غير متاح';
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // تنسيق مدة Cache
  const formatCacheAge = (ageMs: number | null) => {
    if (!ageMs) return 'غير متاح';
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ساعة و ${minutes % 60} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  if (!status) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">📊 حالة أسعار الصرف</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          status.status === 'healthy' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status.status === 'healthy' ? '🟢 نشط' : '🔴 خطأ'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">آخر تحديث</p>
          <p className="text-blue-900 font-bold">
            {formatTime(status.lastUpdated)}
          </p>
        </div>

        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">عمر البيانات</p>
          <p className="text-yellow-900 font-bold">
            {formatCacheAge(status.cacheAge)}
          </p>
        </div>

        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">التحديث التالي</p>
          <p className="text-green-900 font-bold">
            {formatTime(status.nextUpdate)}
          </p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">آخر فحص</p>
          <p className="text-purple-900 font-bold">
            {lastFetch ? formatTime(lastFetch.toISOString()) : 'جاري التحميل...'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleForceUpdate}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isUpdating
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isUpdating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              جاري التحديث...
            </>
          ) : (
            <>
              🔄 تحديث فوري
            </>
          )}
        </button>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
        >
          🔍 تحديث الحالة
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>ملاحظة:</strong> يتم تحديث أسعار الصرف تلقائياً كل ساعة، ويومياً في الساعة 8 صباحاً بتوقيت UTC.
          البيانات مأخوذة من ExchangeRate-API.
        </p>
      </div>
    </div>
  );
} 