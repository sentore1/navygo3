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

    // Get the goal data from the request
    const { title, description, milestones, targetDate } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: "Goal title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert the goal
    const { data: goal, error: goalError } = await supabaseClient
      .from("goals")
      .insert({
        user_id: user.id,
        title,
        description,
        progress: 0,
        streak: 0,
        target_date: targetDate || null,
        notes: [],
      })
      .select()
      .single();

    if (goalError) {
      return new Response(JSON.stringify({ error: goalError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert milestones if provided
    if (milestones && milestones.length > 0) {
      const milestonesData = milestones.map((milestone: any) => ({
        goal_id: goal.id,
        title: milestone.title,
        description: milestone.description || null,
        completed: milestone.completed || false,
      }));

      const { error: milestonesError } = await supabaseClient
        .from("milestones")
        .insert(milestonesData);

      if (milestonesError) {
        return new Response(
          JSON.stringify({ error: milestonesError.message, goal }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    return new Response(JSON.stringify({ success: true, goal }), {
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
