import { Star, ChevronDown, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RankBadgeProps {
  chevrons: number;
  stars: number;
  rank: string;
  score?: number;
  nextRank?: string;
  nextRankScore?: number;
  completedGoals?: number;
  totalMilestones?: number;
  userScore?: number;
  nextChevrons?: number;
  nextStars?: number;
}

export default function RankBadge({ chevrons, stars, rank, score, nextRank, nextRankScore, completedGoals, totalMilestones, userScore, nextChevrons, nextStars }: RankBadgeProps) {
  const getBadgeClass = () => {
    return "bg-black hover:bg-gray-900 text-yellow-300 border-2 border-black";
  };

  return (
    <div className="group relative">
      <Badge variant="secondary" className={`cursor-pointer rounded-full p-1 transition-transform hover:scale-150 ${getBadgeClass()}`}>
        {stars > 0 ? (
          <div className="flex">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={`star-${i}`} className="size-1.5 fill-current" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </div>
        ) : chevrons > 0 ? (
          <div className="flex flex-col -space-y-1">
            {Array.from({ length: chevrons }).map((_, i) => (
              <ChevronDown key={`chevron-${i}`} className="size-2" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </div>
        ) : (
          <Circle className="size-2.5" strokeWidth={3} strokeLinecap="round" />
        )}
      </Badge>
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-4 py-3 bg-white border-2 border-gray-200 text-black text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-20 shadow-2xl min-w-[180px]">
        <div className="font-bold text-gray-900 text-sm mb-2">{rank}</div>
        {userScore !== undefined && (
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Your Points:</span>
              <span className="font-semibold text-gray-900">{userScore}</span>
            </div>
          </div>
        )}
        {nextRank && nextRankScore && (() => {
          const progress = Math.min((userScore! / nextRankScore) * 100, 100);
          const barColor = progress >= 75 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : progress >= 25 ? 'bg-orange-500' : 'bg-red-500';
          return (
            <div className="border-t border-gray-200 pt-2 space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-500">Next: {nextRank}</span>
                <div className="bg-black rounded-full p-0.5">
                  {nextStars! > 0 ? (
                    <div className="flex">
                      {Array.from({ length: nextStars || 0 }).map((_, i) => (
                        <Star key={`next-star-${i}`} className="size-1.5 fill-yellow-300 text-yellow-300" strokeWidth={3} />
                      ))}
                    </div>
                  ) : nextChevrons! > 0 ? (
                    <div className="flex flex-col -space-y-1">
                      {Array.from({ length: nextChevrons || 0 }).map((_, i) => (
                        <ChevronDown key={`next-chevron-${i}`} className="size-2 text-yellow-300" strokeWidth={3} />
                      ))}
                    </div>
                  ) : (
                    <Circle className="size-2.5 text-yellow-300" strokeWidth={3} />
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className={`${barColor} h-1 rounded-full`} style={{ width: `${progress}%` }}></div>
              </div>
              <div className="text-[11px] text-gray-900 font-semibold">{nextRankScore - userScore!} pts needed</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
