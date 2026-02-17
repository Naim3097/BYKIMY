import { TOKENS, ROADMAP_FEATURES } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Roadmap() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <SectionLabel>Coming Soon</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight mb-4">
            {TOKENS.ROADMAP_HEADLINE}
          </h2>
          <p className="text-lg text-byki-dark-gray leading-relaxed mb-10">
            {TOKENS.ROADMAP_DESCRIPTION}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ROADMAP_FEATURES.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border-2 border-dashed border-byki-medium-gray px-5 py-4"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-byki-dark-gray">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-sm text-byki-dark-gray font-normal">{feature}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-byki-dark-gray/60 mt-8 italic">
            {TOKENS.ROADMAP_DISCLAIMER}
          </p>
        </div>
      </Container>
    </section>
  );
}
