import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the user from the request
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user exists in users table
    const { data: userData, error: userDataError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    // Check if goals table exists and is accessible
    const { data: goalsData, error: goalsError } = await supabaseClient
      .from("goals")
      .select("count")
      .eq("user_id", user.id);

    // Check if subscriptions table exists and is accessible
    const { data: subscriptionsData, error: subscriptionsError } =
      await supabaseClient
        .from("subscriptions")
        .select("count")
        .eq("user_id", user.id);

    // Check if milestones table exists and is accessible
    const { data: milestonesData, error: milestonesError } =
      await supabaseClient.from("milestones").select("count");

    // Check if progress_logs table exists and is accessible
    const { data: progressLogsData, error: progressLogsError } =
      await supabaseClient
        .from("progress_logs")
        .select("count")
        .eq("user_id", user.id);

    const result = {
      user: {
        exists: !!userData,
        error: userDataError ? userDataError.message : null,
        data: userData ? { id: userData.id, email: userData.email } : null,
      },
      goals: {
        accessible: !goalsError,
        error: goalsError ? goalsError.message : null,
        count: goalsData?.length || 0,
      },
      milestones: {
        accessible: !milestonesError,
        error: milestonesError ? milestonesError.message : null,
      },
      progress_logs: {
        accessible: !progressLogsError,
        error: progressLogsError ? progressLogsError.message : null,
      },
      subscriptions: {
        accessible: !subscriptionsError,
        error: subscriptionsError ? subscriptionsError.message : null,
      },
      environment: {
        supabase_url: !!Deno.env.get("SUPABASE_URL"),
        supabase_anon_key: !!Deno.env.get("SUPABASE_ANON_KEY"),
        supabase_service_key: !!Deno.env.get("SUPABASE_SERVICE_KEY"),
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
