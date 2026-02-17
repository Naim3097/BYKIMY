import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-byki-medium-gray/30 transition-all duration-300",
        hover && "hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
