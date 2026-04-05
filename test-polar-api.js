// Test Polar API Connection
const https = require('https');
const { URL } = require('url');

const POLAR_API_KEY = 'polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA';
const POLAR_ORG_ID = '2d4bea8d-3408-4672-a1b5-b906db0ee08d';
const POLAR_API_URL = 'https://sandbox-api.polar.sh';

console.log('🧪 Testing Polar API Connection\n');
console.log('Configuration:');
console.log('- API Key:', POLAR_API_KEY.substring(0, 20) + '...');
console.log('- Org ID:', POLAR_ORG_ID);
console.log('- API URL:', POLAR_API_URL);
console.log('\n' + '='.repeat(60) + '\n');

// Test 1: Fetch Products
console.log('Test 1: Fetching Products...');
const url = `${POLAR_API_URL}/v1/products/?organization_id=${POLAR_ORG_ID}&is_archived=false`;

const options = {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${POLAR_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

function makeRequest(url, options, callback) {
  const req = https.request(url, options, (res) => {
    // Handle redirects
    if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
      console.log(`Following redirect to: ${res.headers.location}`);
      makeRequest(res.headers.location, options, callback);
      return;
    }
    callback(res);
  });
  
  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });
  
  req.end();
}

makeRequest(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS: API connection working!');
        if (parsed.items && parsed.items.length > 0) {
          console.log(`\n📦 Found ${parsed.items.length} products:`);
          parsed.items.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.name}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Description: ${product.description || 'N/A'}`);
            if (product.prices && product.prices.length > 0) {
              console.log(`   Prices:`);
              product.prices.forEach(price => {
                const amount = (price.price_amount / 100).toFixed(2);
                console.log(`     - ${price.recurring_interval}: $${amount} ${price.price_currency}`);
                console.log(`       Price ID: ${price.id}`);
              });
            }
          });
        } else {
          console.log('\n⚠️  No products found. Create products in Polar dashboard.');
        }
      } else if (res.statusCode === 401) {
        console.log('\n❌ FAILED: 401 Unauthorized');
        console.log('\nPossible issues:');
        console.log('1. API key is invalid or expired');
        console.log('2. API key doesn\'t match the organization ID');
        console.log('3. API key is from production but using sandbox URL (or vice versa)');
        console.log('\nSolutions:');
        console.log('1. Go to https://sandbox.polar.sh/dashboard');
        console.log('2. Navigate to Settings → API Keys');
        console.log('3. Create a new server-side API key');
        console.log('4. Copy the organization ID from Settings');
        console.log('5. Update .env.local with both values');
      } else {
        console.log(`\n❌ FAILED: ${res.statusCode} ${res.statusMessage}`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Failed to parse response:', e.message);
    }
  });
});
