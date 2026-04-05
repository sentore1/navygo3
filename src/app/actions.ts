"use server";

import { createClient } from "../../supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Helper function to encode redirect messages
export const encodedRedirect = (
  type: "error" | "success",
  path: string,
  message: string,
) => {
  const searchParams = new URLSearchParams();
  searchParams.set(type, message);
  return redirect(`${path}?${searchParams.toString()}`);
};

// Check if a user has an active subscription
export async function checkUserSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Check if the user has any active subscriptions in the subscriptions table
    // Using count() to ensure we get a single row result
    const { data, error } = await supabase
      .from("subscriptions")
      .select("count")
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      console.error("Error checking subscription:", error.message);
      return false;
    }

    // If we found any active subscriptions, the user is subscribed
    // data[0].count will be a number representing the count of active subscriptions
    return data && data.length > 0 && data[0].count > 0;
  } catch (err) {
    console.error("Subscription check error:", err);
    return false;
  }
}

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Email and password are required",
    );
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Sign-in error:", error.message);
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/dashboard");
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          email: email,
        },
      },
    });

    if (error) {
      return encodedRedirect("error", "/sign-up", error.message);
    }

    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  } catch (err: any) {
    console.error("Sign-up exception:", err);
    return encodedRedirect(
      "error",
      "/sign-up",
      `Sign-up failed: ${err.message || "Unknown error"}`,
    );
  }
};

export const signOutAction = async () => {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  await supabase.auth.signOut();
  // Use the encodedRedirect function for consistency
  const searchParams = new URLSearchParams();
  return redirect(`/?${searchParams.toString()}`);
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  if (!password) {
    return encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password is required",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return encodedRedirect("error", "/dashboard/reset-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/dashboard",
    "Your password has been updated successfully.",
  );
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reset-password`,
  });

  if (error) {
    return encodedRedirect("error", "/forgot-password", error.message);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for the password reset link",
  );
};
