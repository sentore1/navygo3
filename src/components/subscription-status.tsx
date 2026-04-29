"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Loader2, CheckCircle, AlertCircle, CreditCard, ExternalLink, XCircle } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function SubscriptionStatus() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancellingTrial, setCancellingTrial] = useState(false);
  const [creatingPortal, setCreatingPortal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const [stripeRes, polarRes, kpayRes, userRes] = await Promise.all([
          supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").maybeSingle(),
          supabase.from("polar_subscriptions").select("*").eq("user_id", user.id).eq("status", "active").maybeSingle(),
          supabase.from("kpay_transactions").select("*").eq("user_id", user.id).eq("status", "completed").order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("users").select("has_trial_access, subscription_status, subscription_expires_at").eq("id", user.id).single()
        ]);

        const hasStripe = !!stripeRes.data;
        const hasPolar = !!polarRes.data;
        const hasKpay = !!kpayRes.data && userRes.data?.subscription_status === "active";
        const hasTrialAccess = userRes.data?.has_trial_access || false;

        let subscriptionDetails = null;
        if (hasStripe) subscriptionDetails = { provider: "stripe", details: stripeRes.data };
        else if (hasPolar) subscriptionDetails = { provider: "polar", details: polarRes.data };
        else if (hasKpay) subscriptionDetails = { provider: "kpay", details: { current_period_end: userRes.data?.subscription_expires_at } };

        setSubscriptionData({
          hasActiveSubscription: hasStripe || hasPolar || hasKpay,
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

  const handleCancelTrial = async () => {
    setCancellingTrial(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({ has_trial_access: false, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;

      window.location.reload();
    } catch (err: any) {
      console.error("Error cancelling trial:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setCancellingTrial(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscriptionDetails) return;

    setCancelling(true);
    try {
      const provider = subscriptionData.subscriptionDetails.provider;
      const details = subscriptionData.subscriptionDetails.details;

      if (provider === "polar") {
        // Cancel Polar subscription
        const response = await fetch("/api/cancel-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: details.subscription_id,
            provider: "polar",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Provide more helpful error message
          const errorMsg = data.error || "Failed to cancel subscription";
          console.error("Cancellation error:", errorMsg);
          
          // Show detailed error with next steps
          alert(
            `Unable to cancel subscription: ${errorMsg}\n\n` +
            `Possible reasons:\n` +
            `• The subscription may not exist in Polar anymore\n` +
            `• There may be a temporary connection issue\n` +
            `• The subscription ID may be invalid\n\n` +
            `Please try again in a few moments, or contact support if the issue persists.\n` +
            `You can also manage your subscription directly at: https://polar.sh`
          );
          
          throw new Error(errorMsg);
        }

        // Check if it was a local-only cancellation
        if (data.localOnly) {
          alert(
            "Subscription cancelled in your account.\n\n" +
            "Note: We couldn't cancel it in Polar's system. " +
            "Please also cancel it manually at https://polar.sh to avoid future charges."
          );
        } else {
          alert("Your subscription will be cancelled at the end of the current billing period.");
        }
        
        // Refresh subscription data
        window.location.reload();
      } else if (provider === "stripe") {
        // Cancel Stripe subscription
        const response = await fetch("/api/cancel-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: details.stripe_id,
            provider: "stripe",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || "Failed to cancel subscription";
          console.error("Cancellation error:", errorMsg);
          
          alert(
            `Unable to cancel subscription: ${errorMsg}\n\n` +
            `Please try again in a few moments, or contact support if the issue persists.`
          );
          
          throw new Error(errorMsg);
        }

        alert("Your subscription will be cancelled at the end of the current billing period.");
        
        // Refresh subscription data
        window.location.reload();
      } else if (provider === "kpay") {
        alert("Please contact support to cancel your KPay subscription.");
      }
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      // Error already shown in alert above
    } finally {
      setCancelling(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscriptionData?.subscriptionDetails) return;

    setCreatingPortal(true);
    try {
      const provider = subscriptionData.subscriptionDetails.provider;

      if (provider === "stripe") {
        // Create Stripe customer portal session
        const response = await fetch("/api/create-portal-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create portal session");
        }

        // Redirect to Stripe portal
        window.location.href = data.url;
      } else if (provider === "polar") {
        // Get Polar customer portal URL from server
        const response = await fetch("/api/get-polar-portal", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to get portal URL");
        }
        
        // Open Polar portal in new tab
        window.open(data.url, "_blank");
      } else if (provider === "kpay") {
        alert("Please contact support to manage your KPay subscription.");
      }
    } catch (err: any) {
      console.error("Error managing subscription:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setCreatingPortal(false);
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
            <Loader2 className="h-3 w-3 animate-spin text-blue-600 mr-2" />
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
                    className="bg-green-600 text-white border-green-600"
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
                <div className="mt-4 p-3 rounded-md text-sm text-black">
                  <p className="font-medium">
                    You currently have trial access.
                  </p>
                  <p className="mt-1">
                    To ensure uninterrupted access, please subscribe to a paid
                    plan.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => window.location.href = "/pricing"}
                    >
                      View Plans
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-white text-black border-gray-300 hover:bg-gray-50" disabled={cancellingTrial}>
                          {cancellingTrial ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Cancelling...</> : "Cancel Trial"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Trial Access?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will immediately lose access to all trial features. You can always subscribe to a paid plan to regain access.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Trial</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelTrial}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Cancel Trial
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
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

            {/* Subscription Management Buttons */}
            {subscriptionData?.hasActiveSubscription && (
              <div className="mt-6 pt-4 border-t space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Manage Subscription
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Manage/Portal Button */}
                  {(subscriptionData.subscriptionDetails.provider === "stripe" || 
                    subscriptionData.subscriptionDetails.provider === "polar") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageSubscription}
                      disabled={creatingPortal}
                      className="flex-1"
                    >
                      {creatingPortal ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Manage Billing
                        </>
                      )}
                    </Button>
                  )}

                  {/* Cancel Button */}
                  {!subscriptionData.subscriptionDetails.details?.cancel_at_period_end && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancelling}
                          className="flex-1"
                        >
                          {cancelling ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your subscription will remain active until the end of your current billing period on{" "}
                            <strong>
                              {subscriptionData.subscriptionDetails.details?.current_period_end
                                ? formatDate(subscriptionData.subscriptionDetails.details.current_period_end)
                                : "the end of the period"}
                            </strong>
                            . After that, you'll lose access to Pro features including AI goal creation.
                            <br /><br />
                            You can resubscribe at any time from the pricing page.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Cancel Subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                {/* Cancellation Notice */}
                {subscriptionData.subscriptionDetails.details?.cancel_at_period_end && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-900">
                          Subscription Cancelled
                        </p>
                        <p className="text-amber-700 mt-1">
                          Your subscription will end on{" "}
                          <strong>
                            {formatDate(subscriptionData.subscriptionDetails.details.current_period_end)}
                          </strong>
                          . You can resubscribe anytime from the{" "}
                          <a href="/pricing" className="underline">
                            pricing page
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
