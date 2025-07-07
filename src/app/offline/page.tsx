import { Wifi, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'غير متصل - El7hm',
  description: 'يبدو أنك غير متصل بالإنترنت'
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* أيقونة */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wifi className="w-12 h-12 text-gray-500" />
          </div>
          <div className="w-16 h-1 bg-red-500 rounded mx-auto opacity-80"></div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            غير متصل بالإنترنت
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            يبدو أنك لست متصلاً بالإنترنت حالياً. تحقق من اتصالك وحاول مرة أخرى.
          </p>

          {/* نصائح الاتصال */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-right">
            <h3 className="font-semibold text-blue-800 mb-2">💡 نصائح للاتصال:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• تحقق من اتصال WiFi</li>
              <li>• تأكد من بيانات الهاتف</li>
              <li>• أعد تشغيل المتصفح</li>
              <li>• جرب شبكة مختلفة</li>
            </ul>
          </div>

          {/* الأزرار */}
          <div className="space-y-3">
            <form action={`javascript:window.location.reload()`}>
              <Button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                إعادة المحاولة
              </Button>
            </form>
            
            <Link href="/">
              <Button 
                variant="outline" 
                className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
              >
                <Home className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="text-sm text-gray-500">
          <p>التطبيق يعمل في وضع عدم الاتصال</p>
          <p>بعض الميزات قد تكون محدودة</p>
        </div>
      </div>
    </div>
  );
} 
