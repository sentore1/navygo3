import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';
import { sendEmailNotification } from '@/lib/notifications/email-gmail';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, userId, data } = body;

    // Get user preferences
    const { data: userProfile } = await supabase
      .from('users')
      .select('email, name, notifications')
      .eq('id', userId)
      .single();

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has email notifications enabled
    const notifications = userProfile.notifications || {};
    
    let shouldSend = false;
    switch (type) {
      case 'goal_reminder':
        shouldSend = notifications.goalReminders !== false;
        break;
      case 'achievement_unlocked':
        shouldSend = notifications.achievements !== false;
        break;
      case 'account_update':
      case 'subscription_update':
        shouldSend = notifications.email !== false;
        break;
    }

    if (!shouldSend) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification disabled by user preferences' 
      });
    }

    // Send email notification
    const result = await sendEmailNotification({
      to: userProfile.email,
      type,
      data: {
        userName: userProfile.name || 'there',
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        ...data,
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}
