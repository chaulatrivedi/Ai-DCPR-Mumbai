"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

// Server Actions that succeed redirect immediately (createProject,
// restoreProject), so there's no client render to fire a toast from at the
// moment of success. Flagging success via a one-shot query param on the
// destination page is the standard workaround.
export function CreatedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("created") === "true") {
      toast.success("Project created.");
      router.replace(window.location.pathname);
    }
  }, [searchParams, router]);

  return null;
}
