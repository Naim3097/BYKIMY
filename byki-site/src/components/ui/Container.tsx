import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
  wide?: boolean;
}

export function Container({ children, className, narrow, wide }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 md:px-8 lg:px-12",
        narrow ? "max-w-[768px]" : wide ? "max-w-[1440px]" : "max-w-[1200px]",
        className
      )}
    >
      {children}
    </div>
  );
}
