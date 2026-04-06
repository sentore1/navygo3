import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const polarApiKey = process.env.POLAR_API_KEY;
    const apiUrl = process.env.POLAR_API_URL || "https://sandbox-api.polar.sh";

    if (!polarApiKey) {
      return NextResponse.json(
        { error: "Polar not configured" },
        { status: 500 }
      );
    }

    console.log('Verifying checkout session:', sessionId);

    // Get checkout session details from Polar
    const checkoutResponse = await fetch(`${apiUrl}/v1/checkouts/${sessionId}`, {
      headers: {
        "Authorization": `Bearer ${polarApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error("Failed to fetch checkout:", errorText);
      return NextResponse.json(
        { error: "Failed to verify checkout" },
        { status: 400 }
      );
    }

    const checkout = await checkoutResponse.json();
    console.log('Checkout status:', checkout.status);
    console.log('Subscription ID:', checkout.subscription_id);

    // Check if checkout is successful (can be "succeeded" or "confirmed")
    const isSuccessful = checkout.status === "confirmed" || checkout.status === "succeeded";

    if (!isSuccessful) {
      // If checkout is still pending
      if (checkout.status === "open") {
        return NextResponse.json(
          { error: "Checkout is still pending" },
          { status: 202 }
        );
      }
      
      return NextResponse.json(
        { error: "Checkout not completed" },
        { status: 400 }
      );
    }

    // If checkout is successful but no subscription ID yet, fetch from Polar
    if (!checkout.subscription_id) {
      console.log('⏳ Checkout succeeded but no subscription ID. Fetching subscriptions from Polar...');
      
      // Get customer email to find subscriptions
      const customerEmail = checkout.customer_email || user.email;
      
      // Fetch subscriptions for this customer
      const subsResponse = await fetch(`${apiUrl}/v1/subscriptions?customer_email=${customerEmail}&limit=10`, {
        headers: {
          "Authorization": `Bearer ${polarApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (subsResponse.ok) {
        const subsData = await subsResponse.json();
        console.log('Found subscriptions:', subsData.items?.length || 0);
        
        // Find the most recent active subscription
        const recentSub = subsData.items?.find((s: any) => s.status === 'active');
        
        if (recentSub) {
          console.log('Found active subscription:', recentSub.id);
          
          // Store subscription in database
          const { error: updateError } = await supabase
            .from("users")
            .update({
              subscription_status: "active",
              subscription_expires_at: recentSub.current_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("Error updating user:", updateError);
          }

          const { error: subError } = await supabase
            .from("polar_subscriptions")
            .upsert({
              user_id: user.id,
              subscription_id: recentSub.id,
              plan_id: recentSub.price_id || recentSub.product_id,
              status: recentSub.status,
              product_id: recentSub.product_id,
              price_id: recentSub.price_id,
              current_period_start: recentSub.current_period_start,
              current_period_end: recentSub.current_period_end,
              cancel_at_period_end: recentSub.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'subscription_id'
            });

          if (subError) {
            console.error("Error storing subscription:", subError);
          }

          console.log('✅ Subscription activated for user:', user.id);

          return NextResponse.json({
            success: true,
            subscription: {
              id: recentSub.id,
              status: recentSub.status,
              product_id: recentSub.product_id,
            },
          });
        }
      }
      
      // If we still can't find a subscription, mark as pending
      console.log('⏳ No subscription found yet. Marking as pending...');
      
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error updating user:", updateError);
      }

      return NextResponse.json({
        success: true,
        pending: true,
        message: "Payment successful! Your subscription will be activated shortly.",
      });
    }

    // If we have a subscription ID from checkout, fetch and store it
    if (checkout.subscription_id) {
      // Fetch subscription details
      const subResponse = await fetch(`${apiUrl}/v1/subscriptions/${checkout.subscription_id}`, {
        headers: {
          "Authorization": `Bearer ${polarApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (subResponse.ok) {
        const subscription = await subResponse.json();
        console.log('Subscription details:', subscription);

        // Update user subscription status
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_status: "active",
            subscription_expires_at: subscription.current_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating user:", updateError);
        }

        // Store subscription in polar_subscriptions table
        const { error: subError } = await supabase
          .from("polar_subscriptions")
          .upsert({
            user_id: user.id,
            subscription_id: subscription.id,
            plan_id: subscription.price_id || subscription.product_id,
            status: subscription.status,
            product_id: subscription.product_id,
            price_id: subscription.price_id,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'subscription_id'
          });

        if (subError) {
          console.error("Error storing subscription:", subError);
        }

        console.log('✅ Subscription activated for user:', user.id);

        return NextResponse.json({
          success: true,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            product_id: subscription.product_id,
          },
        });
      } else {
        console.error("Failed to fetch subscription details");
        return NextResponse.json(
          { error: "Failed to fetch subscription details" },
          { status: 400 }
        );
      }
    }

    // Fallback - should not reach here
    return NextResponse.json(
      { error: "Unexpected checkout state" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Error verifying checkout:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
