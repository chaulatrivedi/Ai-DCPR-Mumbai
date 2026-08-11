import type { Metadata } from "next";
import "./globals.css";

// DESIGN_BRIEF.md §3/§8: system-ui only, no Google Fonts/external font
// imports — font-sans resolves to Tailwind's built-in system font stack.
export const metadata: Metadata = {
  title: "Mumbai DCPR",
  description: "Mumbai DCPR — Smart App",
};

// Applies the stored theme synchronously before hydration/paint, so
// dark-mode users don't see a flash of the light theme. Duplicates the
// tiny read from src/lib/theme.ts's getStoredTheme() intentionally —
// this has to run as inline, unbundled JS to execute before React does.
const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem("theme")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
