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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function EnvironmentCheck() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<any>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const checkEnvironment = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try the new environment check function
      try {
        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-check-environment",
          {
            body: {},
          },
        );

        if (error) {
          throw error;
        }

        setEnvStatus(data);
        return;
      } catch (envError) {
        console.warn(
          "New environment check failed, falling back to database check",
          envError,
        );
      }

      // Fallback to the database check
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-check-database",
        {
          body: {},
        },
      );

      if (error) {
        setError(error.message);
      } else {
        setEnvStatus({
          environment: {
            variables: data.environment,
            databaseConnected: true,
            tables: {
              users: data.user?.exists,
              goals: data.goals?.accessible,
              milestones: data.milestones?.accessible,
              progress_logs: data.progress_logs?.accessible,
              subscriptions: data.subscriptions?.accessible,
            },
          },
          user: data.user?.data,
        });

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
      setError(err.message || "An error occurred checking the environment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnvironment();
  }, []);

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle2 className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-1"
        onClick={() => router.push("/dashboard")}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-6">Environment Check</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Environment Variables
            </CardTitle>
            <CardDescription>
              Checking required environment variables
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : envStatus ? (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Supabase</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SUPABASE_URL</span>
                    <StatusIcon
                      status={envStatus.environment?.variables?.SUPABASE_URL}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SUPABASE_ANON_KEY</span>
                    <StatusIcon
                      status={
                        envStatus.environment?.variables?.SUPABASE_ANON_KEY
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SUPABASE_SERVICE_KEY</span>
                    <StatusIcon
                      status={
                        envStatus.environment?.variables?.SUPABASE_SERVICE_KEY
                      }
                    />
                  </div>
                </div>

                <h3 className="font-medium text-lg mt-4">Stripe</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">STRIPE_SECRET_KEY</span>
                    <StatusIcon
                      status={
                        envStatus.environment?.variables?.STRIPE_SECRET_KEY
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">STRIPE_WEBHOOK_SECRET</span>
                    <StatusIcon
                      status={
                        envStatus.environment?.variables?.STRIPE_WEBHOOK_SECRET
                      }
                    />
                  </div>
                </div>

                <h3 className="font-medium text-lg mt-4">OpenAI</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OPENAI_API_KEY</span>
                    <StatusIcon
                      status={envStatus.environment?.variables?.OPENAI_API_KEY}
                    />
                  </div>
                </div>

                <h3 className="font-medium text-lg mt-4">Polar</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">POLAR_API_KEY</span>
                    <StatusIcon
                      status={envStatus.environment?.variables?.POLAR_API_KEY}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">POLAR_ORGANIZATION_ID</span>
                    <StatusIcon
                      status={
                        envStatus.environment?.variables?.POLAR_ORGANIZATION_ID
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">POLAR_WEBHOOK_SECRET</span>
                    <StatusIcon
                      status={
                        envStatus.environment?.variables?.POLAR_WEBHOOK_SECRET
                      }
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Database Status
            </CardTitle>
            <CardDescription>
              Checking database connectivity and tables
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : envStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Database Connection:</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      status={envStatus.environment?.databaseConnected}
                    />
                    <span>
                      {envStatus.environment?.databaseConnected
                        ? "Connected"
                        : "Not Connected"}
                    </span>
                  </div>
                </div>

                <h3 className="font-medium text-lg mt-4">Tables</h3>
                <div className="space-y-2">
                  {Object.entries(envStatus.environment?.tables || {}).map(
                    ([table, exists]) => (
                      <div
                        key={table}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{table}</span>
                        <StatusIcon status={exists as boolean} />
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="w-full mt-6">
        <CardHeader>
          <CardTitle>Environment Summary</CardTitle>
          <CardDescription>
            Overall status of your environment configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : envStatus ? (
            <div>
              {!envStatus.environment?.variables?.SUPABASE_URL ||
              !envStatus.environment?.variables?.SUPABASE_ANON_KEY ||
              !envStatus.environment?.variables?.SUPABASE_SERVICE_KEY ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Critical Issue</AlertTitle>
                  <AlertDescription>
                    One or more required Supabase environment variables are
                    missing. The application will not function correctly.
                  </AlertDescription>
                </Alert>
              ) : null}

              {!envStatus.environment?.databaseConnected ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Critical Issue</AlertTitle>
                  <AlertDescription>
                    Cannot connect to the database. Check your Supabase
                    configuration.
                  </AlertDescription>
                </Alert>
              ) : null}

              {!envStatus.environment?.variables?.STRIPE_SECRET_KEY ? (
                <Alert variant="default" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Stripe API key is missing. Payment functionality will not
                    work.
                  </AlertDescription>
                </Alert>
              ) : null}

              {!envStatus.environment?.variables?.OPENAI_API_KEY ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    OpenAI API key is missing. AI goal generation will use
                    fallback methods.
                  </AlertDescription>
                </Alert>
              ) : null}

              {!envStatus.environment?.variables?.POLAR_API_KEY ? (
                <Alert variant="default" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Polar API key is missing. Polar subscription functionality
                    will be limited.
                  </AlertDescription>
                </Alert>
              ) : null}

              {envStatus.environment?.databaseConnected &&
              envStatus.environment?.variables?.SUPABASE_URL &&
              envStatus.environment?.variables?.SUPABASE_ANON_KEY &&
              envStatus.environment?.variables?.SUPABASE_SERVICE_KEY ? (
                <Alert
                  variant="default"
                  className="bg-green-50 border-green-200 mb-4"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">
                    Core Environment Ready
                  </AlertTitle>
                  <AlertDescription className="text-green-600">
                    Basic Supabase configuration is correct. The application
                    should function.
                  </AlertDescription>
                </Alert>
              ) : null}
            </div>
          ) : null}
        </CardContent>
        <CardFooter>
          <Button
            onClick={checkEnvironment}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Recheck Environment"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
