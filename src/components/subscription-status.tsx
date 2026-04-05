"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const [stripeRes, userRes] = await Promise.all([
          supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").maybeSingle(),
          supabase.from("users").select("has_trial_access, subscription_status, subscription_expires_at").eq("id", user.id).single()
        ]);

        const hasStripe = !!stripeRes.data;
        const isKpayActive = userRes.data?.subscription_status === "active" && 
          (!userRes.data?.subscription_expires_at || new Date(userRes.data.subscription_expires_at) > new Date());
        const hasTrialAccess = userRes.data?.has_trial_access || false;

        let subscriptionDetails = null;
        if (hasStripe) subscriptionDetails = { provider: "stripe", details: stripeRes.data };
        else if (isKpayActive) subscriptionDetails = { provider: "kpay", details: { current_period_end: userRes.data?.subscription_expires_at } };

        setSubscriptionData({
          hasActiveSubscription: hasStripe || isKpayActive,
          hasTrialAccess,
          subscriptionDetails
        });
      } catch (err: any) {
        console.error("Error checking subscription:", err);
        setError(err.message || "Failed to check subscription status");
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-3 w-3 text-black-600" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span>Checking subscription status...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              <div>
                {subscriptionData?.hasActiveSubscription ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : subscriptionData?.hasTrialAccess ? (
                  <Badge
                    variant="outline"
                    className="border-blue-500 text-blue-600"
                  >
                    Trial Access
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" /> Inactive
                  </Badge>
                )}
              </div>
            </div>

            {subscriptionData?.subscriptionDetails && (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Provider:</span>
                  <span className="capitalize">
                    {subscriptionData.subscriptionDetails.provider}
                  </span>
                </div>

                {subscriptionData.subscriptionDetails.details
                  ?.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Renews on:</span>
                    <span>
                      {formatDate(
                        subscriptionData.subscriptionDetails.details
                          .current_period_end,
                      )}
                    </span>
                  </div>
                )}

                {subscriptionData.subscriptionDetails.details?.plan_id && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan:</span>
                    <span className="capitalize">
                      {subscriptionData.subscriptionDetails.details.plan_id.replace(
                        /_/g,
                        " ",
                      )}
                    </span>
                  </div>
                )}
              </>
            )}

            {subscriptionData?.hasTrialAccess &&
              !subscriptionData?.hasActiveSubscription && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                  <p className="font-medium">
                    You currently have trial access.
                  </p>
                  <p className="mt-1">
                    To ensure uninterrupted access, please subscribe to a paid
                    plan.
                  </p>
                </div>
              )}

            {!subscriptionData?.hasActiveSubscription &&
              !subscriptionData?.hasTrialAccess && (
                <div className="mt-4 p-3 bg-amber-50 rounded-md text-sm text-amber-700">
                  <p className="font-medium">No active subscription found.</p>
                  <p className="mt-1">
                    Please visit the{" "}
                    <a href="/pricing" className="underline">
                      pricing page
                    </a>{" "}
                    to subscribe.
                  </p>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
