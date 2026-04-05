import { NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not logged in' });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('email, subscription_status, subscription_expires_at')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      id: user.id,
      email: user.email,
      dbEmail: userData?.email,
      subscription_status: userData?.subscription_status,
      subscription_expires_at: userData?.subscription_expires_at
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
