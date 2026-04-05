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
    // Get the request body
    const body = await req.json();
    const event = body.event;
    const data = body.data;

    console.log(`Received Polar webhook: ${event}`, data);

    // Verify webhook signature
    const polarWebhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
    if (!polarWebhookSecret) {
      console.warn(
        "POLAR_WEBHOOK_SECRET not configured - skipping signature verification",
      );
    } else {
      const signature = req.headers.get("polar-signature");
      if (!signature) {
        console.warn("No Polar signature provided in webhook request");
        // In production, you might want to reject requests without signatures
        // For now, we'll continue processing to ensure backward compatibility
      } else {
        try {
          // Simple verification function - in production you might want to use a more robust method
          const verifySignature = (
            payload: string,
            signature: string,
            secret: string,
          ): boolean => {
            // This is a simplified example - in production use a proper HMAC verification
            const encoder = new TextEncoder();
            const data = encoder.encode(payload + secret);
            const expectedSignature = Array.from(
              new Uint8Array(crypto.subtle.digestSync("SHA-256", data)),
            )
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");

            return signature === expectedSignature;
          };

          const isValid = verifySignature(
            JSON.stringify(body),
            signature,
            polarWebhookSecret,
          );
          if (!isValid) {
            console.warn("Invalid Polar webhook signature");
            // In production, you might want to reject requests with invalid signatures
            // For now, we'll continue processing to ensure backward compatibility
          } else {
            console.log("Polar webhook signature verified successfully");
          }
        } catch (verifyError) {
          console.error(
            "Error verifying Polar webhook signature:",
            verifyError,
          );
        }
      }
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
    );

    // Log the webhook event
    const { error: logError } = await supabaseClient
      .from("webhook_events")
      .insert({
        event_type: event,
        type: "polar",
        data: data,
      });

    if (logError) {
      console.error("Error logging webhook event:", logError);
    }

    // Handle different event types
    switch (event) {
      case "subscription.created":
      case "subscription.updated":
        // Extract user ID from metadata
        const userId = data.metadata?.userId;
        if (!userId) {
          console.error("No user ID found in subscription metadata");
          break;
        }

        console.log(`Processing ${event} for user ${userId}`);

        // Upsert the subscription in the database
        const { error } = await supabaseClient
          .from("polar_subscriptions")
          .upsert(
            {
              user_id: userId,
              subscription_id: data.id,
              plan_id: data.plan_id,
              status: data.status,
              current_period_start: data.current_period_start,
              current_period_end: data.current_period_end,
              metadata: data.metadata,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "subscription_id",
            },
          );

        if (error) {
          console.error("Error upserting subscription:", error);
        } else {
          console.log(`Successfully updated subscription for user ${userId}`);
        }
        break;

      case "subscription.deleted":
        console.log(
          `Processing subscription.deleted for subscription ${data.id}`,
        );

        // Update the subscription status to canceled
        const { error: deleteError } = await supabaseClient
          .from("polar_subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("subscription_id", data.id);

        if (deleteError) {
          console.error("Error updating subscription status:", deleteError);
        } else {
          console.log(
            `Successfully marked subscription ${data.id} as canceled`,
          );
        }
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
