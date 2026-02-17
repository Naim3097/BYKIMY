import { TOKENS } from "@/lib/constants";

interface DisclaimerProps {
  variant?: 1 | 2 | 3;
  className?: string;
}

export function Disclaimer({ variant = 3, className = "" }: DisclaimerProps) {
  const text =
    variant === 1
      ? TOKENS.DIAGNOSTICS_DISCLAIMER_1
      : variant === 2
      ? TOKENS.DIAGNOSTICS_DISCLAIMER_2
      : TOKENS.DIAGNOSTICS_DISCLAIMER_3;

  return (
    <div className={`border-t border-byki-medium-gray/50 bg-byki-light-gray py-6 ${className}`}>
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 lg:px-12">
        <p className="text-xs text-byki-dark-gray/70 text-center leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
