import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// DESIGN_BRIEF.md §5 Input field spec: "Unit label: right-aligned inside
// field, muted (e.g. 'sq.m' for Plot Area)."
function InputWithUnit({
  unit,
  className,
  ...props
}: React.ComponentProps<"input"> & { unit: string }) {
  return (
    <div className="relative">
      <Input className={cn("pr-12", className)} {...props} />
      <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[14px] text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}

export { InputWithUnit };
