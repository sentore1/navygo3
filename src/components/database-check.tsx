"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../supabase/client";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function DatabaseCheck() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const checkDatabase = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-check-database",
        {
          body: {},
        },
      );

      if (error) {
        setError(error.message);
      } else {
        setDbStatus(data);

        // Log the database status for debugging
        console.log("Database status:", data);

        // Check for critical issues
        const criticalIssues = [];
        if (!data.user?.exists) criticalIssues.push("User record missing");
        if (!data.goals?.accessible)
          criticalIssues.push("Goals table inaccessible");
        if (!data.milestones?.accessible)
          criticalIssues.push("Milestones table inaccessible");

        if (criticalIssues.length > 0) {
          toast({
            title: "Database issues detected",
            description: criticalIssues.join(", "),
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred checking the database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-black-500" />
          Database Status Check
        </CardTitle>
        <CardDescription>
          Checking your database connections and tables
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking database...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : dbStatus ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">User Table:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={dbStatus.user.exists} />
                <span>{dbStatus.user.exists ? "OK" : "Issue"}</span>
              </div>
            </div>
            {dbStatus.user.error && (
              <Alert variant="destructive" className="mt-1">
                <AlertDescription className="text-xs">
                  {dbStatus.user.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Goals Table:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={dbStatus.goals.accessible} />
                <span>{dbStatus.goals.accessible ? "OK" : "Issue"}</span>
              </div>
            </div>
            {dbStatus.goals.error && (
              <Alert variant="destructive" className="mt-1">
                <AlertDescription className="text-xs">
                  {dbStatus.goals.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <span className="font-medium">Subscriptions Table:</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={dbStatus.subscriptions.accessible} />
                <span>
                  {dbStatus.subscriptions.accessible ? "OK" : "Issue"}
                </span>
              </div>
            </div>
            {dbStatus.subscriptions.error && (
              <Alert variant="destructive" className="mt-1">
                <AlertDescription className="text-xs">
                  {dbStatus.subscriptions.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter>
        <Button onClick={checkDatabase} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Recheck Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
