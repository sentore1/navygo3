import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json();
    
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

    console.log('Cancelling subscription in Polar:', subscriptionId);

    // Cancel subscription in Polar
    if (subscriptionId) {
      const cancelResponse = await fetch(`${apiUrl}/v1/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${polarApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!cancelResponse.ok) {
        const errorText = await cancelResponse.text();
        console.error("Failed to cancel in Polar:", errorText);
        // Continue anyway to clear local database
      } else {
        console.log('✅ Subscription cancelled in Polar');
      }
    }

    // Clear subscription status in users table
    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_status: null,
        subscription_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
    }

    // Update Polar subscriptions to cancelled
    const { error: polarError } = await supabase
      .from("polar_subscriptions")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (polarError) {
      console.error("Error updating Polar subscriptions:", polarError);
    }

    console.log('✅ Subscription cancelled for user:', user.id);

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
    });

  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
