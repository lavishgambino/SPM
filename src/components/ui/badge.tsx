import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:     "bg-[#E2E4FA] text-[#1A1F66] hover:bg-[#E2E4FA]/80",
        secondary:   "bg-[#E5E7F0] text-[#212536] hover:bg-[#E5E7F0]/80",
        destructive: "bg-[#FFE0E3] text-[#570006] hover:bg-[#FFE0E3]/80",
        success:     "bg-[#B9F4C3] text-[#042F0A] hover:bg-[#B9F4C3]/80",
        warning:     "bg-[#FDE6AF] text-[#322301] hover:bg-[#FDE6AF]/80",
        info:        "bg-[#D6E6FF] text-[#0B2B66] hover:bg-[#D6E6FF]/80",
        outline:     "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
