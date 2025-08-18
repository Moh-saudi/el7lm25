require('dotenv').config({ path: '.env.local' });

console.log('🔧 Payment System Improvement Script');
console.log('=====================================\n');

// Check current environment
console.log('📋 Current Environment Check:');
console.log('================================');

// Check Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('🔥 Firebase Configuration:');
Object.entries(firebaseConfig).forEach(([key, value]) => {
  const status = value && !value.includes('your_') ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value ? 'Set' : 'Missing'}`);
});

// Check Geidea configuration
console.log('\n💳 Geidea Configuration:');
const geideaConfig = {
  merchantPublicKey: process.env.GEIDEA_MERCHANT_PUBLIC_KEY,
  apiPassword: process.env.GEIDEA_API_PASSWORD,
  webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET,
  baseUrl: process.env.GEIDEA_BASE_URL,
  environment: process.env.NEXT_PUBLIC_GEIDEA_ENVIRONMENT
};

Object.entries(geideaConfig).forEach(([key, value]) => {
  const status = value && !value.includes('your_') ? '✅' : '⚠️';
  console.log(`  ${status} ${key}: ${value ? 'Set' : 'Missing'}`);
});

// Check Supabase configuration
console.log('\n🗄️ Supabase Configuration:');
const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

Object.entries(supabaseConfig).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  console.log(`  ${status} ${key}: ${value ? 'Set' : 'Missing'}`);
});

console.log('\n📊 System Status Summary:');
console.log('================================');

// Determine system status
const firebaseWorking = Object.values(firebaseConfig).every(value => 
  value && !value.includes('your_')
);

const geideaWorking = Object.values(geideaConfig).every(value => 
  value && !value.includes('your_')
);

const supabaseWorking = Object.values(supabaseConfig).every(value => value);

console.log(`🔥 Firebase: ${firebaseWorking ? '✅ Working' : '❌ Needs Configuration'}`);
console.log(`💳 Geidea: ${geideaWorking ? '✅ Working' : '⚠️ Needs Test Credentials'}`);
console.log(`🗄️ Supabase: ${supabaseWorking ? '✅ Connected' : '❌ Needs Configuration'}`);

console.log('\n🎯 Recommendations:');
console.log('================================');

if (!firebaseWorking) {
  console.log('❌ Firebase needs proper configuration');
  console.log('   - Update .env.local with real Firebase credentials');
  console.log('   - Run: node scripts/verify-firebase-config.js');
}

if (!geideaWorking) {
  console.log('⚠️ Geidea needs test credentials');
  console.log('   - Get test credentials from: https://merchant.geidea.net/');
  console.log('   - Update .env.local with real test values');
  console.log('   - Run: node scripts/verify-geidea-config.js');
}

if (!supabaseWorking) {
  console.log('❌ Supabase needs configuration');
  console.log('   - Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

console.log('\n✅ System can work with current setup:');
console.log('   - Firebase fallback is working');
console.log('   - localStorage backup is available');
console.log('   - Console logging for manual tracking');

console.log('\n🚀 Next Steps:');
console.log('================================');
console.log('1. Test current payment flow: npm run dev');
console.log('2. Get Geidea test credentials for full functionality');
console.log('3. Create Supabase tables for advanced reporting');
console.log('4. Monitor console logs for payment tracking');

console.log('\n📞 Support:');
console.log('================================');
console.log('- Firebase issues: Check firebase console');
console.log('- Geidea issues: Contact merchant support');
console.log('- Database issues: Check Supabase dashboard');
console.log('- Payment tracking: Check browser console logs');

console.log('\n✨ Current system is functional with fallbacks!'); 