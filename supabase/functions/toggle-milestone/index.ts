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
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the milestone data from the request
    const body = await req.json();
    console.log("Request body:", body);
    const { goalId, milestoneId, completed } = body;

    if (!goalId || !milestoneId) {
      console.error("Missing required fields:", { goalId, milestoneId });
      return new Response(
        JSON.stringify({ error: "Goal ID and Milestone ID are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Processing milestone toggle:", { goalId, milestoneId, completed, user: user.id });

    // Verify the goal belongs to the user
    const { data: goal, error: goalError } = await supabaseClient
      .from("goals")
      .select()
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (goalError || !goal) {
      console.error("Goal fetch error:", goalError);
      return new Response(
        JSON.stringify({ error: "Goal not found or access denied", details: goalError?.message }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // First check if milestone exists
    const { data: existingMilestone, error: fetchError } = await supabaseClient
      .from("milestones")
      .select("*")
      .eq("id", milestoneId)
      .eq("goal_id", goalId)
      .single();

    if (fetchError || !existingMilestone) {
      console.error("Milestone not found:", { milestoneId, goalId, error: fetchError });
      return new Response(
        JSON.stringify({ 
          error: "Milestone not found",
          details: fetchError?.message,
          milestoneId,
          goalId
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Found milestone:", existingMilestone);

    // Update the milestone in the milestones table
    const { error: milestoneUpdateError } = await supabaseClient
      .from("milestones")
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq("id", milestoneId)
      .eq("goal_id", goalId);

    if (milestoneUpdateError) {
      console.error("Milestone update error:", milestoneUpdateError);
      return new Response(JSON.stringify({ error: milestoneUpdateError.message, code: milestoneUpdateError.code }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Milestone updated successfully");

    // The database trigger will automatically update the goal's progress
    // But we'll also manually update last_updated to ensure it's current
    const { error: goalUpdateError } = await supabaseClient
      .from("goals")
      .update({
        last_updated: new Date().toISOString(),
      })
      .eq("id", goalId);

    if (goalUpdateError) {
      console.error("Goal update error:", goalUpdateError);
      // Don't fail the request if this fails, milestone was already updated
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message, details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
