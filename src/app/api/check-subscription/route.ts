import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ subscribed: false });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status, subscription_expires_at')
      .eq('id', user.id)
      .single();

    const isActive = userData?.subscription_status === 'active' && 
                     userData.subscription_expires_at &&
                     new Date(userData.subscription_expires_at) > new Date();

    return NextResponse.json({ 
      subscribed: isActive,
      status: userData?.subscription_status,
      expires_at: userData?.subscription_expires_at
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
