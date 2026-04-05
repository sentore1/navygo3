import { createClient } from "../../../../supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SubscriptionManager from "@/components/subscription-manager";

export default async function SubscriptionPage() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/sign-in");
  }

  // Get user's active subscription
  const { data: polarSub } = await supabase
    .from('polar_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status, subscription_expires_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-semibold mb-8">Manage Subscription</h1>
      <SubscriptionManager 
        subscription={polarSub}
        userData={userData}
        userId={user.id}
      />
    </div>
  );
}
