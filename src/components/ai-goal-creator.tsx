"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Widget,
  WidgetContent,
  WidgetHeader,
  WidgetTitle,
} from "./ui/widget";
import { Loader2, Sparkles, Target, AlertCircle, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface AIGoalCreatorProps {
  onGoalCreated: (goalData: any) => void;
  onCancel: () => void;
}

export default function AIGoalCreator({
  onGoalCreated,
  onCancel,
}: AIGoalCreatorProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedGoal, setGeneratedGoal] = useState<any | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium",
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  ); // Default to 30 days from now

  const examplePrompts = {
    easy: "I want to read more books this year",
    medium: "I want to learn Spanish in 3 months",
    hard: "I want to train for a marathon",
  };

  const handleGenerateGoal = async () => {
    if (!prompt.trim()) {
      setError("Please enter a goal description");
      return;
    }

    setLoading(true);
    setError(null);

    // Set a timeout to ensure we don't wait forever
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), 20000),
    );

    try {
      console.log(
        "Starting AI goal generation with prompt:",
        prompt,
        "and difficulty:",
        difficulty,
      );

      // Call the Supabase Edge Function to generate the goal
      const { createClient } = await import("../../supabase/client");
      const supabase = createClient();

      if (!supabase) {
        throw new Error("Failed to initialize Supabase client");
      }

      // Try both functions in sequence - first the generate-ai-goal function, then openai-goal as fallback
      let data, error;

      try {
        console.log(
          "Calling primary function: supabase-functions-generate-ai-goal",
        );
        const response = (await Promise.race([
          supabase.functions.invoke("supabase-functions-generate-ai-goal", {
            body: { prompt, difficulty },
          }),
          timeoutPromise,
        ])) as any;

        data = response.data;
        error = response.error;
        console.log("Primary function response:", { data, error });
      } catch (primaryError) {
        console.log(
          "Primary function failed, trying secondary function",
          primaryError,
        );

        try {
          console.log(
            "Calling secondary function: supabase-functions-openai-goal",
          );
          const response = (await Promise.race([
            supabase.functions.invoke("supabase-functions-openai-goal", {
              body: { prompt, difficulty },
            }),
            timeoutPromise,
          ])) as any;

          data = response.data;
          error = response.error;
          console.log("Secondary function response:", { data, error });
        } catch (secondaryError) {
          console.error("Both functions failed", secondaryError);
          throw new Error("All AI goal generation methods failed");
        }
      }

      if (error) {
        throw new Error(error.message || "Error from Supabase function");
      }

      if (data) {
        console.log("Successfully generated goal:", data);
        // Check if we got data directly or if it's in the data.data structure (fallback case)
        const goalData = data.data ? data.data : data;

        // Validate the goal data structure
        if (!goalData.title || !Array.isArray(goalData.milestones)) {
          console.error("Invalid goal data structure:", goalData);
          throw new Error("Invalid goal data received from AI service");
        }

        // Check if the milestones look like they're just repeating the title
        // This is a sign that the AI didn't generate meaningful milestones
        let genericMilestones = false;
        if (goalData.milestones.length > 0) {
          const firstMilestone = goalData.milestones[0].title;
          if (
            firstMilestone.includes("Milestone") &&
            firstMilestone.includes("for")
          ) {
            console.log(
              "Detected generic milestones, will use local generation instead",
            );
            genericMilestones = true;
          }
        }

        // If we detected generic milestones, use our local generation instead
        if (genericMilestones) {
          const betterGoal = generateMockGoal(prompt, difficulty);
          setGeneratedGoal({
            ...betterGoal,
            title: goalData.title || betterGoal.title, // Keep the AI title if available
            createdAt: new Date().toISOString(),
            progress: 0,
            streak: 0,
            lastUpdated: null,
          });
          setError("Enhanced your goal with better milestones");
          return;
        }

        // Ensure all milestones have required fields
        const validatedMilestones = goalData.milestones.map(
          (milestone: Milestone, index: number) => ({
            id: milestone.id || `milestone-${Date.now()}-${index}`,
            title: milestone.title || `Milestone ${index + 1}`,
            description: milestone.description || "",
            completed: false,
          }),
        );

        setGeneratedGoal({
          ...goalData,
          milestones: validatedMilestones,
          createdAt: new Date().toISOString(),
          targetDate: targetDate
            ? targetDate.toISOString()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 0,
          streak: 0,
          lastUpdated: null,
        });

        // If we got a fallback response, show the error message
        if (data.fallback) {
          setError("AI-assisted goal created with fallback method");
        }
      } else {
        console.log("No data returned, using fallback");
        // Fallback to mock implementation if the function fails
        const mockGoal = generateMockGoal(prompt, difficulty);
        setGeneratedGoal(mockGoal);
        setError("Using local goal generation (AI service unavailable)");
      }
    } catch (err: any) {
      console.error("Error generating goal:", err);
      setError("AI service unavailable. Using local goal generation instead.");

      // Fallback to mock implementation if there's an error
      const mockGoal = generateMockGoal(prompt, difficulty);
      setGeneratedGoal(mockGoal);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptGoal = () => {
    if (generatedGoal) {
      onGoalCreated(generatedGoal);
    }
  };

  const generateMockGoal = (prompt: string, difficulty: string) => {
    // This is a local implementation that creates a goal structure based on the prompt
    console.log("Using local goal generation");

    // Clean up and normalize the prompt
    const cleanPrompt = prompt.trim().toLowerCase();

    // Create a more meaningful title from the prompt
    let title = prompt;
    if (prompt.length > 50) {
      // Try to find a sentence break
      const sentenceEnd = prompt.indexOf(".", 30);
      if (sentenceEnd > 0 && sentenceEnd < 100) {
        title = prompt.substring(0, sentenceEnd + 1);
      } else {
        title = prompt.substring(0, 50) + "...";
      }
    }

    // Fix common typos in the title
    title = title
      .replace(/\bcan\b/g, "car")
      .replace(/\bi want to\b/gi, "I want to");

    // Detect goal type based on keywords
    const goalTypes = [
      {
        type: "financial",
        keywords: [
          "buy",
          "save",
          "money",
          "car",
          "house",
          "debt",
          "invest",
          "financial",
          "budget",
        ],
      },
      {
        type: "fitness",
        keywords: [
          "run",
          "exercise",
          "weight",
          "gym",
          "marathon",
          "workout",
          "fitness",
          "health",
          "muscle",
        ],
      },
      {
        type: "learning",
        keywords: [
          "learn",
          "study",
          "course",
          "degree",
          "skill",
          "language",
          "programming",
          "read",
          "book",
        ],
      },
      {
        type: "career",
        keywords: [
          "job",
          "career",
          "promotion",
          "business",
          "startup",
          "work",
          "professional",
          "interview",
        ],
      },
      {
        type: "personal",
        keywords: [
          "habit",
          "meditation",
          "journal",
          "mindfulness",
          "relationship",
          "family",
          "friend",
        ],
      },
    ];

    // Determine the goal type
    let goalType = "general";
    let maxMatches = 0;

    goalTypes.forEach((type) => {
      const matches = type.keywords.filter((keyword) =>
        cleanPrompt.includes(keyword),
      ).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        goalType = type.type;
      }
    });

    console.log(`Detected goal type: ${goalType}`);

    // Extract timeframe if present
    let timeframe = "";
    const timeMatches = cleanPrompt.match(
      /\b(next|in|within)\s+(\d+\s+)?(day|week|month|year|decade)s?\b/,
    );
    if (timeMatches) {
      timeframe = timeMatches[0];
      console.log(`Detected timeframe: ${timeframe}`);
    }

    // Generate different number of milestones based on difficulty
    const milestoneCount =
      difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;

    // Generate milestones based on goal type
    const milestones = [];

    // Template milestones by goal type
    const milestoneTemplates: Record<string, string[][]> = {
      financial: [
        // Financial goal milestones (buying something)
        [
          "Research options and set a specific budget",
          "Create a detailed savings plan",
          "Set up a dedicated savings account",
          "Save 25% of the required amount",
          "Save 50% of the required amount",
          "Save 75% of the required amount",
          "Research financing options if needed",
          "Compare prices and features from different sellers",
          "Make the purchase",
        ],
        // Descriptions
        [
          "Research different models, features, and price ranges to determine exactly what you want and how much it will cost.",
          "Break down how much you need to save each month to reach your goal on time.",
          "Open a separate account specifically for this goal to avoid spending the money elsewhere.",
          "Reaching this milestone means you're making real progress toward your goal.",
          "You're halfway there! Keep up the momentum and stick to your savings plan.",
          "You're in the final stretch. Start finalizing your research on specific options.",
          "Compare interest rates, terms, and requirements from different lenders if you'll need financing.",
          "Visit dealers or websites to compare specific options and negotiate the best deal.",
          "Complete the purchase process and celebrate achieving your goal!",
        ],
      ],
      fitness: [
        // Fitness goal milestones
        [
          "Set specific fitness goals and metrics",
          "Create a workout schedule",
          "Establish a baseline of current fitness",
          "Complete two weeks of consistent workouts",
          "Increase workout intensity or duration",
          "Track progress and adjust plan as needed",
          "Reach 50% of your fitness goal",
          "Maintain consistency for one month",
          "Achieve your fitness target",
        ],
        // Descriptions
        [
          "Define exactly what you want to achieve with specific, measurable targets.",
          "Plan which days and times you'll work out and what exercises you'll do.",
          "Take measurements, record your current abilities, and document your starting point.",
          "Building the habit is the most important first step to long-term success.",
          "As your body adapts, gradually increase the challenge to continue making progress.",
          "Review your progress, celebrate wins, and adjust your approach based on results.",
          "You're making great progress! Keep pushing toward your goal.",
          "Consistency is key to fitness success. A full month of regular workouts is a major achievement.",
          "Congratulations on reaching your target! Consider setting a new goal to maintain momentum.",
        ],
      ],
      learning: [
        // Learning goal milestones
        [
          "Research learning resources and materials",
          "Create a structured learning plan",
          "Set up a regular study schedule",
          "Complete introductory materials",
          "Practice new skills regularly",
          "Complete intermediate materials",
          "Apply knowledge in real-world situations",
          "Test your knowledge with assessments",
          "Achieve proficiency in the subject",
        ],
        // Descriptions
        [
          "Find books, courses, videos, and other resources that will help you learn effectively.",
          "Break down the subject into manageable chunks and create a progression plan.",
          "Decide when you'll study and for how long each session will last.",
          "Master the fundamentals before moving on to more advanced concepts.",
          "Regular practice is essential for building skills and retaining knowledge.",
          "Build on your foundation by tackling more complex aspects of the subject.",
          "Use your new knowledge in practical situations to deepen your understanding.",
          "Take quizzes, tests, or complete projects to measure your progress.",
          "You've reached a level where you can confidently use your new knowledge or skills!",
        ],
      ],
      career: [
        // Career goal milestones
        [
          "Define your specific career objective",
          "Research requirements and qualifications",
          "Update your resume and professional profiles",
          "Expand your professional network",
          "Acquire necessary skills or certifications",
          "Apply for relevant positions or opportunities",
          "Prepare for and complete interviews",
          "Evaluate offers and negotiate terms",
          "Successfully transition to new role",
        ],
        // Descriptions
        [
          "Clearly define what position, promotion, or career change you're aiming for.",
          "Identify what qualifications, experience, or skills you need for your target role.",
          "Update your resume, LinkedIn, and other professional profiles to highlight relevant experience.",
          "Connect with professionals in your target field or company through networking events or online platforms.",
          "Complete courses, certifications, or projects that will make you a stronger candidate.",
          "Start applying for positions that align with your career goals.",
          "Prepare thoroughly for interviews by researching companies and practicing responses.",
          "Compare offers, consider all aspects of compensation, and negotiate for the best terms.",
          "Successfully start your new position and establish yourself in the role.",
        ],
      ],
      general: [
        // General goal milestones
        [
          "Define your specific goal and success criteria",
          "Research and gather necessary information",
          "Create a detailed action plan",
          "Acquire any needed resources or tools",
          "Complete 25% of required actions",
          "Reach the halfway point",
          "Overcome obstacles and adjust plan as needed",
          "Complete 75% of required actions",
          "Achieve your goal",
        ],
        // Descriptions
        [
          "Clearly define what you want to achieve and how you'll know when you've succeeded.",
          "Gather information, advice, and resources that will help you achieve your goal.",
          "Break down your goal into specific steps with deadlines.",
          "Obtain any tools, materials, or assistance you'll need for success.",
          "You're making progress! Keep following your plan consistently.",
          "You've reached the halfway point. Review your progress and adjust as needed.",
          "Address any challenges that arise and modify your approach if necessary.",
          "You're in the final stretch! Stay focused and maintain momentum.",
          "Congratulations on achieving your goal! Take time to celebrate your success.",
        ],
      ],
    };

    // Select the appropriate template based on goal type
    const template = milestoneTemplates[goalType] || milestoneTemplates.general;
    const titles = template[0];
    const descriptions = template[1];

    // Create milestones based on the template and difficulty
    for (let i = 0; i < milestoneCount; i++) {
      // Select milestone index based on progress through the sequence
      const templateIndex = Math.floor((i / milestoneCount) * titles.length);

      milestones.push({
        id: `milestone-${Date.now()}-${i}`,
        title: titles[templateIndex],
        description: descriptions[templateIndex],
        completed: false,
      });
    }

    // Create a more descriptive goal description
    let goalDescription = `Goal to ${prompt}`;

    if (goalType === "financial" && cleanPrompt.includes("buy")) {
      if (cleanPrompt.includes("car")) {
        goalDescription = `Financial goal to purchase a car ${timeframe ? timeframe : "in the future"}. This plan will help you save, research, and make a smart purchase.`;
      } else if (
        cleanPrompt.includes("house") ||
        cleanPrompt.includes("home")
      ) {
        goalDescription = `Financial goal to purchase a home ${timeframe ? timeframe : "in the future"}. This plan will help you save, research, and make this major investment.`;
      } else {
        goalDescription = `Financial goal to make a significant purchase ${timeframe ? timeframe : "in the future"}. This plan will help you save and prepare for this investment.`;
      }
    } else if (goalType === "learning") {
      goalDescription = `Learning goal to acquire new knowledge or skills ${timeframe ? timeframe : ""}. This plan will help you learn effectively and track your progress.`;
    } else if (goalType === "fitness") {
      goalDescription = `Fitness goal to improve your physical health and capabilities ${timeframe ? timeframe : ""}. This plan will help you build consistency and see results.`;
    } else if (goalType === "career") {
      goalDescription = `Career development goal ${timeframe ? timeframe : ""}. This plan will help you advance professionally and achieve your career objectives.`;
    }

    return {
      title,
      description: goalDescription,
      milestones,
      createdAt: new Date().toISOString(),
      targetDate: targetDate
        ? targetDate.toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      streak: 0,
      lastUpdated: null,
    };
  };

  return (
    <Widget className="w-full max-w-2xl mx-auto">
      <WidgetHeader className="p-4">
        <WidgetTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-black-500" />
          <span className="text-sm md:text-base">AI Goal Creator</span>
        </WidgetTitle>
      </WidgetHeader>

      <WidgetContent className="flex-col space-y-3 max-h-[85vh] overflow-y-auto p-4 pt-0">
        {!generatedGoal ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <Tabs
                  defaultValue="medium"
                  onValueChange={(v) => setDifficulty(v as any)}
                >
                  <TabsList className="grid w-full grid-cols-3 h-7">
                    <TabsTrigger value="easy" className="text-[10px] py-0.5">Easy</TabsTrigger>
                    <TabsTrigger value="medium" className="text-[10px] py-0.5">Medium</TabsTrigger>
                    <TabsTrigger value="hard" className="text-[10px] py-0.5">Hard</TabsTrigger>
                  </TabsList>
                  <TabsContent value="easy" className="pt-1">
                    <p className="text-[10px] text-muted-foreground">
                      Creates achievable milestones with gentle progression.
                    </p>
                  </TabsContent>
                  <TabsContent value="medium" className="pt-1">
                    <p className="text-[10px] text-muted-foreground">
                      Balanced milestones that provide a moderate challenge.
                    </p>
                  </TabsContent>
                  <TabsContent value="hard" className="pt-1">
                    <p className="text-[10px] text-muted-foreground">
                      Creates ambitious milestones that will push your limits.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div>
                <Label className="text-[10px] font-medium mb-1 block">
                  Target Completion Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-left font-normal text-[10px] h-7",
                        !targetDate && "text-muted-foreground",
                      )}
                      disabled={loading}
                    >
                      <Calendar className="mr-1.5 h-3 w-3" />
                      {targetDate ? format(targetDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  When do you want to complete this goal?
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder={`Describe your goal... (e.g., "${examplePrompts[difficulty]}")`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none text-sm"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <Label className="text-red-600 text-sm font-normal">{error}</Label>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="bg-muted/50 p-3 rounded-lg border">
              <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" /> AI-Generated Goal
              </Label>
              <Label className="text-sm font-medium">{generatedGoal.title}</Label>
              <Label className="text-muted-foreground text-xs font-normal mt-1 block">
                {generatedGoal.description}
              </Label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <Label className="text-muted-foreground text-xs font-normal">
                  Target: {generatedGoal.targetDate
                    ? format(new Date(generatedGoal.targetDate), "PPP")
                    : "Not specified"}
                </Label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Milestones</Label>
              <div className="space-y-1.5">
                {generatedGoal.milestones.map(
                  (milestone: Milestone, index: number) => (
                    <div
                      key={index}
                      className="hover:bg-muted group rounded-md p-2 hover:cursor-pointer"
                    >
                      <Label className="text-sm font-medium">{milestone.title}</Label>
                      {milestone.description && (
                        <Label className="text-muted-foreground text-xs font-normal block mt-0.5">
                          {milestone.description}
                        </Label>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </WidgetContent>

      <div className="flex flex-col sm:flex-row justify-between gap-2 px-4 pb-4">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={loading} className="text-xs sm:text-sm">
          Cancel
        </Button>

        {!generatedGoal ? (
          <Button
            size="sm"
            onClick={handleGenerateGoal}
            disabled={loading || !prompt.trim()}
            className="gap-1.5 text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
              
                Generate Goal
              </>
            )}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setGeneratedGoal(null)} className="text-xs sm:text-sm">
              Regenerate
            </Button>
            <Button size="sm" onClick={handleAcceptGoal} className="gap-1.5 text-xs sm:text-sm">
              <Target className="h-3.5 w-3.5" />
              Use Goal
            </Button>
          </div>
        )}
      </div>
    </Widget>
  );
}
