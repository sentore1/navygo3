// Check if subscription exists in Polar and list all subscriptions for user
require('dotenv').config({ path: '.env.local' });

const POLAR_API_KEY = process.env.POLAR_API_KEY;
const POLAR_API_URL = process.env.POLAR_API_URL || 'https://sandbox-api.polar.sh';
const SUBSCRIPTION_ID = '8171b63f-5dc4-4aa4-a2e8-756039f1a596';
const USER_EMAIL = 'rwandaform@gmail.com';

async function checkSubscription() {
  console.log('=== Checking Polar Subscription ===');
  console.log('API URL:', POLAR_API_URL);
  console.log('Subscription ID:', SUBSCRIPTION_ID);
  console.log('User Email:', USER_EMAIL);
  console.log('');

  // Check if specific subscription exists
  console.log('1. Checking if subscription exists by ID...');
  try {
    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions/${SUBSCRIPTION_ID}`, {
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Subscription found!');
      console.log('Status:', data.status);
      console.log('Customer ID:', data.customer_id);
      console.log('Product ID:', data.product_id);
      console.log('Current Period End:', data.current_period_end);
      console.log('Cancel at Period End:', data.cancel_at_period_end);
    } else {
      console.log('❌ Subscription not found (404)');
      console.log('Response:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error checking subscription:', error.message);
  }

  console.log('');

  // List all subscriptions for this email
  console.log('2. Listing all subscriptions for', USER_EMAIL);
  try {
    const response = await fetch(`${POLAR_API_URL}/v1/subscriptions?customer_email=${encodeURIComponent(USER_EMAIL)}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${POLAR_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Found ${data.items?.length || 0} subscriptions:`);
      
      if (data.items && data.items.length > 0) {
        data.items.forEach((sub, index) => {
          console.log(`\nSubscription ${index + 1}:`);
          console.log('  ID:', sub.id);
          console.log('  Status:', sub.status);
          console.log('  Product:', sub.product?.name || 'N/A');
          console.log('  Amount:', sub.amount, sub.currency);
          console.log('  Current Period End:', sub.current_period_end);
          console.log('  Cancel at Period End:', sub.cancel_at_period_end);
          console.log('  Created:', sub.created_at);
        });
      } else {
        console.log('No subscriptions found for this email');
      }
    } else {
      console.log('❌ Failed to list subscriptions');
      console.log('Response:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('Error listing subscriptions:', error.message);
  }
}

checkSubscription();
