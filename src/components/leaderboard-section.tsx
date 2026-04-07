"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import RankBadge from "./rank-badge";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar_url: string;
  total_score: number;
  rank_title: string;
  completed_goals: number;
  max_streak: number;
}

export default function LeaderboardSection() {
  const supabase = createClient();
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("leaderboard_view")
        .select("*")
        .limit(10);

      if (error) throw error;
      setTopUsers(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadgeProps = (score: number, rankTitle: string) => {
    // Map rank title to badge properties with ELITE MILITARY RANKS
    const rankMap: Record<string, any> = {
      'Supreme Commander': { chevrons: 0, stars: 8, description: "Ultimate achievement with 30,000+ points", nextRank: "Maximum rank achieved!", pointsNeeded: 0 },
      'Commander': { chevrons: 0, stars: 7, description: "Command level with 20,000+ points", nextRank: "Supreme Commander", pointsNeeded: 30000 - score },
      'Field Marshal': { chevrons: 0, stars: 6, description: "Marshal status with 15,000+ points", nextRank: "Commander", pointsNeeded: 20000 - score },
      'General': { chevrons: 0, stars: 5, description: "Elite performer with 10,000+ points", nextRank: "Field Marshal", pointsNeeded: 15000 - score },
      'Major': { chevrons: 0, stars: 4, description: "Outstanding achiever with 7,000+ points", nextRank: "General", pointsNeeded: 10000 - score },
      'Captain': { chevrons: 0, stars: 3, description: "Exceptional leader with 4,000+ points", nextRank: "Major", pointsNeeded: 7000 - score },
      'Lieutenant': { chevrons: 0, stars: 2, description: "Dedicated achiever with 2,000+ points", nextRank: "Captain", pointsNeeded: 4000 - score },
      'Sergeant': { chevrons: 0, stars: 1, description: "Committed performer with 1,200+ points", nextRank: "Lieutenant", pointsNeeded: 2000 - score },
      'Corporal': { chevrons: 3, stars: 0, description: "Rising star with 600+ points", nextRank: "Sergeant", pointsNeeded: 1200 - score },
      'Private': { chevrons: 1, stars: 0, description: "Getting started with 300+ points", nextRank: "Corporal", pointsNeeded: 600 - score },
      'Recruit': { chevrons: 0, stars: 0, description: "New to the journey", nextRank: "Private", pointsNeeded: 300 - score },
    };

    const rankData = rankMap[rankTitle] || rankMap['Recruit'];
    return {
      ...rankData,
      rank: rankTitle,
    };
  };



  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Top Performers</h2>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (topUsers.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Top Performers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our community of achievers crushing their goals every day
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="p-12 rounded-[3rem] bg-white shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">
                Be the First on the Leaderboard!
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking your goals and compete with others. Enable leaderboard visibility to see your name here.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
              >
                Enable in Settings
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">Top Performers</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Join our community of achievers crushing their goals every day
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-2 sm:px-0">
          {/* Leaderboard List */}
          <TooltipProvider>
            <div className="space-y-3">
              {topUsers.map((user, index) => {
                const isTop3 = index < 3;
                const rankProps = getRankBadgeProps(user.total_score, user.rank_title);
                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-[2rem] sm:rounded-[3rem] bg-white transition-all ${
                      isTop3
                        ? 'shadow-lg hover:shadow-xl'
                        : 'shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div
                      className={`hidden sm:flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xs sm:text-sm font-bold flex-shrink-0 ${
                        index === 0
                          ? 'bg-primary text-primary-foreground'
                          : isTop3
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index === 0 ? (
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <Avatar className={`h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 ${isTop3 ? 'border-2 border-primary/30' : ''}`}>
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`font-semibold truncate ${isTop3 ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                          {user.name || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className={`font-bold leading-none ${isTop3 ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'}`}>
                              {user.total_score}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">points</p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="cursor-help">
                                <RankBadge
                                  chevrons={rankProps.chevrons}
                                  stars={rankProps.stars}
                                  rank={rankProps.rank}
                                  userScore={user.total_score}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <div className="space-y-2">
                                <p className="font-semibold">{rankProps.rank}</p>
                                <p className="text-sm text-muted-foreground">
                                  {rankProps.description}
                                </p>
                                {rankProps.pointsNeeded > 0 && (
                                  <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground">
                                      Next rank: <span className="font-medium text-foreground">{rankProps.nextRank}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {rankProps.pointsNeeded} points needed
                                    </p>
                                  </div>
                                )}
                                {rankProps.pointsNeeded === 0 && (
                                  <p className="text-xs text-primary font-medium pt-2 border-t">
                                    {rankProps.nextRank}
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {user.completed_goals} goals • {user.max_streak} day streak
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TooltipProvider>

          {/* CTA */}
          <div className="mt-8 text-center p-6 rounded-[2.5rem]">
            <p className="text-sm text-muted-foreground mb-3">
              Want to see your name on the leaderboard?
            </p>
            <Link
              href="/settings"
              className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
            >
              Enable in Settings
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
