import { PAGE_METADATA } from "@/lib/metadata";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DownloadCTA } from "@/components/cta/DownloadCTA";

export const metadata = PAGE_METADATA.howItWorks;

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-byki-light-gray">
        <Container>
          <div className="max-w-3xl">
            <SectionLabel>How it works</SectionLabel>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-byki-black leading-[1.1]">
              From check engine light to{" "}
              <span className="text-byki-green">peace of mind.</span>
            </h1>
            <p className="mt-6 text-lg text-byki-dark-gray max-w-2xl leading-relaxed">
              Diagnostic power without the mechanical jargon. From plug-in to actionable report in under 60 seconds.
            </p>
          </div>
        </Container>
      </section>

      {/* What You Need */}
      <section className="py-20 bg-white">
        <Container>
          <h2 className="text-2xl font-bold text-byki-black mb-10">What you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "ELM OBD-II Adapter", desc: "Standard generic adapter (RM60) or Pro version (RM120)." },
              { step: "02", title: "Smartphone", desc: "Any iOS or Android device with Bluetooth 4.0+ capability." },
              { step: "03", title: "Your Vehicle", desc: "Any OBD-II compatible car manufactured after 2000." },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-byki-medium-gray/50 bg-byki-light-gray p-6">
                <span className="text-sm font-bold text-byki-green mb-2 block">{item.step}</span>
                <h3 className="text-lg font-bold text-byki-black mb-2">{item.title}</h3>
                <p className="text-[15px] text-byki-dark-gray leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Step-by-step Flow */}
      <section className="py-20 md:py-28 bg-byki-dark-green text-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div className="md:sticky md:top-24">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">The process.</h2>
              <p className="text-lg text-white/60">
                A simple, repeatable loop for vehicle health.
              </p>
            </div>
            <div className="space-y-16">
              {[
                { title: "Connect", desc: "Locate the OBD-II port under your steering wheel. Plug in the adapter. It draws power instantly from the car's battery." },
                { title: "Pair", desc: "Launch BYKI. Tap connect. We handle the handshake protocols automatically. No complex configuration needed." },
                { title: "Analyze", desc: "We query over 30,000 potential fault codes across Engine, Transmission, ABS, and Airbag systems in real-time." },
                { title: "Resolve", desc: "Get a clear report categorized by severity. Know exactly what part to buy or what to tell your mechanic." },
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-byki-green pl-6">
                  <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                  <p className="text-white/70 text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 bg-byki-light-gray text-center">
        <Container>
          <h2 className="text-3xl font-bold text-byki-black mb-4">Ready to try?</h2>
          <p className="text-byki-dark-gray mb-8 max-w-md mx-auto">
            Download BYKI and start diagnosing your car in under a minute.
          </p>
          <DownloadCTA />
        </Container>
      </section>
    </>
  );
}
