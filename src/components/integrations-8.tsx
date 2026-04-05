import { Calendar, Target, Trophy, Zap, BarChart3, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function IntegrationsSection() {
    return (
        <section>
            <div className="bg-white py-24 md:py-32">
                <div className="mx-auto flex flex-col px-6 md:grid md:max-w-5xl md:grid-cols-2 md:gap-12">
                    <div className="order-last mt-6 flex flex-col gap-12 md:order-first">
                        <div className="space-y-6">
                            <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">Integrate with your favorite apps</h2>
                            <p className="text-muted-foreground">Connect seamlessly with popular productivity tools to sync your goals across platforms.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild>
                                <Link href="/dashboard">Get Started</Link>
                            </Button>
                        </div>

                        <div className="mt-auto grid grid-cols-[auto_1fr] gap-3">
                            <div className="bg-background flex aspect-square items-center justify-center border">
                                <Target className="size-9" />
                            </div>
                            <blockquote>
                                <p>NavyGoal helped me achieve my fitness goals by tracking my daily progress consistently.</p>
                                <div className="mt-2 flex gap-2 text-sm">
                                    <cite>Alex Johnson</cite>
                                    <p className="text-muted-foreground">Fitness Enthusiast</p>
                                </div>
                            </blockquote>
                        </div>
                    </div>

                    <div className="-mx-6 px-6 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)] sm:mx-auto sm:max-w-md md:-mx-6 md:ml-auto md:mr-0">
                        <div className="bg-background dark:bg-muted/50 rounded-[2.5rem] border p-3 shadow-lg md:pb-12">
                            <div className="grid grid-cols-2 gap-2">
                                <Integration
                                    icon={<Calendar className="size-7" />}
                                    name="Google Calendar"
                                    description="Schedule goal milestones and track deadlines."
                                />
                                <Integration
                                    icon={<Target className="size-7" />}
                                    name="Notion"
                                    description="Sync goals with your productivity workspace."
                                />
                                <Integration
                                    icon={<BarChart3 className="size-7" />}
                                    name="Google Sheets"
                                    description="Export progress reports and analytics data."
                                />
                                <Integration
                                    icon={<Trophy className="size-7" />}
                                    name="Fitbit"
                                    description="Automatically track health and fitness goals."
                                />
                                <Integration
                                    icon={<Zap className="size-7" />}
                                    name="IFTTT"
                                    description="Create automated workflows for goal tracking."
                                />
                                <Integration
                                    icon={<Users className="size-7" />}
                                    name="Discord"
                                    description="Share achievements with your community."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

const Integration = ({ icon, name, description }: { icon: React.ReactNode; name: string; description: string }) => {
    return (
        <div className="hover:bg-muted dark:hover:bg-muted/50 space-y-4 rounded-3xl border p-4 transition-colors">
            <div className="flex size-fit items-center justify-center">{icon}</div>
            <div className="space-y-1">
                <h3 className="text-sm font-medium">{name}</h3>
                <p className="text-muted-foreground line-clamp-1 text-sm md:line-clamp-2">{description}</p>
            </div>
        </div>
    )
}
