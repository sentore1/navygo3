import { Target, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">Transform your goals into achievements.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            <span className="text-accent-foreground font-bold">Complete achievement system</span> — from setting goals to celebrating success.
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="size-4" />
                                    <h3 className="text-sm font-medium">Progress Tracking</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">Visual progress bars and milestone tracking to see your journey.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Target className="size-4" />
                                    <h3 className="text-sm font-medium">Smart Goals</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">AI-powered goal creation and personalized achievement strategies.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative mt-6 sm:mt-0">
                        <div className="bg-linear-to-b aspect-67/34 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image src="/dashboard-preview.png" className="rounded-[15px] shadow" alt="NavyGoal dashboard preview" width={1206} height={612} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
