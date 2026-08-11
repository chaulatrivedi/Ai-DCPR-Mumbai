"use client";

import { useState } from "react";

import { softDeleteProject } from "../actions";
import { Button } from "@/components/ui/button";

// DESIGN_BRIEF.md §5 build-now scope doesn't include a Dialog/modal
// component, so the confirmation step required by Task 3.3 is an inline
// two-step affordance ("dialog or equivalent") built from existing button
// tokens instead of a new bespoke component.
export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        Delete
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-body text-muted-foreground">Delete this project?</span>
      <form action={softDeleteProject.bind(null, projectId)}>
        <Button type="submit" variant="destructive">
          Delete
        </Button>
      </form>
      <Button variant="brief-secondary" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
