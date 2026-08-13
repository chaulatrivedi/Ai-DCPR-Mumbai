import { redirect } from "next/navigation";

import { Card, CardTitle } from "@/components/ui/card";
import { getDisplayName } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard/profile")}`);

  const displayName = getDisplayName(user);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-page-heading font-semibold text-ink">Profile</h1>
        <p className="text-page-subheading text-muted-foreground">
          Your account information.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardTitle>Your info</CardTitle>
        <ProfileForm email={user.email ?? ""} displayName={displayName} />
      </Card>
    </div>
  );
}
