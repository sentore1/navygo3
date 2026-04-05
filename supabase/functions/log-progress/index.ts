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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
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

    // Get the goal ID from the request
    const { goalId, notes } = await req.json();

    if (!goalId) {
      return new Response(JSON.stringify({ error: "Goal ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    const today = new Date();
    const lastUpdated = goal.last_updated ? new Date(goal.last_updated) : null;

    // Check if this is a consecutive day (streak)
    let newStreak = goal.streak || 0;
    if (!lastUpdated) {
      // First time logging progress
      newStreak = 1;
    } else {
      const lastDate = new Date(lastUpdated);
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If same day, keep streak the same
    }

    // Create a progress log entry
    const { error: logError } = await supabaseClient
      .from("progress_logs")
      .insert({
        user_id: user.id,
        goal_id: goalId,
        logged_at: today.toISOString(),
        notes: notes || null,
      });

    if (logError) {
      return new Response(JSON.stringify({ error: logError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all milestones for this goal to calculate progress
    const { data: milestones, error: milestonesError } = await supabaseClient
      .from("milestones")
      .select("*")
      .eq("goal_id", goalId);

    // Calculate progress based on milestones or increment by 5%
    let progress = goal.progress || 0;
    if (milestonesError || !milestones || milestones.length === 0) {
      // No milestones, increment by 5%
      progress = Math.min(100, progress + 5);
    } else {
      // Calculate based on completed milestones
      const completedCount = milestones.filter((m) => m.completed).length;
      progress = Math.round((completedCount / milestones.length) * 100);
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { error: updateError } = await serviceClient
      .from("goals")
      .update({
        progress,
        streak: newStreak,
        last_updated: today.toISOString(),
      })
      .eq("id", goalId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        progress,
        streak: newStreak,
        lastUpdated: today.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
