import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { event_type, event_data, page_url } = await req.json();

    if (!event_type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get user agent and IP
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';

    // Insert analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: user?.id || null,
        event_type,
        event_data: event_data || {},
        page_url,
        user_agent: userAgent,
        ip_address: ip,
      });

    if (error) {
      console.error('Error tracking analytics:', error);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in analytics tracking:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
