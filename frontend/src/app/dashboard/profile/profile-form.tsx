"use client";

import { useActionState, useState } from "react";

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

  // Controlled, not defaultValue: a successful save revalidates the
  // /dashboard layout (actions.ts), which re-renders this already-mounted
  // form with a new `displayName` prop. An uncontrolled field's defaultValue
  // isn't supposed to change after first render, and Base UI's Field.Control
  // warns exactly that ("changing the default value state of an uncontrolled
  // FieldControl after being initialized"). Adjusting state during render
  // (rather than in an effect, which would cost an extra render pass) lets
  // a post-save value update apply cleanly instead.
  const [name, setName] = useState(displayName);
  const [prevDisplayName, setPrevDisplayName] = useState(displayName);
  if (displayName !== prevDisplayName) {
    setPrevDisplayName(displayName);
    setName(displayName);
  }

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
          value={name}
          onValueChange={setName}
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
