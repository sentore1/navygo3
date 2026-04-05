"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PaymentGateway {
  id: string;
  gateway_name: string;
  is_enabled: boolean;
  config: any;
}

export default function AdminSettingsSecure() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      await Promise.all([loadGateways(), checkEnvVariables()]);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadGateways = async () => {
    const { data, error } = await supabase
      .from("payment_gateway_settings")
      .select("*")
      .order("gateway_name");

    if (error) {
      console.error("Error loading gateways:", error);
      return;
    }

    setGateways(data || []);
  };

  const checkEnvVariables = async () => {
    // Call an API route to check if env vars are set (server-side only)
    try {
      const response = await fetch('/api/admin/check-env');
      const data = await response.json();
      setEnvStatus(data.status || {});
    } catch (error) {
      console.error("Error checking env vars:", error);
    }
  };

  const handleToggleGateway = async (gatewayId: string, isEnabled: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("payment_gateway_settings")
        .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
        .eq("id", gatewayId);

      if (error) throw error;

      setGateways(gateways.map(g => 
        g.id === gatewayId ? { ...g, is_enabled: isEnabled } : g
      ));

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action_type: isEnabled ? 'enable_gateway' : 'disable_gateway',
        p_action_data: { gateway_id: gatewayId }
      });
    } catch (error: any) {
      console.error("Error updating gateway:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getGatewayDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      stripe: "Accept credit cards and digital wallets worldwide",
      kpay: "Local payment gateway for Rwanda (Mobile Money)",
      polar: "Subscription management and billing platform",
    };
    return descriptions[name] || "Payment gateway";
  };

  const getEnvVarsForGateway = (name: string) => {
    const envVars: Record<string, string[]> = {
      stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
      kpay: ["KPAY_API_URL", "KPAY_USERNAME", "KPAY_PASSWORD", "KPAY_RETAILER_ID", "KPAY_BANK_ID"],
      polar: ["POLAR_API_KEY", "POLAR_ORGANIZATION_ID", "POLAR_WEBHOOK_SECRET"],
    };
    return envVars[name] || [];
  };

  const getGatewayStatus = (name: string) => {
    const vars = getEnvVarsForGateway(name);
    const allConfigured = vars.every(v => envStatus[v]);
    const someConfigured = vars.some(v => envStatus[v]);
    
    if (allConfigured) return { status: "configured", color: "green" };
    if (someConfigured) return { status: "partial", color: "yellow" };
    return { status: "not-configured", color: "red" };
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
        </Button>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
      </div>

      {/* Security Notice */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-yellow-900">
                Security Notice: Environment Variables
              </p>
              <p className="text-sm text-yellow-800">
                For security, environment variables should be configured in your hosting platform 
                (Vercel, Netlify, etc.) or in your local <code className="bg-yellow-100 px-1 rounded">.env.local</code> file. 
                Never store API keys in the database.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Gateways</CardTitle>
          <CardDescription>
            Enable or disable payment gateways for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {gateways.map((gateway, index) => {
            const status = getGatewayStatus(gateway.gateway_name);
            return (
              <div key={gateway.id}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Label
                        htmlFor={`gateway-${gateway.id}`}
                        className="text-base font-semibold capitalize"
                      >
                        {gateway.gateway_name}
                      </Label>
                      <Badge variant={
                        status.status === 'configured' ? 'default' :
                        status.status === 'partial' ? 'secondary' :
                        'destructive'
                      }>
                        {status.status === 'configured' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {status.status === 'partial' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {status.status === 'not-configured' && <XCircle className="h-3 w-3 mr-1" />}
                        {status.status === 'configured' ? 'Configured' :
                         status.status === 'partial' ? 'Partially Configured' :
                         'Not Configured'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getGatewayDescription(gateway.gateway_name)}
                    </p>
                    
                    {/* Show required env vars */}
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Required variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {getEnvVarsForGateway(gateway.gateway_name).map(envVar => (
                          <Badge 
                            key={envVar} 
                            variant="outline"
                            className={envStatus[envVar] ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}
                          >
                            {envStatus[envVar] ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                            {envVar}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Switch
                    id={`gateway-${gateway.id}`}
                    checked={gateway.is_enabled}
                    onCheckedChange={(checked) =>
                      handleToggleGateway(gateway.id, checked)
                    }
                    disabled={saving || status.status === 'not-configured'}
                  />
                </div>
                {index < gateways.length - 1 && <Separator className="mt-6" />}
              </div>
            );
          })}
          {gateways.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No payment gateways configured. Run the database migration to set up gateways.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Configure Environment Variables</CardTitle>
          <CardDescription>
            Add these variables to your hosting platform or .env.local file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Local Development (.env.local)</h3>
            <pre className="text-xs bg-background p-3 rounded overflow-x-auto">
{`STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
KPAY_API_URL=https://api.kpay.rw
KPAY_USERNAME=your_username
KPAY_PASSWORD=your_password
POLAR_API_KEY=polar_xxxxx
POLAR_ORGANIZATION_ID=org_xxxxx`}
            </pre>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="font-semibold">Production (Hosting Platform)</h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• <strong>Vercel:</strong> Project Settings → Environment Variables</li>
              <li>• <strong>Netlify:</strong> Site Settings → Environment Variables</li>
              <li>• <strong>Railway:</strong> Project → Variables</li>
              <li>• <strong>Render:</strong> Environment → Environment Variables</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
