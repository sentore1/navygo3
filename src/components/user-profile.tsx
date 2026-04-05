"use client";
import { useState, useEffect } from "react";
import { UserCircle, Settings, LogOut, Award, Target } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { createClient } from "../../supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserProfile() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

        setUser({
          ...user,
          profile: data || {},
        });
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full relative h-10 w-10 border border-border bg-background hover:bg-accent hover:text-accent-foreground"
        >
          {loading ? (
            <div className="animate-pulse">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary animate-ping"></span>
            </div>
          ) : (
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={user?.profile?.avatar_url || user?.profile?.image}
                alt={user?.profile?.name || user?.email}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(user?.profile?.name || user?.email || "")}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        {user && (
          <>
            <DropdownMenuLabel className="font-normal p-2 rounded-md bg-muted/50">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.profile?.name || user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="cursor-pointer rounded-md flex items-center h-9 px-2"
              onClick={() => router.push("/dashboard")}
            >
              <Target className="mr-2 h-4 w-4" />
              My Goals
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-md flex items-center h-9 px-2"
              onClick={() => router.push("/achievements")}
            >
              <Award className="mr-2 h-4 w-4" />
              Achievements
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-md flex items-center h-9 px-2"
              onClick={() => router.push("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:text-red-500 rounded-md flex items-center h-9 px-2"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
