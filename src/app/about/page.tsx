'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Target, Award, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img src="/hagzz-logo.png" alt="Logo" className="w-auto h-10" />
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                Hagzz Go
              </span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-blue-600 transition-colors duration-200 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-12 mx-auto">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            عن منصة
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text"> Hagzz Go</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            منصة شاملة لإدارة لاعبي كرة القدم تهدف إلى ربط المواهب الرياضية بالأندية والوكلاء في جميع أنحاء العالم
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid gap-8 mb-16 md:grid-cols-2">
          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">رسالتنا</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              نهدف إلى تمكين لاعبي كرة القدم من عرض مواهبهم ومهاراتهم للأندية والوكلاء حول العالم، 
              وتوفير منصة شاملة تجمع بين اللاعبين والأندية والوكلاء في مكان واحد لتسهيل عمليات الاكتشاف والتوقيع.
            </p>
          </div>

          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">رؤيتنا</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              أن نصبح المنصة الرائدة عالمياً في مجال اكتشاف وإدارة المواهب الرياضية، 
              ونساهم في تطوير كرة القدم العربية والعالمية من خلال توفير الأدوات والتقنيات المتقدمة.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">مميزات المنصة</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <Users className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">إدارة شاملة للملفات</h3>
              <p className="text-gray-600">
                ملفات شخصية تفصيلية تشمل المهارات، الإحصائيات، الفيديوهات، والتاريخ الطبي
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <Globe className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">وصول عالمي</h3>
              <p className="text-gray-600">
                منصة تدعم عدة لغات وعملات، مع إمكانية الوصول للأندية والوكلاء في جميع أنحاء العالم
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md">
              <Target className="w-12 h-12 mb-4 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold text-gray-900">تحليلات متقدمة</h3>
              <p className="text-gray-600">
                أدوات تحليل الأداء وتقييم المهارات مع تقارير مفصلة ومخططات تفاعلية
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">إحصائياتنا</h2>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="p-6 text-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div>لاعب مسجل</div>
            </div>
            <div className="p-6 text-center bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">50+</div>
              <div>نادي شريك</div>
            </div>
            <div className="p-6 text-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">25+</div>
              <div>وكيل معتمد</div>
            </div>
            <div className="p-6 text-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">15</div>
              <div>دولة</div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="p-8 text-center bg-white rounded-2xl shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">تواصل معنا</h2>
          <p className="mb-6 text-gray-600">
            لديك أسئلة أو تحتاج مساعدة؟ فريقنا مستعد لمساعدتك
          </p>
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <a
              href="mailto:info@hagzzgo.com"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              info@hagzzgo.com
            </a>
            <a
              href="tel:+201017799580"
              className="px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              +20 10 1779 9580
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-white">
        <div className="container px-4 mx-auto text-center">
          <p>&copy; 2024 Hagzz Go. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
} 