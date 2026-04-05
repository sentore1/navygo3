import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { tid, refid, statusid, momtransactionid, payaccount } = payload;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    const { data: transaction } = await supabase
      .from('kpay_transactions')
      .update({
        status: statusid === '01' ? 'completed' : 'failed',
        mom_transaction_id: momtransactionid,
        pay_account: payaccount,
        updated_at: new Date().toISOString(),
      })
      .eq('tid', tid)
      .select()
      .single();

    if (statusid === '01' && transaction) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await supabase.from('users').update({
        subscription_status: 'active',
        subscription_expires_at: expiresAt.toISOString(),
      }).eq('id', transaction.user_id);
    }

    return NextResponse.json({ tid, refid, reply: "OK" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
