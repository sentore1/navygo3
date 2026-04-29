import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { user_id, email, phone, name, amount, plan_name } = await req.json();
    
    if (!user_id || !email || !name || !amount) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const kpayUrl = process.env.KPAY_API_URL || 'https://pay.esicia.com';
    const kpayUsername = process.env.KPAY_USERNAME;
    const kpayPassword = process.env.KPAY_PASSWORD;
    const kpayRetailerId = process.env.KPAY_RETAILER_ID;

    const refid = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    const payload = {
      action: "pay",
      msisdn: phone?.replace(/\+/g, '') || '0000000000',
      email,
      details: `NavyGoal ${plan_name || 'Monthly'} Subscription`,
      refid,
      amount: amount,
      currency: "RWF",
      cname: name,
      cnumber: user_id,
      pmethod: "cc",
      retailerid: kpayRetailerId,
      returl: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'http://localhost:3000'}/api/kpay-webhook`,
      redirecturl: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'http://localhost:3000'}/success?tid=${refid}`,
      bankid: "000",
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
    console.log('KPay Response:', data);

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      { auth: { persistSession: false } }
    );
    
    // Save transaction
    await supabase.from('kpay_transactions').insert({
      user_id,
      tid: data.tid || 'PENDING',
      refid,
      amount: amount,
      plan_name,
      status: 'completed',
    });

    // Activate subscription immediately
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    await supabase.from('users').update({
      subscription_status: 'active',
      subscription_expires_at: expiresAt.toISOString(),
    }).eq('id', user_id);

    if (data.retcode === 0) {
      return NextResponse.json({ success: true, url: data.url, tid: data.tid, refid });
    } else {
      return NextResponse.json({ error: data.statusdesc || 'Payment initiation failed', kpayResponse: data }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
