"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "../../supabase/client";
import { Badge } from "./ui/badge";
import { useToast } from "./ui/use-toast";

interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  interval: string;
  currency: string;
  popular?: boolean;
  features?: string[];
}

export default function PricingCard({
  item,
  user,
}: {
  item: PricingPlan;
  user: User | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleCheckout = async (priceId: string) => {
    window.location.href = "/pricing";
  };

  // Define features based on plan type
  const features = item.features || [
    "Goal tracking",
    "Progress visualization",
    "Daily consistency tracking",
  ];

  if (item.name !== "Free" && !features.includes("Unlimited goals")) {
    features.push("Unlimited goals");
  }

  if (item.name === "Pro" && !features.includes("Priority support")) {
    features.push("Priority support");
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <Card
      className={`flex flex-col ${item.popular ? "border-primary shadow-md" : ""}`}
    >
      <CardHeader>
        {item.popular && <Badge className="w-fit mb-2">Most Popular</Badge>}
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">
            {formatCurrency(item.amount, item.currency)}
          </span>
          <span className="text-muted-foreground ml-1">/{item.interval}</span>
          {item.description && (
            <p className="text-sm mt-2">{item.description}</p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={() => handleCheckout(item.id)}
          className="w-full"
          disabled={isLoading}
          variant={item.popular ? "default" : "outline"}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            "Get Started"
          )}
        </Button>
        {error && (
          <div className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
