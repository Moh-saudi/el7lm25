#!/usr/bin/env node

/**
 * سكريبت التحقق من تحديث مفاتيح جيديا للإنتاج
 * يتحقق من أن المفاتيح الجديدة تم تطبيقها بشكل صحيح
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 التحقق من تحديث مفاتيح جيديا للإنتاج');
console.log('=====================================\n');

// قراءة ملف .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ تم قراءة ملف .env.local بنجاح');
} catch (error) {
  console.error('❌ فشل في قراءة ملف .env.local:', error.message);
  process.exit(1);
}

// استخراج متغيرات جيديا
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

// التحقق من مفاتيح جيديا الجديدة
const geideaConfig = {
  merchantPublicKey: envVars.GEIDEA_MERCHANT_PUBLIC_KEY,
  apiPassword: envVars.GEIDEA_API_PASSWORD,
  webhookSecret: envVars.GEIDEA_WEBHOOK_SECRET,
  baseUrl: envVars.GEIDEA_BASE_URL,
  environment: envVars.NEXT_PUBLIC_GEIDEA_ENVIRONMENT
};

console.log('📋 مفاتيح جيديا الجديدة:');
console.log('================================');

const expectedKeys = {
  'GEIDEA_MERCHANT_PUBLIC_KEY': '3448c010-87b1-41e7-9771-cac444268cfb',
  'GEIDEA_API_PASSWORD': 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0',
  'GEIDEA_WEBHOOK_SECRET': 'geidea_webhook_secret_production_2024',
  'GEIDEA_BASE_URL': 'https://api.merchant.geidea.net',
  'NEXT_PUBLIC_GEIDEA_ENVIRONMENT': 'production'
};

let allCorrect = true;

Object.entries(expectedKeys).forEach(([key, expectedValue]) => {
  const actualValue = envVars[key];
  const isCorrect = actualValue === expectedValue;
  const status = isCorrect ? '✅' : '❌';
  
  console.log(`${status} ${key}:`);
  console.log(`   المتوقع: ${expectedValue}`);
  console.log(`   الفعلي:  ${actualValue || 'غير محدد'}`);
  console.log('');
  
  if (!isCorrect) {
    allCorrect = false;
  }
});

// التحقق من ملفات API
console.log('🔍 التحقق من ملفات API:');
console.log('========================');

const apiFiles = [
  'src/app/api/geidea/create-session/route.ts',
  'src/lib/firebase/config.ts'
];

apiFiles.forEach(filePath => {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const hasOldTestKeys = fileContent.includes('e510dca3-d113-47bf-b4b0-9b92bac661f6') || 
                          fileContent.includes('9b794cd5-9b42-4048-8e97-2c162f35710f');
    const hasProductionKeys = fileContent.includes('3448c010-87b1-41e7-9771-cac444268cfb') ||
                             fileContent.includes('edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0');
    
    if (hasOldTestKeys) {
      console.log(`❌ ${filePath}: يحتوي على مفاتيح اختبارية قديمة`);
    } else if (hasProductionKeys) {
      console.log(`✅ ${filePath}: يستخدم مفاتيح الإنتاج الجديدة`);
    } else {
      console.log(`⚠️ ${filePath}: لا يحتوي على مفاتيح واضحة`);
    }
  } catch (error) {
    console.log(`❌ ${filePath}: فشل في القراءة - ${error.message}`);
  }
});

console.log('\n📊 ملخص التحديث:');
console.log('================');

if (allCorrect) {
  console.log('✅ تم تحديث جميع مفاتيح جيديا بنجاح!');
  console.log('✅ النظام جاهز للعمل في وضع الإنتاج');
  console.log('✅ يمكن الآن معالجة المدفوعات الحقيقية');
} else {
  console.log('❌ هناك مشاكل في التحديث');
  console.log('❌ يرجى مراجعة المفاتيح وإعادة المحاولة');
}

console.log('\n🚀 الخطوات التالية:');
console.log('1. أعد تشغيل خادم التطوير: npm run dev');
console.log('2. اختبر عملية دفع تجريبية');
console.log('3. تحقق من سجلات الخادم للتأكد من عدم وجود أخطاء');
console.log('4. في الإنتاج، تأكد من استخدام HTTPS');

console.log('\n✨ تم الانتهاء من التحقق!');












