import type * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:ring-destructive/20 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-blue-nav to-blue-nav-dark text-white hover:from-blue-nav-light hover:to-blue-nav active:from-blue-nav-dark active:to-blue-nav shadow-navy-md hover:shadow-navy-lg active:shadow-navy-sm border border-blue-nav-light/20",
        destructive:
          "bg-gradient-to-b from-status-danger to-red-700 text-white hover:from-red-600 hover:to-red-800 active:from-red-800 shadow-navy-md hover:shadow-navy-lg active:shadow-navy-sm border border-status-danger/30",
        outline:
          "border-2 border-primary/40 bg-transparent hover:bg-primary/5 hover:border-primary/60 text-primary font-medium",
        secondary:
          "bg-gradient-to-b from-blue-accent to-blue-accent-dark text-white hover:from-blue-accent-light hover:to-blue-accent active:from-blue-accent-dark shadow-navy-md hover:shadow-navy-lg active:shadow-navy-sm border border-blue-accent/30",
        ghost: "hover:bg-primary/10 hover:text-primary text-foreground/80 font-medium active:bg-primary/15",
        link: "text-primary underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
