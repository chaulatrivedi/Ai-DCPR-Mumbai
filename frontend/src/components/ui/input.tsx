import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // DESIGN_BRIEF.md §5 — Input field / Dropdown select (build now).
        "w-full min-w-0 rounded-input border-[0.5px] border-border bg-sand px-2.5 py-1.5 text-[14px] text-ink transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-placeholder-grey focus-visible:border-terracotta disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error",
        className
      )}
      {...props}
    />
  )
}

export { Input }
