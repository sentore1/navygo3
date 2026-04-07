import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    console.log("AI Goal generation function called");

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
      console.error("Authentication error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin or has active subscription
    const { data: userData, error: userDataError } = await supabaseClient
      .from("users")
      .select("role, has_trial_access")
      .eq("id", user.id)
      .single();

    const isAdmin = userData?.role === "admin";
    const hasTrialAccess = userData?.has_trial_access;

    // Check for active subscriptions (Stripe or Polar)
    const { data: stripeData } = await supabaseClient
      .from("subscriptions")
      .select("count")
      .eq("user_id", user.id)
      .eq("status", "active");

    const { data: polarData } = await supabaseClient
      .from("polar_subscriptions")
      .select("count")
      .eq("user_id", user.id)
      .eq("status", "active");

    const hasStripeSubscription = stripeData && stripeData.length > 0 && stripeData[0].count > 0;
    const hasPolarSubscription = polarData && polarData.length > 0 && polarData[0].count > 0;
    const hasActiveSubscription = hasStripeSubscription || hasPolarSubscription;

    // Allow access if user is admin, has active subscription, or has trial access
    if (!isAdmin && !hasActiveSubscription && !hasTrialAccess) {
      console.log("User does not have Pro access");
      return new Response(
        JSON.stringify({ 
          error: "AI goal creation requires a Pro subscription",
          requiresSubscription: true 
        }), 
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`User has access - Admin: ${isAdmin}, Subscription: ${hasActiveSubscription}, Trial: ${hasTrialAccess}`);

    // Get the prompt and difficulty from the request
    const requestData = await req.json();
    const { prompt, difficulty = "medium" } = requestData;

    console.log(
      "Received request with prompt:",
      prompt,
      "and difficulty:",
      difficulty,
    );

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get AI settings from database
    const { data: aiSettings, error: settingsError } = await supabaseClient
      .from('ai_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.log("Error fetching AI settings:", settingsError);
    }

    // Check if AI is enabled
    if (!aiSettings?.ai_enabled) {
      console.log("AI is disabled, using fallback generation");
      const fallbackGoal = generateFallbackGoal(prompt, difficulty);
      return new Response(JSON.stringify(fallbackGoal), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const provider = aiSettings?.ai_provider || 'openai';
    const model = aiSettings?.ai_model || 'gpt-3.5-turbo';

    console.log(`Using AI provider: ${provider}, model: ${model}`);

    // Get the appropriate API key based on provider
    let apiKey = '';
    let apiUrl = '';
    
    if (provider === 'openai') {
      apiKey = Deno.env.get("OPENAI_API_KEY") || '';
      apiUrl = "https://api.openai.com/v1/chat/completions";
    } else if (provider === 'groq') {
      apiKey = Deno.env.get("GROQ_API_KEY") || '';
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    } else if (provider === 'grok') {
      apiKey = Deno.env.get("GROK_API_KEY") || '';
      apiUrl = "https://api.x.ai/v1/chat/completions";
    } else if (provider === 'gemini') {
      apiKey = Deno.env.get("GEMINI_API_KEY") || '';
      // Gemini uses a different API structure, we'll handle it separately
    }

    if (!apiKey) {
      console.log(`${provider} API key not found, using fallback generation`);
      const fallbackGoal = generateFallbackGoal(prompt, difficulty);
      return new Response(JSON.stringify(fallbackGoal), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      console.log(`Calling ${provider} API with model ${model}`);
      
      // Handle Gemini separately as it has a different API structure
      if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a goal-setting assistant. Create a structured goal with milestones based on the user's input. The difficulty level is ${difficulty}. Format your response as JSON with the following structure: { "title": "Goal Title", "description": "Goal description", "milestones": [{ "id": "unique-id", "title": "Milestone title", "description": "Milestone description", "completed": false }] }. For ${difficulty} difficulty, create ${difficulty === "easy" ? "3-4" : difficulty === "medium" ? "5-6" : "7-8"} milestones.\n\nUser request: ${prompt}`
                }]
              }],
              generationConfig: {
                temperature: 0.7,
              }
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Gemini API error:", errorData);
          throw new Error(`Gemini API error: ${errorData.error?.message || "Unknown error"}`);
        }

        const geminiResponse = await response.json();
        const content = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
          throw new Error("No content in Gemini response");
        }

        // Parse and return the goal data
        const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || content.match(/```([\s\S]*)```/) || [null, content];
        const jsonContent = jsonMatch[1] || content;
        const goalData = JSON.parse(jsonContent);

        if (!goalData.title || !Array.isArray(goalData.milestones)) {
          throw new Error("Invalid response structure");
        }

        goalData.targetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        return new Response(JSON.stringify(goalData), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // For OpenAI-compatible APIs (OpenAI, Groq, Grok)
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
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
        const errorData = await response.json();
        console.error(`${provider} API error:`, errorData);
        throw new Error(
          `${provider} API error: ${errorData.error?.message || "Unknown error"}`,
        );
      }

      const apiResponse = await response.json();
      console.log(`${provider} response received`);

      const content = apiResponse.choices[0]?.message?.content;

      if (!content) {
        throw new Error(`No content in ${provider} response`);
      }

      // Parse the JSON response
      try {
        // Extract JSON from the response (it might be wrapped in markdown code blocks)
        const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) ||
          content.match(/```([\s\S]*)```/) || [null, content];
        const jsonContent = jsonMatch[1] || content;
        const goalData = JSON.parse(jsonContent);

        // Ensure the response has the expected structure
        if (!goalData.title || !Array.isArray(goalData.milestones)) {
          throw new Error("Invalid response structure");
        }

        // Add target date (30 days from now)
        goalData.targetDate = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString();

        console.log("Successfully parsed goal data");
        return new Response(JSON.stringify(goalData), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error(`Error parsing ${provider} response:`, parseError);
        console.error("Raw content:", content);

        // Fall back to generating a goal
        const fallbackGoal = generateFallbackGoal(prompt, difficulty);
        return new Response(JSON.stringify(fallbackGoal), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (apiError) {
      console.error(`Error calling ${provider}:`, apiError);
      // Fall back to generating a goal
      const fallbackGoal = generateFallbackGoal(prompt, difficulty);
      return new Response(JSON.stringify(fallbackGoal), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("General error in function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Fallback function to generate a goal when OpenAI is not available
function generateFallbackGoal(prompt, difficulty) {
  console.log("Using fallback goal generation");
  // Generate a title based on the prompt
  const title = prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt;

  // Generate different number of milestones based on difficulty
  const milestoneCount =
    difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;

  const milestones = [];
  for (let i = 1; i <= milestoneCount; i++) {
    let milestoneTitle = "";
    let milestoneDescription = "";

    // Create more meaningful milestones based on the difficulty
    if (difficulty === "easy") {
      milestoneTitle = `Step ${i}: Get started with ${title}`;
      milestoneDescription = `Begin your journey by taking a small step toward your goal.`;
    } else if (difficulty === "medium") {
      milestoneTitle = `Milestone ${i}: Make progress on ${title}`;
      milestoneDescription = `Continue building momentum with this intermediate challenge.`;
    } else {
      milestoneTitle = `Challenge ${i}: Advanced progress toward ${title}`;
      milestoneDescription = `Push your limits with this difficult but rewarding step.`;
    }

    milestones.push({
      id: `milestone-${Date.now()}-${i}`,
      title: milestoneTitle,
      description: milestoneDescription,
      completed: false,
    });
  }

  return {
    title,
    description: `Goal based on: "${prompt}". Difficulty level: ${difficulty}.`,
    milestones,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
  };
}
