import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0";

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
    // Check if Stripe API key is available
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.warn("Stripe API key not configured, returning mock plans");
      // Return mock plans if Stripe is not configured
      return new Response(
        JSON.stringify([
          {
            id: "price_free",
            name: "Free",
            description: "Get started with basic goal tracking",
            amount: 0,
            interval: "month",
            currency: "USD",
            features: [
              "3 goals maximum",
              "Basic progress tracking",
              "7-day history",
            ],
          },
          {
            id: "price_standard",
            name: "Standard",
            description: "Perfect for serious goal setters",
            amount: 999,
            interval: "month",
            currency: "USD",
            popular: true,
            features: [
              "Unlimited goals",
              "Advanced progress tracking",
              "Detailed analytics",
              "30-day history",
              "Email reminders",
            ],
          },
          {
            id: "price_pro",
            name: "Pro",
            description: "For power users and teams",
            amount: 1999,
            interval: "month",
            currency: "USD",
            features: [
              "Everything in Standard",
              "Team collaboration",
              "Priority support",
              "API access",
              "Custom reporting",
              "Unlimited history",
            ],
          },
        ]),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Fetch all active products
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    // Fetch all prices to get more details
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
    });

    // Map products with their prices
    const plans = products.data
      .map((product) => {
        // Find the default price for this product
        const defaultPrice = prices.data.find(
          (price) => price.id === (product.default_price as any)?.id,
        );

        if (!defaultPrice) return null;

        // Extract features from product metadata or description
        const features = product.metadata?.features
          ? JSON.parse(product.metadata.features)
          : product.description
            ? [product.description]
            : [];

        return {
          id: defaultPrice.id,
          name: product.name,
          description: product.description,
          amount: defaultPrice.unit_amount || 0,
          interval: defaultPrice.recurring?.interval || "month",
          currency: defaultPrice.currency.toUpperCase(),
          popular: product.metadata?.popular === "true",
          features,
        };
      })
      .filter(Boolean);

    // Sort plans by price
    plans.sort((a, b) => a.amount - b.amount);

    return new Response(JSON.stringify(plans), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
