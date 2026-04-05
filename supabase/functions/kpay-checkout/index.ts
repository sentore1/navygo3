import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { user_id, email, phone, name, amount, plan_name } = await req.json();
    
    if (!user_id || !email || !phone || !name || !amount) {
      throw new Error('Missing required parameters');
    }

    const kpayUrl = Deno.env.get('KPAY_API_URL') || 'https://pay.esicia.com';
    const kpayUsername = Deno.env.get('KPAY_USERNAME');
    const kpayPassword = Deno.env.get('KPAY_PASSWORD');
    const kpayRetailerId = Deno.env.get('KPAY_RETAILER_ID');
    const kpayBankId = Deno.env.get('KPAY_BANK_ID') || '63510';

    const refid = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const amountInCents = amount * 100;
    
    const payload = {
      action: "pay",
      msisdn: phone.replace(/\+/g, ''),
      email,
      details: `NavyGoal ${plan_name || 'Monthly'} Subscription`,
      refid,
      amount: amountInCents,
      currency: "USD",
      cname: name,
      cnumber: user_id,
      pmethod: "cc",
      retailerid: kpayRetailerId,
      returl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/kpay-webhook`,
      redirecturl: `${req.headers.get('origin') || 'http://localhost:3000'}/success`,
      bankid: "000",
    };

    const response = await fetch(kpayUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${kpayUsername}:${kpayPassword}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.retcode === 0) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('kpay_transactions').insert({
        user_id,
        tid: data.tid,
        refid,
        amount: amountInCents,
        plan_name,
        status: 'pending',
      });

      return new Response(
        JSON.stringify({ success: true, url: data.url, tid: data.tid }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error(data.statusdesc || 'Payment initiation failed');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
