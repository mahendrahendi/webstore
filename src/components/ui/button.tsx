import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// shadcn/ui Button, with variants and sizes tuned to the KOIN v2 design.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center gap-2.5 whitespace-nowrap transition-[background-color,border-color,color,transform] disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Lime call-to-action ("Buy now", "Check status")
        default:
          "bg-primary text-primary-foreground hover:bg-lime-hover hover:text-primary-foreground",
        // Off-white ("Check account")
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-white hover:text-secondary-foreground",
        // Hairline border ("Change payment method", "Edit")
        outline:
          "border border-white/16 text-ink hover:bg-white/6 hover:text-ink",
        // Translucent fill ("Copy")
        tonal: "bg-white/10 text-ink hover:bg-white/16 hover:text-ink",
        ghost: "text-ink hover:bg-white/8 hover:text-ink",
      },
      size: {
        default: "min-h-[52px] rounded-[14px] px-5 text-[15px] font-extrabold",
        lg: "min-h-[58px] rounded-2xl px-5 font-display text-base font-extrabold",
        sm: "rounded-xl px-4 py-2.5 text-sm font-extrabold",
        pill: "rounded-full px-3.5 py-2.5 text-sm font-bold",
      },
      press: {
        true: "active:scale-[0.97]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      press: false,
    },
  }
)

function Button({
  className,
  variant,
  size,
  press,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, press, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
