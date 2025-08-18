const fetch = require('node-fetch');

async function testGeideaSession() {
  console.log('🧪 Testing Geidea Session Creation...');
  
  const testData = {
    amount: 100,
    currency: 'EGP',
    orderId: `TEST_ORDER_${Date.now()}`,
    customerEmail: 'test@example.com',
    customerName: 'Test Customer'
  };

  console.log('📤 Sending test data:', testData);

  try {
    const response = await fetch('http://localhost:3000/api/geidea/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Session created successfully!');
      console.log('Session ID:', data.sessionId);
      console.log('Redirect URL:', data.redirectUrl);
    } else {
      console.log('❌ Session creation failed');
      console.log('Error:', data.error);
      console.log('Details:', data.details);
    }

  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

testGeideaSession(); 