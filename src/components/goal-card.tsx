"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Target,
  CheckCircle2,
  Calendar,
  Trash2,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description: string;
    progress: number;
    streak: number;
    milestones: Milestone[];
    createdAt: string;
    lastUpdated: string | null;
  };
  onLogProgress: (goalId: string) => void;
  onViewDetails: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  hideDelete?: boolean;
}

export default function GoalCard({
  goal,
  onLogProgress,
  onViewDetails,
  onDeleteGoal,
  hideDelete = false,
}: GoalCardProps) {
  const [isLoggingProgress, setIsLoggingProgress] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isUpdatedToday = () => {
    if (!goal.lastUpdated) return false;
    const today = new Date();
    const lastUpdated = new Date(goal.lastUpdated);
    return today.toDateString() === lastUpdated.toDateString();
  };

  const completedMilestones = goal.milestones.filter((m) => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const progressPercentage = goal.progress;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
    <Card 
      className={`w-full rounded-[2rem] border-2 border-gray-200 flex flex-col hover:shadow-lg transition-all duration-700 ease-out hover:scale-105 bg-white relative ${
        isExpanded ? 'h-auto' : 'h-48 overflow-hidden'
      }`}
      style={{
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xs font-semibold text-left">
              <span className="line-clamp-1 truncate">{goal.title}</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5 text-left" style={{fontSize: '9px'}}>
              {formatDate(goal.createdAt)}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end ml-1 gap-1">
            {!hideDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="h-3 w-3 p-0 text-red-500 hover:text-red-700 flex items-center justify-center"
              >
                <Trash2 className="h-2 w-2" strokeWidth={2.5} />
              </button>
            )}
            <div className="flex items-center gap-0.5 text-amber-600 text-xs" style={{fontSize: '9px'}}>
              <Calendar className="h-2 w-2" />
              <span>{goal.streak}d</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-0.5 px-4 pt-0 flex-1">
        <div className="space-y-0">
          <div className="flex justify-between items-center text-xs" style={{fontSize: '9px'}}>
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-1 bg-gray-200" style={{background: `linear-gradient(to right, ${progressPercentage >= 100 ? '#22c55e' : progressPercentage >= 50 ? '#3b82f6' : '#f59e0b'} ${progressPercentage}%, #e5e7eb ${progressPercentage}%)`}} />
          {!isUpdatedToday() && progressPercentage < 100 && (
            <div className="flex items-center gap-0.5 text-xs text-amber-600" style={{fontSize: '9px'}}>
              <Calendar className="h-2 w-2" />
              <span>Log today</span>
            </div>
          )}
          {progressPercentage >= 100 && (
            <div className="flex items-center gap-0.5 text-xs text-green-600" style={{fontSize: '9px'}}>
              <CheckCircle2 className="h-2 w-2" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {goal.description && (
          <p className={`text-xs text-muted-foreground text-left transition-all duration-500 ease-out ${
            isExpanded ? 'line-clamp-none' : 'line-clamp-1'
          }`} style={{fontSize: '8px'}}>
            {goal.description}
          </p>
        )}
        
        <div className={`overflow-hidden transition-all duration-700 ease-out ${
          isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className={`space-y-1 pt-1 transform transition-all duration-500 ease-out ${
            isExpanded ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
          }`}>
            <div className="text-xs text-muted-foreground space-y-0.5" style={{fontSize: '9px'}}>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{formatDate(goal.createdAt)}</span>
              </div>
              {goal.lastUpdated && (
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span>{formatDate(goal.lastUpdated)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Streak:</span>
                <span>{goal.streak} days</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 text-xs">
          <div className="flex gap-0.5">
            {Array.from({length: totalMilestones}).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < completedMilestones ? 'bg-green-500' : 'bg-gray-300'}`} />
            ))}
          </div>
          <span className="ml-1">{completedMilestones}/{totalMilestones}</span>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-1 p-4 pt-0 items-center mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(goal.id)}
            className="h-5 text-xs px-1 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors" style={{fontSize: '10px'}}
          >
            View
          </Button>

          {progressPercentage >= 100 ? (
            <Button
              size="sm"
              variant="outline"
              className="h-5 text-xs px-1 bg-green-50 text-green-700 border-green-200 flex items-center justify-center" style={{fontSize: '10px'}}
              disabled
            >
              <CheckCircle2 className="h-2 w-2 mr-0.5" />
              Done
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setIsLoggingProgress(true);
                onLogProgress(goal.id);
                setTimeout(() => setIsLoggingProgress(false), 1000);
              }}
              className="h-5 text-xs px-1 flex items-center justify-center" style={{fontSize: '10px'}}
              disabled={isUpdatedToday() || isLoggingProgress}
            >
              {isUpdatedToday() ? (
                <>
                  <CheckCircle2 className="h-2 w-2 mr-0.5" />
                  Logged
                </>
              ) : isLoggingProgress ? (
                <>
                  <Loader2 className="h-2 w-2 animate-spin mr-0.5" />
                  ...
                </>
              ) : (
                <>Log</>
              )}
            </Button>
          )}
        </CardFooter>
    </Card>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{goal.title}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.stopPropagation();
              onDeleteGoal(goal.id);
              setShowDeleteConfirm(false);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}