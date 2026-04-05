"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Upload } from "lucide-react";

interface FeatureItem {
  id: string;
  icon_name: string;
  text: string;
  item_order: number;
}

interface FeatureSection {
  id: string;
  section_order: number;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  items: FeatureItem[];
}

export default function FeaturesAdmin() {
  const supabase = createClient();
  const [sections, setSections] = useState<FeatureSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("features_sections")
        .select("*")
        .order("section_order");

      if (sectionsError) throw sectionsError;

      const sectionsWithItems = await Promise.all(
        (sectionsData || []).map(async (section: any) => {
          const { data: items } = await supabase
            .from("features_items")
            .select("*")
            .eq("section_id", section.id)
            .order("item_order");

          return { ...section, items: items || [] };
        })
      );

      setSections(sectionsWithItems);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (sectionId: string, updates: Partial<FeatureSection>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("features_sections")
        .update(updates)
        .eq("id", sectionId);

      if (error) throw error;
      await fetchSections();
    } catch (error) {
      console.error("Error updating section:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (itemId: string, text: string) => {
    try {
      const { error } = await supabase
        .from("features_items")
        .update({ text })
        .eq("id", itemId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const addItem = async (sectionId: string) => {
    try {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const maxOrder = Math.max(...section.items.map((i) => i.item_order), 0);

      const { error } = await supabase.from("features_items").insert({
        section_id: sectionId,
        icon_name: "Target",
        text: "New feature",
        item_order: maxOrder + 1,
      });

      if (error) throw error;
      await fetchSections();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Delete this feature item?")) return;

    try {
      const { error } = await supabase
        .from("features_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      await fetchSections();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleImageUpload = async (sectionId: string, file: File) => {
    try {
      // For now, just use a placeholder URL
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        await updateSection(sectionId, { image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Features Sections</h1>
        <p className="text-muted-foreground">
          Manage the "Track Your Progress" sections on the landing page
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle>Section {section.section_order}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={section.title}
                  onChange={(e) =>
                    setSections(
                      sections.map((s) =>
                        s.id === section.id ? { ...s, title: e.target.value } : s
                      )
                    )
                  }
                  onBlur={() => updateSection(section.id, { title: section.title })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={section.description}
                  onChange={(e) =>
                    setSections(
                      sections.map((s) =>
                        s.id === section.id
                          ? { ...s, description: e.target.value }
                          : s
                      )
                    )
                  }
                  onBlur={() =>
                    updateSection(section.id, { description: section.description })
                  }
                  rows={3}
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-sm font-medium">Image</label>
                <div className="flex items-center gap-4 mt-2">
                  {section.image_url && (
                    <img
                      src={section.image_url}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(section.id, file);
                      }}
                      className="mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Or enter image URL:
                    </p>
                    <Input
                      value={section.image_url}
                      onChange={(e) =>
                        setSections(
                          sections.map((s) =>
                            s.id === section.id
                              ? { ...s, image_url: e.target.value }
                              : s
                          )
                        )
                      }
                      onBlur={() =>
                        updateSection(section.id, { image_url: section.image_url })
                      }
                      placeholder="/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Feature Items</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addItem(section.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <select
                        value={item.icon_name}
                        onChange={async (e) => {
                          await supabase
                            .from("features_items")
                            .update({ icon_name: e.target.value })
                            .eq("id", item.id);
                          await fetchSections();
                        }}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        <option value="Target">Target</option>
                        <option value="TrendingUp">TrendingUp</option>
                        <option value="Calendar">Calendar</option>
                        <option value="Trophy">Trophy</option>
                        <option value="BarChart3">BarChart3</option>
                        <option value="Users">Users</option>
                      </select>
                      <Input
                        value={item.text}
                        onChange={(e) =>
                          setSections(
                            sections.map((s) =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    items: s.items.map((i) =>
                                      i.id === item.id
                                        ? { ...i, text: e.target.value }
                                        : i
                                    ),
                                  }
                                : s
                            )
                          )
                        }
                        onBlur={() => updateItem(item.id, item.text)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={section.is_active}
                  onChange={(e) =>
                    updateSection(section.id, { is_active: e.target.checked })
                  }
                  className="rounded"
                />
                <label className="text-sm">Active (show on landing page)</label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
