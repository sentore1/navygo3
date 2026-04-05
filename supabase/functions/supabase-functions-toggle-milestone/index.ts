import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Get the milestone data from the request
    const { goalId, milestoneId, completed } = await req.json();

    if (!goalId || !milestoneId || completed === undefined) {
      return new Response(
        JSON.stringify({ error: "Goal ID, Milestone ID, and completed status are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify the goal belongs to the user
    const { data: goal, error: goalError } = await supabaseClient
      .from("goals")
      .select()
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError || !goal) {
      return new Response(
        JSON.stringify({ error: "Goal not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Update the milestone
    const { error: updateError } = await supabaseClient
      .from("milestones")
      .update({ completed })
      .eq("id", milestoneId)
      .eq("goal_id", goalId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all milestones for this goal to calculate progress
    const { data: milestones, error: milestonesError } = await supabaseClient
      .from("milestones")
      .select("*")
      .eq("goal_id", goalId);

    if (milestonesError) {
      return new Response(JSON.stringify({ error: milestonesError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate progress based on completed milestones
    const completedCount = milestones.filter((m) => m.completed).length;
    const progress =
      milestones.length > 0
        ? Math.round((completedCount / milestones.length) * 100)
        : 0;

    // Update the goal's progress and last_updated
    const { error: goalUpdateError } = await supabaseClient
      .from("goals")
      .update({
        progress,
        last_updated: new Date().toISOString(),
      })
      .eq("id", goalId);

    if (goalUpdateError) {
      return new Response(JSON.stringify({ error: goalUpdateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
