import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/notifications/email-gmail';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, data } = body;

    // Validate input
    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, userId' },
        { status: 400 }
      );
    }

    // Get user details from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, name, display_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare email data
    const userName = user.display_name || user.name || 'Operative';
    const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://navygoal.com'}/dashboard`;

    // Send email notification
    const result = await sendEmailNotification({
      to: user.email,
      type: type,
      data: {
        userName,
        dashboardUrl,
        ...data,
      },
    });

    if (!result.success) {
      console.error('Failed to send email:', result.error);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      messageId: result.data?.messageId,
    });
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
