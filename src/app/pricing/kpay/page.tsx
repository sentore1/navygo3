import { createClient } from "../../../../supabase/server";
import KPayCheckoutWrapper from "@/components/kpay-checkout-wrapper";

export default async function KPayPricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <KPayCheckoutWrapper user={user} />;
}
