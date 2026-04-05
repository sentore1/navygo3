"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SubscriptionStatus from "@/components/subscription-status";
import NotificationPermission from "@/components/notification-permission";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar_url: "",
    display_name: "",
    show_on_leaderboard: false,
    notifications: {
      email: true,
      push: true,
      goalReminders: true,
      achievements: true,
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Get additional user data from the users table
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        const userData = {
          ...user,
          profile: data || {},
        };

        setUser(userData);
        setFormData({
          name: userData.profile?.name || "",
          email: userData.email || "",
          avatar_url: userData.profile?.avatar_url || "",
          display_name: userData.profile?.display_name || "",
          show_on_leaderboard: userData.profile?.show_on_leaderboard || false,
          notifications: userData.profile?.notifications || {
            email: true,
            push: true,
            goalReminders: true,
            achievements: true,
          },
        });
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // First, check if the user exists in the users table
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      // Prepare update data without notifications to avoid errors
      const userData = {
        name: formData.name,
        avatar_url: formData.avatar_url,
        email: formData.email,
        display_name: formData.display_name,
        show_on_leaderboard: formData.show_on_leaderboard,
        token_identifier: user.id, // Add token_identifier to fix not-null constraint
        updated_at: new Date().toISOString(),
      };

      if (checkError && checkError.code === "PGRST116") {
        // User doesn't exist, insert instead of update
        const { error } = await supabase.from("users").insert({
          id: user.id,
          ...userData,
        });
        if (error) throw error;
      } else {
        // User exists, update
        const { error } = await supabase
          .from("users")
          .update(userData)
          .eq("id", user.id);
        if (error) throw error;
      }

      // Update email if changed
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
      }

      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(`Error updating profile: ${error.message}`);
    } finally {
      // Add a small delay to make the loading state more noticeable
      setTimeout(() => {
        setSaving(false);
      }, 500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: value,
      },
    });
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    if (file.size > 1024 * 1024) {
      alert("File size must be less than 1MB");
      return;
    }

    try {
      // Create a temporary URL for immediate preview
      const objectUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        avatar_url: objectUrl,
      });

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update state with the permanent URL
      setFormData({
        ...formData,
        avatar_url: publicUrl,
      });

      // Auto-save the avatar to database
      await supabase
        .from("users")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      // Clean up temporary URL
      URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      alert(`Error uploading avatar: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Button
          variant="ghost"
          className="mb-4 flex items-center gap-1 opacity-50 pointer-events-none"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted animate-pulse"></div>
              Settings
            </CardTitle>
            <CardDescription>
              Loading your profile information...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse"></div>
              <div className="h-40 bg-muted rounded animate-pulse"></div>
              <div className="h-20 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-1"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="space-y-6">
              <div className="space-y-4 py-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2) ||
                          user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-2">Profile Picture</p>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAvatarUpload(file);
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                        >
                          Upload Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const seed = Math.random().toString(36).substring(7);
                            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                            setFormData({
                              ...formData,
                              avatar_url: avatarUrl,
                            });
                            // Auto-save to database
                            if (user) {
                              await supabase
                                .from("users")
                                .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
                                .eq("id", user.id);
                            }
                          }}
                        >
                          Generate Avatar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, GIF or PNG. 1MB max. Or generate a random avatar.
                      </p>
                    </div>
                  </div>
                  
                  {/* Avatar Style Picker */}
                  <div className="grid gap-3">
                    <Label>Choose Avatar Style</Label>
                    <div className="grid grid-cols-6 gap-3">
                      {[
                        { style: 'avataaars', label: 'Avataaars' },
                        { style: 'bottts', label: 'Robots' },
                        { style: 'fun-emoji', label: 'Emoji' },
                        { style: 'lorelei', label: 'Lorelei' },
                        { style: 'pixel-art', label: 'Pixel' },
                        { style: 'thumbs', label: 'Thumbs' },
                      ].map((avatarStyle) => {
                        const seed = formData.name || user.email.split('@')[0];
                        const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle.style}/svg?seed=${seed}`;
                        return (
                          <button
                            key={avatarStyle.style}
                            type="button"
                            onClick={async () => {
                              setFormData({ ...formData, avatar_url: avatarUrl });
                              // Auto-save to database
                              if (user) {
                                await supabase
                                  .from("users")
                                  .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
                                  .eq("id", user.id);
                              }
                            }}
                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all hover:border-primary ${
                              formData.avatar_url.includes(avatarStyle.style)
                                ? 'border-primary bg-primary/5'
                                : 'border-border'
                            }`}
                          >
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={avatarUrl} />
                              <AvatarFallback>?</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{avatarStyle.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="avatar_url">Custom Avatar URL (Optional)</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Or use the avatar styles above
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-on-leaderboard">
                      Show on Leaderboard
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Display your name and rank on the public leaderboard to motivate others.
                    </p>
                  </div>
                  <Switch
                    id="show-on-leaderboard"
                    checked={formData.show_on_leaderboard}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, show_on_leaderboard: checked })
                    }
                  />
                </div>
                <Separator />
                {formData.show_on_leaderboard && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="display_name">Leaderboard Display Name</Label>
                      <Input
                        id="display_name"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleChange}
                        placeholder={formData.name || "Enter a display name"}
                      />
                      <p className="text-xs text-muted-foreground">
                        This name will appear on the leaderboard. Leave empty to use your profile name.
                      </p>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">What will be shown?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your {formData.display_name ? 'display name' : 'name'}</li>
                    <li>• Your rank badge</li>
                    <li>• Your total score</li>
                    <li>• Number of completed goals</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Your email and other personal details will never be displayed.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4 py-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <NotificationPermission />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your account activity.
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on your device.
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="goal-reminders">Goal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminders about your daily goal progress.
                    </p>
                  </div>
                  <Switch
                    id="goal-reminders"
                    checked={formData.notifications.goalReminders}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("goalReminders", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="achievement-notifications">
                      Achievement Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you earn new achievements.
                    </p>
                  </div>
                  <Switch
                    id="achievement-notifications"
                    checked={formData.notifications.achievements}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("achievements", checked)
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="min-w-[120px] relative"
          >
            {saving ? (
              <>
                <span className="animate-pulse">Saving</span>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
                  <span
                    className="h-1.5 w-1.5 bg-primary-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 bg-primary-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="h-1.5 w-1.5 bg-primary-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </span>
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-6">
        <SubscriptionStatus />
      </div>
    </div>
  );
}
