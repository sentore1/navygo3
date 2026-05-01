import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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
        { error: "Polar API key not configured" },
        { status: 500 }
      );
    }

    // Get customer_id from Polar by email
    console.log('Finding Polar customer for email:', user.email);
    
    try {
      // List subscriptions to get customer_id
      const subsResponse = await fetch(`${apiUrl}/v1/subscriptions?customer_email=${encodeURIComponent(user.email!)}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${polarApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!subsResponse.ok) {
        throw new Error('Failed to fetch customer subscriptions');
      }

      const subsData = await subsResponse.json();
      const customerId = subsData.items?.[0]?.customer_id;

      if (!customerId) {
        // Fallback to default portal URL if no customer found
        const polarOrgId = process.env.POLAR_ORGANIZATION_ID;
        const isSandbox = apiUrl.includes("sandbox");
        const portalBaseUrl = isSandbox ? "https://sandbox.polar.sh" : "https://polar.sh";
        const portalUrl = `${portalBaseUrl}/${polarOrgId}/portal`;
        
        return NextResponse.json({ url: portalUrl });
      }

      console.log('Found customer ID:', customerId);

      // Create authenticated customer session
      const sessionResponse = await fetch(`${apiUrl}/v1/customer-sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${polarApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
        }),
      });

      if (!sessionResponse.ok) {
        const errorText = await sessionResponse.text();
        console.error('Failed to create customer session:', errorText);
        throw new Error('Failed to create customer session');
      }

      const sessionData = await sessionResponse.json();
      console.log('✅ Created customer portal session');

      return NextResponse.json({ url: sessionData.customer_portal_url });

    } catch (error: any) {
      console.error('Error creating portal session:', error);
      
      // Fallback to default portal URL
      const polarOrgId = process.env.POLAR_ORGANIZATION_ID;
      const isSandbox = apiUrl.includes("sandbox");
      const portalBaseUrl = isSandbox ? "https://sandbox.polar.sh" : "https://polar.sh";
      const portalUrl = `${portalBaseUrl}/${polarOrgId}/portal`;
      
      return NextResponse.json({ url: portalUrl });
    }
  } catch (error: any) {
    console.error("Error getting Polar portal URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get portal URL" },
      { status: 500 }
    );
  }
}
