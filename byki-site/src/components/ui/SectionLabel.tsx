import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: string;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-byki-green/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-byki-green",
        className
      )}
    >
      {children}
    </span>
  );
}
