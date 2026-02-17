import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { FOOTER_LINKS, TOKENS } from "@/lib/constants";
import { DownloadCTA } from "@/components/cta/DownloadCTA";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-byki-dark-green text-white">
      {/* CTA band */}
      <div className="border-b border-white/10 py-16 md:py-20">
        <Container className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl mb-4">
            {TOKENS.FOOTER_CTA_HEADLINE}
          </h2>
          <p className="text-base text-white/60 max-w-lg mx-auto mb-8">
            Download BYKI and start diagnosing your car today. Available on iOS and Android.
          </p>
          <DownloadCTA size="large" />
        </Container>
      </div>

      {/* Links grid */}
      <div className="py-12 md:py-16">
        <Container>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2 mb-4">
                <Image
                  src="/images/brand/byki-logo.png"
                  alt="BYKI"
                  width={100}
                  height={28}
                  className="h-7 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm text-white/50 leading-relaxed max-w-[260px]">
                Professional-grade car diagnostics for everyone. Powered by advanced AI.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-white/40 mb-4">
                Product
              </h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-white/40 mb-4">
                Support
              </h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-white/40 mb-4">
                Legal
              </h3>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-6">
        <Container className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-white/40">
            © {year} BYKI. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Malaysia Edition
          </p>
        </Container>
      </div>
    </footer>
  );
}
