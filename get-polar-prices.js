// Helper script to fetch Polar product and price IDs
// Run with: node get-polar-prices.js

const apiKey = 'polar_oat_e7vN8nZvdYdbFUvGxU0CU5U5dHQP8UBNdtHJa4FkDEA';
const orgId = '2d4bea8d-3408-4672-a1b5-b906db0ee08d';
const apiUrl = 'https://sandbox-api.polar.sh';

async function fetchPolarPrices() {
  try {
    console.log('Fetching Polar products and prices...\n');
    
    const response = await fetch(
      `${apiUrl}/v1/products?organization_id=${orgId}&is_archived=false`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    console.log('='.repeat(60));
    console.log('POLAR PRODUCTS & PRICES');
    console.log('='.repeat(60));
    console.log('');

    if (!data.items || data.items.length === 0) {
      console.log('No products found.');
      return;
    }

    data.items.forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      console.log('   Prices:');
      
      if (product.prices && product.prices.length > 0) {
        product.prices.forEach(price => {
          const amount = (price.price_amount / 100).toFixed(2);
          const currency = price.price_currency.toUpperCase();
          const interval = price.recurring_interval || 'one-time';
          console.log(`     - ${interval.padEnd(10)}: ${price.id}`);
          console.log(`       Amount: ${currency} $${amount}${interval !== 'one-time' ? '/' + interval : ''}`);
        });
      } else {
        console.log('     No prices configured');
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('');
    console.log('1. Go to: https://sandbox.polar.sh/dashboard');
    console.log('2. Navigate to Products > [Select Product] > Checkout Links');
    console.log('3. Create a checkout link for each price');
    console.log('4. Copy the checkout link URLs');
    console.log('5. Add them to src/config/pricing.ts:');
    console.log('');
    console.log('   polarCheckoutLinks: {');
    data.items.forEach(product => {
      if (product.prices) {
        product.prices.forEach(price => {
          console.log(`     "${price.id}": "YOUR_CHECKOUT_LINK_URL_HERE",`);
        });
      }
    });
    console.log('   }');
    console.log('');

  } catch (error) {
    console.error('Error fetching Polar prices:', error.message);
  }
}

fetchPolarPrices();
