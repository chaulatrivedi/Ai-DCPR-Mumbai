import type { Metadata } from "next";
import "./globals.css";

// DESIGN_BRIEF.md §3/§8: system-ui only, no Google Fonts/external font
// imports — font-sans resolves to Tailwind's built-in system font stack.
export const metadata: Metadata = {
  title: "Mumbai DCPR",
  description: "Mumbai DCPR — Smart App",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
