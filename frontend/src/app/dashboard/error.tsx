"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

// Catches render-time errors anywhere under /dashboard (e.g. the transient
// "unexpected response from the server" Next.js's router can throw when a
// navigation races an in-flight one) so a crash shows a recoverable message
// inside the existing NavBar/Sidebar shell instead of a blank/broken page.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-4">
      <div>
        <h1 className="text-page-heading font-semibold text-ink">Something went wrong</h1>
        <p className="text-page-subheading text-muted-foreground">
          {error.message || "An unexpected error occurred."}
        </p>
      </div>
      <Button variant="brief-secondary" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
