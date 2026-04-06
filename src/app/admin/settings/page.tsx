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
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentGateway {
  id: string;
  gateway_name: string;
  is_enabled: boolean;
  config: any;
}

interface AISettings {
  ai_enabled: boolean;
  ai_model: string;
  ai_provider: string;
  openai_api_key_configured: boolean;
  grok_api_key_configured: boolean;
  groq_api_key_configured: boolean;
  gemini_api_key_configured: boolean;
  current_provider_configured: boolean;
}

export default function AdminSettingsSecure() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [aiSettings, setAiSettings] = useState<AISettings>({
    ai_enabled: false,
    ai_model: 'gpt-3.5-turbo',
    ai_provider: 'openai',
    openai_api_key_configured: false,
    grok_api_key_configured: false,
    groq_api_key_configured: false,
    gemini_api_key_configured: false,
    current_provider_configured: false,
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
      await Promise.all([loadGateways(), checkEnvVariables(), loadAISettings()]);
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

  const loadAISettings = async () => {
    try {
      const response = await fetch('/api/admin/ai-settings');
      const data = await response.json();
      if (data.success) {
        setAiSettings(data.settings);
      }
    } catch (error) {
      console.error("Error loading AI settings:", error);
    }
  };

  const handleToggleAI = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_enabled: enabled,
          ai_model: aiSettings.ai_model,
          ai_provider: aiSettings.ai_provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update AI settings');
      }

      setAiSettings({ ...aiSettings, ai_enabled: enabled });
      
      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action_type: enabled ? 'enable_ai' : 'disable_ai',
        p_action_data: { ai_model: aiSettings.ai_model, ai_provider: aiSettings.ai_provider }
      });
    } catch (error: any) {
      console.error("Error updating AI settings:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAIProvider = async (provider: string) => {
    setSaving(true);
    try {
      // Get default model for the provider
      const defaultModels: Record<string, string> = {
        openai: 'gpt-3.5-turbo',
        grok: 'grok-beta',
        groq: 'llama-3.3-70b-versatile',
        gemini: 'gemini-pro',
      };

      const newModel = defaultModels[provider] || 'gpt-3.5-turbo';

      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_enabled: aiSettings.ai_enabled,
          ai_model: newModel,
          ai_provider: provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update AI provider');
      }

      // Reload settings to get updated configuration status
      await loadAISettings();
    } catch (error: any) {
      console.error("Error updating AI provider:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAIModel = async (model: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_enabled: aiSettings.ai_enabled,
          ai_model: model,
          ai_provider: aiSettings.ai_provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update AI model');
      }

      setAiSettings({ ...aiSettings, ai_model: model });
    } catch (error: any) {
      console.error("Error updating AI model:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Get available models based on selected provider
  const getAvailableModels = () => {
    const models: Record<string, Array<{value: string, label: string}>> = {
      openai: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Faster, Lower Cost)' },
        { value: 'gpt-4', label: 'GPT-4 (Higher Quality)' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Best Balance)' },
        { value: 'gpt-4o', label: 'GPT-4o (Latest, Fastest)' },
      ],
      grok: [
        { value: 'grok-beta', label: 'Grok Beta (Latest)' },
        { value: 'grok-2-latest', label: 'Grok 2 (Most Advanced)' },
      ],
      groq: [
        { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Latest, Best)' },
        { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B (Fast)' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Balanced)' },
        { value: 'gemma2-9b-it', label: 'Gemma 2 9B (Lightweight)' },
      ],
      gemini: [
        { value: 'gemini-pro', label: 'Gemini Pro (Balanced)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced)' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fastest)' },
      ],
    };

    return models[aiSettings.ai_provider] || models.openai;
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
          <div className="h-4 w-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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

      {/* AI Settings Card */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>AI Goal Creation</CardTitle>
          </div>
          <CardDescription>
            Configure AI-powered goal creation for Pro users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-provider" className="text-sm font-medium">
              AI Provider
            </Label>
            <Select
              value={aiSettings.ai_provider}
              onValueChange={handleChangeAIProvider}
              disabled={saving || aiSettings.ai_enabled}
            >
              <SelectTrigger id="ai-provider" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <span>OpenAI</span>
                    {aiSettings.openai_api_key_configured && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                </SelectItem>
                <SelectItem value="groq">
                  <div className="flex items-center gap-2">
                    <span>Groq (Fast Inference)</span>
                    {aiSettings.groq_api_key_configured && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                </SelectItem>
                <SelectItem value="grok">
                  <div className="flex items-center gap-2">
                    <span>Grok (xAI)</span>
                    {aiSettings.grok_api_key_configured && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                </SelectItem>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <span>Google Gemini</span>
                    {aiSettings.gemini_api_key_configured && <CheckCircle className="h-3 w-3 text-green-500" />}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {aiSettings.ai_enabled && 'Disable AI to change provider. '}
              Choose your preferred AI provider for goal generation.
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <Label htmlFor="ai-enabled" className="text-base font-semibold">
                  Enable AI Goal Creation
                </Label>
                <Badge variant={
                  aiSettings.current_provider_configured ? 'default' : 'destructive'
                }>
                  {aiSettings.current_provider_configured ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> API Key Configured</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> API Key Missing</>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow Pro users to create goals using AI assistance
              </p>
              
              {/* Show required env var for selected provider */}
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Required variable:</p>
                <Badge 
                  variant="outline"
                  className={aiSettings.current_provider_configured ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}
                >
                  {aiSettings.current_provider_configured ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                  {aiSettings.ai_provider === 'openai' && 'OPENAI_API_KEY'}
                  {aiSettings.ai_provider === 'groq' && 'GROQ_API_KEY'}
                  {aiSettings.ai_provider === 'grok' && 'GROK_API_KEY'}
                  {aiSettings.ai_provider === 'gemini' && 'GEMINI_API_KEY'}
                </Badge>
              </div>
            </div>
            <Switch
              id="ai-enabled"
              checked={aiSettings.ai_enabled}
              onCheckedChange={handleToggleAI}
              disabled={saving || !aiSettings.current_provider_configured}
            />
          </div>

          {aiSettings.ai_enabled && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ai-model" className="text-sm font-medium">
                  AI Model
                </Label>
                <Select
                  value={aiSettings.ai_model}
                  onValueChange={handleChangeAIModel}
                  disabled={saving}
                >
                  <SelectTrigger id="ai-model" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableModels().map(model => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the AI model for goal generation. 
                  {aiSettings.ai_provider === 'openai' && ' GPT-3.5 is recommended for most use cases.'}
                  {aiSettings.ai_provider === 'groq' && ' Llama 3.3 70B offers the best balance of speed and quality.'}
                  {aiSettings.ai_provider === 'grok' && ' Grok 2 offers the most advanced capabilities.'}
                  {aiSettings.ai_provider === 'gemini' && ' Gemini 1.5 Flash is fastest and most cost-effective.'}
                </p>
              </div>
            </>
          )}

          {!aiSettings.current_provider_configured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-900">
                    {aiSettings.ai_provider === 'openai' && 'OpenAI API Key Required'}
                    {aiSettings.ai_provider === 'groq' && 'Groq API Key Required'}
                    {aiSettings.ai_provider === 'grok' && 'Grok API Key Required'}
                    {aiSettings.ai_provider === 'gemini' && 'Gemini API Key Required'}
                  </p>
                  <p className="text-sm text-yellow-800">
                    To enable AI goal creation with {aiSettings.ai_provider}, you need to add your API key to the environment variables.
                    {aiSettings.ai_provider === 'openai' && ' Get your API key from '}
                    {aiSettings.ai_provider === 'groq' && ' Get your API key from '}
                    {aiSettings.ai_provider === 'grok' && ' Get your API key from '}
                    {aiSettings.ai_provider === 'gemini' && ' Get your API key from '}
                    {aiSettings.ai_provider === 'openai' && <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">OpenAI Platform</a>}
                    {aiSettings.ai_provider === 'groq' && <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">Groq Console</a>}
                    {aiSettings.ai_provider === 'grok' && <a href="https://x.ai" target="_blank" rel="noopener noreferrer" className="underline font-medium">xAI Console</a>}
                    {aiSettings.ai_provider === 'gemini' && <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google AI Studio</a>}
                    .
                  </p>
                </div>
              </div>
            </div>
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
{`# Payment Gateways
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
KPAY_API_URL=https://api.kpay.rw
KPAY_USERNAME=your_username
KPAY_PASSWORD=your_password
POLAR_API_KEY=polar_xxxxx
POLAR_ORGANIZATION_ID=org_xxxxx

# AI Settings (choose one or more)
OPENAI_API_KEY=sk-xxxxx
GROQ_API_KEY=gsk_xxxxx
GROK_API_KEY=xai-xxxxx
GEMINI_API_KEY=AIzaSy-xxxxx`}
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
