import { PAGE_METADATA } from "@/lib/metadata";
import { TOKENS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ContactForm } from "@/components/sections/ContactForm";

export const metadata = PAGE_METADATA.contact;

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-byki-light-gray">
        <Container>
          <div className="max-w-3xl">
            <SectionLabel>Contact</SectionLabel>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight text-byki-black leading-[1.1]">
              Get in <span className="text-byki-green">touch.</span>
            </h1>
            <p className="mt-6 text-lg text-byki-dark-gray max-w-2xl leading-relaxed">
              Technical support, partnership inquiries, or general feedback. We&apos;re listening.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-20 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
            <div>
              <h2 className="text-2xl font-bold text-byki-black mb-8">Send a message</h2>
              <ContactForm variant="full" />
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-lg font-bold text-byki-black mb-2">Response time</h3>
                <p className="text-byki-dark-gray leading-relaxed">
                  We typically respond within {TOKENS.RESPONSE_TIME}. For urgent diagnostic issues, please consult a professional mechanic.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-byki-black mb-2">Office</h3>
                <p className="text-byki-dark-gray leading-relaxed">
                  Cyberjaya, Malaysia<br />
                  (Digital Operations Only)
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-byki-black mb-2">Email</h3>
                <p className="text-byki-dark-gray">support@byki.com</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
