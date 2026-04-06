"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Trophy,
  Target,
  Flame,
  Calendar,
  CheckCircle2,
  Star,
  ChevronDown,
  Circle,
  Crown,
  Gem,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export default function AchievementsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // In a real app, you would fetch achievements from the database
          // For now, we'll use mock data
          // Add artificial delay to simulate network request
          setTimeout(() => {
            setAchievements(getMockAchievements());
            setLoading(false);
          }, 800);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const getMockAchievements = (): Achievement[] => {
    return [
      {
        id: "1",
        title: "Recruit",
        description: "Start your journey - 0 points",
        icon: "circle",
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        unlockedAt: "2023-06-15",
        category: "goals",
      },
      {
        id: "2",
        title: "Private",
        description: "Reach 300 points",
        icon: "chevron1",
        progress: 0,
        maxProgress: 300,
        unlocked: false,
        category: "goals",
      },
      {
        id: "3",
        title: "Corporal",
        description: "Reach 600 points",
        icon: "chevron3",
        progress: 0,
        maxProgress: 600,
        unlocked: false,
        category: "goals",
      },
      {
        id: "4",
        title: "Sergeant",
        description: "Reach 1,200 points",
        icon: "star1",
        progress: 0,
        maxProgress: 1200,
        unlocked: false,
        category: "goals",
      },
      {
        id: "5",
        title: "Lieutenant",
        description: "Reach 2,000 points",
        icon: "star2",
        progress: 0,
        maxProgress: 2000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "6",
        title: "Captain",
        description: "Reach 4,000 points",
        icon: "star3",
        progress: 0,
        maxProgress: 4000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "7",
        title: "Major",
        description: "Reach 7,000 points",
        icon: "star4",
        progress: 0,
        maxProgress: 7000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "8",
        title: "General",
        description: "Reach 10,000 points",
        icon: "star5",
        progress: 0,
        maxProgress: 10000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "9",
        title: "Field Marshal",
        description: "Reach 15,000 points",
        icon: "crown1",
        progress: 0,
        maxProgress: 15000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "10",
        title: "Commander",
        description: "Reach 20,000 points",
        icon: "crown2",
        progress: 0,
        maxProgress: 20000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "11",
        title: "Supreme Commander",
        description: "Reach 30,000 points - Ultimate Rank!",
        icon: "crown3",
        progress: 0,
        maxProgress: 30000,
        unlocked: false,
        category: "goals",
      },
      {
        id: "12",
        title: "Milestone Master",
        description: "Complete 10 milestones",
        icon: "checkCircle2",
        progress: 0,
        maxProgress: 10,
        unlocked: false,
        category: "milestones",
      },
      {
        id: "13",
        title: "Streak Champion",
        description: "Maintain a 7-day streak",
        icon: "flame",
        progress: 0,
        maxProgress: 7,
        unlocked: false,
        category: "streaks",
      },
    ];
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "circle":
        return <Circle className="h-8 w-8 text-yellow-500" strokeWidth={3} />;
      case "chevron1":
        return <ChevronDown className="h-8 w-8 text-yellow-500" strokeWidth={3} />;
      case "chevron3":
        return <div className="flex flex-col -space-y-1"><ChevronDown className="h-4 w-4 text-yellow-500" strokeWidth={3} /><ChevronDown className="h-4 w-4 text-yellow-500" strokeWidth={3} /><ChevronDown className="h-4 w-4 text-yellow-500" strokeWidth={3} /></div>;
      case "star1":
        return <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />;
      case "star2":
        return <div className="flex"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /></div>;
      case "star3":
        return <div className="flex"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /></div>;
      case "star4":
        return <div className="flex"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /></div>;
      case "star5":
        return <div className="flex"><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /><Star className="h-4 w-4 fill-yellow-500 text-yellow-500" /></div>;
      case "crown1":
        return <div className="flex items-center gap-0.5"><Crown className="h-6 w-6 fill-yellow-500 text-yellow-500" /><Gem className="h-3 w-3 fill-yellow-500 text-yellow-500" /></div>;
      case "crown2":
        return <div className="flex items-center gap-0.5"><Crown className="h-6 w-6 fill-yellow-500 text-yellow-500" /><Gem className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Gem className="h-3 w-3 fill-yellow-500 text-yellow-500" /></div>;
      case "crown3":
        return <div className="flex items-center gap-0.5"><Crown className="h-6 w-6 fill-yellow-500 text-yellow-500" /><Gem className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Gem className="h-3 w-3 fill-yellow-500 text-yellow-500" /><Gem className="h-3 w-3 fill-yellow-500 text-yellow-500" /></div>;
      case "flame":
        return <Flame className="h-8 w-8 text-orange-500" />;
      case "checkCircle2":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      default:
        return <Award className="h-8 w-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 opacity-50 pointer-events-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500 animate-pulse" />
                  Achievements
                </CardTitle>
                <CardDescription>Loading your achievements...</CardDescription>
              </div>
              <div className="text-right">
                <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-muted rounded mt-1 animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              <div className="h-24 bg-muted rounded animate-pulse"></div>
              <div className="h-24 bg-muted rounded animate-pulse"></div>
              <div className="h-24 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const inProgressAchievements = achievements.filter((a) => !a.unlocked);

  const goalAchievements = achievements.filter((a) => a.category === "goals");
  const milestoneAchievements = achievements.filter(
    (a) => a.category === "milestones",
  );
  const streakAchievements = achievements.filter(
    (a) => a.category === "streaks",
  );

  return (
    <div className="container mx-auto py-10">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-1"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-black-500" />
                Achievements
              </CardTitle>
              <CardDescription>
                Track your progress and unlock rewards
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {unlockedAchievements.length}/{achievements.length}
              </p>
              <p className="text-sm text-muted-foreground">
                Achievements Unlocked
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="goals">Ranks</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              <h3 className="text-lg font-semibold">
                Unlocked ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start p-5 border-2 rounded-3xl bg-gradient-to-br from-green-50/50 to-emerald-50/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="mr-4 bg-white p-3 rounded-3xl shadow-sm border border-green-100">
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{achievement.title}</h4>
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-300 rounded-full px-2.5"
                        >
                          Unlocked
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(
                            achievement.unlockedAt,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-8">
                In Progress ({inProgressAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start p-5 border-2 rounded-3xl bg-gradient-to-br from-slate-50/50 to-gray-50/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-gray-300"
                  >
                    <div className="mr-4 bg-white p-3 rounded-3xl shadow-sm border">
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div className="w-full">
                      <h4 className="font-semibold text-base">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-foreground">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={
                            (achievement.progress / achievement.maxProgress) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-start p-5 border-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-green-50/50 to-emerald-50/30 hover:shadow-lg"
                        : "bg-gradient-to-br from-slate-50/50 to-gray-50/30 hover:shadow-lg hover:border-gray-300"
                    }`}
                  >
                    <div className={`mr-4 p-3 rounded-3xl shadow-sm border ${
                      achievement.unlocked ? "bg-white border-green-100" : "bg-white"
                    }`}>
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 border-green-300 rounded-full px-2.5"
                          >
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={
                              (achievement.progress / achievement.maxProgress) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestoneAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-start p-5 border-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-green-50/50 to-emerald-50/30 hover:shadow-lg"
                        : "bg-gradient-to-br from-slate-50/50 to-gray-50/30 hover:shadow-lg hover:border-gray-300"
                    }`}
                  >
                    <div className={`mr-4 p-3 rounded-3xl shadow-sm border ${
                      achievement.unlocked ? "bg-white border-green-100" : "bg-white"
                    }`}>
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 border-green-300 rounded-full px-2.5"
                          >
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={
                              (achievement.progress / achievement.maxProgress) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="streaks" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {streakAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-start p-5 border-2 rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-green-50/50 to-emerald-50/30 hover:shadow-lg"
                        : "bg-gradient-to-br from-slate-50/50 to-gray-50/30 hover:shadow-lg hover:border-gray-300"
                    }`}
                  >
                    <div className={`mr-4 p-3 rounded-3xl shadow-sm border ${
                      achievement.unlocked ? "bg-white border-green-100" : "bg-white"
                    }`}>
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-600 border-green-300 rounded-full px-2.5"
                          >
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress
                            value={
                              (achievement.progress / achievement.maxProgress) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
