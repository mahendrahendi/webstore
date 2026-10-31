import * as React from "react"

import { cn } from "@/lib/utils"

// shadcn/ui Input, styled as the KOIN v2 field: dark well, hairline border, lime on focus.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-[52px] w-full min-w-0 rounded-[14px] border border-input bg-bg px-4 text-base text-ink transition-colors outline-none placeholder:text-faint focus:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
