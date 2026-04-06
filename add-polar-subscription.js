// Add Polar subscription to the database
const SUPABASE_URL = 'https://rilhdwxirwxqfgsqpiww.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzAxOTcyMSwiZXhwIjoyMDU4NTk1NzIxfQ.oboUzObna8V9AYOn6h5uDBOYdqHWuI8TvXLgEhYbTXk';

async function addPolarSubscription() {
  console.log('🔧 Adding Polar subscription...\n');

  try {
    // First, get the user with active subscription
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email&subscription_status=eq.active`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const users = await usersRes.json();
    
    if (users.length === 0) {
      console.log('❌ No active users found');
      return;
    }

    const user = users[0];
    console.log(`Found active user: ${user.email}`);
    console.log(`User ID: ${user.id}\n`);

    // Create a Polar subscription record with UUID
    const { randomUUID } = require('crypto');
    const subId = `sub_${Date.now()}`;
    const subscription = {
      id: randomUUID(), // Generate a proper UUID
      user_id: user.id,
      subscription_id: subId, // Polar subscription ID
      plan_id: 'pro_monthly', // Plan identifier
      status: 'active',
      product_id: 'pro_plan', // Change this to your actual product
      price_id: 'price_monthly', // Change this to your actual price
      current_period_start: new Date().toISOString(),
      current_period_end: '2026-05-03T20:59:24.389436+00:00', // Match your expiry date
      cancel_at_period_end: false,
      metadata: {
        source: 'manual_migration',
        original_provider: 'kpay',
        migrated_at: new Date().toISOString()
      }
    };

    console.log('Creating Polar subscription record...');
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/polar_subscriptions`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(subscription)
    });

    if (insertRes.ok) {
      const result = await insertRes.json();
      console.log('✅ Polar subscription created successfully!');
      console.log('\nSubscription details:');
      console.log(`   User: ${user.email}`);
      console.log(`   Status: ${result[0].status}`);
      console.log(`   Product: ${result[0].product_id}`);
      console.log(`   Expires: ${result[0].current_period_end}`);
      console.log('\n🎉 Now refresh your settings page - it should show "Provider: polar"');
    } else {
      const error = await insertRes.json();
      console.log('❌ Failed to create subscription');
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addPolarSubscription();
