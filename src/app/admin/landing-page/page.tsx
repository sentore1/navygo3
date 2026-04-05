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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type,
  Layout,
  Star,
  MessageSquare,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export default function LandingPageCMS() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // State for different sections
  const [sections, setSections] = useState<any[]>([]);
  const [heroSettings, setHeroSettings] = useState<any>(null);
  const [headerSettings, setHeaderSettings] = useState<any>(null);
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [ctaSections, setCtaSections] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<string>("");
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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
      await loadAllData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadSections(),
      loadHeroSettings(),
      loadHeaderSettings(),
      loadFooterSettings(),
      loadTestimonials(),
      loadFeatures(),
      loadCTASections(),
      loadSubscribers(),
    ]);
  };

  const loadSections = async () => {
    const { data, error } = await supabase
      .from("landing_sections")
      .select("*")
      .order("display_order");
    if (!error && data) setSections(data);
  };

  const loadHeroSettings = async () => {
    const { data, error } = await supabase
      .from("hero_settings")
      .select("*")
      .single();
    
    if (error) {
      console.error("Error loading hero settings:", error);
      // If no data exists, create default settings
      if (error.code === 'PGRST116') {
        // No rows returned, insert default
        const { data: newData, error: insertError } = await supabase
          .from("hero_settings")
          .insert({
            title: 'Navy Goal',
            subtitle: 'Set meaningful goals, track daily progress, and celebrate milestones with our visual goal tracking platform.',
            title_font_family: 'Georgia Pro, Georgia, serif',
            title_font_size: 'clamp(3rem, 12vw, 10rem)',
            subtitle_font_size: 'text-base sm:text-lg',
            show_avatars: true,
            show_rating: true,
            rating_value: 4.9,
            rating_count: 200
          })
          .select()
          .single();
        
        if (!insertError && newData) {
          setHeroSettings(newData);
        }
      }
    } else if (data) {
      setHeroSettings(data);
    }
  };

  const loadHeaderSettings = async () => {
    const { data, error } = await supabase
      .from("header_settings")
      .select("*")
      .single();
    if (!error && data) setHeaderSettings(data);
  };

  const loadFooterSettings = async () => {
    const { data, error } = await supabase
      .from("footer_settings")
      .select("*")
      .single();
    if (!error && data) setFooterSettings(data);
  };

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("display_order");
    if (!error && data) setTestimonials(data);
  };

  const loadFeatures = async () => {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("display_order");
    if (!error && data) setFeatures(data);
  };

  const loadCTASections = async () => {
    const { data, error} = await supabase
      .from("cta_sections")
      .select("*")
      .order("display_order");
    if (!error && data) setCtaSections(data);
  };

  const loadSubscribers = async () => {
    const { data, error } = await supabase
      .from("email_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (!error && data) setSubscribers(data);
  };

  const toggleSectionVisibility = async (sectionId: string, isEnabled: boolean) => {
    try {
      setToggling(sectionId);
      const { error } = await supabase
        .from("landing_sections")
        .update({ is_enabled: !isEnabled, updated_at: new Date().toISOString() })
        .eq("id", sectionId);

      if (error) {
        console.error("Error toggling section:", error);
        alert("Error updating section visibility: " + error.message);
        return;
      }

      // Reload sections to reflect changes
      await loadSections();
      
      // Force a small delay to ensure UI updates
      setTimeout(() => {
        console.log("Section visibility toggled successfully");
      }, 100);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred");
    } finally {
      setToggling(null);
    }
  };

  const saveHeroSettings = async () => {
    if (!heroSettings) return;
    setSaving(true);
    
    try {
      // Check if we have an ID (existing record)
      if (heroSettings.id) {
        // Update existing record
        const { error } = await supabase
          .from("hero_settings")
          .update({
            title: heroSettings.title,
            subtitle: heroSettings.subtitle,
            title_font_family: heroSettings.title_font_family,
            title_font_size: heroSettings.title_font_size,
            subtitle_font_size: heroSettings.subtitle_font_size,
            show_avatars: heroSettings.show_avatars,
            show_rating: heroSettings.show_rating,
            rating_value: heroSettings.rating_value,
            rating_count: heroSettings.rating_count,
            updated_at: new Date().toISOString()
          })
          .eq("id", heroSettings.id);

        if (error) throw error;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("hero_settings")
          .insert({
            title: heroSettings.title,
            subtitle: heroSettings.subtitle,
            title_font_family: heroSettings.title_font_family,
            title_font_size: heroSettings.title_font_size,
            subtitle_font_size: heroSettings.subtitle_font_size,
            show_avatars: heroSettings.show_avatars,
            show_rating: heroSettings.show_rating,
            rating_value: heroSettings.rating_value,
            rating_count: heroSettings.rating_count
          })
          .select()
          .single();

        if (error) throw error;
        if (data) setHeroSettings(data);
      }
      
      alert("Hero settings saved successfully!");
      // Reload to confirm
      await loadHeroSettings();
    } catch (error: any) {
      console.error("Error saving hero settings:", error);
      alert("Error saving hero settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const saveHeaderSettings = async () => {
    if (!headerSettings) return;
    setSaving(true);
    const { error } = await supabase
      .from("header_settings")
      .update(headerSettings)
      .eq("id", headerSettings.id);

    if (error) {
      alert("Error saving header settings: " + error.message);
    } else {
      alert("Header settings saved successfully!");
    }
    setSaving(false);
  };

  const saveFooterSettings = async () => {
    if (!footerSettings) return;
    setSaving(true);
    const { error } = await supabase
      .from("footer_settings")
      .update(footerSettings)
      .eq("id", footerSettings.id);

    if (error) {
      alert("Error saving footer settings: " + error.message);
    } else {
      alert("Footer settings saved successfully!");
    }
    setSaving(false);
  };

  const openDialog = (type: string, item: any = null) => {
    setDialogType(type);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const saveTestimonial = async (data: any) => {
    setSaving(true);
    if (editingItem) {
      const { error } = await supabase
        .from("testimonials")
        .update(data)
        .eq("id", editingItem.id);
      if (error) alert("Error: " + error.message);
    } else {
      const { error } = await supabase.from("testimonials").insert(data);
      if (error) alert("Error: " + error.message);
    }
    await loadTestimonials();
    setDialogOpen(false);
    setSaving(false);
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (!error) await loadTestimonials();
  };

  const saveFeature = async (data: any) => {
    setSaving(true);
    if (editingItem) {
      const { error } = await supabase
        .from("features")
        .update(data)
        .eq("id", editingItem.id);
      if (error) alert("Error: " + error.message);
    } else {
      const { error } = await supabase.from("features").insert(data);
      if (error) alert("Error: " + error.message);
    }
    await loadFeatures();
    setDialogOpen(false);
    setSaving(false);
  };

  const deleteFeature = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) return;
    const { error } = await supabase.from("features").delete().eq("id", id);
    if (!error) await loadFeatures();
  };

  const saveCTA = async (data: any) => {
    setSaving(true);
    if (editingItem) {
      const { error } = await supabase
        .from("cta_sections")
        .update(data)
        .eq("id", editingItem.id);
      if (error) alert("Error: " + error.message);
    } else {
      const { error } = await supabase.from("cta_sections").insert(data);
      if (error) alert("Error: " + error.message);
    }
    await loadCTASections();
    setDialogOpen(false);
    setSaving(false);
  };

  const deleteCTA = async (id: string) => {
    if (!confirm("Are you sure you want to delete this CTA section?")) return;
    const { error } = await supabase.from("cta_sections").delete().eq("id", id);
    if (!error) await loadCTASections();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading CMS...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-1"
        onClick={() => router.push("/admin")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Admin
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Landing Page CMS
          </CardTitle>
          <CardDescription>
            Manage all content on your landing page from one place
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Sections</CardTitle>
              <CardDescription>
                Control which sections appear and their order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section.id}>
                      <TableCell className="font-medium">
                        {section.section_name}
                      </TableCell>
                      <TableCell>{section.display_order}</TableCell>
                      <TableCell>
                        <Badge variant={section.is_enabled ? "default" : "secondary"}>
                          {section.is_enabled ? "Visible" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={toggling === section.id}
                          onClick={() =>
                            toggleSectionVisibility(section.id, section.is_enabled)
                          }
                        >
                          {toggling === section.id ? (
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : section.is_enabled ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Settings</CardTitle>
              <CardDescription>Customize the hero section title, fonts, and display options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!heroSettings ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading hero settings...</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    If this persists, run SETUP_HERO_SECTION_NOW.sql in Supabase
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={heroSettings.title || ""}
                      onChange={(e) =>
                        setHeroSettings({
                          ...heroSettings,
                          title: e.target.value,
                        })
                      }
                      placeholder="Navy Goal"
                    />
                    <p className="text-xs text-muted-foreground">The main heading displayed in the hero section</p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Hero Subtitle</Label>
                    <Textarea
                      value={heroSettings.subtitle || ""}
                      onChange={(e) =>
                        setHeroSettings({
                          ...heroSettings,
                          subtitle: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Set meaningful goals, track daily progress..."
                    />
                    <p className="text-xs text-muted-foreground">The subtitle text below the main heading</p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Title Font Family</Label>
                    <Select
                      value={heroSettings.title_font_family || "Georgia Pro, Georgia, serif"}
                      onValueChange={(value) =>
                        setHeroSettings({
                          ...heroSettings,
                          title_font_family: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Georgia Pro, Georgia, serif">Georgia (Serif)</SelectItem>
                        <SelectItem value="Inter, system-ui, sans-serif">Inter (Sans-serif)</SelectItem>
                        <SelectItem value="Helvetica, Arial, sans-serif">Helvetica (Sans-serif)</SelectItem>
                        <SelectItem value="Times New Roman, Times, serif">Times New Roman (Serif)</SelectItem>
                        <SelectItem value="Courier New, monospace">Courier New (Monospace)</SelectItem>
                        <SelectItem value="Playfair Display, serif">Playfair Display (Serif)</SelectItem>
                        <SelectItem value="Montserrat, sans-serif">Montserrat (Sans-serif)</SelectItem>
                        <SelectItem value="Roboto, sans-serif">Roboto (Sans-serif)</SelectItem>
                        <SelectItem value="Poppins, sans-serif">Poppins (Sans-serif)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose the font style for the hero title</p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Title Font Size (CSS)</Label>
                    <Input
                      value={heroSettings.title_font_size || ""}
                      onChange={(e) =>
                        setHeroSettings({
                          ...heroSettings,
                          title_font_size: e.target.value,
                        })
                      }
                      placeholder="clamp(3rem, 12vw, 10rem)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use CSS values like: clamp(3rem, 12vw, 10rem), 5rem, 80px, etc.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Subtitle Font Size (Tailwind Classes)</Label>
                    <Select
                      value={heroSettings.subtitle_font_size || "text-base sm:text-lg"}
                      onValueChange={(value) =>
                        setHeroSettings({
                          ...heroSettings,
                          subtitle_font_size: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-xs sm:text-sm">Extra Small</SelectItem>
                        <SelectItem value="text-sm sm:text-base">Small</SelectItem>
                        <SelectItem value="text-base sm:text-lg">Medium (Default)</SelectItem>
                        <SelectItem value="text-lg sm:text-xl">Large</SelectItem>
                        <SelectItem value="text-xl sm:text-2xl">Extra Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Display Options</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Avatars</Label>
                        <p className="text-xs text-muted-foreground">Display user avatars below the subtitle</p>
                      </div>
                      <Switch
                        checked={heroSettings.show_avatars}
                        onCheckedChange={(checked) =>
                          setHeroSettings({
                            ...heroSettings,
                            show_avatars: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Rating</Label>
                        <p className="text-xs text-muted-foreground">Display star rating and review count</p>
                      </div>
                      <Switch
                        checked={heroSettings.show_rating}
                        onCheckedChange={(checked) =>
                          setHeroSettings({
                            ...heroSettings,
                            show_rating: checked,
                          })
                        }
                      />
                    </div>

                    {heroSettings.show_rating && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Rating Value (1-5)</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={heroSettings.rating_value || 4.9}
                              onChange={(e) =>
                                setHeroSettings({
                                  ...heroSettings,
                                  rating_value: parseFloat(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Review Count</Label>
                            <Input
                              type="number"
                              min="0"
                              value={heroSettings.rating_count || 200}
                              onChange={(e) =>
                                setHeroSettings({
                                  ...heroSettings,
                                  rating_count: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <Button onClick={saveHeroSettings} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Hero Settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header Tab */}
        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Settings</CardTitle>
              <CardDescription>Customize your site header and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {headerSettings && (
                <>
                  <div className="grid gap-2">
                    <Label>Logo Text</Label>
                    <Input
                      value={headerSettings.logo_text || ""}
                      onChange={(e) =>
                        setHeaderSettings({
                          ...headerSettings,
                          logo_text: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Logo Icon</Label>
                    <Switch
                      checked={headerSettings.show_logo_icon}
                      onCheckedChange={(checked) =>
                        setHeaderSettings({
                          ...headerSettings,
                          show_logo_icon: checked,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={headerSettings.cta_button_text || ""}
                      onChange={(e) =>
                        setHeaderSettings({
                          ...headerSettings,
                          cta_button_text: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>CTA Button Link</Label>
                    <Input
                      value={headerSettings.cta_button_link || ""}
                      onChange={(e) =>
                        setHeaderSettings({
                          ...headerSettings,
                          cta_button_link: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={saveHeaderSettings} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Header Settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Tab */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
              <CardDescription>Customize your site footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {footerSettings && (
                <>
                  <div className="grid gap-2">
                    <Label>Company Name</Label>
                    <Input
                      value={footerSettings.company_name || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          company_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Large Text</Label>
                    <Switch
                      checked={footerSettings.show_large_text}
                      onCheckedChange={(checked) =>
                        setFooterSettings({
                          ...footerSettings,
                          show_large_text: checked,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Large Text</Label>
                    <Input
                      value={footerSettings.large_text || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          large_text: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Copyright Text</Label>
                    <Input
                      value={footerSettings.copyright_text || ""}
                      onChange={(e) =>
                        setFooterSettings({
                          ...footerSettings,
                          copyright_text: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={saveFooterSettings} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Footer Settings"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Testimonials</CardTitle>
                  <CardDescription>Manage customer testimonials</CardDescription>
                </div>
                <Button onClick={() => openDialog("testimonial")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Testimonial
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell className="font-medium">{testimonial.name}</TableCell>
                      <TableCell>{testimonial.company}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={testimonial.is_enabled ? "default" : "secondary"}>
                          {testimonial.is_enabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog("testimonial", testimonial)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTestimonial(testimonial.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Tab */}
        <TabsContent value="cta">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Call-to-Action Sections</CardTitle>
                  <CardDescription>Manage CTA sections</CardDescription>
                </div>
                <Button onClick={() => openDialog("cta")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add CTA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Button Text</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ctaSections.map((cta) => (
                    <TableRow key={cta.id}>
                      <TableCell className="font-medium">{cta.title}</TableCell>
                      <TableCell>{cta.button_text}</TableCell>
                      <TableCell>
                        <Badge variant={cta.is_enabled ? "default" : "secondary"}>
                          {cta.is_enabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog("cta", cta)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCTA(cta.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Email Subscribers</CardTitle>
              <CardDescription>
                View and manage email subscribers from the landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                Total subscribers: {subscribers.length}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscriber.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No subscribers yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs for editing */}
      <TestimonialDialog
        open={dialogOpen && dialogType === "testimonial"}
        onClose={() => setDialogOpen(false)}
        onSave={saveTestimonial}
        testimonial={editingItem}
        saving={saving}
      />

      <CTADialog
        open={dialogOpen && dialogType === "cta"}
        onClose={() => setDialogOpen(false)}
        onSave={saveCTA}
        cta={editingItem}
        saving={saving}
      />
    </div>
  );
}

// Testimonial Dialog Component
function TestimonialDialog({ open, onClose, onSave, testimonial, saving }: any) {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    company: "",
    testimonial: "",
    avatar_url: "",
    rating: 5,
    show_avatar: true,
    is_enabled: true,
    display_order: 0,
  });

  useEffect(() => {
    if (testimonial) {
      setFormData(testimonial);
    } else {
      setFormData({
        name: "",
        designation: "",
        company: "",
        testimonial: "",
        avatar_url: "",
        rating: 5,
        show_avatar: true,
        is_enabled: true,
        display_order: 0,
      });
    }
  }, [testimonial, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {testimonial ? "Edit Testimonial" : "Add Testimonial"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Designation</Label>
              <Input
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Testimonial</Label>
            <Textarea
              value={formData.testimonial}
              onChange={(e) =>
                setFormData({ ...formData, testimonial: e.target.value })
              }
              rows={4}
            />
          </div>
          <div className="grid gap-2">
            <Label>Avatar URL</Label>
            <Input
              value={formData.avatar_url}
              onChange={(e) =>
                setFormData({ ...formData, avatar_url: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Rating (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label>Show Avatar</Label>
              <Switch
                checked={formData.show_avatar}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_avatar: checked })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch
              checked={formData.is_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_enabled: checked })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// CTA Dialog Component
function CTADialog({ open, onClose, onSave, cta, saving }: any) {
  const [formData, setFormData] = useState({
    section_key: "",
    title: "",
    description: "",
    button_text: "",
    button_link: "",
    show_email_form: false,
    show_stars: false,
    is_enabled: true,
    display_order: 0,
  });

  useEffect(() => {
    if (cta) {
      setFormData(cta);
    } else {
      setFormData({
        section_key: "",
        title: "",
        description: "",
        button_text: "",
        button_link: "",
        show_email_form: false,
        show_stars: false,
        is_enabled: true,
        display_order: 0,
      });
    }
  }, [cta, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cta ? "Edit CTA Section" : "Add CTA Section"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Section Key (unique identifier)</Label>
            <Input
              value={formData.section_key}
              onChange={(e) =>
                setFormData({ ...formData, section_key: e.target.value })
              }
              disabled={!!cta}
            />
          </div>
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Button Text</Label>
              <Input
                value={formData.button_text}
                onChange={(e) =>
                  setFormData({ ...formData, button_text: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Button Link</Label>
              <Input
                value={formData.button_link}
                onChange={(e) =>
                  setFormData({ ...formData, button_link: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Email Form</Label>
            <Switch
              checked={formData.show_email_form}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_email_form: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Stars</Label>
            <Switch
              checked={formData.show_stars}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, show_stars: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Enabled</Label>
            <Switch
              checked={formData.is_enabled}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_enabled: checked })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
