import Link from "next/link";

interface StoreBadgeProps {
  store: "apple" | "google";
  href: string;
  size?: "default" | "large";
}

export function StoreBadge({ store, href, size = "default" }: StoreBadgeProps) {
  const isApple = store === "apple";
  const label = isApple ? "App Store" : "Google Play";
  const sub = isApple ? "Download on the" : "Get it on";

  const h = size === "large" ? "h-14" : "h-12";

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 rounded-full bg-byki-black px-5 ${h} text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
    >
      {isApple ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 1.332a1 1 0 010 1.732l-2.302 1.332-2.535-2.533 2.535-2.533zM5.864 3.455L16.8 9.788l-2.302 2.302-8.634-8.635z"/>
        </svg>
      )}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-normal opacity-70">{sub}</span>
        <span className="text-sm font-bold -mt-0.5">{label}</span>
      </div>
    </Link>
  );
}
