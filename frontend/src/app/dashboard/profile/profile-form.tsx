"use client";

import { useActionState } from "react";

import { updateDisplayName } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  email,
  displayName,
}: {
  email: string;
  displayName: string;
}) {
  const [state, formAction, pending] = useActionState(updateDisplayName, undefined);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" defaultValue={email} disabled />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          required
        />
      </div>
      {state?.error && <p className="text-sm text-error">{state.error}</p>}
      {state?.success && (
        <p className="text-sm text-success-text">{state.success}</p>
      )}
      <Button type="submit" variant="brief-primary" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
