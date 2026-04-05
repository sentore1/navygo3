"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Award, AlertCircle, Target, Zap } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  milestones: Milestone[];
  lastUpdated: string | null;
}

interface GoalProgressMapProps {
  goal: Goal;
  togglingMilestoneId?: string | null;
  onMilestoneClick?: (milestoneId: string) => void;
}

export default function GoalProgressMap({
  goal,
  togglingMilestoneId,
  onMilestoneClick,
}: GoalProgressMapProps) {
  const [animateProgress, setAnimateProgress] = useState(0);
  const [adjustedProgress, setAdjustedProgress] = useState(goal.progress);
  const [clickedMilestone, setClickedMilestone] = useState<string | null>(null);
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has logged progress today
    const hasLoggedToday = checkIfLoggedToday(goal.lastUpdated);

    // Reduce progress if user hasn't logged today (by 5%)
    const reducedProgress = hasLoggedToday
      ? goal.progress
      : Math.max(0, goal.progress - 5);
    setAdjustedProgress(reducedProgress);

    // Animate progress from 0 to current value
    const timer = setTimeout(() => {
      setAnimateProgress(reducedProgress);
    }, 300);

    return () => clearTimeout(timer);
  }, [goal.progress, goal.lastUpdated]);

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

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const progressPercentage =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : adjustedProgress;

  // Generate progress color based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage < 25) return "#ef4444"; // red-500
    if (percentage < 50) return "#f97316"; // orange-500
    if (percentage < 75) return "#eab308"; // yellow-500
    return "#22c55e"; // green-500
  };

  // Generate dots for the path
  const generateDots = (count: number) => {
    const dots = [];
    const segmentSize = 100 / (count - 1);

    for (let i = 0; i < count; i++) {
      const position = segmentSize * i;
      const randomOffset = Math.sin(i * 0.5) * 15 + (Math.random() * 10 - 5);

      dots.push({
        id: `dot-${i}`,
        position,
        yOffset: randomOffset,
        completed: position <= adjustedProgress,
        isChallenge: false,
        isRandomChallenge: false,
      });
    }

    return dots;
  };

  // Generate challenge dots based on milestone count
  const generateChallengeDots = (): any[] => {
    const challengeDots: any[] = [];
    const milestoneCount = totalMilestones || 1;
    const redDotCount = milestoneCount * 70;
    const blackDotCount = milestoneCount * 80;

    const isOverlapping = (x: number, y: number, size: number) => {
      for (const dot of challengeDots) {
        const dotSize = dot.isRandomChallenge ? 6 : 5;
        const distance = Math.sqrt(Math.pow(x - dot.position, 2) + Math.pow(y - dot.yOffset, 2));
        if (distance < (size + dotSize + 1)) return true;
      }
      return false;
    };

    // Red challenge dots
    for (let i = 0; i < redDotCount; i++) {
      let attempts = 0;
      let position, yOffset;
      do {
        position = Math.random() * 100;
        yOffset = Math.random() * 80 - 40;
        attempts++;
      } while (isOverlapping(position, yOffset, 6) && attempts < 50);

      challengeDots.push({
        id: `red-${i}`,
        position,
        yOffset,
        completed: false,
        isChallenge: false,
        isRandomChallenge: true,
      });
    }

    // Black hard challenge dots
    for (let i = 0; i < blackDotCount; i++) {
      let attempts = 0;
      let position, yOffset;
      do {
        position = Math.random() * 100;
        yOffset = Math.random() * 80 - 40;
        attempts++;
      } while (isOverlapping(position, yOffset, 5) && attempts < 50);

      challengeDots.push({
        id: `black-${i}`,
        position,
        yOffset,
        completed: false,
        isChallenge: false,
        isRandomChallenge: false,
        isHardChallenge: true,
      });
    }

    return challengeDots;
  };

  const dots = generateDots(80);
  const challengeDots = useMemo(() => generateChallengeDots(), [totalMilestones]);
  const allDots = [...challengeDots, ...dots];

  return (
    <Card className="w-full overflow-hidden bg-gray-100 border-2 border-gray-300">
      <CardHeader className="pb-2 border-b border-gray-300">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          Goal Map
          {!checkIfLoggedToday(goal.lastUpdated) && (
            <div className="ml-auto flex items-center text-xs text-amber-400 gap-1 bg-amber-950/50 px-2 py-1 rounded-full">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Progress reduced (no daily log)</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-white border border-gray-300 shadow-inner">
          {/* Star-like background */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={`star-${i}`}
                className="absolute w-0.5 h-0.5 bg-gray-300 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  opacity: Math.random() * 0.7 + 0.3,
                }}
              />
            ))}
          </div>

          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-6">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={`grid-${i}`}
                className="border-[0.5px] border-gray-200/50"
              />
            ))}
          </div>

          {/* Start Point */}
          <div className="absolute left-0 top-1/2 w-5 h-5 bg-blue-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 border-2 border-white shadow-md z-20">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-50"></div>
          </div>

          {/* End Point - Award Icon */}
          <div className="absolute right-0 top-1/2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full transform -translate-y-1/2 translate-x-1/2 border-2 border-white shadow-md z-20 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-amber-500 rounded-full animate-pulse opacity-30"></div>
          </div>

          {/* Progress Dots */}
          {allDots.map((dot, index) => {
            // Calculate the size based on dot type
            const size = dot.isHardChallenge ? 5 : dot.isRandomChallenge ? 6 : dot.completed ? 4 : 3;
            const opacity = dot.isHardChallenge || dot.isRandomChallenge ? 1 : dot.completed ? 1 : 0.3;

            // Determine color based on dot type
            let bgColor = "#4b5563";
            let zIndex = 5;

            if (dot.isHardChallenge) {
              bgColor = "#000000";
              zIndex = 3;
            } else if (dot.isRandomChallenge) {
              bgColor = "#ef4444";
              zIndex = 4;
            } else if (dot.completed) {
              bgColor = getProgressColor(dot.position);
              zIndex = 6;
            }

            return (
              <div
                key={dot.id}
                className={`absolute rounded-full transition-all duration-500 cursor-pointer hover:scale-150`}
                style={{
                  left: `${dot.position}%`,
                  top: `${50 + dot.yOffset}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: bgColor,
                  opacity,
                  transform: "translate(-50%, -50%)",
                  border: "none",
                  boxShadow: "none",
                  zIndex,
                }}
                title={dot.isHardChallenge ? "Hard Challenge" : dot.isRandomChallenge ? "Challenge" : `Day ${Math.round((dot.position / 100) * 30)}: ${dot.completed ? "Completed" : "Not reached yet"}`}
              />
            );
          })}

          {/* Current Progress Indicator */}
          {animateProgress > 0 && (
            <div
              className="absolute top-0 w-6 h-6 rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-1000 ease-in-out z-30"
              style={{
                left: `${animateProgress}%`,
                top: `${50 + Math.sin(animateProgress * 0.1) * 15}%`,
                background: `radial-gradient(circle at center, ${getProgressColor(adjustedProgress)}, ${getProgressColor(adjustedProgress)}cc)`,
                boxShadow: `0 0 15px 3px ${getProgressColor(adjustedProgress)}80`,
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}

          {/* Milestone Markers */}
          {goal.milestones.map((milestone, index) => {
            const position = ((index + 1) / (goal.milestones.length + 1)) * 100;
            const yOffset =
              Math.sin(position * 0.1) * 15 + (Math.random() * 6 - 3);
            const isClicked = clickedMilestone === milestone.id;
            const isCelebrating = celebratingMilestone === milestone.id;
            const isToggling = togglingMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all duration-200 hover:scale-110 cursor-pointer group ${
                  isClicked ? "scale-125" : ""
                } ${isToggling ? "pointer-events-none" : ""}`}
                style={{
                  left: `${position}%`,
                  top: `${50 + yOffset}%`,
                }}
                onClick={() => {
                  setClickedMilestone(milestone.id);
                  if (!milestone.completed) {
                    setCelebratingMilestone(milestone.id);
                    setTimeout(() => setCelebratingMilestone(null), 1000);
                  }
                  setTimeout(() => setClickedMilestone(null), 200);
                  onMilestoneClick?.(milestone.id);
                }}
                title={milestone.title}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${milestone.completed ? "border-purple-400 bg-purple-600" : "border-gray-600 bg-gray-700"} shadow-md transition-all duration-200 relative ${
                    isClicked ? "ring-4 ring-purple-400/50" : ""
                  }`}
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-white animate-pulse" />
                  ) : null}
                  {isClicked && (
                    <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
                  )}
                </div>
                {isCelebrating && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 border-4 border-purple-400 rounded-full animate-ping"></div>
                    </div>
                    <div className="absolute -top-10 text-2xl animate-bounce pointer-events-none">
                      🎉
                    </div>
                  </>
                )}

                <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30">
                  {milestone.title}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
          <div className="flex flex-col items-center">
            <div className="text-blue-400 font-medium">Start</div>
            <div className="text-xs text-gray-600">Day 1</div>
          </div>
          <div
            className={`font-medium px-3 py-1 rounded-full text-white transition-colors duration-300`}
            style={{ backgroundColor: getProgressColor(progressPercentage) }}
          >
            {progressPercentage}% Complete
          </div>
          <div className="flex flex-col items-center">
            <div className="text-amber-400 font-medium">Goal</div>
            <div className="text-xs text-gray-600">Achievement</div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-300 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Progress Dots</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Life Challenge</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span>Hard Challenge</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span>Milestone</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Achievement</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
