// Test creating a goal with milestones
// Run with: node test-goal-with-milestones.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testGoalWithMilestones() {
  try {
    console.log('🔐 Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Not authenticated:', authError?.message);
      console.log('\n💡 Please log in to your app first, then run this script again.');
      return;
    }

    console.log('✅ Authenticated as:', user.email);
    console.log('User ID:', user.id);

    // Test data with milestones
    const testGoal = {
      title: 'Test Goal with Milestones',
      description: 'Testing milestone creation',
      milestones: [
        {
          title: 'Milestone 1',
          description: 'First milestone',
          completed: false
        },
        {
          title: 'Milestone 2',
          description: 'Second milestone',
          completed: false
        }
      ],
      targetDate: new Date().toISOString()
    };

    console.log('\n📝 Creating goal with milestones...');
    console.log('Goal data:', JSON.stringify(testGoal, null, 2));

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
      console.error('Context:', JSON.stringify(error.context, null, 2));
      return;
    }

    console.log('\n✅ Response received!');
    console.log('Data:', JSON.stringify(data, null, 2));

    if (data.warning) {
      console.warn('\n⚠️  Warning:', data.warning);
      console.error('Milestone error:', data.milestoneError);
    }

    if (data.goal) {
      console.log('\n📊 Checking if milestones were created...');
      
      const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('goal_id', data.goal.id);

      if (milestonesError) {
        console.error('❌ Error fetching milestones:', milestonesError);
      } else {
        console.log(`✅ Found ${milestones.length} milestones:`);
        milestones.forEach((m, i) => {
          console.log(`  ${i + 1}. ${m.title} - ${m.description}`);
        });
      }
    }

  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message);
    console.error(err);
  }
}

testGoalWithMilestones();
