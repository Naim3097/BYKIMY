import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "green" | "gray" | "primary" | "secondary" | "success" | "warning" | "danger" | "default";
  number?: number;
}

const variantMap: Record<string, string> = {
  green: "bg-byki-green text-white",
  primary: "bg-byki-green text-white",
  success: "bg-byki-green/15 text-byki-green",
  gray: "bg-byki-medium-gray text-byki-dark-gray",
  secondary: "bg-byki-medium-gray text-byki-dark-gray",
  default: "bg-byki-light-gray text-byki-dark-gray",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
};

export function Badge({ children, className, variant = "green", number }: BadgeProps) {
  if (number !== undefined) {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-full bg-byki-green/15 text-byki-green text-xs font-bold min-w-[20px] h-5 px-1.5", className)}>
        {number}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        variantMap[variant] || variantMap.default,
        className
      )}
    >
      {children}
    </span>
  );
}
