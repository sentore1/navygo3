import Navbar from "@/components/navbar";
import PricingClient from "@/components/pricing-client";
import Footer from "@/components/footer";
import { createClient } from "../../../supabase/server";
import { cookies } from "next/headers";

interface PolarPrice {
    id: string;
    price_amount: number;
    price_currency: string;
    recurring_interval: string;
}

interface PolarProduct {
    id: string;
    name: string;
    description: string;
    prices: PolarPrice[];
}

export default async function Pricing() {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Fetch Polar products from API
    let polarProducts: PolarProduct[] = [];
    try {
        const polarApiKey = process.env.POLAR_API_KEY;
        const polarOrgId = process.env.POLAR_ORGANIZATION_ID;

        console.log('Fetching Polar products from API...');
        console.log('Org ID:', polarOrgId);
        console.log('API Key:', polarApiKey ? `${polarApiKey.substring(0, 15)}...` : 'Missing');

        if (polarApiKey && polarOrgId) {
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            try {
                const response = await fetch(
                    `https://sandbox-api.polar.sh/v1/products?organization_id=${polarOrgId}&is_archived=false`,
                    {
                        headers: {
                            "Authorization": `Bearer ${polarApiKey}`,
                            "Content-Type": "application/json",
                        },
                        next: { revalidate: 300 }, // Cache for 5 minutes
                        signal: controller.signal,
                    }
                );

                clearTimeout(timeoutId);

                console.log('Polar API response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    // Filter to only show products with recurring prices
                    polarProducts = (data.items || []).filter((product: any) => 
                        product.prices?.some((price: any) => price.recurring_interval === 'month' || price.recurring_interval === 'year')
                    );
                    console.log('✅ Polar products fetched:', polarProducts.length);
                    if (polarProducts.length > 0) {
                        console.log('Products:', polarProducts.map((p: PolarProduct) => p.name).join(', '));
                    }
                } else {
                    const errorText = await response.text();
                    console.error('❌ Polar API error:', response.status, errorText);
                }
            } catch (fetchError: any) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.error('❌ Polar API timeout after 5 seconds');
                } else {
                    console.error('❌ Polar API fetch error:', fetchError);
                }
            }
        } else {
            console.warn('⚠️ Polar API key or Org ID missing');
        }
    } catch (error) {
        console.error("❌ Error fetching Polar products:", error);
    }

    // Check user's active subscription
    let activePlan = null;
    let activeSubscription = null;
    
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('id', user.id)
            .single();

        if (userData?.subscription_status === 'active') {
            // Check Polar subscriptions
            const { data: polarSub } = await supabase
                .from('polar_subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (polarSub) {
                activeSubscription = polarSub;
                activePlan = polarSub.product_id;
            }

            // Fallback to KPay transactions
            if (!activePlan) {
                const { data: transactions } = await supabase
                    .from('kpay_transactions')
                    .select('plan_name, status, created_at')
                    .eq('user_id', user.id)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: false })
                    .limit(1);
                
                activePlan = transactions?.[0]?.plan_name || null;
            }
        }
    }

    return (
        <>
            <Navbar />
            <PricingClient 
                polarProducts={polarProducts}
                user={user} 
                activePlan={activePlan}
                activeSubscription={activeSubscription}
            />
            <Footer />
        </>
    );
}
