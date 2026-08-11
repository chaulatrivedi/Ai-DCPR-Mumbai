import * as React from "react";

import { cn } from "@/lib/utils";

// DESIGN_BRIEF.md §5 — Dropdown select (build now): "Same as input field.
// Arrow indicator: muted."
function SelectNative({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select-native"
        className={cn(
          "w-full min-w-0 appearance-none rounded-input border-[0.5px] border-border bg-sand px-2.5 py-1.5 pr-8 text-[14px] text-ink outline-none transition-colors focus-visible:border-terracotta disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground"
      >
        ▾
      </span>
    </div>
  );
}

export { SelectNative };
