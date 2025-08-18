const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: "hagzzgo-87884.firebaseapp.com",
  projectId: "hagzzgo-87884",
  storageBucket: "hagzzgo-87884.appspot.com",
  messagingSenderId: "865241332465",
  appId: "1:865241332465:web:158ed5fb2f0a80eecf0750"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSpecificDuplicate() {
  try {
    console.log('🔍 فحص الحساب المكرر المحدد...');
    
    const targetEmail = '0555555555@hagzzgo.com';
    const targetUid = 'TnSvLJgehmftXNY024Y0cjib6NI3';
    
    console.log('🎯 البحث عن:', {
      email: targetEmail,
      uid: targetUid
    });
    
    const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
    const results = {};
    
    for (const collectionName of collections) {
      console.log(`\n📊 فحص مجموعة ${collectionName}...`);
      
      try {
        // البحث بالبريد الإلكتروني
        const emailQuery = query(
          collection(db, collectionName),
          where('email', '==', targetEmail)
        );
        const emailDocs = await getDocs(emailQuery);
        
        // البحث بالـ UID
        const uidQuery = query(
          collection(db, collectionName),
          where('uid', '==', targetUid)
        );
        const uidDocs = await getDocs(uidQuery);
        
        // البحث بالـ firebaseEmail
        const firebaseEmailQuery = query(
          collection(db, collectionName),
          where('firebaseEmail', '==', targetEmail)
        );
        const firebaseEmailDocs = await getDocs(firebaseEmailQuery);
        
        const foundDocs = [];
        
        // جمع النتائج من جميع الاستعلامات
        emailDocs.forEach(doc => {
          foundDocs.push({
            id: doc.id,
            data: doc.data(),
            matchType: 'email'
          });
        });
        
        uidDocs.forEach(doc => {
          // تجنب التكرار
          if (!foundDocs.find(d => d.id === doc.id)) {
            foundDocs.push({
              id: doc.id,
              data: doc.data(),
              matchType: 'uid'
            });
          }
        });
        
        firebaseEmailDocs.forEach(doc => {
          // تجنب التكرار
          if (!foundDocs.find(d => d.id === doc.id)) {
            foundDocs.push({
              id: doc.id,
              data: doc.data(),
              matchType: 'firebaseEmail'
            });
          }
        });
        
        if (foundDocs.length > 0) {
          results[collectionName] = foundDocs;
          console.log(`✅ تم العثور على ${foundDocs.length} وثيقة في ${collectionName}`);
          
          foundDocs.forEach((doc, index) => {
            console.log(`  📄 وثيقة ${index + 1}:`);
            console.log(`    ID: ${doc.id}`);
            console.log(`    نوع المطابقة: ${doc.matchType}`);
            console.log(`    نوع الحساب: ${doc.data.accountType || 'غير محدد'}`);
            console.log(`    البريد الإلكتروني: ${doc.data.email || 'غير محدد'}`);
            console.log(`    UID: ${doc.data.uid || 'غير محدد'}`);
            console.log(`    الاسم: ${doc.data.full_name || doc.data.name || 'غير محدد'}`);
            console.log(`    الهاتف: ${doc.data.phone || 'غير محدد'}`);
          });
        } else {
          console.log(`❌ لم يتم العثور على أي وثيقة في ${collectionName}`);
        }
        
      } catch (error) {
        console.error(`❌ خطأ في فحص ${collectionName}:`, error.message);
      }
    }
    
    // تحليل النتائج
    console.log('\n📊 تحليل النتائج:');
    let totalFound = 0;
    let duplicates = [];
    
    for (const [collectionName, docs] of Object.entries(results)) {
      totalFound += docs.length;
      if (docs.length > 1) {
        duplicates.push({
          collection: collectionName,
          count: docs.length,
          docs: docs
        });
      }
    }
    
    console.log(`📈 إجمالي الوثائق الموجودة: ${totalFound}`);
    
    if (duplicates.length > 0) {
      console.log('🚨 تم العثور على تكرارات:');
      duplicates.forEach(dup => {
        console.log(`  📁 في مجموعة ${dup.collection}: ${dup.count} وثيقة`);
      });
    } else {
      console.log('✅ لم يتم العثور على تكرارات في نفس المجموعة');
    }
    
    // فحص التكرار عبر المجموعات
    const allEmails = new Set();
    const allUids = new Set();
    const emailToCollections = {};
    const uidToCollections = {};
    
    for (const [collectionName, docs] of Object.entries(results)) {
      docs.forEach(doc => {
        const email = doc.data.email;
        const uid = doc.data.uid;
        
        if (email) {
          allEmails.add(email);
          if (!emailToCollections[email]) {
            emailToCollections[email] = [];
          }
          emailToCollections[email].push(collectionName);
        }
        
        if (uid) {
          allUids.add(uid);
          if (!uidToCollections[uid]) {
            uidToCollections[uid] = [];
          }
          uidToCollections[uid].push(collectionName);
        }
      });
    }
    
    console.log('\n🔍 فحص التكرار عبر المجموعات:');
    
    // فحص تكرار البريد الإلكتروني
    for (const [email, collections] of Object.entries(emailToCollections)) {
      if (collections.length > 1) {
        console.log(`🚨 البريد الإلكتروني ${email} موجود في ${collections.length} مجموعات: ${collections.join(', ')}`);
      }
    }
    
    // فحص تكرار الـ UID
    for (const [uid, collections] of Object.entries(uidToCollections)) {
      if (collections.length > 1) {
        console.log(`🚨 الـ UID ${uid} موجود في ${collections.length} مجموعات: ${collections.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    process.exit(0);
  }
}

checkSpecificDuplicate(); 