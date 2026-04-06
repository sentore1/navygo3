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
    // Create a Supabase client with the service role to bypass RLS
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

    // Get the goal data from the request
    const { title, description, milestones, targetDate } = await req.json();

    if (!title) {
      return new Response(JSON.stringify({ error: "Goal title is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert the goal
    const goalInsert: any = {
      user_id: user.id,
      title,
      description,
      progress: 0,
      streak: 0,
    };

    // Only add target_date if provided
    if (targetDate) {
      goalInsert.target_date = targetDate;
    }

    const { data: goal, error: goalError } = await supabaseClient
      .from("goals")
      .insert(goalInsert)
      .select()
      .single();

    if (goalError) {
      console.error("Goal creation error:", goalError);
      console.error("Goal insert data:", goalInsert);
      return new Response(
        JSON.stringify({ 
          error: goalError.message,
          details: goalError,
          hint: "Check if goals table has all required columns"
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
        console.error("Milestones creation error:", milestonesError);
        console.error("Milestones data:", milestonesData);
        
        // Don't fail the entire request if milestones fail
        // Return success with a warning about milestones
        return new Response(
          JSON.stringify({ 
            success: true, 
            goal,
            warning: "Goal created but milestones failed to save",
            milestoneError: milestonesError.message 
          }),
          {
            status: 200,
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
    console.error("Create goal function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
