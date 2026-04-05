"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, Loader2, Target, AlertCircle, Sparkles, Grid3X3, Clock, CheckCircle, UserCircle, Database, Award, CreditCard, Settings, LogOut, Menu, PartyPopper } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import GoalCard from "./goal-card";
import GoalForm from "./goal-form";
import GoalDetail from "./goal-detail";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import AIGoalCreator from "./ai-goal-creator";
import RankBadge from "./rank-badge";

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

interface Milestone {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export default function GoalDashboard() {
  const supabase = createClient();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [showAIGoalCreator, setShowAIGoalCreator] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalDetail, setShowGoalDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("in-progress");
  const [showRankUp, setShowRankUp] = useState(false);
  const [newRank, setNewRank] = useState<string>("");
  const [previousRank, setPreviousRank] = useState<string>("Recruit");
  const [isPro, setIsPro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRank, setUserRank] = useState({
    rank: "Recruit",
    chevrons: 0,
    stars: 0,
    score: 0,
    nextRank: "Private",
    nextScore: 150,
    nextChevrons: 1,
    nextStars: 0,
  });

  useEffect(() => {
    fetchGoals();
    checkProStatus();
    checkAdminStatus();
    fetchUserRank();
    const savedRank = localStorage.getItem('userRank');
    if (savedRank) setPreviousRank(savedRank);
  }, []);

  const fetchUserRank = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("total_score, rank_title")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        const score = data.total_score || 0;
        const rankTitle = data.rank_title || "Recruit";
        
        // Map rank to badge properties with ELITE MILITARY RANKS
        const rankMap: Record<string, any> = {
          'Supreme Commander': { chevrons: 0, stars: 8, nextRank: undefined, nextScore: undefined, nextChevrons: undefined, nextStars: undefined },
          'Commander': { chevrons: 0, stars: 7, nextRank: "Supreme Commander", nextScore: 30000, nextChevrons: 0, nextStars: 8 },
          'Field Marshal': { chevrons: 0, stars: 6, nextRank: "Commander", nextScore: 20000, nextChevrons: 0, nextStars: 7 },
          'General': { chevrons: 0, stars: 5, nextRank: "Field Marshal", nextScore: 15000, nextChevrons: 0, nextStars: 6 },
          'Major': { chevrons: 0, stars: 4, nextRank: "General", nextScore: 10000, nextChevrons: 0, nextStars: 5 },
          'Captain': { chevrons: 0, stars: 3, nextRank: "Major", nextScore: 7000, nextChevrons: 0, nextStars: 4 },
          'Lieutenant': { chevrons: 0, stars: 2, nextRank: "Captain", nextScore: 4000, nextChevrons: 0, nextStars: 3 },
          'Sergeant': { chevrons: 0, stars: 1, nextRank: "Lieutenant", nextScore: 2000, nextChevrons: 0, nextStars: 2 },
          'Corporal': { chevrons: 3, stars: 0, nextRank: "Sergeant", nextScore: 1200, nextChevrons: 0, nextStars: 1 },
          'Private': { chevrons: 1, stars: 0, nextRank: "Corporal", nextScore: 600, nextChevrons: 3, nextStars: 0 },
          'Recruit': { chevrons: 0, stars: 0, nextRank: "Private", nextScore: 300, nextChevrons: 1, nextStars: 0 },
        };

        const rankData = rankMap[rankTitle] || rankMap['Recruit'];
        setUserRank({
          rank: rankTitle,
          score,
          ...rankData,
        });
      }
    } catch (error) {
      console.error("Error fetching user rank:", error);
    }
  };

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    setIsAdmin(userData?.role === 'admin');
  };

  const checkProStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if (userData?.subscription_status === 'active') {
      const { data: transaction } = await supabase
        .from('kpay_transactions')
        .select('plan_name')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      setIsPro(transaction?.plan_name === 'Pro');
    }
  };

  useEffect(() => {
    if (userRank.rank && userRank.rank !== 'Recruit') {
      const savedRank = localStorage.getItem('userRank');
      if (savedRank && savedRank !== userRank.rank) {
        setNewRank(userRank.rank);
        setShowRankUp(true);
        setTimeout(() => setShowRankUp(false), 5000);
      }
      localStorage.setItem('userRank', userRank.rank);
    }
  }, [userRank.rank]);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-get-goals",
        {
          body: {},
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our interface
      const transformedGoals: Goal[] = data.map((goal: any) => {
        // Handle milestones - they come as an array from the join
        const milestones = Array.isArray(goal.milestones) 
          ? goal.milestones
              .sort((a: any, b: any) => a.created_at?.localeCompare(b.created_at) || 0)
              .map((m: any) => ({
                id: m.id,
                title: m.title,
                description: m.description || "",
                completed: m.completed || false,
              }))
          : [];

        return {
          id: goal.id,
          title: goal.title,
          description: goal.description || "",
          progress: goal.progress || 0,
          streak: goal.streak || 0,
          milestones,
          createdAt: goal.created_at,
          lastUpdated: goal.last_updated,
        };
      });

      setGoals(transformedGoals);
    } catch (err: any) {
      console.error("Error fetching goals:", err);
      setError(err.message || "Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: any) => {
    try {
      // Check if user has reached the 50 goal limit for Basic plan
      if (goals.length >= 50) {
        window.location.href = '/pricing';
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-create-goal",
        {
          body: goalData,
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      // Refresh goals to get proper database IDs
      await fetchGoals();
      setShowNewGoalForm(false);
    } catch (err: any) {
      console.error("Error creating goal:", err);
      setError(err.message || "Failed to create goal");
    }
  };

  const handleLogProgress = async (goalId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch('https://rilhdwxirwxqfgsqpiww.supabase.co/functions/v1/supabase-functions-log-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ goalId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Function error:', data);
        throw new Error(data.error || 'Failed to log progress');
      }

      // Update the goal in the local state
      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                progress: data.progress,
                streak: data.streak,
                lastUpdated: data.lastUpdated,
              }
            : goal,
        ),
      );

      // Show success message
      setError(null);
    } catch (err: any) {
      console.error("Error logging progress:", err);
      setError(err.message || "Failed to log progress");
    }
  };

  const handleViewDetails = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (goal) {
      setSelectedGoal(goal);
      setShowGoalDetail(true);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      const { error } = await supabase.functions.invoke(
        "supabase-functions-delete-goal",
        {
          body: { goalId },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      // Remove the goal from the local state
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
    } catch (err: any) {
      console.error("Error deleting goal:", err);
      setError(err.message || "Failed to delete goal");
    }
  };

  const filteredGoals = goals.filter((goal) => {
    if (activeTab === "all") return true;
    if (activeTab === "in-progress") return goal.progress < 100;
    if (activeTab === "completed") return goal.progress === 100;
    return true;
  });

  const completedGoals = goals.filter(g => g.progress >= 100).length;
  const totalMilestones = goals.reduce((sum, g) => sum + g.milestones.filter(m => m.completed).length, 0);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:mx-32 xl:mx-40 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold">My Goals</h1>
          </div>
          <p className="text-muted-foreground font-light text-xs sm:text-sm">
            Track your progress and achieve your goals
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="hidden sm:block">
            <RankBadge chevrons={userRank.chevrons} stars={userRank.stars} rank={userRank.rank} score={userRank.score} userScore={userRank.score} nextRank={userRank.nextRank} nextRankScore={userRank.nextScore} nextChevrons={userRank.nextChevrons} nextStars={userRank.nextStars} />
          </div>
          <div className="flex gap-2">
          <Button
            onClick={() => setShowNewGoalForm(true)}
            size="sm"
            className="flex items-center gap-2 rounded-xl text-xs sm:px-3 py-1"
          >
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Goal</span>
          </Button>
          {isPro && (
            <Button
              onClick={() => setShowAIGoalCreator(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-xl text-xs sm:px-3 py-1"
            >
              <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">AI Goal</span>
            </Button>
          )}
        </div>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full shadow-lg h-8 w-8">
              <Target className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="text-sm rounded-2xl border-2">
            {isAdmin && (
              <DropdownMenuItem
                onClick={() => window.location.href = '/admin'}
                className="flex items-center gap-2 text-xs rounded-xl"
              >
                <Settings className="h-2.5 w-2.5" />
                Admin Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => window.location.href = '/database-check'}
              className="flex items-center gap-2 text-xs rounded-xl"
            >
              <Database className="h-2.5 w-2.5" />
              Database
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.location.href = '/achievements'}
              className="flex items-center gap-2 text-xs rounded-xl"
            >
              <Award className="h-2.5 w-2.5" />
              Achievements
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.location.href = '/pricing'}
              className="flex items-center gap-2 text-xs rounded-xl"
            >
              <CreditCard className="h-2.5 w-2.5" />
              Pricing
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.location.href = '/settings'}
              className="flex items-center gap-2 text-xs rounded-xl"
            >
              <Settings className="h-2.5 w-2.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="flex items-center gap-2 text-xs rounded-xl"
            >
              <LogOut className="h-2.5 w-2.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showRankUp && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-500/20 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRankUp(false)}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="absolute animate-ping" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: '3s' }}>
                <div className="text-xl">✨</div>
              </div>
            ))}
          </div>
          <div className="relative text-center animate-in zoom-in-50 duration-700">
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            <div className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 text-transparent bg-clip-text text-8xl font-black mb-6 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-in slide-in-from-top" style={{ textShadow: '0 0 40px rgba(250,204,21,0.5)' }}>RANK UP!</div>
            <div className="bg-black/80 backdrop-blur-md rounded-3xl px-12 py-8 border-4 border-yellow-400 shadow-2xl">
              <div className="text-yellow-400 text-6xl font-black tracking-wider">{newRank}</div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="w-full">
        <div className="flex justify-start mb-8">
          <ButtonGroup>
            <Button
              size="sm"
              variant={activeTab === "in-progress" ? "default" : "ghost"}
              onClick={() => setActiveTab("in-progress")}
              className="rounded-xl text-xs px-2 py-1"
            >
              In Progress
            </Button>
            <Button
              size="sm"
              variant={activeTab === "completed" ? "default" : "ghost"}
              onClick={() => setActiveTab("completed")}
              className="rounded-xl text-xs px-2 py-1"
            >
              Completed
            </Button>
            <Button
              size="sm"
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="rounded-xl text-xs px-2 py-1"
            >
              All Goals
            </Button>
          </ButtonGroup>
        </div>

        <div className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredGoals.length === 0 ? (
            <Card className="w-full rounded-[2rem] shadow-lg border-0">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  {activeTab === "all"
                    ? "No goals yet"
                    : activeTab === "in-progress"
                      ? "No goals in progress"
                      : "No completed goals"}
                </h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {activeTab === "all"
                    ? "Create your first goal to start tracking your progress"
                    : activeTab === "in-progress"
                      ? "All your goals are completed. Great job!"
                      : "Keep working on your goals to complete them"}
                </p>
                {activeTab === "all" && (
                  <Button
                    onClick={() => setShowNewGoalForm(true)}
                    size="sm"
                    className="flex items-center gap-2 rounded-2xl text-sm"
                  >
                    <Plus className="h-4 w-4" /> Create Goal
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-3 mb-8">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={`${goal.id}-${goal.progress}`}
                  goal={goal}
                  onLogProgress={handleLogProgress}
                  onViewDetails={handleViewDetails}
                  onDeleteGoal={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Goal Dialog */}
      <Dialog open={showNewGoalForm} onOpenChange={setShowNewGoalForm}>
        <DialogContent className="sm:max-w-[400px] p-0 rounded-3xl">
          <DialogTitle className="sr-only">Create New Goal</DialogTitle>
          <GoalForm
            onSubmit={handleCreateGoal}
            onClose={() => setShowNewGoalForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* AI Goal Creator Dialog */}
      <Dialog open={showAIGoalCreator} onOpenChange={setShowAIGoalCreator}>
        <DialogContent className="sm:max-w-[400px] p-0 rounded-3xl">
          <DialogTitle className="sr-only">AI Goal Creator</DialogTitle>
          <AIGoalCreator
            onGoalCreated={(goalData) => {
              handleCreateGoal(goalData);
              setShowAIGoalCreator(false);
            }}
            onCancel={() => setShowAIGoalCreator(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Goal Detail Dialog */}
      <Dialog open={showGoalDetail} onOpenChange={setShowGoalDetail}>
        <DialogContent className="sm:max-w-[800px] p-0 max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogTitle className="sr-only">Goal Details</DialogTitle>
          {selectedGoal && (
            <GoalDetail
              goal={selectedGoal}
              onClose={() => {
                setShowGoalDetail(false);
                setSelectedGoal(null);
              }}
              onUpdate={() => {}}
              onToggleMilestone={async (goalId, milestoneId) => {
                const milestone = selectedGoal.milestones.find((m) => m.id === milestoneId);
                if (!milestone) return;

                const updatedMilestones = selectedGoal.milestones.map(m => 
                  m.id === milestoneId ? { ...m, completed: !m.completed } : m
                );
                const completedCount = updatedMilestones.filter(m => m.completed).length;
                const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
                
                setSelectedGoal({
                  ...selectedGoal,
                  milestones: updatedMilestones,
                  progress: newProgress
                });

                const { error } = await supabase.functions.invoke(
                  "toggle-milestone",
                  {
                    body: { goalId, milestoneId, completed: !milestone.completed },
                  },
                );

                if (error) throw error;
                await fetchGoals();
              }}
              onLogProgress={handleLogProgress}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
