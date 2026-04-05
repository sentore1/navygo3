"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";
import { createClient } from "../../supabase/client";
import { useToast } from "./ui/use-toast";

export default function KPayCheckout({ user: initialUser, amount, planName }: { user: User | null; amount: number; planName: string }) {
  console.log('KPayCheckout amount:', amount, 'planName:', planName);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [user, setUser] = useState<User | null>(initialUser);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => setUser(data.user));
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Signed In",
        description: "Please sign in to continue",
      });
      setTimeout(() => window.location.href = "/sign-in?redirect=pricing", 1500);
      return;
    }

    if (!name) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide your name",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/kpay-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          phone: "0000000000",
          name,
          amount,
          plan_name: planName,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Payment Initiated",
          description: "Please complete the payment",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: err.message || "Failed to initiate payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing
          </>
        ) : (
          `Pay ${amount} RWF`
        )}
      </Button>
    </form>
  );
}
