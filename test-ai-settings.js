// Test AI settings API
// Run with: node test-ai-settings.js

require('dotenv').config({ path: '.env.local' });

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🧪 Testing AI Settings\n');

async function testAISettings() {
  try {
    // First, let's check the database directly
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);

    console.log('📊 Checking AI settings in database...\n');

    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error fetching AI settings:', error.message);
      return;
    }

    if (!data) {
      console.log('⚠️  No AI settings found in database');
      console.log('You need to configure AI settings in Admin Settings page');
      return;
    }

    console.log('✅ AI Settings from database:');
    console.log('  AI Enabled:', data.ai_enabled);
    console.log('  AI Provider:', data.ai_provider);
    console.log('  AI Model:', data.ai_model);
    console.log('');

    // Check environment variables
    console.log('🔑 Checking environment variables:');
    console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('  GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('  GROK_API_KEY:', process.env.GROK_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('');

    // Check if the selected provider's key is available
    const providerKey = {
      'openai': process.env.OPENAI_API_KEY,
      'groq': process.env.GROQ_API_KEY,
      'grok': process.env.GROK_API_KEY,
      'gemini': process.env.GEMINI_API_KEY,
    }[data.ai_provider];

    if (!providerKey) {
      console.log(`❌ Selected provider "${data.ai_provider}" API key is NOT set!`);
      console.log('   Please add it to your .env.local file');
    } else {
      console.log(`✅ Selected provider "${data.ai_provider}" API key is configured`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAISettings();
