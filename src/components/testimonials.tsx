"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import Link from "next/link";
import { ComponentProps } from "react";
import { createClient } from "../../supabase/client";

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  company: string;
  testimonial: string;
  avatar_url: string;
  rating: number;
  is_featured: boolean;
  display_order: number;
  show_avatar: boolean;
}

interface SectionContent {
  title: string;
  description: string;
}

const Testimonials = () => {
  const supabase = createClient();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [content, setContent] = useState<SectionContent>({
    title: "Success Stories",
    description: "Real stories from people who use and love our product every day"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
    loadSectionContent();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_enabled", true)
        .order("display_order");

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSectionContent = async () => {
    try {
      const { data, error } = await supabase
        .from("section_content")
        .select("content_key, content_value")
        .in("content_key", ["testimonials_title", "testimonials_description"]);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const titleItem = data.find(item => item.content_key === "testimonials_title");
        const descItem = data.find(item => item.content_key === "testimonials_description");
        
        setContent({
          title: titleItem?.content_value || content.title,
          description: descItem?.content_value || content.description
        });
      }
    } catch (error) {
      console.error("Error loading section content:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center py-12">
        <div className="h-full w-full">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-md mb-4" />
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse mx-auto max-w-xl" />
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-center py-12">
      <div className="h-full w-full">
        <h2 className="text-5xl font-semibold text-center tracking-[-0.03em] px-6 text-pretty">
          {content.title}
        </h2>
        <p className="mt-3 text-center text-muted-foreground text-xl">
          {content.description}
        </p>
        <div className="mt-14 relative">
          <div className="z-10 absolute left-0 inset-y-0 w-[15%] bg-linear-to-r from-background to-transparent" />
          <div className="z-10 absolute right-0 inset-y-0 w-[15%] bg-linear-to-l from-background to-transparent" />
          <Marquee pauseOnHover className="[--duration:80s]">
            <TestimonialList testimonials={testimonials} />
          </Marquee>
          <Marquee pauseOnHover reverse className="mt-0 [--duration:80s]">
            <TestimonialList testimonials={testimonials} />
          </Marquee>
          <Marquee pauseOnHover className="mt-0 [--duration:80s]">
            <TestimonialList testimonials={testimonials} />
          </Marquee>
        </div>
      </div>
    </div>
  );
};

const TestimonialList = ({ testimonials }: { testimonials: Testimonial[] }) =>
  testimonials.map((testimonial) => (
    <div
      key={testimonial.id}
      className="min-w-64 max-w-xs bg-white rounded-3xl p-4 shadow-md border text-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {testimonial.show_avatar && (
            <Avatar className="size-8">
              <AvatarImage src={testimonial.avatar_url} />
              <AvatarFallback className="text-sm font-medium bg-primary text-primary-foreground">
                {testimonial.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <p className="text-sm font-semibold">{testimonial.name}</p>
            <p className="text-xs text-gray-500">{testimonial.designation}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="#" target="_blank">
            <TwitterLogo className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      <p className="mt-3 text-xs">{testimonial.testimonial}</p>
    </div>
  ));

const TwitterLogo = (props: ComponentProps<"svg">) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>X</title>
    <path
      fill="currentColor"
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
    />
  </svg>
);

export default Testimonials;
