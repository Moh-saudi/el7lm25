#!/usr/bin/env node

/**
 * سكريبت اختبار النظام بعد الإصلاحات
 * يختبر Firebase, Geidea, Google Analytics, و Google Fonts
 */

const https = require('https');
const http = require('http');

console.log('🧪 اختبار النظام بعد الإصلاحات...\n');

// اختبار Firebase
async function testFirebase() {
    console.log('1️⃣ اختبار Firebase...');
    try {
        const response = await fetch('http://localhost:3000/api/health');
        const data = await response.json();
        console.log('✅ Firebase يعمل بشكل طبيعي');
        return true;
    } catch (error) {
        console.log('❌ مشكلة في Firebase:', error.message);
        return false;
    }
}

// اختبار Geidea
async function testGeidea() {
    console.log('\n2️⃣ اختبار Geidea...');
    try {
        const response = await fetch('http://localhost:3000/api/geidea/config');
        const data = await response.json();
        console.log('✅ Geidea يعمل بشكل طبيعي');
        return true;
    } catch (error) {
        console.log('❌ مشكلة في Geidea:', error.message);
        return false;
    }
}

// اختبار Google Analytics
async function testGoogleAnalytics() {
    console.log('\n3️⃣ اختبار Google Analytics...');
    try {
        const response = await fetch('https://www.google-analytics.com/analytics.js');
        if (response.ok) {
            console.log('✅ Google Analytics متاح');
            return true;
        } else {
            console.log('❌ مشكلة في Google Analytics');
            return false;
        }
    } catch (error) {
        console.log('❌ مشكلة في Google Analytics:', error.message);
        return false;
    }
}

// اختبار Google Fonts
async function testGoogleFonts() {
    console.log('\n4️⃣ اختبار Google Fonts...');
    try {
        const response = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap');
        if (response.ok) {
            console.log('✅ Google Fonts متاح');
            return true;
        } else {
            console.log('❌ مشكلة في Google Fonts');
            return false;
        }
    } catch (error) {
        console.log('❌ مشكلة في Google Fonts:', error.message);
        return false;
    }
}

// اختبار CSP
async function testCSP() {
    console.log('\n5️⃣ اختبار Content Security Policy...');
    try {
        const response = await fetch('http://localhost:3000/dashboard/club/profile');
        const cspHeader = response.headers.get('content-security-policy');
        if (cspHeader) {
            console.log('✅ CSP موجود:', cspHeader.substring(0, 100) + '...');
            return true;
        } else {
            console.log('❌ CSP غير موجود');
            return false;
        }
    } catch (error) {
        console.log('❌ مشكلة في CSP:', error.message);
        return false;
    }
}

// اختبار شامل
async function runAllTests() {
    console.log('🚀 بدء الاختبارات الشاملة...\n');
    
    const results = {
        firebase: await testFirebase(),
        geidea: await testGeidea(),
        googleAnalytics: await testGoogleAnalytics(),
        googleFonts: await testGoogleFonts(),
        csp: await testCSP()
    };
    
    console.log('\n📊 نتائج الاختبارات:');
    console.log('='.repeat(50));
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅' : '❌';
        const testName = {
            firebase: 'Firebase',
            geidea: 'Geidea',
            googleAnalytics: 'Google Analytics',
            googleFonts: 'Google Fonts',
            csp: 'Content Security Policy'
        }[test];
        
        console.log(`${status} ${testName}`);
    });
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📈 النتيجة النهائية: ${passedTests}/${totalTests} اختبارات نجحت`);
    
    if (passedTests === totalTests) {
        console.log('🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
    } else {
        console.log('⚠️ بعض الاختبارات فشلت. يرجى مراجعة الإعدادات.');
    }
    
    return results;
}

// تشغيل الاختبارات
runAllTests().catch(console.error); 