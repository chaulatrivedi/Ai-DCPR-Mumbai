"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  created: "Project created.",
  updated: "Saved.",
  restored: "Project restored.",
};

// Server Actions that succeed redirect immediately (createProject,
// updateProject, restoreProject), so there's no client render to fire a
// toast from at the moment of success. Flagging success via a one-shot
// query param on the destination page is the standard workaround.
export function ActionToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    for (const [param, message] of Object.entries(MESSAGES)) {
      if (searchParams.get(param) === "true") {
        toast.success(message);
        router.replace(window.location.pathname);
        return;
      }
    }
  }, [searchParams, router]);

  return null;
}
