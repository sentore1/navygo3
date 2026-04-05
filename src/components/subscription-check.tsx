import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../../supabase/server";

// Define the checkUserSubscription function directly in this component
async function checkUserSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_status, subscription_expires_at")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error checking subscription:", userError.message);
      return false;
    }

    if (userData?.subscription_status === 'active' && userData.subscription_expires_at) {
      const expiresAt = new Date(userData.subscription_expires_at);
      if (expiresAt > new Date()) {
        console.log("User has active subscription");
        return true;
      }
    }

    console.log("No active subscription found");
    return false;
  } catch (err) {
    console.error("Subscription check error:", err);
    return false;
  }
}

interface SubscriptionCheckProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function SubscriptionCheck({
  children,
  redirectTo = "/pricing",
}: SubscriptionCheckProps) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No authenticated user found, redirecting to sign-in");
    redirect("/sign-in");
  }

  const isSubscribed = await checkUserSubscription(user?.id!);

  if (!isSubscribed) {
    console.log("User not subscribed, redirecting to pricing page");
    redirect(redirectTo);
  }

  return <>{children}</>;
}
