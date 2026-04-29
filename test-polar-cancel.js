// Test Polar subscription cancellation
// Run with: node test-polar-cancel.js

require('dotenv').config({ path: '.env.local' });

const POLAR_API_KEY = process.env.POLAR_API_KEY;
const POLAR_API_URL = process.env.POLAR_API_URL || 'https://sandbox-api.polar.sh';

// Replace this with your actual subscription ID from the database
const SUBSCRIPTION_ID = 'YOUR_SUBSCRIPTION_ID_HERE';

async function testPolarCancel() {
  console.log('🧪 Testing Polar Subscription Cancellation\n');
  console.log('Configuration:');
  console.log('- API URL:', POLAR_API_URL);
  console.log('- API Key:', POLAR_API_KEY ? `${POLAR_API_KEY.substring(0, 15)}...` : 'NOT SET');
  console.log('- Subscription ID:', SUBSCRIPTION_ID);
  console.log('\n---\n');

  if (!POLAR_API_KEY) {
    console.error('❌ POLAR_API_KEY is not set in .env.local');
    return;
  }

  if (SUBSCRIPTION_ID === 'YOUR_SUBSCRIPTION_ID_HERE') {
    console.error('❌ Please replace SUBSCRIPTION_ID with your actual subscription ID');
    console.log('\nTo find your subscription ID, run this SQL query:');
    console.log('SELECT subscription_id FROM polar_subscriptions WHERE user_id = (SELECT id FROM users WHERE email = \'your-email@example.com\');');
    return;
  }

  try {
    console.log('📡 Attempting to cancel subscription...\n');

    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions/${SUBSCRIPTION_ID}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ Failed to cancel subscription');
      console.error('Error:', errorText);
      
      if (response.status === 404) {
        console.log('\n💡 Subscription not found. Possible reasons:');
        console.log('   • The subscription ID is incorrect');
        console.log('   • The subscription was already cancelled');
        console.log('   • The subscription doesn\'t exist in Polar');
      } else if (response.status === 401 || response.status === 403) {
        console.log('\n💡 Authentication failed. Possible reasons:');
        console.log('   • The API key is invalid or expired');
        console.log('   • The API key doesn\'t have permission to cancel subscriptions');
        console.log('   • You\'re using a sandbox key with production API or vice versa');
      }
      
      return;
    }

    const data = await response.json();
    console.log('\n✅ Subscription cancelled successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('\n❌ Network error:', error.message);
    console.log('\n💡 Possible reasons:');
    console.log('   • No internet connection');
    console.log('   • Polar API is down');
    console.log('   • Firewall blocking the request');
  }
}

// First, let's test if we can reach the Polar API at all
async function testPolarConnection() {
  console.log('🔌 Testing Polar API connection...\n');
  
  try {
    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Connection Status:', response.status, response.statusText);

    if (response.status === 401 || response.status === 403) {
      console.log('⚠️  API key authentication failed');
      console.log('   Check that your POLAR_API_KEY is correct');
    } else if (response.ok) {
      console.log('✅ Successfully connected to Polar API');
      const data = await response.json();
      console.log(`   Found ${data.items?.length || 0} subscriptions`);
      
      if (data.items && data.items.length > 0) {
        console.log('\n📋 Your subscriptions:');
        data.items.forEach((sub, i) => {
          console.log(`   ${i + 1}. ID: ${sub.id}, Status: ${sub.status}`);
        });
      }
    }

    console.log('\n---\n');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n---\n');
  }
}

// Run tests
(async () => {
  await testPolarConnection();
  await testPolarCancel();
})();
