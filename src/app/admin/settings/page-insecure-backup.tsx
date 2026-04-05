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
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Eye, EyeOff, Copy, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentGateway {
  id: string;
  gateway_name: string;
  is_enabled: boolean;
  config: any;
}

interface EnvVariable {
  key: string;
  value: string;
  visible: boolean;
}

export default function AdminSettings() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Environment variables state
  const [envVars, setEnvVars] = useState<Record<string, EnvVariable>>({
    STRIPE_SECRET_KEY: { key: 'STRIPE_SECRET_KEY', value: '', visible: false },
    STRIPE_WEBHOOK_SECRET: { key: 'STRIPE_WEBHOOK_SECRET', value: '', visible: false },
    KPAY_API_URL: { key: 'KPAY_API_URL', value: '', visible: false },
    KPAY_USERNAME: { key: 'KPAY_USERNAME', value: '', visible: false },
    KPAY_PASSWORD: { key: 'KPAY_PASSWORD', value: '', visible: false },
    KPAY_RETAILER_ID: { key: 'KPAY_RETAILER_ID', value: '', visible: false },
    KPAY_BANK_ID: { key: 'KPAY_BANK_ID', value: '', visible: false },
    POLAR_API_KEY: { key: 'POLAR_API_KEY', value: '', visible: false },
    POLAR_ORGANIZATION_ID: { key: 'POLAR_ORGANIZATION_ID', value: '', visible: false },
    POLAR_WEBHOOK_SECRET: { key: 'POLAR_WEBHOOK_SECRET', value: '', visible: false },
  });

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
      await loadGateways();
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
    
    // Load environment variables from gateway configs
    if (data) {
      const newEnvVars = { ...envVars };
      data.forEach((gateway: PaymentGateway) => {
        if (gateway.config) {
          Object.keys(gateway.config).forEach(key => {
            if (newEnvVars[key]) {
              newEnvVars[key].value = gateway.config[key] || '';
            }
          });
        }
      });
      setEnvVars(newEnvVars);
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

  const getGatewayStatus = (name: string) => {
    const envVarKeys: Record<string, string[]> = {
      stripe: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
      kpay: ["KPAY_API_URL", "KPAY_USERNAME", "KPAY_PASSWORD"],
      polar: ["POLAR_API_KEY", "POLAR_ORGANIZATION_ID"],
    };

    const vars = envVarKeys[name] || [];
    const configured = vars.every(key => envVars[key]?.value);
    return configured ? "Configured" : "Not configured";
  };

  const toggleVisibility = (key: string) => {
    setEnvVars(prev => ({
      ...prev,
      [key]: { ...prev[key], visible: !prev[key].visible }
    }));
  };

  const updateEnvVar = (key: string, value: string) => {
    setEnvVars(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const copyToClipboard = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const saveEnvVariables = async () => {
    setSaving(true);
    try {
      // Group env vars by gateway
      const stripeConfig = {
        STRIPE_SECRET_KEY: envVars.STRIPE_SECRET_KEY.value,
        STRIPE_WEBHOOK_SECRET: envVars.STRIPE_WEBHOOK_SECRET.value,
      };
      
      const kpayConfig = {
        KPAY_API_URL: envVars.KPAY_API_URL.value,
        KPAY_USERNAME: envVars.KPAY_USERNAME.value,
        KPAY_PASSWORD: envVars.KPAY_PASSWORD.value,
        KPAY_RETAILER_ID: envVars.KPAY_RETAILER_ID.value,
        KPAY_BANK_ID: envVars.KPAY_BANK_ID.value,
      };
      
      const polarConfig = {
        POLAR_API_KEY: envVars.POLAR_API_KEY.value,
        POLAR_ORGANIZATION_ID: envVars.POLAR_ORGANIZATION_ID.value,
        POLAR_WEBHOOK_SECRET: envVars.POLAR_WEBHOOK_SECRET.value,
      };

      // Update each gateway's config
      const updates = [
        { name: 'stripe', config: stripeConfig },
        { name: 'kpay', config: kpayConfig },
        { name: 'polar', config: polarConfig },
      ];

      for (const update of updates) {
        const gateway = gateways.find(g => g.gateway_name === update.name);
        if (gateway) {
          const { error } = await supabase
            .from("payment_gateway_settings")
            .update({ 
              config: update.config,
              updated_at: new Date().toISOString() 
            })
            .eq("id", gateway.id);

          if (error) throw error;
        }
      }

      alert("Environment variables saved successfully!");
    } catch (error: any) {
      console.error("Error saving env vars:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const generateEnvFile = () => {
    const envContent = Object.entries(envVars)
      .map(([key, { value }]) => `${key}=${value}`)
      .join('\n');
    
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.local';
    a.click();
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

      <Tabs defaultValue="gateways" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="environment">Environment Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>
                Enable or disable payment gateways for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {gateways.map((gateway, index) => (
                <div key={gateway.id}>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <Label
                          htmlFor={`gateway-${gateway.id}`}
                          className="text-base font-semibold capitalize"
                        >
                          {gateway.gateway_name}
                        </Label>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          getGatewayStatus(gateway.gateway_name) === 'Configured' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {getGatewayStatus(gateway.gateway_name)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getGatewayDescription(gateway.gateway_name)}
                      </p>
                    </div>
                    <Switch
                      id={`gateway-${gateway.id}`}
                      checked={gateway.is_enabled}
                      onCheckedChange={(checked) =>
                        handleToggleGateway(gateway.id, checked)
                      }
                      disabled={saving}
                    />
                  </div>
                  {index < gateways.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
              {gateways.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No payment gateways configured. Run the database migration to set up gateways.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>
                    Configure API keys and secrets for payment gateways
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={generateEnvFile}>
                    Download .env.local
                  </Button>
                  <Button onClick={saveEnvVariables} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save All"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stripe Section */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">Stripe</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getGatewayStatus('stripe') === 'Configured' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getGatewayStatus('stripe')}
                  </span>
                </h3>
                <div className="space-y-4">
                  {['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'].map(key => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {key}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={key}
                          type={envVars[key].visible ? "text" : "password"}
                          value={envVars[key].value}
                          onChange={(e) => updateEnvVar(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleVisibility(key)}
                        >
                          {envVars[key].visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(key, envVars[key].value)}
                          disabled={!envVars[key].value}
                        >
                          {copiedKey === key ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* KPay Section */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">KPay</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getGatewayStatus('kpay') === 'Configured' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getGatewayStatus('kpay')}
                  </span>
                </h3>
                <div className="space-y-4">
                  {['KPAY_API_URL', 'KPAY_USERNAME', 'KPAY_PASSWORD', 'KPAY_RETAILER_ID', 'KPAY_BANK_ID'].map(key => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {key}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={key}
                          type={envVars[key].visible ? "text" : "password"}
                          value={envVars[key].value}
                          onChange={(e) => updateEnvVar(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleVisibility(key)}
                        >
                          {envVars[key].visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(key, envVars[key].value)}
                          disabled={!envVars[key].value}
                        >
                          {copiedKey === key ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Polar Section */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-lg">Polar</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getGatewayStatus('polar') === 'Configured' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getGatewayStatus('polar')}
                  </span>
                </h3>
                <div className="space-y-4">
                  {['POLAR_API_KEY', 'POLAR_ORGANIZATION_ID', 'POLAR_WEBHOOK_SECRET'].map(key => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {key}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={key}
                          type={envVars[key].visible ? "text" : "password"}
                          value={envVars[key].value}
                          onChange={(e) => updateEnvVar(key, e.target.value)}
                          placeholder={`Enter ${key}`}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleVisibility(key)}
                        >
                          {envVars[key].visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(key, envVars[key].value)}
                          disabled={!envVars[key].value}
                        >
                          {copiedKey === key ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> These values are stored in the database and can be downloaded as a .env.local file. 
                  For production, consider using environment variables directly in your hosting platform.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
