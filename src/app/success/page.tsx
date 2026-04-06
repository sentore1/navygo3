import { Suspense } from "react";
import SuccessContent from "./success-content";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 flex justify-center"><div className="h-4 w-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
