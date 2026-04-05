import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { refid } = await req.json();
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    );
    
    const { data: transaction } = await supabase
      .from('kpay_transactions')
      .select('user_id, plan_name')
      .eq('refid', refid)
      .single();

    if (transaction) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await supabase.from('users').update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt.toISOString(),
      }).eq('id', transaction.user_id);

      await supabase.from('kpay_transactions').update({
        status: 'completed',
      }).eq('refid', refid);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Transaction not found' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
