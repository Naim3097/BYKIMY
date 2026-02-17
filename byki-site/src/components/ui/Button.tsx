import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "sm" | "md" | "lg";
  asLink?: boolean;
  href?: string;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-byki-green text-white hover:bg-[#239a50] shadow-[0_2px_12px_rgba(40,181,95,0.2)] hover:shadow-[0_4px_20px_rgba(40,181,95,0.3)]",
  gradient:
    "bg-linear-to-r from-byki-dark-green to-byki-light-green text-white shadow-[0_2px_12px_rgba(40,181,95,0.2)] hover:shadow-[0_4px_20px_rgba(40,181,95,0.3)]",
  secondary:
    "bg-byki-medium-gray text-byki-dark-gray hover:bg-[#d4d4d4]",
  outline:
    "bg-transparent text-byki-green border-2 border-byki-green hover:bg-byki-green/5",
  ghost:
    "bg-transparent text-byki-dark-gray hover:text-byki-black hover:bg-byki-light-gray",
};

const sizeClasses: Record<string, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-13 px-8 text-base",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asLink, href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asLink && href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
