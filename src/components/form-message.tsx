import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  if (!message) return null;

  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in message && (
        <Alert variant="default" className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            {message.success}
          </AlertDescription>
        </Alert>
      )}
      {"error" in message && (
        <div className="text-red-600 text-sm text-center">
          {message.error}
        </div>
      )}
      {"message" in message && (
        <Alert>
          <AlertDescription>{message.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
