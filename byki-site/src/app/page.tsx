import { PAGE_METADATA } from "@/lib/metadata";
import { getSoftwareAppSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { HowItWorksSteps } from "@/components/sections/HowItWorksSteps";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { SystemCoverage } from "@/components/sections/SystemCoverage";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { Disclaimer } from "@/components/sections/Disclaimer";

export const metadata = PAGE_METADATA.home;

export default function HomePage() {
  return (
    <>
      <JsonLd data={getSoftwareAppSchema()} />
      <Hero />
      <Manifesto />
      <HowItWorksSteps />
      <FeatureGrid />
      <SystemCoverage />
      <ComparisonSection />
      <Testimonials />
      <FAQAccordion limit={5} showLink />
      <Disclaimer variant={3} />
    </>
  );
}
