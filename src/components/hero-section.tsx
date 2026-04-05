"use client";

import React, { useState, useEffect } from 'react'
import { Mail, SendHorizonal, Star, ChevronDown, Circle, Crown, Gem, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { HeroHeader } from '@/components/header'
import HeroGoalCard from '@/components/hero-goal-card'
import FeaturesSection from '@/components/features-5'
import Features8Section from '@/components/features-8'
import IntegrationsSection from '@/components/integrations-8'
import Testimonials from '@/components/testimonials'
import LeaderboardSection from '@/components/leaderboard-section'
import { createClient } from '../../supabase/client'


const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

interface HeroSettings {
    title: string;
    subtitle: string;
    title_font_family: string;
    title_font_size: string;
    subtitle_font_size: string;
    show_avatars: boolean;
    show_rating: boolean;
    rating_value: number;
    rating_count: number;
}

export default function HeroSection() {
    const supabase = createClient();
    const [sections, setSections] = useState<Record<string, boolean>>({});
    const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([loadSectionVisibility(), loadHeroSettings()]);
        setLoading(false);
    };

    const loadSectionVisibility = async () => {
        try {
            const { data, error } = await supabase
                .from('landing_sections')
                .select('section_key, is_enabled');
            
            if (error) throw error;
            
            const visibilityMap: Record<string, boolean> = {};
            data?.forEach(section => {
                visibilityMap[section.section_key] = section.is_enabled;
            });
            setSections(visibilityMap);
        } catch (error) {
            console.error('Error loading section visibility:', error);
        }
    };

    const loadHeroSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('hero_settings')
                .select('*')
                .single();
            
            if (error) throw error;
            setHeroSettings(data);
        } catch (error) {
            console.error('Error loading hero settings:', error);
        }
    };

    const isSectionVisible = (key: string) => {
        return sections[key] !== false; // Default to true if not found
    };

    if (loading) {
        return (
            <>
                <HeroHeader />
                <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
                    <section>
                        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-20 pt-20 sm:pt-24 lg:pt-32">
                            <div className="relative z-10 mx-auto max-w-4xl text-center space-y-8">
                                {/* Title skeleton - multiple lines for realistic look */}
                                <div className="space-y-4">
                                    <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-2xl animate-pulse mx-auto max-w-3xl" />
                                </div>
                                
                                {/* Subtitle skeleton */}
                                <div className="space-y-2 mx-auto max-w-2xl">
                                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
                                    <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse w-4/5 mx-auto" />
                                </div>
                                
                                {/* Avatars and rating skeleton */}
                                <div className="flex justify-center items-center gap-4 flex-wrap">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full animate-pulse border-2 border-white" />
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-28 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                                
                                {/* Card skeleton */}
                                <div className="mx-auto max-w-2xl mt-16 sm:mt-24">
                                    <div className="h-72 sm:h-80 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-3xl animate-pulse shadow-lg border border-gray-200" />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
                <section>
                    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-20 pt-20 sm:pt-24 lg:pt-32">
                        <div className="relative z-10 mx-auto max-w-4xl text-center">
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="text-balance text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]"
                                style={{ 
                                    fontFamily: heroSettings?.title_font_family || "'Georgia Pro', Georgia, serif", 
                                    fontSize: heroSettings?.title_font_size || 'clamp(3rem, 12vw, 10rem)' 
                                }}>
                                {heroSettings?.title || 'Navy Goal'}
                            </TextEffect>
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className={`mx-auto mt-4 sm:mt-6 max-w-2xl text-pretty px-4 ${heroSettings?.subtitle_font_size || 'text-base sm:text-lg'}`}>
                                {heroSettings?.subtitle || 'Set meaningful goals, track daily progress, and celebrate milestones with our visual goal tracking platform.'}
                            </TextEffect>

                            {(heroSettings === null || heroSettings?.show_avatars !== false || heroSettings?.show_rating !== false) && (
                            <div className="mx-auto mt-8 sm:mt-10 flex w-fit flex-col items-center gap-3 sm:gap-4 sm:flex-row">
                                {(heroSettings === null || heroSettings?.show_avatars !== false) && (
                                <span className="mx-2 sm:mx-4 inline-flex items-center -space-x-3 sm:-space-x-4">
                                    <Avatar className="size-10 sm:size-12 border">
                                        <AvatarImage src="/avatar-1.webp" alt="Avatar 1" />
                                    </Avatar>
                                    <Avatar className="size-10 sm:size-12 border">
                                        <AvatarImage src="/avatar-2.webp" alt="Avatar 2" />
                                    </Avatar>
                                    <Avatar className="size-10 sm:size-12 border">
                                        <AvatarImage src="/avatar-3.webp" alt="Avatar 3" />
                                    </Avatar>
                                    <Avatar className="size-10 sm:size-12 border">
                                        <AvatarImage src="/avatar-4.webp" alt="Avatar 4" />
                                    </Avatar>
                                    <Avatar className="size-10 sm:size-12 border">
                                        <AvatarImage src="/avatar-5.webp" alt="Avatar 5" />
                                    </Avatar>
                                </span>
                                )}
                                {(heroSettings === null || heroSettings?.show_rating !== false) && (
                                <div className="text-center sm:text-left">
                                    <div className="flex items-center gap-1 justify-center sm:justify-start">
                                        <Star className="size-4 sm:size-5 fill-yellow-400 text-yellow-400" />
                                        <Star className="size-4 sm:size-5 fill-yellow-400 text-yellow-400" />
                                        <Star className="size-4 sm:size-5 fill-yellow-400 text-yellow-400" />
                                        <Star className="size-4 sm:size-5 fill-yellow-400 text-yellow-400" />
                                        <Star className="size-4 sm:size-5 fill-yellow-400 text-yellow-400" />
                                        <span className="ml-1 text-xs sm:text-sm text-black">+{heroSettings?.rating_value || 4.9}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        from {heroSettings?.rating_count || 200}+ reviews
                                    </p>
                                </div>
                                )}
                            </div>
                            )}

                            <div className="mx-auto mt-16 sm:mt-24 lg:mt-32 max-w-2xl px-4">
                                <HeroGoalCard />
                            </div>


                        </div>
                    </div>
                </section>

            </main>
            {isSectionVisible('features') && <FeaturesSection />}
            {isSectionVisible('features_8') && <Features8Section />}
            
            {/* Ranks Section */}
            {isSectionVisible('ranks') && (
            <section className="py-12 sm:py-16 md:py-24 bg-white">
                <div className="container max-w-5xl px-4 sm:px-6">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Climb the Ranks</h2>
                        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                            Earn points by completing goals, achieving milestones, and maintaining streaks. Rise through the ranks to reach elite General status.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 -translate-x-1/2" />
                        <div className="space-y-4 sm:space-y-6">
                            {[
                                { name: "Supreme Commander", pts: 30000, desc: "Ultimate", badge: <div className="flex items-center gap-0.5"><Crown className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Gem className="size-2 sm:size-3 fill-yellow-300 text-yellow-300" /><Gem className="size-2 sm:size-3 fill-yellow-300 text-yellow-300" /><Gem className="size-2 sm:size-3 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "Commander", pts: 20000, desc: "Command", badge: <div className="flex items-center gap-0.5"><Crown className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Gem className="size-2 sm:size-3 fill-yellow-300 text-yellow-300" /><Gem className="size-2 sm:size-3 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "Field Marshal", pts: 15000, desc: "Marshal", badge: <div className="flex items-center gap-0.5"><Crown className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Gem className="size-2 sm:size-3 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "General", pts: 10000, desc: "Elite", badge: <div className="flex"><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "Major", pts: 7000, desc: "Outstanding", badge: <div className="flex"><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "Captain", pts: 4000, desc: "Exceptional", badge: <div className="flex"><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "Lieutenant", pts: 2000, desc: "Dedicated", badge: <div className="flex"><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /><Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /></div> },
                                { name: "Sergeant", pts: 1200, desc: "Committed", badge: <Star className="size-3 sm:size-4 fill-yellow-300 text-yellow-300" /> },
                                { name: "Corporal", pts: 600, desc: "Rising", badge: <div className="flex flex-col -space-y-0.5"><ChevronDown className="size-3 sm:size-4 text-yellow-300" strokeWidth={3} /><ChevronDown className="size-3 sm:size-4 text-yellow-300" strokeWidth={3} /><ChevronDown className="size-3 sm:size-4 text-yellow-300" strokeWidth={3} /></div> },
                                { name: "Private", pts: 300, desc: "Started", badge: <ChevronDown className="size-3 sm:size-4 text-yellow-300" strokeWidth={3} /> },
                                { name: "Recruit", pts: 0, desc: "New", badge: <Circle className="size-3 sm:size-4 text-yellow-300" strokeWidth={3} /> },
                            ].map((rank, i) => (
                                <div key={rank.name} className={`flex items-center gap-3 sm:gap-6 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`flex-1 ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                        <div className="inline-block bg-white border border-gray-200 rounded-3xl sm:rounded-[2rem] px-3 sm:px-5 py-2 sm:py-3 shadow-sm hover:shadow-md hover:scale-105 transition-all relative overflow-hidden group">
                                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                                            <div className="relative">
                                                <div className="font-bold text-xs sm:text-sm lg:text-base mb-0.5">{rank.name}</div>
                                                <div className="text-[10px] sm:text-xs text-muted-foreground">{rank.pts.toLocaleString()} pts • {rank.desc}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative z-10 bg-black rounded-full p-1.5 sm:p-2.5 border-2 sm:border-3 border-white shadow-md overflow-hidden group hover:scale-110 transition-transform">
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                                        <div className="relative">
                                            {rank.badge}
                                        </div>
                                    </div>
                                    <div className="flex-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            )}
            
            {isSectionVisible('integrations') && <IntegrationsSection />}
            {isSectionVisible('leaderboard') && <LeaderboardSection />}
            {isSectionVisible('testimonials') && <Testimonials />}
        </>
    )
}


