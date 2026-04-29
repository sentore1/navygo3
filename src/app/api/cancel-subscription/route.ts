import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import Stripe from "stripe";

// Initialize Stripe only when needed to avoid build-time errors
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia",
  });
};

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, provider } = await request.json();
    
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Handle Polar cancellation
    if (provider === "polar") {
      const polarApiKey = process.env.POLAR_API_KEY;
      const apiUrl = process.env.POLAR_API_URL || "https://sandbox-api.polar.sh";

      if (!polarApiKey) {
        return NextResponse.json(
          { error: "Polar not configured" },
          { status: 500 }
        );
      }

      if (!subscriptionId) {
        console.error("No subscription ID provided for Polar cancellation");
        return NextResponse.json(
          { error: "Subscription ID is missing. Please contact support." },
          { status: 400 }
        );
      }

      console.log('Cancelling Polar subscription:', subscriptionId);
      console.log('Using Polar API URL:', apiUrl);

      // Cancel subscription in Polar (sets cancel_at_period_end = true)
      let polarCancelSuccess = false;
      try {
        const cancelResponse = await fetch(`${apiUrl}/v1/subscriptions/${subscriptionId}/cancel`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${polarApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!cancelResponse.ok) {
          const errorText = await cancelResponse.text();
          console.error("Failed to cancel in Polar:", {
            status: cancelResponse.status,
            statusText: cancelResponse.statusText,
            error: errorText,
            subscriptionId,
            apiUrl
          });
          
          // If subscription not found in Polar (404), we'll cancel locally
          if (cancelResponse.status === 404) {
            console.log('⚠️  Subscription not found in Polar, will cancel locally only');
            polarCancelSuccess = false; // Will trigger local cancellation below
          } else if (cancelResponse.status === 401 || cancelResponse.status === 403) {
            console.log('⚠️  Authentication failed with Polar, will cancel locally only');
            polarCancelSuccess = false; // Will trigger local cancellation below
          } else {
            // For other errors, still try to cancel locally
            console.log('⚠️  Polar API error, will cancel locally only');
            polarCancelSuccess = false;
          }
        } else {
          console.log('✅ Subscription cancelled in Polar');
          polarCancelSuccess = true;
        }
      } catch (fetchError: any) {
        console.error("Network error cancelling Polar subscription:", fetchError);
        console.log('⚠️  Network error, will cancel locally only');
        polarCancelSuccess = false;
      }

      // Update local database to reflect cancellation
      const { error: polarError } = await supabase
        .from("polar_subscriptions")
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("subscription_id", subscriptionId);

      if (polarError) {
        console.error("Error updating Polar subscriptions:", polarError);
        return NextResponse.json(
          { error: "Failed to update subscription in database" },
          { status: 500 }
        );
      }

      console.log('✅ Polar subscription set to cancel at period end for user:', user.id);
      
      // Return success with a note if Polar API failed but local cancellation succeeded
      return NextResponse.json({
        success: true,
        message: polarCancelSuccess 
          ? "Subscription will be cancelled at the end of the billing period"
          : "Subscription cancelled locally. Note: Could not cancel in Polar - you may need to cancel manually at polar.sh",
        localOnly: !polarCancelSuccess
      });
    }
    
    // Handle Stripe cancellation
    else if (provider === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: "Stripe not configured" },
          { status: 500 }
        );
      }

      console.log('Cancelling Stripe subscription:', subscriptionId);

      // Cancel subscription in Stripe (sets cancel_at_period_end = true)
      if (subscriptionId) {
        try {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          });

          console.log('✅ Subscription cancelled in Stripe');

          // Update local database to reflect cancellation
          const { error: stripeError } = await supabase
            .from("subscriptions")
            .update({
              cancel_at_period_end: true,
              canceled_at: Math.floor(Date.now() / 1000),
            })
            .eq("user_id", user.id)
            .eq("stripe_id", subscriptionId);

          if (stripeError) {
            console.error("Error updating Stripe subscriptions:", stripeError);
          }

          console.log('✅ Stripe subscription set to cancel at period end for user:', user.id);
        } catch (stripeError: any) {
          console.error("Failed to cancel in Stripe:", stripeError);
          return NextResponse.json(
            { error: `Failed to cancel subscription: ${stripeError.message}` },
            { status: 500 }
          );
        }
      }
    }
    
    else {
      return NextResponse.json(
        { error: "Invalid provider specified" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription will be cancelled at the end of the billing period",
    });

  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
