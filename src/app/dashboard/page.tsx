import DashboardNavbar from "@/components/dashboard-navbar";
import { cookies } from "next/headers";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import { checkUserSubscription } from "../actions";
import dynamic from "next/dynamic";

const GoalDashboard = dynamic(() => import("@/components/goal-dashboard"), {
  ssr: false,
});

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <SubscriptionCheck>
      <main className="w-full">
        <GoalDashboard />
      </main>
    </SubscriptionCheck>
  );
}
