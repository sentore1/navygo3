"use client";

import GoalCard from '@/components/goal-card';

const demoGoals = [
  {
    id: 'demo-goal-1',
    title: 'Learn React Development',
    description: 'Complete online course and build 3 projects',
    progress: 75,
    streak: 12,
    milestones: [
      { id: '1', title: 'Setup Environment', completed: true },
      { id: '2', title: 'Learn Basics', completed: true },
      { id: '3', title: 'Build First Project', completed: true },
      { id: '4', title: 'Advanced Concepts', completed: false }
    ],
    createdAt: '2024-12-15T00:00:00Z',
    lastUpdated: '2024-12-27T00:00:00Z'
  },
  {
    id: 'demo-goal-2',
    title: 'Fitness Journey',
    description: 'Run 5K and build healthy habits',
    progress: 45,
    streak: 8,
    milestones: [
      { id: '1', title: 'Start Running', completed: true },
      { id: '2', title: 'Run 2K', completed: true },
      { id: '3', title: 'Run 3K', completed: false },
      { id: '4', title: 'Run 5K', completed: false }
    ],
    createdAt: '2024-12-10T00:00:00Z',
    lastUpdated: '2024-12-26T00:00:00Z'
  },
  {
    id: 'demo-goal-3',
    title: 'Read 12 Books',
    description: 'Expand knowledge through reading',
    progress: 90,
    streak: 25,
    milestones: [
      { id: '1', title: 'Read 3 Books', completed: true },
      { id: '2', title: 'Read 6 Books', completed: true },
      { id: '3', title: 'Read 9 Books', completed: true },
      { id: '4', title: 'Read 12 Books', completed: false }
    ],
    createdAt: '2024-11-01T00:00:00Z',
    lastUpdated: '2024-12-25T00:00:00Z'
  }
];

export default function HeroGoalCard() {
  return (
    <div className="relative flex justify-center items-center gap-2 sm:gap-4 lg:gap-6 w-full h-64 sm:h-72 overflow-hidden">
      {demoGoals.map((goal, index) => {
        const isCenter = index === 1;
        
        return (
          <div 
            key={goal.id}
            className={`w-40 sm:w-56 lg:w-64 ${
              isCenter ? 'opacity-100 scale-100 sm:scale-125 z-20' : 'opacity-100 scale-75 sm:scale-80 z-10'
            }`}
          >
            <div className="relative">
              {!isCenter && <div className="absolute inset-0 bg-white/70 z-10 rounded-3xl"></div>}
              <GoalCard 
                goal={goal}
                onLogProgress={() => {}}
                onViewDetails={() => {}}
                onDeleteGoal={() => {}}
                hideDelete={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
