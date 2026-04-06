import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET - Check AI settings and OpenAI API key status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get AI settings from database
    const { data: aiSettings, error: settingsError } = await supabase
      .from('ai_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Error fetching AI settings:', settingsError);
    }

    // Check which API keys are configured (server-side only)
    const openaiKeyConfigured = !!process.env.OPENAI_API_KEY;
    const grokKeyConfigured = !!process.env.GROK_API_KEY;
    const groqKeyConfigured = !!process.env.GROQ_API_KEY;
    const geminiKeyConfigured = !!process.env.GEMINI_API_KEY;

    // Determine if the selected provider's key is configured
    let apiKeyConfigured = false;
    const provider = aiSettings?.ai_provider || 'openai';
    
    if (provider === 'openai') apiKeyConfigured = openaiKeyConfigured;
    else if (provider === 'grok') apiKeyConfigured = grokKeyConfigured;
    else if (provider === 'groq') apiKeyConfigured = groqKeyConfigured;
    else if (provider === 'gemini') apiKeyConfigured = geminiKeyConfigured;

    return NextResponse.json({
      success: true,
      settings: {
        ai_enabled: aiSettings?.ai_enabled || false,
        ai_model: aiSettings?.ai_model || 'gpt-3.5-turbo',
        ai_provider: provider,
        openai_api_key_configured: openaiKeyConfigured,
        grok_api_key_configured: grokKeyConfigured,
        groq_api_key_configured: groqKeyConfigured,
        gemini_api_key_configured: geminiKeyConfigured,
        current_provider_configured: apiKeyConfigured,
      }
    });

  } catch (error: any) {
    console.error('Error in AI settings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Update AI settings
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { ai_enabled, ai_model, ai_provider } = body;

    // Validate inputs
    if (typeof ai_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'ai_enabled must be a boolean' },
        { status: 400 }
      );
    }

    // Validate AI provider
    const validProviders = ['openai', 'grok', 'groq', 'gemini'];
    if (ai_provider && !validProviders.includes(ai_provider)) {
      return NextResponse.json(
        { error: `ai_provider must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate AI model based on provider
    const validModels: Record<string, string[]> = {
      openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
      grok: ['grok-beta', 'grok-2-latest'],
      groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
      gemini: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    };

    const provider = ai_provider || 'openai';
    if (ai_model && !validModels[provider].includes(ai_model)) {
      return NextResponse.json(
        { error: `For ${provider}, ai_model must be one of: ${validModels[provider].join(', ')}` },
        { status: 400 }
      );
    }

    // Check if the selected provider's API key is configured
    if (ai_enabled) {
      let apiKeyConfigured = false;
      let apiKeyName = '';

      if (provider === 'openai') {
        apiKeyConfigured = !!process.env.OPENAI_API_KEY;
        apiKeyName = 'OPENAI_API_KEY';
      } else if (provider === 'grok') {
        apiKeyConfigured = !!process.env.GROK_API_KEY;
        apiKeyName = 'GROK_API_KEY';
      } else if (provider === 'groq') {
        apiKeyConfigured = !!process.env.GROQ_API_KEY;
        apiKeyName = 'GROQ_API_KEY';
      } else if (provider === 'gemini') {
        apiKeyConfigured = !!process.env.GEMINI_API_KEY;
        apiKeyName = 'GEMINI_API_KEY';
      }

      if (!apiKeyConfigured) {
        return NextResponse.json(
          { error: `Cannot enable AI: ${apiKeyName} environment variable is not configured` },
          { status: 400 }
        );
      }
    }

    // Update settings
    const updateData: any = {
      ai_enabled,
      updated_at: new Date().toISOString(),
    };

    if (ai_model) {
      updateData.ai_model = ai_model;
    }

    if (ai_provider) {
      updateData.ai_provider = ai_provider;
    }

    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('ai_settings')
      .select('id')
      .single();

    let result;
    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from('ai_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from('ai_settings')
        .insert({
          ...updateData,
          openai_api_key_configured: !!process.env.OPENAI_API_KEY,
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({
      success: true,
      message: 'AI settings updated successfully',
      settings: result.data
    });

  } catch (error: any) {
    console.error('Error in AI settings POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
