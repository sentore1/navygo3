import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { newPriceId, interval } = await request.json();
    
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has an active subscription
    const { data: activeSubscription } = await supabase
      .from("polar_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!activeSubscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
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

    console.log('Changing subscription plan...');
    console.log('Current subscription:', activeSubscription.subscription_id);
    console.log('New price ID:', newPriceId);

    // Update subscription in Polar
    const updateResponse = await fetch(
      `${apiUrl}/v1/subscriptions/${activeSubscription.subscription_id}`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${polarApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_price_id: newPriceId,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error("Failed to update subscription in Polar:", errorText);
      return NextResponse.json(
        { error: "Failed to change subscription plan" },
        { status: 500 }
      );
    }

    const updatedSubscription = await updateResponse.json();
    console.log('✅ Subscription updated in Polar');

    // Update local database
    const { error: updateError } = await supabase
      .from("polar_subscriptions")
      .update({
        price_id: newPriceId,
        updated_at: new Date().toISOString(),
      })
      .eq("subscription_id", activeSubscription.subscription_id);

    if (updateError) {
      console.error("Error updating local subscription:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription plan changed successfully",
      subscription: updatedSubscription,
    });

  } catch (error: any) {
    console.error("Error changing subscription:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
