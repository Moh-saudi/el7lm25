// مكون لعرض خط Cairo
'use client';

export default function FontShowcase() {
  return (
    <div className="p-8 space-y-8 bg-white rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        خط Cairo في كل مكان
      </h1>
      
      {/* عرض خط Cairo للنصوص العربية */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          خط Cairo للنصوص العربية
        </h2>
        
        <div className="space-y-3">
          <p className="text-lg">
            نص عربي بخط Cairo - خط واضح ومقروء ومناسب لجميع الاستخدامات
          </p>
          
          <p className="text-lg font-medium">
            نص عربي متوسط الثقل - مناسب للعناوين الفرعية والنصوص المهمة
          </p>
          
          <p className="text-lg font-bold">
            نص عربي غامق - مثالي للعناوين الرئيسية والتأكيدات
          </p>
        </div>
      </section>
      
      {/* عرض خط Cairo للنصوص الإنجليزية */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Cairo Font for English Text
        </h2>
        
        <div className="space-y-3">
          <p className="text-lg">
            Cairo font works great for English text too - clean and readable
          </p>
          
          <p className="text-lg font-medium">
            Medium weight English text - perfect for important content
          </p>
          
          <p className="text-lg font-bold">
            Bold English text - ideal for headings and emphasis
          </p>
        </div>
      </section>
      
      {/* عرض العناوين والنصوص المختلطة */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          العناوين والنصوص المختلطة
        </h2>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            عنوان رئيسي - Main Heading
          </h1>
          
          <h2 className="text-3xl font-semibold">
            عنوان فرعي - Subheading
          </h2>
          
          <p className="text-lg">
            نص مختلط عربي و English - خط Cairo يدعم كلا اللغتين بشكل مثالي
          </p>
          
          <p className="text-base font-medium">
            نص متوسط - Medium weight text for emphasis
          </p>
        </div>
      </section>
      
      {/* أمثلة على الاستخدام */}
      <section className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold">
          أمثلة على الاستخدام في التطبيق
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">الأزرار</h4>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              زر بخط Cairo
            </button>
            <button className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Cairo Font Button
            </button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800">حقول الإدخال</h4>
            <input 
              type="text" 
              placeholder="أدخل النص هنا..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
            <input 
              type="text" 
              placeholder="Enter text here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
            />
          </div>
        </div>
      </section>
      
      {/* معلومات تقنية */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">
          المعلومات التقنية
        </h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• <strong>Cairo:</strong> الخط الوحيد المستخدم في كامل التطبيق</p>
          <p>• <strong>دعم اللغات:</strong> العربية والإنجليزية</p>
          <p>• <strong>الأوزان:</strong> من 300 إلى 900</p>
          <p>• <strong>التحسينات:</strong> font-smoothing, kerning</p>
          <p>• <strong>الأداء:</strong> display: swap للتحميل السريع</p>
          <p>• <strong>التوافق:</strong> جميع المتصفحات الحديثة</p>
          <p>• <strong>الاستخدام:</strong> الأزرار، العناوين، النصوص، حقول الإدخال</p>
        </div>
      </section>
    </div>
  );
} 