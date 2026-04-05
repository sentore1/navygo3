"use client";

import { useState, useEffect } from "react";
import { Progress } from "./ui/progress";
import { AlertCircle, CheckCircle2, Calendar } from "lucide-react";

interface GoalProgressIndicatorProps {
  progress: number;
  lastUpdated: string | null;
  streak: number;
  showStreak?: boolean;
}

export default function GoalProgressIndicator({
  progress,
  lastUpdated,
  streak,
  showStreak = true,
}: GoalProgressIndicatorProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [adjustedProgress, setAdjustedProgress] = useState(progress);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);

  useEffect(() => {
    // Check if user has logged progress today
    const loggedToday = checkIfLoggedToday(lastUpdated);
    setHasLoggedToday(loggedToday);

    // Reduce progress if user hasn't logged today (by 5%)
    const reduced = loggedToday ? progress : Math.max(0, progress - 5);
    setAdjustedProgress(reduced);

    // Animate progress from current to target value
    const startValue = animatedProgress;
    const endValue = reduced;
    const duration = 1000;
    const startTime = performance.now();

    const animateProgress = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = startValue + (endValue - startValue) * progress;

      setAnimatedProgress(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      }
    };

    requestAnimationFrame(animateProgress);
  }, [progress, lastUpdated]);

  // Function to check if progress was logged today
  const checkIfLoggedToday = (lastUpdated: string | null): boolean => {
    if (!lastUpdated) return false;

    const today = new Date();
    const lastDate = new Date(lastUpdated);

    return (
      today.getDate() === lastDate.getDate() &&
      today.getMonth() === lastDate.getMonth() &&
      today.getFullYear() === lastDate.getFullYear()
    );
  };

  // Get progress color based on percentage and logged status
  const getProgressColor = () => {
    if (!hasLoggedToday) return "bg-amber-500";
    if (adjustedProgress < 25) return "bg-red-500";
    if (adjustedProgress < 50) return "bg-orange-500";
    if (adjustedProgress < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1">
          {hasLoggedToday ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
          <span>{hasLoggedToday ? "Updated today" : "Needs daily update"}</span>
        </div>
        <span className="font-medium">{Math.round(adjustedProgress)}%</span>
      </div>

      <div className="relative">
        <Progress
          value={animatedProgress}
          className={`h-2.5 ${getProgressColor()}`}
        />

        {showStreak && streak > 0 && (
          <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {streak}
          </div>
        )}
      </div>

      {!hasLoggedToday && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <Calendar className="h-3.5 w-3.5" />
          <span>Progress decreases without daily logs</span>
        </div>
      )}
    </div>
  );
}
