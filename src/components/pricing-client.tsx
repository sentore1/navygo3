"use client";

import { Widget, WidgetHeader, WidgetTitle, WidgetContent, WidgetFooter } from "@/components/ui/widget";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { pricingConfig } from "@/config/pricing";

interface PolarProduct {
    id: string;
    name: string;
    description: string;
    prices: Array<{
        id: string;
        price_amount: number;
        price_currency: string;
        recurring_interval: string;
    }>;
}

interface PricingClientProps {
    polarProducts: PolarProduct[];
    user: User | null;
    activePlan: string | null;
    activeSubscription: any;
}

export default function PricingClient({ 
    polarProducts, 
    user, 
    activePlan,
    activeSubscription 
}: PricingClientProps) {
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
    const [loading, setLoading] = useState<string | null>(null);

    // Debug: Log products and their prices
    useEffect(() => {
        console.log('Billing cycle:', billingCycle);
        console.log('Polar products:', polarProducts);
        polarProducts.forEach(product => {
            console.log(`Product: ${product.name}`);
            console.log('Prices:', product.prices);
            const monthPrice = product.prices?.find(p => p.recurring_interval === 'month');
            const yearPrice = product.prices?.find(p => p.recurring_interval === 'year');
            console.log(`  - Monthly: ${monthPrice ? 'Available' : 'Missing'}`);
            console.log(`  - Yearly: ${yearPrice ? 'Available' : 'Missing'}`);
        });
    }, [billingCycle, polarProducts]);

    const handleSubscribe = async (priceId: string, productName: string) => {
        if (!user) {
            router.push("/sign-in?redirect=/pricing");
            return;
        }

        setLoading(priceId);

        try {
            // Use API to create checkout
            const response = await fetch("/api/polar-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId: priceId,
                    interval: billingCycle,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create checkout");
            }

            const { url } = await response.json();
            
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: any) {
            console.error("Error creating checkout:", error);
            alert(error.message || "Failed to create checkout session");
            setLoading(null);
        }
    };

    const formatPrice = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
            minimumFractionDigits: 0,
        }).format(amount / 100);
    };

    // If no Polar products, show fallback message
    if (!polarProducts || polarProducts.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-semibold mb-4">Choose Your Plan</h1>
                    <p className="text-muted-foreground mb-8">
                        Loading pricing plans...
                    </p>
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12 max-w-3xl mx-auto">
                <h1 className="text-4xl font-semibold mb-4">Choose Your Plan</h1>
                <p className="text-sm text-muted-foreground mb-6">
                    Select a plan that fits your goals. All plans include recurring billing.
                </p>
                <Tabs 
                    value={billingCycle} 
                    onValueChange={(v) => setBillingCycle(v as "month" | "year")} 
                    className="inline-flex mx-auto"
                >
                    <TabsList className="rounded-full">
                        <TabsTrigger value="month" className="rounded-full">
                            Monthly
                        </TabsTrigger>
                        <TabsTrigger value="year" className="rounded-full">
                            Yearly
                            <span className="ml-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                                Save 17%
                            </span>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex flex-wrap justify-center items-start gap-6 max-w-6xl mx-auto">
                {polarProducts
                    .sort((a, b) => {
                        // Get the price for current billing cycle for each product
                        const priceA = a.prices?.find(p => p.recurring_interval === billingCycle);
                        const priceB = b.prices?.find(p => p.recurring_interval === billingCycle);
                        
                        // If either product doesn't have a price for this cycle, put it at the end
                        if (!priceA) return 1;
                        if (!priceB) return -1;
                        
                        // Sort by price amount (lowest to highest)
                        return priceA.price_amount - priceB.price_amount;
                    })
                    .map((product) => {
                    const price = product.prices?.find(
                        (p) => p.recurring_interval === billingCycle
                    );

                    if (!price) return null;

                    const isActive = activeSubscription?.product_id === product.id;
                    const isPopular = product.name.toLowerCase().includes("navy");

                    return (
                        <Widget
                            key={product.id}
                            design="mumbai"
                            className="flex flex-col rounded-[2.5rem] w-full sm:w-[350px] shadow-2xl border-0"
                        >
                            <WidgetHeader className="p-8 flex-row justify-between items-start">
                                <WidgetTitle className="flex flex-col items-start justify-start">
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xl font-semibold capitalize">
                                            {product.name.toLowerCase()}
                                        </Label>
                                        {isActive && (
                                            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
                                                Active
                                            </span>
                                        )}
                                        {isPopular && !isActive && (
                                            <span className="bg-primary text-white text-[10px] px-2 py-1 rounded-full">
                                                Popular
                                            </span>
                                        )}
                                    </div>
                                    <Label className="text-muted-foreground text-sm mt-1 capitalize">
                                        {billingCycle === "month" ? "Monthly" : "Yearly"}
                                    </Label>
                                </WidgetTitle>
                                <div className="flex flex-col items-end">
                                    <Label className="text-primary text-3xl font-bold">
                                        {formatPrice(price.price_amount, price.price_currency)}
                                    </Label>
                                    <Label className="text-muted-foreground text-xs">
                                        per {billingCycle === "month" ? "month" : "year"}
                                    </Label>
                                </div>
                            </WidgetHeader>

                            <WidgetContent className="p-8 pt-0 flex-1">
                                {product.description && (
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {product.description}
                                    </p>
                                )}
                                <ul className="space-y-2">
                                    {/* Get features from config based on product name */}
                                    {(() => {
                                        const features = pricingConfig.productFeatures[product.name] || 
                                                       pricingConfig.productFeatures[product.name.toLowerCase()] ||
                                                       [];
                                        
                                        // If no features found, use default features
                                        const displayFeatures = features.length > 0 ? features : [
                                            "Goal Tracking",
                                            "Progress Visualization",
                                            "Data Sync",
                                            "Priority Support"
                                        ];
                                        
                                        return displayFeatures.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ));
                                    })()}
                                </ul>
                            </WidgetContent>

                            <WidgetFooter className="p-8 pt-0">
                                <Button
                                    size="lg"
                                    className="w-full rounded-full"
                                    onClick={() => handleSubscribe(price.id, product.name)}
                                    disabled={isActive || loading === price.id}
                                >
                                    {loading === price.id ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : isActive ? (
                                        "Current Plan"
                                    ) : activePlan && !isActive ? (
                                        "Switch Plan"
                                    ) : (
                                        "Get It Done"
                                    )}
                                </Button>
                            </WidgetFooter>
                        </Widget>
                    );
                })}
            </div>

            {activeSubscription && (
                <div className="mt-12 max-w-2xl mx-auto">
                    <div className="bg-muted/50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-2">Your Subscription</h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">Status:</span>{" "}
                                <span className="font-medium capitalize">{activeSubscription.status}</span>
                            </p>
                            {activeSubscription.current_period_end && (
                                <p>
                                    <span className="text-muted-foreground">Renews on:</span>{" "}
                                    <span className="font-medium">
                                        {new Date(activeSubscription.current_period_end).toLocaleDateString()}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
