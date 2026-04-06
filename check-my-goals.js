// Check your pending goals from the database
// Run with: node check-my-goals.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkMyGoals() {
  console.log('🔍 Checking your goals in the database...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // Find your user
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, name, display_name')
      .eq('email', 'abdousentore@gmail.com');

    if (userError) {
      console.error('❌ Error finding user:', userError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found with email: abdousentore@gmail.com');
      console.log('💡 Make sure you have signed up and logged in to the app.\n');
      return;
    }

    const user = users[0]; // Take the first user if multiple exist

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.display_name || user.name || 'Not set'}\n`);

    // Get ALL goals first to see what we have
    const { data: allGoals, error: allGoalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (allGoalsError) {
      console.error('❌ Error fetching goals:', allGoalsError.message);
      return;
    }

    console.log(`📋 Total Goals: ${allGoals?.length || 0}\n`);

    if (allGoals && allGoals.length > 0) {
      allGoals.forEach((goal, index) => {
        console.log(`${index + 1}. ${goal.title}`);
        if (goal.description) console.log(`   Description: ${goal.description}`);
        if (goal.progress !== null && goal.progress !== undefined) {
          console.log(`   Progress: ${goal.progress}%`);
        }
        if (goal.streak) console.log(`   Streak: ${goal.streak} days`);
        console.log(`   Created: ${new Date(goal.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('   No goals found.');
      console.log('   Create some goals in your dashboard to see them here!\n');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log(`Total Goals: ${allGoals?.length || 0}`);
    console.log('='.repeat(60) + '\n');

    if (allGoals && allGoals.length > 0) {
      console.log('💡 These goals will appear in your daily email reminders!');
    } else {
      console.log('💡 Create goals in your dashboard to receive daily reminders.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkMyGoals();
