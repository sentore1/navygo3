import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { tid } = await req.json();
    
    const kpayUrl = process.env.KPAY_API_URL || 'https://pay.esicia.com';
    const kpayUsername = process.env.KPAY_USERNAME;
    const kpayPassword = process.env.KPAY_PASSWORD;

    const payload = {
      action: "checkstatus",
      tid,
    };

    const response = await fetch(kpayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${kpayUsername}:${kpayPassword}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.statusid === '01') {
      const supabase = await createClient();
      
      const { data: transaction } = await supabase
        .from('kpay_transactions')
        .select('user_id, plan_name, tid')
        .eq('refid', tid)
        .single();

      if (!transaction) {
        return NextResponse.json({ success: false, error: 'Transaction not found' });
      }

      const actualTid = transaction.tid || data.tid;

      if (transaction) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabase.from('users').update({
          subscription_status: 'active',
          subscription_expires_at: expiresAt.toISOString(),
        }).eq('id', transaction.user_id);

        await supabase.from('kpay_transactions').update({
          status: 'completed',
          mom_transaction_id: data.momtransactionid,
        }).eq('refid', tid);

        return NextResponse.json({ success: true, status: 'active' });
      }
    }

    return NextResponse.json({ success: false, status: data.statusdesc });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
