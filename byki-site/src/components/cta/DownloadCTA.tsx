import { TOKENS } from "@/lib/constants";
import { StoreBadge } from "./StoreBadge";
import { cn } from "@/lib/utils";

interface DownloadCTAProps {
  layout?: "row" | "stack";
  size?: "default" | "large";
  className?: string;
}

export function DownloadCTA({ layout = "row", size = "default", className }: DownloadCTAProps) {
  const isPlaceholder = TOKENS.APPSTORE_URL === "#" && TOKENS.PLAYSTORE_URL === "#";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn(
        "flex gap-3",
        layout === "stack" ? "flex-col" : "flex-col sm:flex-row"
      )}>
        <StoreBadge store="apple" href={TOKENS.APPSTORE_URL} size={size} />
        <StoreBadge store="google" href={TOKENS.PLAYSTORE_URL} size={size} />
      </div>
      {isPlaceholder && (
        <p className="text-xs text-byki-dark-gray mt-1">{TOKENS.DOWNLOAD_FALLBACK_TEXT}</p>
      )}
    </div>
  );
}
