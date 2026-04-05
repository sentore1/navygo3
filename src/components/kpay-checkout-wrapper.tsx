"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import KPayCheckout from "./kpay-checkout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function KPayCheckoutWrapper({ user }: { user: User | null }) {
  const [interval, setInterval] = useState<"monthly" | "annually">("monthly");
  const [plan, setPlan] = useState<"Basic" | "Pro">("Basic");
  const [exchangeRate, setExchangeRate] = useState(1000);

  const pricesUSD = { Basic: 4.7, Pro: 9.3 };

  useEffect(() => {
    fetch('/api/convert-currency')
      .then(res => res.json())
      .then(data => setExchangeRate(data.rate))
      .catch(() => setExchangeRate(1000));
  }, []);

  const priceUSD = interval === "monthly" ? pricesUSD[plan] : pricesUSD[plan] * 10;
  const priceRWF = Math.round(priceUSD * exchangeRate);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto space-y-4">
        <Tabs value={plan} onValueChange={(v) => setPlan(v as "Basic" | "Pro")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Basic">Basic</TabsTrigger>
            <TabsTrigger value="Pro">Pro</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={interval} onValueChange={(v) => setInterval(v as "monthly" | "annually")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annually">Annually</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Subscribe to NavyGoal {plan}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">${priceUSD}</span>
              <span className="text-muted-foreground">/{interval === "monthly" ? "month" : "year"}</span>
              <div className="text-xs text-muted-foreground">{priceRWF} RWF</div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KPayCheckout user={user} amount={priceRWF} planName={plan} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
