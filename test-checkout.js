// Test Polar Checkout Creation
const https = require('https');

const POLAR_API_KEY = 'polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA';
const POLAR_API_URL = 'https://sandbox-api.polar.sh';

// Use the navygoal product
const PRICE_ID = '1ab0d75a-a693-4afb-b7c2-74b1183d5dea'; // $4.90/month
const TEST_EMAIL = 'test@navygoal.com';

console.log('🧪 Testing Polar Checkout Creation\n');
console.log('Configuration:');
console.log('- Price ID:', PRICE_ID);
console.log('- Test Email:', TEST_EMAIL);
console.log('\n' + '='.repeat(60) + '\n');

const checkoutData = {
  product_price_id: PRICE_ID,
  customer_email: TEST_EMAIL,
  success_url: 'http://localhost:3000/success?session_id={CHECKOUT_ID}',
  metadata: {
    user_id: 'test_user_123',
    interval: 'month',
  },
};

console.log('Creating checkout session...');
console.log('Request body:', JSON.stringify(checkoutData, null, 2));

const postData = JSON.stringify(checkoutData);

const options = {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${POLAR_API_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

function makeRequest(url, options, postData, callback) {
  const req = https.request(url, options, (res) => {
    // Handle redirects
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
      console.log(`Following redirect to: ${res.headers.location}`);
      makeRequest(res.headers.location, options, postData, callback);
      return;
    }
    callback(res);
  });
  
  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });
  
  req.write(postData);
  req.end();
}

makeRequest(`${POLAR_API_URL}/v1/checkouts/`, options, postData, (res) => {
  console.log('\nStatus Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SUCCESS: Checkout session created!');
        if (parsed.url) {
          console.log('\n🔗 Checkout URL:', parsed.url);
          console.log('\nNext steps:');
          console.log('1. Open this URL in your browser');
          console.log('2. Complete the checkout process');
          console.log('3. Check if webhook is triggered');
        }
      } else if (res.statusCode === 400) {
        console.log('\n❌ FAILED: Bad Request');
        console.log('\nPossible issues:');
        console.log('1. Invalid price ID');
        console.log('2. Missing required fields');
        console.log('3. Invalid email format');
      } else if (res.statusCode === 401) {
        console.log('\n❌ FAILED: Unauthorized');
        console.log('API key issue');
      } else if (res.statusCode === 404) {
        console.log('\n❌ FAILED: Not Found');
        console.log('Checkout endpoint might not be available in sandbox');
      } else {
        console.log(`\n❌ FAILED: ${res.statusCode} ${res.statusMessage}`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Failed to parse response:', e.message);
    }
  });
});
