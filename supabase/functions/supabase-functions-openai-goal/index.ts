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

    // Check if OpenAI API key is available
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          fallback: true,
          // Generate a fallback response
          data: generateFallbackGoal(prompt, difficulty),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a goal-setting assistant. Create a structured goal with milestones based on the user's input. The difficulty level is ${difficulty}. Format your response as JSON with the following structure: { "title": "Goal Title", "description": "Goal description", "milestones": [{ "id": "unique-id", "title": "Milestone title", "description": "Milestone description", "completed": false }] }. For ${difficulty} difficulty, create ${difficulty === "easy" ? "3-4" : difficulty === "medium" ? "5-6" : "7-8"} milestones.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API error: ${error.error?.message || "Unknown error"}`,
      );
    }

    const openaiResponse = await response.json();
    const content = openaiResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse the JSON response
    let goalData;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) ||
        content.match(/```([\s\S]*)```/) || [null, content];
      const jsonContent = jsonMatch[1] || content;
      goalData = JSON.parse(jsonContent);

      // Ensure the response has the expected structure
      if (!goalData.title || !Array.isArray(goalData.milestones)) {
        throw new Error("Invalid response structure");
      }

      // Add target date (30 days from now)
      goalData.targetDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      return new Response(JSON.stringify(goalData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Raw content:", content);

      // Fall back to generating a goal
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          fallback: true,
          data: generateFallbackGoal(prompt, difficulty),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error in OpenAI goal generation:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        fallback: true,
        data: generateFallbackGoal(prompt, difficulty),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

// Fallback function to generate a goal when OpenAI is not available
function generateFallbackGoal(prompt: string, difficulty: string) {
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

  return {
    title,
    description: `AI-generated goal based on: "${prompt}". Difficulty level: ${difficulty}.`,
    milestones,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  };
}
