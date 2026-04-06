import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Check if requester is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Unblock the user
    const { error } = await supabase
      .from('users')
      .update({
        is_blocked: false,
        blocked_at: null,
        blocked_reason: null,
      })
      .eq('id', user_id);

    if (error) {
      console.error('Error unblocking user:', error);
      return NextResponse.json(
        { error: 'Failed to unblock user' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.rpc('log_admin_action', {
      p_action_type: 'unblock_user',
      p_target_user_id: user_id,
      p_action_data: {}
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in unblock user:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
