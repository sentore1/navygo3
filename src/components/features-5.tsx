"use client";

import { Target, TrendingUp, Calendar, Trophy, BarChart3, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '../../supabase/client'

interface FeatureItem {
    id: string;
    icon_name: string;
    text: string;
    item_order: number;
}

interface FeatureSection {
    id: string;
    section_order: number;
    title: string;
    description: string;
    image_url: string;
    items: FeatureItem[];
}

const iconMap: Record<string, any> = {
    Target,
    TrendingUp,
    Calendar,
    Trophy,
    BarChart3,
    Users,
};

export default function FeaturesSection() {
    const supabase = createClient();
    const [sections, setSections] = useState<FeatureSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const { data: sectionsData } = await supabase
                .from('features_sections')
                .select('*')
                .eq('is_active', true)
                .order('section_order');

            if (sectionsData) {
                const sectionsWithItems = await Promise.all(
                    sectionsData.map(async (section) => {
                        const { data: items } = await supabase
                            .from('features_items')
                            .select('*')
                            .eq('section_id', section.id)
                            .order('item_order');

                        return { ...section, items: items || [] };
                    })
                );

                setSections(sectionsWithItems);
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="py-16 md:py-32">Loading...</div>;
    }

    return (
        <>
            {sections.map((section) => {
                const Icon = iconMap[section.items[0]?.icon_name] || Target;
                
                return (
                    <section key={section.id} className="py-16 md:py-32">
                        <div className="mx-auto max-w-6xl px-6">
                            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                                <div className="lg:col-span-2">
                                    <div className="md:pr-6 lg:pr-0">
                                        <h2 className="text-4xl font-semibold lg:text-5xl">{section.title}</h2>
                                        <p className="mt-6">{section.description}</p>
                                    </div>
                                    <ul className="mt-8 space-y-3">
                                        {section.items.map((item) => {
                                            const ItemIcon = iconMap[item.icon_name] || Target;
                                            return (
                                                <li key={item.id} className="flex items-center gap-3">
                                                    <ItemIcon className="size-5" />
                                                    {item.text}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                                <div className="border-border/50 relative rounded-[2.5rem] border p-3 lg:col-span-3">
                                    <div className="bg-linear-to-b aspect-76/59 relative rounded-[2rem] from-zinc-300 to-transparent p-px dark:from-zinc-700">
                                        <img 
                                            src={section.image_url} 
                                            className="rounded-[1.875rem] shadow w-full h-full object-cover" 
                                            alt={section.title} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                );
            })}
        </>
    )
}
