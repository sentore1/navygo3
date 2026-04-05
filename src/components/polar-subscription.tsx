"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Loader2, CreditCard, AlertCircle, Check } from "lucide-react";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";

// Define fallback components first with safer props handling
const FallbackPolarProvider = (props = {}) => {
  // Safely destructure children inside the function body
  const { children } = props as { children?: React.ReactNode };
  return children || null;
};

interface PolarSubscriptionProps {
  userId?: string;
  userEmail?: string;
}

function PolarSubscriptionButton({
  userId,
  userEmail,
}: PolarSubscriptionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const [polarClient, setPolarClient] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Try to dynamically import the Polar SDK
    const loadPolarSDK = async () => {
      try {
        const polarModule = await import("@polar-sh/sdk");
        if (polarModule && polarModule.Polar) {
          // Create a Polar client instance directly
          const polarClient = new polarModule.Polar({
            accessToken: process.env.NEXT_PUBLIC_POLAR_PUBLIC_KEY || "pk_live_",
          } as any);
          setPolarClient(polarClient);
          console.log("Polar client initialized successfully");
        }
      } catch (error) {
        console.error("Failed to import Polar SDK:", error);
      }
    };

    loadPolarSDK();
  }, []);

  const handleSubscribe = async () => {
    if (!userId) {
      router.push("/sign-in?redirect=pricing");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      if (!polarClient) {
        // Use server-side checkout creation if client SDK is not available
        console.log("Using server-side checkout creation");
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-create-polar-checkout",
          {
            body: {
              user_id: userId,
              email: userEmail,
              return_url: `${window.location.origin}/success`,
              cancel_url: `${window.location.origin}/pricing`,
            },
          },
        );

        if (error)
          throw new Error(error.message || "Failed to create checkout");
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        throw new Error("No checkout URL returned from server");
      }

      // Create a checkout session with Polar client SDK
      console.log("Creating Polar checkout session with client SDK");
      const checkoutUrl = await polarClient.createCheckoutSession({
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`,
        email: userEmail,
        metadata: {
          userId: userId,
        },
      });

      // Redirect to Polar checkout
      if (checkoutUrl) {
        console.log("Redirecting to Polar checkout:", checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err: any) {
      console.error("Error creating Polar checkout:", err);
      setError(err.message || "Failed to create checkout session");
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: err.message || "Failed to create checkout session",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSubscribe}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Subscribe with Polar
          </>
        )}
      </Button>
      {error && (
        <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </>
  );
}

export default function PolarSubscription({
  userId,
  userEmail,
}: PolarSubscriptionProps) {
  const [PolarProvider, setPolarProvider] = useState<any>(
    FallbackPolarProvider,
  );
  const [sdkAvailable, setSdkAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const polarPublicKey = process.env.NEXT_PUBLIC_POLAR_PUBLIC_KEY || "pk_live_";
  const supabase = createClient();

  useEffect(() => {
    // Try to dynamically import the Polar SDK
    const loadPolarSDK = async () => {
      try {
        console.log("Attempting to load Polar SDK");
        const polarModule = await import("@polar-sh/sdk");
        if (polarModule && (polarModule as any).PolarProvider) {
          setPolarProvider(() => (polarModule as any).PolarProvider);
          setSdkAvailable(true);
          console.log("Polar SDK loaded successfully");
        } else {
          console.warn("Polar SDK imported but PolarProvider not found");
          setSdkAvailable(false);
        }
      } catch (error) {
        console.error("Failed to import Polar SDK:", error);
        setSdkAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolarSDK();

    // Check if user already has an active subscription
    const checkSubscription = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase.functions.invoke(
            "supabase-functions-check-subscription",
            { body: {} },
          );

          if (error) throw new Error(error.message);
          setSubscriptionData(data);
        } catch (err) {
          console.error("Error checking subscription status:", err);
        }
      }
    };

    checkSubscription();
  }, [userId, supabase]);

  // Get real subscription price from the subscription data or fetch from Polar
  const [subscriptionPrice, setSubscriptionPrice] = useState("$9.99/month");

  useEffect(() => {
    // Fetch subscription plans from Polar if possible
    const fetchPolarPlans = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase.functions.invoke(
            "supabase-functions-get-polar-plans",
            { body: {} },
          );

          if (error) throw new Error(error.message);
          if (data?.plans?.length > 0) {
            // Format the price from the first plan
            const plan = data.plans[0];
            const formattedPrice =
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
              }).format(plan.amount / 100) +
              "/" +
              plan.interval;
            setSubscriptionPrice(formattedPrice);
          }
        } catch (err) {
          console.error("Error fetching Polar plans:", err);
        }
      }
    };

    fetchPolarPlans();
  }, [userId, supabase]);
  const isSubscribed = subscriptionData?.hasActiveSubscription;

  const SubscriptionContent = () => (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-purple-200">
      <div className="px-6 py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-full">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-center mb-2">
          Premium Subscription
        </h3>
        <p className="text-gray-600 text-center mb-6">
          Unlock all features and get unlimited access to our goal tracking
          platform
        </p>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Monthly subscription</span>
            <span className="font-bold">{subscriptionPrice}</span>
          </div>

          {isSubscribed ? (
            <div className="bg-green-50 p-4 rounded-md border border-green-200 flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Already subscribed</p>
                <p className="text-sm text-green-700">
                  You already have an active subscription
                </p>
              </div>
            </div>
          ) : (
            <PolarSubscriptionButton userId={userId} userEmail={userEmail} />
          )}

          {isLoading ? (
            <div className="mt-2 flex justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : !sdkAvailable ? (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
              Note: Using secure server-side checkout.
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <ul className="text-xs text-gray-500 space-y-1">
          <li className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Unlimited goals
          </li>
          <li className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Advanced analytics
          </li>
          <li className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Priority support
          </li>
          <li className="flex items-center gap-1">
            <Check className="h-3 w-3 text-green-500" /> Cancel anytime
          </li>
        </ul>
      </div>
    </div>
  );

  // Always render the content, with or without the provider
  return sdkAvailable ? (
    <PolarProvider publicKey={polarPublicKey}>
      <SubscriptionContent />
    </PolarProvider>
  ) : (
    <SubscriptionContent />
  );
}
