import { PAGE_METADATA } from "@/lib/metadata";
import { getFAQSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { ContactTeaser } from "@/components/sections/ContactTeaser";

export const metadata = PAGE_METADATA.faq;

export default function FAQPage() {
  return (
    <>
      <JsonLd data={getFAQSchema()} />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-byki-light-gray">
        <Container>
          <div className="max-w-3xl">
            <SectionLabel>FAQ</SectionLabel>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-byki-black leading-[1.1]">
              Frequently asked{" "}
              <span className="text-byki-green">questions.</span>
            </h1>
            <p className="mt-6 text-lg text-byki-dark-gray max-w-2xl leading-relaxed">
              Common questions about vehicle diagnostics, hardware compatibility, and data privacy.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-white min-h-[60vh]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold text-byki-black mb-4">Topics</h2>
                <ul className="space-y-3 text-[15px]">
                  <li className="text-byki-green font-bold">General</li>
                  <li className="text-byki-dark-gray">Hardware</li>
                  <li className="text-byki-dark-gray">Troubleshooting</li>
                  <li className="text-byki-dark-gray">Subscription</li>
                </ul>
              </div>
            </div>
            <div className="lg:col-span-8">
              <FAQAccordion showLink={false} />
            </div>
          </div>
        </Container>
      </section>

      <ContactTeaser />
    </>
  );
}
