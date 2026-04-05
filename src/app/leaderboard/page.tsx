"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import RankBadge from "@/components/rank-badge";
import { useRouter } from "next/navigation";
import { HeroHeader } from "@/components/header";
import Footer from "@/components/footer";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url: string;
  total_score: number;
  rank_title: string;
  completed_goals: number;
  max_streak: number;
}

export default function LeaderboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(data);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .order("total_score", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeProps = (score: number) => {
    if (score >= 5000) return { chevrons: 0, stars: 5, rank: "General" };
    if (score >= 3500) return { chevrons: 0, stars: 4, rank: "Major" };
    if (score >= 2000) return { chevrons: 0, stars: 3, rank: "Captain" };
    if (score >= 1000) return { chevrons: 0, stars: 2, rank: "Lieutenant" };
    if (score >= 600) return { chevrons: 0, stars: 1, rank: "Sergeant" };
    if (score >= 300) return { chevrons: 3, stars: 0, rank: "Corporal" };
    if (score >= 150) return { chevrons: 1, stars: 0, rank: "Private" };
    return { chevrons: 0, stars: 0, rank: "Recruit" };
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <>
        <HeroHeader />
        <div className="container mx-auto py-10 pt-24">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Loading Leaderboard...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <HeroHeader />
      <div className="container mx-auto py-10 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Top performers ranked by total score
            </p>
          </div>

          {currentUser && !currentUser.show_on_leaderboard && (
            <Card className="mb-6 border-primary/50 bg-primary/5 rounded-[2rem]">
              <CardContent className="pt-6">
                <p className="text-sm text-center">
                  You're not on the leaderboard yet.{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => router.push("/settings")}
                  >
                    Enable it in settings
                  </Button>{" "}
                  to compete with others!
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-[2rem]">
            <CardContent className="pt-6">
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    No users on the leaderboard yet
                  </h3>
                  <p className="text-muted-foreground">
                    Be the first to enable leaderboard visibility in settings!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user, index) => {
                    const rankProps = getRankBadgeProps(user.total_score);
                    const isCurrentUser = currentUser?.id === user.id;

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-4 p-4 rounded-3xl border transition-all ${
                          isCurrentUser
                            ? "bg-primary/10 border-primary"
                            : "bg-card hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center justify-center w-10">
                            {getMedalIcon(index) || (
                              <span className="text-xl font-bold text-muted-foreground">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2) || "??"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold flex items-center gap-2">
                              {user.name || "Anonymous"}
                              {isCurrentUser && (
                                <span className="text-xs text-primary">(You)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{user.completed_goals} goals</span>
                              {user.max_streak > 0 && (
                                <span className="flex items-center gap-1">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  {user.max_streak} day streak
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{user.total_score}</p>
                            <p className="text-xs text-muted-foreground">points</p>
                          </div>
                          <RankBadge
                            chevrons={rankProps.chevrons}
                            stars={rankProps.stars}
                            rank={rankProps.rank}
                            userScore={user.total_score}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <div className="rounded-[2rem] p-6">
              <h3 className="font-semibold mb-2">How scoring works</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Completed goal: 100 points</p>
                <p>• Completed milestone: 20 points</p>
                <p>• Daily streak: 5 points per day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
