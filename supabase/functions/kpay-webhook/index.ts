import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { tid, refid, statusid, momtransactionid, payaccount } = payload;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    return new Response(
      JSON.stringify({ tid, refid, reply: "OK" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
