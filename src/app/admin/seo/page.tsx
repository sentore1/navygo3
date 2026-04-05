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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SEOSetting {
  id: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string[];
  og_image?: string;
  og_title?: string;
  og_description?: string;
  twitter_card?: string;
  robots?: string;
  canonical_url?: string;
}

export default function SEOManagement() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SEOSetting[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SEOSetting | null>(null);
  const [formData, setFormData] = useState<Partial<SEOSetting>>({
    page_path: "",
    title: "",
    description: "",
    keywords: [],
    robots: "index, follow",
    twitter_card: "summary_large_image",
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
      await loadSEOSettings();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadSEOSettings = async () => {
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .order("page_path");

    if (error) {
      console.error("Error loading SEO settings:", error);
      return;
    }

    setSeoSettings(data || []);
  };

  const handleSave = async () => {
    if (!formData.page_path || !formData.title || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Update existing
        const { error } = await supabase
          .from("seo_settings")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("seo_settings")
          .insert([formData]);

        if (error) throw error;
      }

      await loadSEOSettings();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving SEO settings:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SEO setting?")) return;

    try {
      const { error } = await supabase
        .from("seo_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await loadSEOSettings();
    } catch (error: any) {
      console.error("Error deleting SEO setting:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (item: SEOSetting) => {
    setEditingItem(item);
    setFormData(item);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      page_path: "",
      title: "",
      description: "",
      keywords: [],
      robots: "index, follow",
      twitter_card: "summary_large_image",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading SEO settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
          </Button>
          <h1 className="text-3xl font-bold">SEO Management</h1>
        </div>
        <Button onClick={() => {
          resetForm();
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" /> Add SEO Setting
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page SEO Settings</CardTitle>
          <CardDescription>
            Manage meta tags, Open Graph, and Twitter Card settings for each page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Path</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Robots</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoSettings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{setting.page_path}</TableCell>
                  <TableCell>{setting.title}</TableCell>
                  <TableCell className="max-w-md truncate">{setting.description}</TableCell>
                  <TableCell>{setting.robots}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(setting)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(setting.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {seoSettings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No SEO settings configured. Click "Add SEO Setting" to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SEO Settings Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit" : "Add"} SEO Setting</DialogTitle>
            <DialogDescription>
              Configure SEO meta tags for a specific page
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="page_path">Page Path *</Label>
              <Input
                id="page_path"
                placeholder="/about"
                value={formData.page_path}
                onChange={(e) => setFormData({ ...formData, page_path: e.target.value })}
                disabled={!!editingItem}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Page Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Page description for search engines"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="goal tracking, productivity, ai"
                value={formData.keywords?.join(", ") || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  keywords: e.target.value.split(",").map(k => k.trim()).filter(Boolean)
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="robots">Robots</Label>
              <Select
                value={formData.robots}
                onValueChange={(value) => setFormData({ ...formData, robots: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index, follow">Index, Follow</SelectItem>
                  <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                  <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                  <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_title">Open Graph Title</Label>
              <Input
                id="og_title"
                placeholder="Title for social media sharing"
                value={formData.og_title || ""}
                onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_description">Open Graph Description</Label>
              <Textarea
                id="og_description"
                placeholder="Description for social media sharing"
                value={formData.og_description || ""}
                onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image">Open Graph Image URL</Label>
              <Input
                id="og_image"
                placeholder="https://example.com/image.jpg"
                value={formData.og_image || ""}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="canonical_url">Canonical URL</Label>
              <Input
                id="canonical_url"
                placeholder="https://example.com/page"
                value={formData.canonical_url || ""}
                onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
