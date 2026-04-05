"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, SendHorizonal, Star } from "lucide-react";
import { createClient } from "../../supabase/client";

export default function CTASection() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert({
          email: email.toLowerCase().trim(),
          source: "landing_page_cta",
          metadata: {
            subscribed_from: window.location.href,
            user_agent: navigator.userAgent,
          }
        });

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          setMessage("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        setMessage("Thanks for subscribing! 🎉");
        setEmail("");
      }
    } catch (error: any) {
      console.error("Error subscribing:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-24 border-t bg-white">
      <div className="container max-w-3xl space-y-4 sm:space-y-6 text-center px-4 sm:px-6">
        <div className="flex justify-center gap-1 mb-4">
          <Star className="size-6 fill-yellow-400 text-yellow-400" />
          <Star className="size-6 fill-yellow-400 text-yellow-400" />
          <Star className="size-6 fill-yellow-400 text-yellow-400" />
          <Star className="size-6 fill-yellow-400 text-yellow-400" />
          <Star className="size-6 fill-yellow-400 text-yellow-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Ready to Achieve Your Goals?
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mx-auto">
          Join thousands of goal-setters who are visualizing their progress
          and celebrating their achievements.
        </p>
        <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
          <div className="bg-background has-[input:focus]:ring-primary relative grid grid-cols-[1fr_auto] items-center rounded-full border pr-1.5 sm:pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2 transition-all">
            <Mail className="pointer-events-none absolute inset-y-0 left-3 sm:left-4 my-auto size-3 sm:size-4 text-muted-foreground" />
            <input
              placeholder="Your email address"
              className="h-10 sm:h-12 w-full bg-transparent pl-9 sm:pl-12 text-sm sm:text-base focus:outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <div className="md:pr-1.5 lg:pr-0">
              <Button
                type="submit"
                aria-label="submit"
                size="sm"
                disabled={loading}
                className="rounded-full">
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="hidden md:block">Get Started</span>
                    <SendHorizonal
                      className="relative mx-auto size-5 md:hidden"
                      strokeWidth={2}
                    />
                  </>
                )}
              </Button>
            </div>
          </div>
          {message && (
            <p className={`mt-3 text-sm ${message.includes("Thanks") ? "text-green-600" : "text-muted-foreground"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
