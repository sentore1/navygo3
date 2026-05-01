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

      // Check user subscription status and expiration from users table (single source of truth)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("subscription_status, subscription_expires_at, has_trial_access, role")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error checking user subscription:", userError.message);
        return NextResponse.redirect(new URL("/pricing", request.url));
      }

      console.log("User subscription data:", userData);

      // Allow admins to bypass subscription check
      if (userData?.role === 'admin') {
        console.log("✅ User is admin, allowing access");
        return response;
      }

      // Allow trial access
      if (userData?.has_trial_access) {
        console.log("✅ User has trial access");
        return response;
      }

      // Check for active subscription with valid expiration
      const hasActiveSubscription = 
        userData?.subscription_status === 'active' && 
        userData?.subscription_expires_at &&
        new Date(userData.subscription_expires_at) > new Date();

      if (!hasActiveSubscription) {
        console.log("❌ No active subscription found, redirecting to pricing");
        console.log("Status:", userData?.subscription_status);
        console.log("Expires at:", userData?.subscription_expires_at);
        return NextResponse.redirect(new URL("/pricing", request.url));
      }

      console.log("✅ User has active subscription");
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
