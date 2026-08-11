import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { PasswordForm } from "./password-form";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-page-heading font-semibold text-ink">Settings</h1>
        <p className="text-page-subheading text-muted-foreground">
          Account-level preferences.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardTitle>Change password</CardTitle>
        <PasswordForm />
      </Card>

      <Card className="max-w-xl">
        <CardTitle>Appearance</CardTitle>
        <div className="mt-2">
          <DarkModeToggle />
        </div>
      </Card>

      <Card className="max-w-xl">
        <CardTitle>Account</CardTitle>
        <form action={signOut} className="mt-2">
          <Button type="submit" variant="brief-secondary">
            Sign out
          </Button>
        </form>
      </Card>
    </div>
  );
}
