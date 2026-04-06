"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface SubscriptionManagerProps {
  subscription: any;
  userData: any;
  userId: string;
}

export default function SubscriptionManager({ subscription, userData, userId }: SubscriptionManagerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access at the end of your billing period.")) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, you'd call Polar API to cancel the subscription
      // For now, we'll just clear it from the database (for testing)
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId: subscription?.subscription_id }),
      });

      if (response.ok) {
        alert("Subscription cancelled successfully");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription && !userData?.subscription_status) {
    return (
      <div className="bg-muted/50 rounded-lg p-6">
        <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
        <Button onClick={() => router.push("/pricing")}>
          View Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
        <div className="space-y-2">
          <p>
            <span className="text-muted-foreground">Status:</span>{" "}
            <span className="font-medium capitalize">{subscription?.status || userData?.subscription_status}</span>
          </p>
          {subscription?.current_period_end && (
            <p>
              <span className="text-muted-foreground">Renews on:</span>{" "}
              <span className="font-medium">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
            </p>
          )}
          {subscription?.product_id && (
            <p>
              <span className="text-muted-foreground">Plan:</span>{" "}
              <span className="font-medium">{subscription.product_id}</span>
            </p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-y-4">
          <div>
            <Button 
              onClick={() => router.push("/pricing")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Change Plan
            </Button>
          </div>
          
          {subscription && (
            <div>
              <Button 
                onClick={handleCancelSubscription}
                variant="destructive"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Subscription"
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                You'll retain access until the end of your billing period
              </p>
            </div>
          )}
        </div>
      </div>

      {/* For Testing Only */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Testing Tools</h3>
        <p className="text-xs text-yellow-700 mb-4">
          These buttons are for testing only. Remove in production.
        </p>
        <Button 
          onClick={async () => {
            if (confirm("Cancel subscription in Polar and clear from database?")) {
              setIsLoading(true);
              const response = await fetch("/api/clear-subscription", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  subscriptionId: subscription?.subscription_id 
                }),
              });
              if (response.ok) {
                alert("Subscription cancelled and cleared");
                router.refresh();
                router.push("/pricing");
              } else {
                const error = await response.json();
                alert(error.error || "Failed to clear subscription");
              }
              setIsLoading(false);
            }
          }}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Clearing...
            </>
          ) : (
            "Cancel in Polar & Clear (Test Only)"
          )}
        </Button>
      </div>
    </div>
  );
}
