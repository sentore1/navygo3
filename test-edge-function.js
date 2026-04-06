// Test the Edge Function directly
// Run with: node test-edge-function.js

require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing Edge Function: supabase-functions-generate-ai-goal\n');

async function testEdgeFunction() {
  try {
    // First, get a user token (you'll need to be logged in)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Check if user is logged in
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('⚠️  No active session. You need to be logged in to test this.');
      console.log('   Please log in to your app first, then run this test again.\n');
      return;
    }

    console.log('✅ User authenticated:', session.user.email);
    console.log('');

    // Test the Edge Function
    console.log('📤 Calling Edge Function...');
    console.log('Prompt: "I want to learn JavaScript"');
    console.log('Difficulty: medium');
    console.log('');

    const { data, error } = await supabase.functions.invoke(
      'supabase-functions-generate-ai-goal',
      {
        body: {
          prompt: 'I want to learn JavaScript',
          difficulty: 'medium'
        }
      }
    );

    if (error) {
      console.error('❌ Edge Function Error:');
      console.error(error);
      return;
    }

    console.log('✅ Edge Function Response:');
    console.log('');

    if (data) {
      console.log('Title:', data.title);
      console.log('Description:', data.description);
      console.log('');
      console.log('Milestones:');
      
      if (data.milestones && Array.isArray(data.milestones)) {
        data.milestones.forEach((milestone, index) => {
          console.log(`  ${index + 1}. ${milestone.title}`);
          if (milestone.description) {
            console.log(`     ${milestone.description.substring(0, 100)}${milestone.description.length > 100 ? '...' : ''}`);
          }
        });
        console.log('');

        // Check if milestones look AI-generated or hardcoded
        const firstMilestone = data.milestones[0].title;
        if (firstMilestone.includes('Research options') || 
            firstMilestone.includes('Define your specific goal') ||
            firstMilestone.includes('Step 1:')) {
          console.log('⚠️  These look like FALLBACK/HARDCODED milestones');
          console.log('   The Edge Function is not using the AI API');
          console.log('');
          console.log('Possible reasons:');
          console.log('  1. GROQ_API_KEY not set in Supabase Edge Functions');
          console.log('  2. AI settings not configured in database');
          console.log('  3. AI is disabled in admin settings');
        } else {
          console.log('✅ These look like AI-GENERATED milestones!');
          console.log('   The Edge Function is successfully using the AI API');
        }
      }
    } else {
      console.log('⚠️  No data returned from Edge Function');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEdgeFunction();
