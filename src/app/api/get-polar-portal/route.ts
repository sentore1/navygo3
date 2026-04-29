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

    const polarOrgId = process.env.POLAR_ORGANIZATION_ID;
    const apiUrl = process.env.POLAR_API_URL || "https://sandbox-api.polar.sh";

    if (!polarOrgId) {
      return NextResponse.json(
        { error: "Polar organization ID not configured" },
        { status: 500 }
      );
    }

    // Determine if we're using sandbox or production
    const isSandbox = apiUrl.includes("sandbox");
    const portalBaseUrl = isSandbox ? "https://sandbox.polar.sh" : "https://polar.sh";
    const portalUrl = `${portalBaseUrl}/${polarOrgId}/portal`;

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error("Error getting Polar portal URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get portal URL" },
      { status: 500 }
    );
  }
}
