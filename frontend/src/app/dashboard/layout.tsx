import { Toaster } from "sonner";

import { NavBar } from "@/components/layout/nav-bar";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-sand">
      <NavBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
