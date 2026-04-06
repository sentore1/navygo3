// Check subscription data in the database
const SUPABASE_URL = 'https://rilhdwxirwxqfgsqpiww.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpbGhkd3hpcnd4cWZnc3FwaXd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzAxOTcyMSwiZXhwIjoyMDU4NTk1NzIxfQ.oboUzObna8V9AYOn6h5uDBOYdqHWuI8TvXLgEhYbTXk';

async function checkDatabase() {
  console.log('🔍 Checking subscription data...\n');

  try {
    // Check users table
    console.log('1️⃣ Checking users table:');
    const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,subscription_status,subscription_expires_at,has_trial_access&limit=10`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const users = await usersRes.json();
    console.log(`   Found ${users.length} users`);
    users.forEach(u => {
      console.log(`   - ${u.email}: status=${u.subscription_status}, expires=${u.subscription_expires_at}`);
    });

    // Check kpay_transactions
    console.log('\n2️⃣ Checking kpay_transactions:');
    const kpayRes = await fetch(`${SUPABASE_URL}/rest/v1/kpay_transactions?select=*&order=created_at.desc&limit=5`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    const kpayData = await kpayRes.json();
    if (kpayData.length > 0) {
      console.log(`   Found ${kpayData.length} KPay transactions`);
      kpayData.forEach(t => {
        console.log(`   - User: ${t.user_id}, Status: ${t.status}, Amount: ${t.amount}, Date: ${t.created_at}`);
      });
    } else {
      console.log('   No KPay transactions found');
    }

    // Check polar_subscriptions
    console.log('\n3️⃣ Checking polar_subscriptions:');
    const polarRes = await fetch(`${SUPABASE_URL}/rest/v1/polar_subscriptions?select=*&limit=5`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    
    if (polarRes.ok) {
      const polarData = await polarRes.json();
      if (polarData.length > 0) {
        console.log(`   Found ${polarData.length} Polar subscriptions`);
        polarData.forEach(s => {
          console.log(`   - User: ${s.user_id}, Status: ${s.status}, Plan: ${s.plan_id}, Ends: ${s.current_period_end}`);
        });
      } else {
        console.log('   ⚠️  Table exists but NO Polar subscriptions found!');
        console.log('   This is why it shows KPay instead of Polar.');
      }
    } else {
      const error = await polarRes.json();
      console.log('   ❌ polar_subscriptions table does NOT exist!');
      console.log('   Error:', error.message);
      console.log('   This is why it shows KPay instead of Polar.');
    }

    // Check subscriptions (Stripe)
    console.log('\n4️⃣ Checking subscriptions (Stripe):');
    const stripeRes = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?select=*&limit=5`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });
    
    if (stripeRes.ok) {
      const stripeData = await stripeRes.json();
      if (stripeData.length > 0) {
        console.log(`   Found ${stripeData.length} Stripe subscriptions`);
      } else {
        console.log('   No Stripe subscriptions found');
      }
    } else {
      console.log('   subscriptions table does not exist');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('─────────────────────────────────────');
    
    const activeUsers = users.filter(u => u.subscription_status === 'active');
    console.log(`✓ Users with active status: ${activeUsers.length}`);
    
    if (kpayData.length > 0) {
      console.log(`✓ KPay transactions exist: ${kpayData.length}`);
    }
    
    if (polarRes.ok) {
      const polarData = await polarRes.json();
      if (polarData.length === 0) {
        console.log('❌ NO Polar subscriptions in database');
        console.log('\n🔧 SOLUTION:');
        console.log('   1. Run FIX_SUBSCRIPTION_PROVIDER.sql to create the table');
        console.log('   2. Add your Polar subscription manually OR');
        console.log('   3. Set up Polar webhooks to auto-sync');
      } else {
        console.log(`✓ Polar subscriptions exist: ${polarData.length}`);
      }
    } else {
      console.log('❌ polar_subscriptions table missing');
      console.log('\n🔧 SOLUTION:');
      console.log('   Run FIX_SUBSCRIPTION_PROVIDER.sql to create the table');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
