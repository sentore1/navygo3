"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ban, LogOut } from "lucide-react";

export default function BlockedPage() {
  const supabase = createClient();
  const router = useRouter();
  const [blockReason, setBlockReason] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBlockStatus();
  }, []);

  const checkBlockStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("is_blocked, blocked_reason")
        .eq("id", user.id)
        .single();

      if (!userData?.is_blocked) {
        router.push("/dashboard");
        return;
      }

      setBlockReason(userData.blocked_reason || "No reason provided");
    } catch (error) {
      console.error("Error checking block status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-4 w-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Account Blocked</CardTitle>
          <CardDescription>
            Your account has been temporarily blocked by an administrator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
            <p className="text-sm text-gray-600">{blockReason}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              If you believe this is a mistake, please contact support at:
            </p>
            <p className="text-sm font-medium text-primary">
              support@navygoal.com
            </p>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
