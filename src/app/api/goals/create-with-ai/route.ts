import { createClient } from '../../../../supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, difficulty = 'medium', targetDate, apiKey } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate API key (you should set this in your environment variables)
    const validApiKey = process.env.GOALS_API_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be easy, medium, or hard' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has AI access (Pro subscription)
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    let hasAIAccess = false;

    if (userData?.subscription_status === 'active') {
      // Check Polar subscriptions for AI access
      const { data: polarSub } = await supabase
        .from('polar_subscriptions')
        .select('has_ai_access')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      hasAIAccess = polarSub?.has_ai_access || false;
    }

    if (!hasAIAccess) {
      return NextResponse.json(
        { error: 'AI goal creation requires an active Pro subscription' },
        { status: 403 }
      );
    }

    // Call the AI goal generation function
    const { data: aiGoalData, error: aiError } = await supabase.functions.invoke(
      'supabase-functions-generate-ai-goal',
      {
        body: { prompt, difficulty }
      }
    );

    if (aiError) {
      console.error('AI generation error:', aiError);
      return NextResponse.json(
        { error: 'Failed to generate goal with AI', details: aiError.message },
        { status: 500 }
      );
    }

    // Prepare goal data
    const goalData = {
      title: aiGoalData.title,
      description: aiGoalData.description,
      milestones: aiGoalData.milestones,
      targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Create the goal
    const { data: createdGoal, error: createError } = await supabase.functions.invoke(
      'supabase-functions-create-goal',
      {
        body: goalData
      }
    );

    if (createError) {
      console.error('Goal creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create goal', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      goal: createdGoal,
      message: 'Goal created successfully with AI'
    }, { status: 201 });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
