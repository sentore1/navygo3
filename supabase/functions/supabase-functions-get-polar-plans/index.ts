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
      console.error("Authentication error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if Polar API key is available
    const polarApiKey = Deno.env.get("POLAR_API_KEY");
    const polarOrgId = Deno.env.get("POLAR_ORGANIZATION_ID");

    if (!polarApiKey || !polarOrgId) {
      console.warn(
        "Polar API key or Organization ID not configured, returning mock plans",
      );
      // Return mock plans if Polar is not configured
      return new Response(
        JSON.stringify({
          plans: [
            {
              id: "plan_monthly",
              name: "Monthly Subscription",
              description: "Premium access to all features",
              amount: 999,
              interval: "month",
              currency: "USD",
              features: [
                "Unlimited goals",
                "Advanced analytics",
                "Priority support",
                "Cancel anytime",
              ],
            },
          ],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    try {
      console.log(`Fetching plans for organization: ${polarOrgId}`);

      // Make an API call to Polar's plans API
      const response = await fetch(
        `https://api.polar.sh/v1/organizations/${polarOrgId}/plans`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${polarApiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Polar API error:", errorData);
        throw new Error(
          errorData.message || `Polar API error: ${response.status}`,
        );
      }

      const data = await response.json();

      // Transform the data to match our expected format
      const plans = data.map((plan: any) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        interval: plan.interval,
        currency: plan.currency.toUpperCase(),
        features: plan.features || [
          "Unlimited goals",
          "Advanced analytics",
          "Priority support",
          "Cancel anytime",
        ],
      }));

      return new Response(JSON.stringify({ plans }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (apiError: any) {
      console.error("Error calling Polar API:", apiError);

      // Return mock plans as fallback
      return new Response(
        JSON.stringify({
          plans: [
            {
              id: "plan_monthly",
              name: "Monthly Subscription",
              description: "Premium access to all features",
              amount: 999,
              interval: "month",
              currency: "USD",
              features: [
                "Unlimited goals",
                "Advanced analytics",
                "Priority support",
                "Cancel anytime",
              ],
            },
          ],
          error: apiError.message,
        }),
        {
          status: 200,
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
