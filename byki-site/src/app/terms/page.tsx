import { PAGE_METADATA } from "@/lib/metadata";
import { TOKENS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { DownloadCTA } from "@/components/cta/DownloadCTA";
import { LegalContent } from "@/components/sections/LegalContent";

export const metadata = PAGE_METADATA.terms;

export default function TermsPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-byki-light-gray">
        <Container className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-byki-black mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-byki-dark-gray mb-6">
            Last updated: {TOKENS.TERMS_LAST_UPDATED}
          </p>
          <DownloadCTA size="default" />
        </Container>
      </section>

      {/* Legal Content */}
      <LegalContent>
        <h2>Acceptance of Terms</h2>
        <p>
          By downloading, installing, or using the BYKI application, you agree
          to be bound by these Terms of Service. If you do not agree, do not use
          the application.
        </p>

        <h2>Service Description</h2>
        <p>
          BYKI is a car diagnostics application that connects to OBD-II
          compatible devices to read vehicle data, generate diagnostic reports,
          and provide insights.
        </p>

        <h2>Diagnostics Only Disclaimer</h2>
        <p>
          <strong>{TOKENS.DIAGNOSTICS_DISCLAIMER_1}</strong>
        </p>

        <h2>ELM Device</h2>
        <p>
          BYKI requires a compatible ELM OBD-II device (sold separately). We are
          not responsible for device compatibility issues with specific vehicles
          or third-party hardware.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          BYKI provides diagnostic data &quot;as-is&quot; and does not guarantee the
          accuracy, completeness, or reliability of diagnostic results. Users
          should consult qualified automotive professionals for vehicle repairs
          and safety concerns.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The BYKI application, including its design, code, and content, is the
          intellectual property of {TOKENS.COMPANY_NAME}. Unauthorized
          reproduction or distribution is prohibited.
        </p>

        <h2>Governing Law</h2>
        <p>
          These terms are governed by the laws of Malaysia. Any disputes shall be
          resolved in the courts of Malaysia.
        </p>

        <h2>Contact</h2>
        <p>
          For questions about these terms, contact us at{" "}
          {TOKENS.CONTACT_EMAIL}.
        </p>

        <hr />
        <p className="text-sm text-byki-dark-gray">
          <em>
            This is placeholder content. The full terms of service will be
            provided via content.md.
          </em>
        </p>
      </LegalContent>

      {/* Company Identity */}
      <section className="py-8 text-center bg-byki-light-gray">
        <Container>
          <p className="text-sm text-byki-dark-gray">
            {TOKENS.COMPANY_NAME}
          </p>
        </Container>
      </section>
    </>
  );
}
