import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const polarApiKey = process.env.POLAR_API_KEY;
        const polarOrgId = process.env.POLAR_ORGANIZATION_ID;

        if (!polarApiKey || !polarOrgId) {
            return NextResponse.json(
                { error: 'Polar API credentials not configured' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://sandbox-api.polar.sh/v1/products?organization_id=${polarOrgId}&is_archived=false`,
            {
                headers: {
                    "Authorization": `Bearer ${polarApiKey}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Polar API error:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to fetch Polar products' },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        // Filter to only show products with recurring prices
        const products = (data.items || [])
            .filter((product: any) => 
                product.prices?.some((price: any) => 
                    price.recurring_interval === 'month' || price.recurring_interval === 'year'
                )
            )
            .map((product: any) => ({
                id: product.id,
                name: product.name,
                description: product.description || '',
            }));

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Error fetching Polar products:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
