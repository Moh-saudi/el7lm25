#!/usr/bin/env node

/**
 * Script لاختبار رفع الفيديوهات
 * يستخدم لاختبار API routes الجديدة
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// إعدادات الاختبار
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  apiEndpoint: '/api/upload/video',
  testVideoPath: './test-video.mp4', // يجب إنشاء ملف فيديو تجريبي
  userId: 'test-user-123'
};

/**
 * إنشاء ملف فيديو تجريبي
 */
function createTestVideo() {
  const testVideoPath = path.join(__dirname, '..', 'test-video.mp4');
  
  if (!fs.existsSync(testVideoPath)) {
    console.log('⚠️ ملف الفيديو التجريبي غير موجود');
    console.log('يرجى إنشاء ملف test-video.mp4 في مجلد المشروع الرئيسي');
    return false;
  }
  
  return true;
}

/**
 * اختبار رفع الفيديو
 */
async function testVideoUpload() {
  console.log('🚀 بدء اختبار رفع الفيديو...');
  
  if (!createTestVideo()) {
    return;
  }
  
  try {
    const testVideoPath = path.join(__dirname, '..', 'test-video.mp4');
    const videoBuffer = fs.readFileSync(testVideoPath);
    
    // إنشاء FormData
    const formData = new FormData();
    formData.append('file', videoBuffer, {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    formData.append('userId', TEST_CONFIG.userId);
    
    console.log('📤 رفع الفيديو...');
    
    // إرسال الطلب
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ فشل في رفع الفيديو:', errorData);
      return;
    }
    
    const result = await response.json();
    console.log('✅ تم رفع الفيديو بنجاح:', result);
    
    // اختبار حذف الفيديو
    await testVideoDelete(result.url);
    
  } catch (error) {
    console.error('❌ خطأ في اختبار رفع الفيديو:', error);
  }
}

/**
 * اختبار حذف الفيديو
 */
async function testVideoDelete(videoUrl) {
  console.log('🗑️ اختبار حذف الفيديو...');
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}?url=${encodeURIComponent(videoUrl)}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ فشل في حذف الفيديو:', errorData);
      return;
    }
    
    const result = await response.json();
    console.log('✅ تم حذف الفيديو بنجاح:', result);
    
  } catch (error) {
    console.error('❌ خطأ في اختبار حذف الفيديو:', error);
  }
}

/**
 * اختبار أنواع ملفات غير مدعومة
 */
async function testInvalidFileTypes() {
  console.log('🧪 اختبار أنواع ملفات غير مدعومة...');
  
  const invalidFiles = [
    { name: 'test.txt', type: 'text/plain', content: 'This is a text file' },
    { name: 'test.jpg', type: 'image/jpeg', content: 'fake image content' },
    { name: 'test.pdf', type: 'application/pdf', content: 'fake pdf content' }
  ];
  
  for (const file of invalidFiles) {
    try {
      const formData = new FormData();
      formData.append('file', Buffer.from(file.content), {
        filename: file.name,
        contentType: file.type
      });
      formData.append('userId', TEST_CONFIG.userId);
      
      const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          ...formData.getHeaders()
        }
      });
      
      if (response.ok) {
        console.log(`⚠️ تم قبول ملف غير مدعوم: ${file.name}`);
      } else {
        const errorData = await response.json();
        console.log(`✅ تم رفض الملف غير المدعوم: ${file.name} - ${errorData.error}`);
      }
      
    } catch (error) {
      console.error(`❌ خطأ في اختبار الملف ${file.name}:`, error);
    }
  }
}

/**
 * اختبار ملف كبير جداً
 */
async function testLargeFile() {
  console.log('📏 اختبار ملف كبير جداً...');
  
  try {
    // إنشاء ملف كبير (101MB)
    const largeBuffer = Buffer.alloc(101 * 1024 * 1024);
    
    const formData = new FormData();
    formData.append('file', largeBuffer, {
      filename: 'large-video.mp4',
      contentType: 'video/mp4'
    });
    formData.append('userId', TEST_CONFIG.userId);
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });
    
    if (response.ok) {
      console.log('⚠️ تم قبول ملف كبير جداً');
    } else {
      const errorData = await response.json();
      console.log('✅ تم رفض الملف الكبير:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الملف الكبير:', error);
  }
}

/**
 * اختبار بدون معرف مستخدم
 */
async function testWithoutUserId() {
  console.log('👤 اختبار بدون معرف مستخدم...');
  
  try {
    const testVideoPath = path.join(__dirname, '..', 'test-video.mp4');
    const videoBuffer = fs.readFileSync(testVideoPath);
    
    const formData = new FormData();
    formData.append('file', videoBuffer, {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    // لا نضيف userId
    
    const response = await fetch(`${TEST_CONFIG.baseUrl}${TEST_CONFIG.apiEndpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });
    
    if (response.ok) {
      console.log('⚠️ تم قبول طلب بدون معرف مستخدم');
    } else {
      const errorData = await response.json();
      console.log('✅ تم رفض الطلب بدون معرف مستخدم:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ خطأ في اختبار بدون معرف مستخدم:', error);
  }
}

/**
 * تشغيل جميع الاختبارات
 */
async function runAllTests() {
  console.log('🧪 بدء اختبارات رفع الفيديوهات...\n');
  
  await testVideoUpload();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testInvalidFileTypes();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testLargeFile();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testWithoutUserId();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ انتهت جميع الاختبارات');
}

// تشغيل الاختبارات إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testVideoUpload,
  testVideoDelete,
  testInvalidFileTypes,
  testLargeFile,
  testWithoutUserId,
  runAllTests
}; 