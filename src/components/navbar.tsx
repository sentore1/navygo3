import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { Target, UserCircle, LogIn, UserPlus, CreditCard } from "lucide-react";
import UserProfile from "./user-profile";

export default async function Navbar() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full bg-white py-2 sm:py-3">
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl sm:text-2xl font-bold flex items-center">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 mr-2 text-black" />
          <span>NavyGoal</span>
        </Link>
        <div className="flex gap-2 sm:gap-4 items-center">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <Button size="sm" className="text-xs sm:text-sm">My Goals</Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link href="/pricing" className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 rounded-full"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden md:inline">Pricing</span>
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-xs sm:text-sm rounded-full"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="flex items-center gap-1 text-xs sm:text-sm rounded-full">
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sign Up</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
