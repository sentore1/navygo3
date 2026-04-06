"use client";

import { useState } from "react";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { format } from "date-fns";
import {
  Loader2,
  X,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import GoalProgressMap from "./goal-progress-map";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  streak: number;
  milestones: Milestone[];
  createdAt: string;
  lastUpdated: string | null;
}

interface GoalDetailProps {
  goal: Goal;
  onClose: () => void;
  onUpdate: () => void;
  onToggleMilestone?: (goalId: string, milestoneId: string) => void;
  onLogProgress?: (goalId: string) => void;
}

export default function GoalDetail({
  goal,
  onClose,
  onUpdate,
  onToggleMilestone,
  onLogProgress,
}: GoalDetailProps) {
  const supabase = createClient();
  const [notes, setNotes] = useState("");
  const [isLoggingProgress, setIsLoggingProgress] = useState(false);
  const [togglingMilestoneId, setTogglingMilestoneId] = useState<string | null>(
    null,
  );

  const handleLogProgress = async () => {
    setIsLoggingProgress(true);
    try {
      if (onLogProgress) {
        // Use the prop function if provided
        onLogProgress(goal.id);
        setNotes("");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-log-progress",
        {
          body: { goalId: goal.id, notes: notes.trim() || null },
        },
      );

      if (error) throw error;
      setNotes("");
      onUpdate();
    } catch (error) {
      console.error("Error logging progress:", error);
      alert("Failed to log progress. Please try again.");
    } finally {
      setIsLoggingProgress(false);
    }
  };

  const handleToggleMilestone = async (
    milestoneId: string,
    completed: boolean,
  ) => {
    if (onToggleMilestone) {
      onToggleMilestone(goal.id, milestoneId);
    } else {
      setTogglingMilestoneId(milestoneId);
      try {
        const { error } = await supabase.functions.invoke(
          "toggle-milestone",
          {
            body: { goalId: goal.id, milestoneId, completed },
          },
        );
        if (error) throw error;
        await onUpdate();
      } catch (error) {
        console.error("Error toggling milestone:", error);
        alert("Failed to update milestone. Please try again.");
      } finally {
        setTogglingMilestoneId(null);
      }
    }
  };

  const isUpdatedToday = () => {
    if (!goal.lastUpdated) return false;

    const today = new Date();
    const lastUpdated = new Date(goal.lastUpdated);

    return today.toDateString() === lastUpdated.toDateString();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Target className="h-6 w-6 text-black" />
          {goal.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-4">
          <span>Created on {formatDate(goal.createdAt)}</span>
          {goal.lastUpdated && (
            <span>Last updated: {formatDate(goal.lastUpdated)}</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Map */}
        <GoalProgressMap
          goal={goal}
          togglingMilestoneId={togglingMilestoneId}
          onMilestoneClick={(milestoneId) => {
            const milestone = goal.milestones.find((m) => m.id === milestoneId);
            if (milestone) {
              handleToggleMilestone(milestoneId, !milestone.completed);
            }
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium mb-1 text-muted-foreground">Description</h3>
              <p className="text-sm">
                {goal.description || "No description provided."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1 text-muted-foreground">Progress</h3>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span>Overall Completion</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="relative">
                  <Progress
                    value={goal.progress}
                    className={`h-2 ${goal.progress >= 100 ? "bg-green-600" : isUpdatedToday() ? "bg-green-500" : "bg-amber-500"}`}
                  />
                  {goal.streak > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {goal.streak}
                    </div>
                  )}
                </div>

                {!isUpdatedToday() && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Progress decreases by 5% each day without logging</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-1 text-muted-foreground">Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                {goal.progress < 100 && (
                  <div className="border rounded-lg p-2">
                    <div className="text-xl font-bold">{goal.streak}</div>
                    <div className="text-xs text-muted-foreground">
                      Day Streak
                    </div>
                  </div>
                )}
                <div className={`border rounded-lg p-2 ${goal.progress >= 100 ? 'col-span-2' : ''}`}>
                  <div className="text-xl font-bold">
                    {goal.milestones.filter((m) => m.completed).length}/
                    {goal.milestones.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Milestones Completed
                  </div>
                </div>
              </div>
            </div>

            {goal.progress < 100 ? (
              <div>
                <h3 className="text-sm font-medium mb-1 text-muted-foreground">Log Progress</h3>
                <div className="space-y-1">
                  <Textarea
                    placeholder="Add notes about today's progress (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    disabled={isLoggingProgress || isUpdatedToday()}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleLogProgress}
                    disabled={isLoggingProgress || isUpdatedToday()}
                    className="w-full"
                    size="sm"
                  >
                    {isLoggingProgress ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Logging Progress...
                      </>
                    ) : isUpdatedToday() ? (
                      <>
                        <CheckCircle2 className="mr-2 h-3 w-3" />
                        Progress Logged Today
                      </>
                    ) : (
                      "Log Today's Progress"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium mb-1 text-muted-foreground">Goal Status</h3>
                <div className="bg-green-500 p-2 rounded-lg border-2 border-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <div>
                    <p className="font-medium text-white text-xs">
                      Goal Completed!
                    </p>
                    <p className="text-xs text-green-50">
                      Congratulations on achieving your goal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2 text-muted-foreground">Milestones</h3>
            {goal.milestones.length === 0 ? (
              <div className="text-center py-6 border rounded-lg">
                <p className="text-sm text-muted-foreground">No milestones defined</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {goal.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <div className="relative mt-0.5">
                        <Checkbox
                          id={`milestone-${milestone.id}`}
                          checked={milestone.completed}
                          onCheckedChange={(checked) =>
                            handleToggleMilestone(
                              milestone.id,
                              checked as boolean,
                            )
                          }
                          disabled={togglingMilestoneId === milestone.id}
                          className={
                            milestone.completed ? "text-green-500" : ""
                          }
                        />
                        {togglingMilestoneId === milestone.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={`milestone-${milestone.id}`}
                          className={`text-sm font-medium ${milestone.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          {milestone.title}
                        </label>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground">
                            {milestone.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < goal.milestones.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end pt-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}
