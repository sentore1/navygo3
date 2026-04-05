import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const polarApiKey = process.env.POLAR_API_KEY;
    const polarOrgId = process.env.POLAR_ORGANIZATION_ID;

    if (!polarApiKey || !polarOrgId) {
      return NextResponse.json(
        { error: "Polar not configured" },
        { status: 500 }
      );
    }

    // Fetch products from Polar
    const response = await fetch(
      `https://api.polar.sh/v1/products?organization_id=${polarOrgId}&is_archived=false`,
      {
        headers: {
          "Authorization": `Bearer ${polarApiKey}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Polar API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform Polar products to our format
    const products = data.items?.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      prices: product.prices?.map((price: any) => ({
        id: price.id,
        amount: price.price_amount,
        currency: price.price_currency,
        interval: price.recurring_interval || "month",
      })) || [],
    })) || [];

    return NextResponse.json({ products });

  } catch (error: any) {
    console.error("Error fetching Polar products:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
