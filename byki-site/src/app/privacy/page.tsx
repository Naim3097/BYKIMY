import { PAGE_METADATA } from "@/lib/metadata";
import { TOKENS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { DownloadCTA } from "@/components/cta/DownloadCTA";
import { LegalContent } from "@/components/sections/LegalContent";

export const metadata = PAGE_METADATA.privacy;

export default function PrivacyPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-byki-light-gray">
        <Container className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-byki-black mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-byki-dark-gray mb-6">
            Last updated: {TOKENS.PRIVACY_LAST_UPDATED}
          </p>
          <DownloadCTA size="default" />
        </Container>
      </section>

      {/* Legal Content */}
      <LegalContent>
        <h2>Introduction</h2>
        <p>
          This privacy policy outlines how {TOKENS.COMPANY_NAME} (&quot;we&quot;,
          &quot;us&quot;, &quot;our&quot;) collects, uses, stores, and protects
          your personal data when you use the BYKI car diagnostics application.
        </p>

        <h2>Data We Collect</h2>
        <p>
          When you use BYKI, we may collect the following types of information:
        </p>
        <ul>
          <li>Vehicle diagnostic data (fault codes, live data readings, VIN)</li>
          <li>Device information (phone model, OS version)</li>
          <li>Contact information (if you reach out to us)</li>
          <li>Usage analytics (how you interact with the app)</li>
        </ul>

        <h2>How We Use Your Data</h2>
        <p>
          Your data is used to provide diagnostic reports, improve our services,
          and respond to your support requests. We do not sell your personal data
          to third parties.
        </p>

        <h2>Data Protection</h2>
        <p>
          We implement appropriate security measures to protect your data in
          accordance with Malaysia&apos;s Personal Data Protection Act 2010 (PDPA).
        </p>

        <h2>Your Rights</h2>
        <p>
          Under the PDPA, you have the right to access, correct, and request
          deletion of your personal data. Contact us at {TOKENS.CONTACT_EMAIL}{" "}
          for any data-related requests.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy-related inquiries, contact us at {TOKENS.CONTACT_EMAIL}.
        </p>

        <hr />
        <p className="text-sm text-byki-dark-gray">
          <em>
            This is placeholder content. The full privacy policy will be
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
