import { Toaster } from "sonner";

import { NavBar } from "@/components/layout/nav-bar";
import { Sidebar } from "@/components/layout/sidebar";
import { getDisplayName } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const displayName = user ? getDisplayName(user) : "";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-sand">
      <NavBar displayName={displayName} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
