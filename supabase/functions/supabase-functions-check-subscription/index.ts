import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the user has an active subscription
    const { data: stripeData, error: stripeError } = await supabaseClient
      .from("subscriptions")
      .select("count")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (stripeError) {
      console.error("Error checking Stripe subscription:", stripeError.message);
    }

    const { data: polarData, error: polarError } = await supabaseClient
      .from("polar_subscriptions")
      .select("count")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (polarError) {
      console.error("Error checking Polar subscription:", polarError.message);
    }

    // Check for trial access
    const { data: userData, error: userError2 } = await supabaseClient
      .from("users")
      .select("has_trial_access")
      .eq("id", user.id)
      .single();

    if (userError2) {
      console.error("Error checking user trial access:", userError2.message);
    }

    const hasStripeSubscription =
      stripeData && stripeData.length > 0 && stripeData[0].count > 0;
    const hasPolarSubscription =
      polarData && polarData.length > 0 && polarData[0].count > 0;
    const hasTrialAccess = userData && userData.has_trial_access;

    // Get subscription details
    let subscriptionDetails = null;
    if (hasStripeSubscription) {
      const { data: stripeDetails } = await supabaseClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      subscriptionDetails = {
        provider: "stripe",
        details: stripeDetails,
      };
    } else if (hasPolarSubscription) {
      const { data: polarDetails } = await supabaseClient
        .from("polar_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      subscriptionDetails = {
        provider: "polar",
        details: polarDetails,
      };
    }

    return new Response(
      JSON.stringify({
        hasActiveSubscription: hasStripeSubscription || hasPolarSubscription,
        hasTrialAccess,
        subscriptionDetails,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error checking subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
