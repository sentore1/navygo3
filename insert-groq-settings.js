// Insert Groq AI settings into database
// Run with: node insert-groq-settings.js

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Inserting Groq AI Settings\n');

async function insertSettings() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('📝 Inserting AI settings...\n');

    const { data, error } = await supabase
      .from('ai_settings')
      .insert({
        ai_enabled: true,
        ai_model: 'llama-3.3-70b-versatile',
        ai_provider: 'groq',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('❌ Error inserting settings:', error.message);
      console.log('\nTry running this SQL in Supabase SQL Editor instead:');
      console.log('');
      console.log(`INSERT INTO ai_settings (ai_enabled, ai_model, ai_provider, created_at, updated_at)
VALUES (true, 'llama-3.3-70b-versatile', 'groq', NOW(), NOW());`);
      return;
    }

    console.log('✅ AI Settings inserted successfully!');
    console.log('');
    console.log('Settings:');
    console.log('  AI Enabled: true');
    console.log('  Provider: groq');
    console.log('  Model: llama-3.3-70b-versatile');
    console.log('');
    console.log('⚠️  Next step: Add GROQ_API_KEY to Supabase Edge Functions');
    console.log('   Go to: https://supabase.com/dashboard/project/rilhdwxirwxqfgsqpiww/settings/functions');
    console.log('   Add secret: GROQ_API_KEY = your_groq_api_key');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

insertSettings();
