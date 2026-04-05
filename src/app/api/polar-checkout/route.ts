import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { productId, interval } = await request.json();

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

    // Get user email
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single();

    const userEmail = userData?.email || user.email;

    console.log('Creating Polar checkout session...');
    console.log('Price ID:', productId);
    console.log('User email:', userEmail);

    // Create checkout session using Polar API
    // Use product_price_id to specify the exact price
    const checkoutResponse = await fetch(`${apiUrl}/v1/checkouts/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${polarApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_price_id: productId,
        customer_email: userEmail,
        success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_ID}`,
        metadata: {
          user_id: user.id,
          interval: interval,
        },
      }),
    });

    const responseText = await checkoutResponse.text();
    console.log('Polar API response status:', checkoutResponse.status);
    console.log('Polar API response:', responseText);

    if (!checkoutResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { detail: responseText };
      }
      console.error("Polar API error:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Failed to create checkout" },
        { status: checkoutResponse.status }
      );
    }

    const checkoutData = JSON.parse(responseText);
    console.log('✅ Checkout created:', checkoutData.id);

    return NextResponse.json({
      url: checkoutData.url,
      id: checkoutData.id,
    });

  } catch (error: any) {
    console.error("Error creating Polar checkout:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
