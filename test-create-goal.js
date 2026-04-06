// Test script to see the exact error from create-goal edge function
// Run with: node test-create-goal.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCreateGoal() {
  try {
    // First, check if we're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated:', authError?.message);
      console.log('\n💡 Please log in to your app first, then run this script again.');
      return;
    }

    console.log('✅ Authenticated as:', user.email);
    console.log('\n📝 Testing goal creation...\n');

    // Test data
    const testGoal = {
      title: 'Test Goal',
      description: 'This is a test goal',
      milestones: [
        {
          title: 'Test Milestone 1',
          description: 'First milestone',
          completed: false
        }
      ],
      targetDate: new Date().toISOString()
    };

    console.log('Sending data:', JSON.stringify(testGoal, null, 2));

    // Call the edge function
    const { data, error } = await supabase.functions.invoke(
      'supabase-functions-create-goal',
      {
        body: testGoal
      }
    );

    if (error) {
      console.error('\n❌ Error from edge function:');
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('Context:', error.context);
      console.error('\nFull error:', JSON.stringify(error, null, 2));
      return;
    }

    console.log('\n✅ Goal created successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message);
    console.error(err);
  }
}

testCreateGoal();
