import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("webhook-signature");
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Polar webhook secret not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    if (signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(body);
    console.log("Polar webhook event:", event.type);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case "checkout.created":
      case "checkout.updated":
        // Log checkout events
        await supabase.from("webhook_events").insert({
          provider: "polar",
          event_type: event.type,
          data: event.data,
        });
        break;

      case "subscription.created":
      case "subscription.updated":
        const subscription = event.data;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          // Update user subscription status
          await supabase
            .from("users")
            .update({
              subscription_status: subscription.status === "active" ? "active" : "inactive",
              subscription_expires_at: subscription.current_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          // Store subscription details
          await supabase.from("polar_subscriptions").upsert({
            user_id: userId,
            subscription_id: subscription.id,
            plan_id: subscription.price_id || subscription.product_id,
            status: subscription.status,
            product_id: subscription.product_id,
            price_id: subscription.price_id,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            metadata: subscription.metadata,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'subscription_id'
          });
        }
        break;

      case "subscription.canceled":
        const canceledSub = event.data;
        const canceledUserId = canceledSub.metadata?.user_id;

        if (canceledUserId) {
          // Set status to "inactive" and clear expiration to immediately revoke access
          // This ensures users cannot access dashboard after cancellation is processed by Polar
          await supabase
            .from("users")
            .update({
              subscription_status: "inactive",
              subscription_expires_at: null, // Clear expiration to revoke access immediately
              updated_at: new Date().toISOString(),
            })
            .eq("id", canceledUserId);

          await supabase
            .from("polar_subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", canceledSub.id);
        }
        break;

      case "order.created":
        // Handle one-time purchases if needed
        const order = event.data;
        await supabase.from("webhook_events").insert({
          provider: "polar",
          event_type: event.type,
          data: order,
        });
        break;
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Error processing Polar webhook:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
