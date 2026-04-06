"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, GripVertical, RefreshCw, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PolarProduct {
    id: string;
    name: string;
    description: string;
}

interface ProductFeature {
    id: string;
    polar_product_id: string;
    polar_product_name: string;
    feature_text: string;
    sort_order: number;
    is_enabled: boolean;
}

interface PricingSettings {
    id: string;
    page_title: string;
    page_subtitle: string;
    yearly_savings_percent: number;
    show_monthly: boolean;
    show_yearly: boolean;
}

export default function AdminPricingPage() {
    const supabase = createClient();
    const [polarProducts, setPolarProducts] = useState<PolarProduct[]>([]);
    const [features, setFeatures] = useState<Record<string, ProductFeature[]>>({});
    const [settings, setSettings] = useState<PricingSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await Promise.all([
                loadPolarProducts(),
                loadFeatures(),
                loadSettings()
            ]);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadPolarProducts = async () => {
        try {
            setError(null);
            const response = await fetch('/api/polar-products');
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load products');
            }
            
            setPolarProducts(data.products || []);
        } catch (error: any) {
            console.error("Error loading Polar products:", error);
            setError(error.message || 'Failed to load Polar products');
        }
    };

    const loadFeatures = async () => {
        try {
            const { data: featuresData } = await supabase
                .from("pricing_product_features")
                .select("*")
                .order("sort_order");

            if (featuresData) {
                const featuresByProduct: Record<string, ProductFeature[]> = {};
                featuresData.forEach((feature: ProductFeature) => {
                    if (!featuresByProduct[feature.polar_product_id]) {
                        featuresByProduct[feature.polar_product_id] = [];
                    }
                    featuresByProduct[feature.polar_product_id].push(feature);
                });
                setFeatures(featuresByProduct);
            }
        } catch (error) {
            console.error("Error loading features:", error);
        }
    };

    const loadSettings = async () => {
        try {
            const { data: settingsData } = await supabase
                .from("pricing_settings")
                .select("*")
                .single();

            if (settingsData) {
                setSettings(settingsData);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const saveSettings = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("pricing_settings")
                .update({
                    page_title: settings.page_title,
                    page_subtitle: settings.page_subtitle,
                    yearly_savings_percent: settings.yearly_savings_percent,
                    show_monthly: settings.show_monthly,
                    show_yearly: settings.show_yearly,
                })
                .eq("id", settings.id);

            if (error) throw error;
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const addFeature = async (productId: string, productName: string) => {
        try {
            const currentFeatures = features[productId] || [];
            const { data, error } = await supabase
                .from("pricing_product_features")
                .insert({
                    polar_product_id: productId,
                    polar_product_name: productName,
                    feature_text: "New Feature",
                    sort_order: currentFeatures.length + 1,
                })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setFeatures({
                    ...features,
                    [productId]: [...currentFeatures, data],
                });
            }
        } catch (error) {
            console.error("Error adding feature:", error);
            alert("Failed to add feature");
        }
    };

    const updateFeature = async (feature: ProductFeature) => {
        try {
            const { error } = await supabase
                .from("pricing_product_features")
                .update({
                    feature_text: feature.feature_text,
                    is_enabled: feature.is_enabled,
                })
                .eq("id", feature.id);

            if (error) throw error;
        } catch (error) {
            console.error("Error updating feature:", error);
            alert("Failed to update feature");
        }
    };

    const deleteFeature = async (featureId: string, productId: string) => {
        if (!confirm("Are you sure you want to delete this feature?")) return;

        try {
            const { error } = await supabase
                .from("pricing_product_features")
                .delete()
                .eq("id", featureId);

            if (error) throw error;

            setFeatures({
                ...features,
                [productId]: features[productId].filter((f) => f.id !== featureId),
            });
        } catch (error) {
            console.error("Error deleting feature:", error);
            alert("Failed to delete feature");
        }
    };

    const syncWithPolar = async () => {
        setSyncing(true);
        try {
            await loadPolarProducts();
            alert("Synced with Polar successfully!");
        } catch (error) {
            console.error("Error syncing with Polar:", error);
            alert("Failed to sync with Polar");
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading pricing data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}
            
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Pricing Management</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Products and prices come from Polar. Manage feature descriptions here.
                    </p>
                </div>
                <Button onClick={syncWithPolar} disabled={syncing} variant="outline">
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync with Polar'}
                </Button>
            </div>

            <Tabs defaultValue="settings" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="settings">Page Settings</TabsTrigger>
                    <TabsTrigger value="features">Product Features</TabsTrigger>
                </TabsList>

                <TabsContent value="settings">
                    {settings && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Page Settings</CardTitle>
                                <CardDescription>
                                    Customize the pricing page title, subtitle, and options
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="page_title">Page Title</Label>
                                    <Input
                                        id="page_title"
                                        value={settings.page_title}
                                        onChange={(e) =>
                                            setSettings({ ...settings, page_title: e.target.value })
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="page_subtitle">Page Subtitle</Label>
                                    <Textarea
                                        id="page_subtitle"
                                        value={settings.page_subtitle}
                                        onChange={(e) =>
                                            setSettings({ ...settings, page_subtitle: e.target.value })
                                        }
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="yearly_savings">Yearly Savings Percent</Label>
                                    <Input
                                        id="yearly_savings"
                                        type="number"
                                        value={settings.yearly_savings_percent}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                yearly_savings_percent: parseInt(e.target.value),
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show_monthly"
                                        checked={settings.show_monthly}
                                        onCheckedChange={(checked) =>
                                            setSettings({ ...settings, show_monthly: checked })
                                        }
                                    />
                                    <Label htmlFor="show_monthly">Show Monthly Billing</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show_yearly"
                                        checked={settings.show_yearly}
                                        onCheckedChange={(checked) =>
                                            setSettings({ ...settings, show_yearly: checked })
                                        }
                                    />
                                    <Label htmlFor="show_yearly">Show Yearly Billing</Label>
                                </div>

                                <Button onClick={saveSettings} disabled={saving}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saving ? "Saving..." : "Save Settings"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="features">
                    {polarProducts.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Products Found</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                    {error 
                                        ? "There was an error loading products from Polar. Check your API credentials and try syncing again."
                                        : "No Polar products found. Make sure you have created products in your Polar dashboard with recurring prices (monthly or yearly)."}
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <Button onClick={syncWithPolar} disabled={syncing}>
                                        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                                        {syncing ? 'Syncing...' : 'Sync with Polar'}
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => window.open('https://polar.sh', '_blank')}
                                    >
                                        Open Polar Dashboard
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {polarProducts.map((product) => (
                                <Card key={product.id}>
                                    <CardHeader>
                                        <CardTitle>{product.name}</CardTitle>
                                        <CardDescription>
                                            {product.description || 'No description from Polar'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="border-t pt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">Feature Descriptions</h3>
                                                <Button
                                                    size="sm"
                                                    onClick={() => addFeature(product.id, product.name)}
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Feature
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {(features[product.id] || []).map((feature) => (
                                                    <div
                                                        key={feature.id}
                                                        className="flex items-center gap-2 p-2 border rounded"
                                                    >
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            value={feature.feature_text}
                                                            onChange={(e) => {
                                                                const updated = {
                                                                    ...feature,
                                                                    feature_text: e.target.value,
                                                                };
                                                                setFeatures({
                                                                    ...features,
                                                                    [product.id]: features[product.id].map(
                                                                        (f) => (f.id === feature.id ? updated : f)
                                                                    ),
                                                                });
                                                            }}
                                                            onBlur={() => updateFeature(feature)}
                                                            className="flex-1"
                                                        />
                                                        <Switch
                                                            checked={feature.is_enabled}
                                                            onCheckedChange={(checked) => {
                                                                const updated = {
                                                                    ...feature,
                                                                    is_enabled: checked,
                                                                };
                                                                setFeatures({
                                                                    ...features,
                                                                    [product.id]: features[product.id].map(
                                                                        (f) => (f.id === feature.id ? updated : f)
                                                                    ),
                                                                });
                                                                updateFeature(updated);
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                deleteFeature(feature.id, product.id)
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {(!features[product.id] || features[product.id].length === 0) && (
                                                    <p className="text-sm text-muted-foreground text-center py-4">
                                                        No features added yet. Click "Add Feature" to get started.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
