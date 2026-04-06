"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Switch } from "../../../components/ui/switch";
import { Label } from "../../../components/ui/label";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2, Sparkles, CheckCircle } from "lucide-react";

interface ProductFeature {
  id: string;
  product_id: string;
  product_name: string;
  has_ai_access: boolean;
}

export default function ProductFeaturesPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<ProductFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('polar_product_features')
        .select('*')
        .order('product_name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleAIAccess = async (productId: string, currentValue: boolean) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('polar_product_features')
        .update({ has_ai_access: !currentValue, updated_at: new Date().toISOString() })
        .eq('product_id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.product_id === productId ? { ...p, has_ai_access: !currentValue } : p
      ));

      setMessage({ 
        type: 'success', 
        text: `AI access ${!currentValue ? 'enabled' : 'disabled'} for product. Active subscriptions updated.` 
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Product Features</h1>
        <p className="text-muted-foreground">
          Manage which subscription products include AI goal creation access
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{product.product_name}</span>
                {product.has_ai_access && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                    AI ENABLED
                  </span>
                )}
              </CardTitle>
              <CardDescription>Product ID: {product.product_id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className={`h-5 w-5 ${product.has_ai_access ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <div>
                    <Label className="text-sm font-medium">AI Goal Creation</Label>
                    <p className="text-xs text-muted-foreground">
                      {product.has_ai_access 
                        ? 'Subscribers can create goals with AI assistance' 
                        : 'AI features not included in this plan'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={product.has_ai_access}
                  onCheckedChange={() => toggleAIAccess(product.product_id, product.has_ai_access)}
                  disabled={saving}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No products found. Products are automatically synced from Polar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
