// Check AI configuration
// Run with: node check-ai-config.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking AI Configuration\n');

async function checkConfig() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('📊 Checking ai_settings table...\n');

    // Try to read ai_settings (this should work without auth if RLS allows)
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*');

    if (error) {
      console.log('❌ Cannot read ai_settings table:', error.message);
      console.log('   This might be due to RLS policies\n');
      
      // Try to check if table exists
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'ai_settings');
      
      if (tableError) {
        console.log('⚠️  Cannot check if table exists');
      }
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  ai_settings table is EMPTY');
      console.log('   You need to configure AI settings in Admin Settings page\n');
      console.log('Steps to configure:');
      console.log('  1. Log in as admin');
      console.log('  2. Go to Admin Settings');
      console.log('  3. Scroll to "AI Goal Creation" section');
      console.log('  4. Select "Groq (Fast Inference)" as provider');
      console.log('  5. Select "Llama 3.3 70B" as model');
      console.log('  6. Enable AI Goal Creation');
      return;
    }

    const settings = data[0];
    console.log('✅ AI Settings found in database:');
    console.log('');
    console.log('  AI Enabled:', settings.ai_enabled ? '✅ YES' : '❌ NO');
    console.log('  Provider:', settings.ai_provider || 'Not set');
    console.log('  Model:', settings.ai_model || 'Not set');
    console.log('  Created:', settings.created_at);
    console.log('  Updated:', settings.updated_at);
    console.log('');

    // Check local environment
    console.log('🔑 Local Environment Variables (.env.local):');
    console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('  GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('  GROK_API_KEY:', process.env.GROK_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('');

    // Check if the selected provider's key is set locally
    const providerKeyMap = {
      'openai': 'OPENAI_API_KEY',
      'groq': 'GROQ_API_KEY',
      'grok': 'GROK_API_KEY',
      'gemini': 'GEMINI_API_KEY'
    };

    const requiredKey = providerKeyMap[settings.ai_provider];
    const keyIsSet = process.env[requiredKey];

    console.log('📋 Configuration Status:');
    if (settings.ai_enabled) {
      console.log('  ✅ AI is enabled in database');
    } else {
      console.log('  ❌ AI is DISABLED in database');
      console.log('     Enable it in Admin Settings');
    }

    if (keyIsSet) {
      console.log(`  ✅ ${requiredKey} is set locally (.env.local)`);
    } else {
      console.log(`  ❌ ${requiredKey} is NOT set locally`);
    }

    console.log('');
    console.log('⚠️  IMPORTANT: Edge Functions need their own environment variables!');
    console.log('   Your .env.local only works for Next.js, not for Edge Functions.');
    console.log('');
    console.log('To set Edge Function environment variables:');
    console.log('  1. Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/settings/functions');
    console.log(`  2. Add secret: ${requiredKey} = your_api_key`);
    console.log('  3. The Edge Function will then use AI instead of fallback');
    console.log('');

    // Summary
    console.log('📝 Summary:');
    if (settings.ai_enabled && keyIsSet) {
      console.log('  ✅ Configuration looks good locally');
      console.log('  ⚠️  But you still need to add the API key to Supabase Edge Functions');
    } else if (!settings.ai_enabled) {
      console.log('  ❌ AI is disabled - enable it in Admin Settings');
    } else if (!keyIsSet) {
      console.log(`  ❌ ${requiredKey} is missing from .env.local`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkConfig();
