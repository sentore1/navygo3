import Hero from "@/components/hero";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import { cookies } from "next/headers";
import { createClient } from "../../supabase/server";
import dynamic from "next/dynamic";

// Use dynamic imports with ssr: false for client components that are causing issues
const DynamicPricingCard = dynamic(() => import("@/components/pricing-card"), {
  ssr: false,
});
const DynamicPolarSubscription = dynamic(
  () => import("@/components/polar-subscription"),
  { ssr: false },
);

export default async function Home() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch subscription plans
  const { data: plans, error } = await supabase.functions.invoke(
    "supabase-functions-get-plans",
  );

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <CTASection />
      <Footer />
    </div>
  );
}
