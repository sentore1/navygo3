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

    // Get the prompt and difficulty from the request
    const { prompt, difficulty = "medium" } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // In a real implementation, you would call an AI service like OpenAI here
    // For now, we'll generate a mock goal based on the prompt and difficulty

    // Generate a title based on the prompt
    const title = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;

    // Generate different number of milestones based on difficulty
    const milestoneCount =
      difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;

    const milestones = [];
    for (let i = 1; i <= milestoneCount; i++) {
      milestones.push({
        id: `milestone-${Date.now()}-${i}`,
        title: `Milestone ${i} for ${title}`,
        description: `This is a ${difficulty} milestone to help you achieve your goal`,
        completed: false,
      });
    }

    const goalData = {
      title,
      description: `AI-generated goal based on: "${prompt}". Difficulty level: ${difficulty}.`,
      milestones,
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    return new Response(JSON.stringify(goalData), {
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
