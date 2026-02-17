import { PAGE_METADATA } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { DownloadCTA } from "@/components/cta/DownloadCTA";

export const metadata = PAGE_METADATA.compare;

export default function ComparePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-byki-light-gray">
        <Container>
          <div className="max-w-3xl">
            <SectionLabel>Compare</SectionLabel>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-byki-black leading-[1.1]">
              Choose your{" "}
              <span className="text-byki-green">diagnostic level.</span>
            </h1>
            <p className="mt-6 text-lg text-byki-dark-gray max-w-2xl leading-relaxed">
              Every driver needs a copilot. Choose the level of insight that matches your expertise.
            </p>
          </div>
        </Container>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 bg-white">
        <Container>
          <ComparisonTable />
        </Container>
      </section>

      {/* Hardware Section */}
      <section className="py-20 bg-byki-dark-green text-white">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Universal hardware</h2>
            <p className="text-lg text-white/70 mb-10">
              BYKI works with standard ELM327 adapters. We don&apos;t lock you into proprietary hardware.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/15 p-6 bg-white/5">
                <h3 className="text-lg font-bold mb-2">Basic ELM327</h3>
                <p className="text-white/60 text-sm">Best for basic engine codes and quick checks.</p>
              </div>
              <div className="rounded-2xl border border-byki-green/40 p-6 bg-byki-green/10">
                <h3 className="text-lg font-bold mb-2">Pro Adapter</h3>
                <p className="text-white/60 text-sm">Required for ABS/Airbag scanning and coding.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-byki-light-gray text-center">
        <Container>
          <h2 className="text-3xl font-bold text-byki-black mb-4">Ready to start?</h2>
          <p className="text-byki-dark-gray mb-8 max-w-md mx-auto">
            Download BYKI and see what your car is really telling you.
          </p>
          <DownloadCTA />
        </Container>
      </section>
    </>
  );
}
