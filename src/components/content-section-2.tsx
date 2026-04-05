import { Calendar, Trophy } from 'lucide-react'
import Image from 'next/image'

export default function ContentSection2() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">Stay motivated with streaks and milestones.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            <span className="text-accent-foreground font-bold">Build lasting habits</span> — track daily progress and celebrate wins.
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    <h3 className="text-sm font-medium">Daily Streaks</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Maintain momentum with consistent daily logging.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Trophy className="size-4" />
                                    <h3 className="text-sm font-medium">Achievements</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Unlock badges and celebrate milestone completions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-6 sm:mt-0">
                        <div className="bg-linear-to-b aspect-67/34 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image src="/dashboard-preview.png" className="rounded-[15px] shadow" alt="NavyGoal streaks and milestones" width={1206} height={612} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}