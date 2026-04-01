"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-white/45 bg-white/24 bg-clip-padding text-sm font-medium whitespace-nowrap shadow-[0_10px_28px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-all outline-none select-none hover:-translate-y-px focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:border-white/15 dark:bg-white/8 dark:shadow-[0_10px_28px_rgba(2,6,23,0.35)] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "border-primary/40 bg-primary/90 text-primary-foreground hover:bg-primary",
        outline:
          "border-white/55 bg-white/45 hover:bg-white/70 hover:text-foreground aria-expanded:bg-white/70 aria-expanded:text-foreground dark:border-white/20 dark:bg-white/12 dark:hover:bg-white/20",
        secondary:
          "border-secondary/40 bg-secondary/70 text-secondary-foreground hover:bg-secondary/85 aria-expanded:bg-secondary/85 aria-expanded:text-secondary-foreground",
        ghost:
          "bg-white/22 hover:bg-white/40 hover:text-foreground aria-expanded:bg-white/40 aria-expanded:text-foreground dark:bg-white/8 dark:hover:bg-white/16",
        destructive:
          "border-destructive/40 bg-destructive/14 text-destructive hover:bg-destructive/24 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/22 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
