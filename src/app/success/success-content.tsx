"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your subscription...");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID found");
      return;
    }

    // Verify the checkout and update subscription status
    const verifyCheckout = async () => {
      try {
        const response = await fetch("/api/verify-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok) {
          // Check if subscription is pending (webhook hasn't processed yet)
          if (data.pending && retryCount < maxRetries) {
            setMessage("Payment successful! Setting up your subscription...");
            // Retry after 2 seconds
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
          } else if (data.pending) {
            // Max retries reached, but payment was successful
            setStatus("success");
            setMessage("Payment successful! Your subscription will be activated shortly. You can now access the dashboard.");
          } else {
            setStatus("success");
            setMessage("Your subscription is now active!");
          }
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to verify checkout");
        }
      } catch (error) {
        console.error("Error verifying checkout:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your subscription");
      }
    };

    verifyCheckout();
  }, [sessionId, retryCount]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        {status === "loading" && (
          <>
            <div className="relative h-24 w-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Processing...</h1>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Attempt {retryCount} of {maxRetries}
              </p>
            )}
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <Button onClick={() => router.push("/dashboard")} size="lg">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✕</span>
            </div>
            <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="space-x-4">
              <Button onClick={() => router.push("/pricing")} variant="outline">
                Back to Pricing
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
