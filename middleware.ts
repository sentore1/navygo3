import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // Check if Supabase environment variables are available
    if (
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "undefined" ||
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "undefined"
    ) {
      console.warn("Supabase environment variables are missing");
      // Return the request as-is without attempting to create a Supabase client
      return NextResponse.next();
    }

    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll().map(({ name, value }) => ({
              name,
              value,
            }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              });
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Skip subscription check for auth callback routes and success page
    if (
      request.nextUrl.pathname.startsWith("/auth/callback") ||
      request.nextUrl.pathname.startsWith("/success")
    ) {
      return response;
    }

    // Protected routes - redirect to sign-in if not authenticated
    if (request.nextUrl.pathname.startsWith("/dashboard") && error) {
      console.log("User not authenticated, redirecting to sign-in");
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // If user is authenticated, check subscription for dashboard access
    if (request.nextUrl.pathname.startsWith("/dashboard") && user) {
      console.log("=== CHECKING SUBSCRIPTION FOR USER ===");
      console.log("User ID:", user.id);
      console.log("User Email:", user.email);

      // Check if the user has an active subscription
      const { data: stripeData, error: stripeError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (stripeError) {
        console.error(
          "Error checking Stripe subscription:",
          stripeError.message,
        );
      } else {
        console.log("Stripe subscriptions found:", stripeData?.length || 0);
      }

      const { data: polarData, error: polarError } = await supabase
        .from("polar_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (polarError) {
        console.error("Error checking Polar subscription:", polarError.message);
      } else {
        console.log("Polar subscriptions found:", polarData?.length || 0);
        if (polarData && polarData.length > 0) {
          console.log("Polar subscription details:", polarData[0]);
        }
      }

      // Check for trial access and pending subscriptions
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("has_trial_access, subscription_status")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error checking user trial access:", userError.message);
      } else {
        console.log("User data:", userData);
      }

      const hasStripeSubscription = stripeData && stripeData.length > 0;
      const hasPolarSubscription = polarData && polarData.length > 0;
      const hasTrialAccess = userData && userData.has_trial_access;
      const hasPendingSubscription = userData && userData.subscription_status === "pending";

      console.log("Has Stripe subscription:", hasStripeSubscription);
      console.log("Has Polar subscription:", hasPolarSubscription);
      console.log("Has trial access:", hasTrialAccess);
      console.log("Has pending subscription:", hasPendingSubscription);

      // If no active subscription, pending subscription, or trial access, redirect to pricing page
      if (!hasStripeSubscription && !hasPolarSubscription && !hasTrialAccess && !hasPendingSubscription) {
        console.log("❌ No active subscription found, redirecting to pricing");
        return NextResponse.redirect(new URL("/pricing", request.url));
      }

      console.log("✅ User has active subscription, pending subscription, or trial access");
    }

    return response;
  } catch (e) {
    // If Supabase client could not be created, just continue without auth checks
    console.error("Error in middleware:", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * - api/webhooks (webhook endpoints)
     * - auth/callback (OAuth callback)
     * - success (payment success page)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|auth/callback|success|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
