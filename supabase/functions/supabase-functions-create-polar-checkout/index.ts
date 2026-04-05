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
    console.log("Creating Polar checkout session from server");

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
      console.error("Authentication error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request data
    const { user_id, email, return_url, cancel_url } = await req.json();

    if (!user_id || !return_url) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the user is authorized to create a checkout for this user_id
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized to create checkout for this user",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Check if Polar API key is available
    const polarApiKey = Deno.env.get("POLAR_API_KEY");
    if (!polarApiKey) {
      return new Response(
        JSON.stringify({ error: "Polar API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create a checkout session with Polar API
    try {
      // This is a simplified example - in a real implementation, you would use the Polar API
      // to create a checkout session. Since we don't have direct access to the Polar API in this
      // example, we're simulating the response.

      // In a real implementation, you would make an API call to Polar's checkout API
      // const response = await fetch('https://api.polar.sh/v1/checkout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${polarApiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     success_url: return_url,
      //     cancel_url: cancel_url || `${new URL(return_url).origin}/pricing`,
      //     email: email,
      //     metadata: {
      //       userId: user_id,
      //     },
      //   }),
      // });
      //
      // const data = await response.json();
      // const checkoutUrl = data.url;

      // For now, we'll simulate a successful response with a mock URL
      const checkoutUrl = `https://checkout.polar.sh/c/mock-checkout-session-${Date.now()}`;

      // Log the checkout creation in the database
      await supabaseClient.from("checkout_sessions").insert({
        user_id: user_id,
        provider: "polar",
        status: "created",
        metadata: {
          return_url,
          cancel_url: cancel_url || `${new URL(return_url).origin}/pricing`,
        },
      });

      return new Response(JSON.stringify({ url: checkoutUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (apiError: any) {
      console.error("Error calling Polar API:", apiError);
      return new Response(
        JSON.stringify({
          error: apiError.message || "Failed to create checkout with Polar API",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error: any) {
    console.error("General error in function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
