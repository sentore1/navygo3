import { createClient } from '../../../../../../supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, difficulty = 'medium', targetDate, userId, adminApiKey } = body;

    // Validate admin API key
    const validAdminKey = process.env.ADMIN_API_KEY;
    if (!validAdminKey || adminApiKey !== validAdminKey) {
      return NextResponse.json(
        { error: 'Invalid or missing admin API key' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be easy, medium, or hard' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for admin operations
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify the user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, subscription_status')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
      
      // Try fallback function
      const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke(
        'supabase-functions-openai-goal',
        {
          body: { prompt, difficulty }
        }
      );

      if (fallbackError) {
        return NextResponse.json(
          { error: 'Failed to generate goal with AI', details: fallbackError.message },
          { status: 500 }
        );
      }

      // Use fallback data
      const goalData = {
        title: fallbackData.title,
        description: fallbackData.description,
        milestones: fallbackData.milestones,
        targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        userId: userId,
      };

      return NextResponse.json({
        success: true,
        goal: goalData,
        message: 'Goal generated successfully with AI (fallback method)',
        note: 'Goal data returned but not saved. Use the create-goal endpoint to save it.'
      }, { status: 200 });
    }

    // Prepare goal data
    const goalData = {
      title: aiGoalData.title,
      description: aiGoalData.description,
      milestones: aiGoalData.milestones,
      targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      goal: goalData,
      message: 'Goal generated successfully with AI',
      note: 'Goal data returned but not saved. Use the create-goal endpoint to save it.'
    }, { status: 200 });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
