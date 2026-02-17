import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { DownloadCTA } from "@/components/cta/DownloadCTA";

export default function NotFound() {
  return (
    <section
      className="min-h-screen flex items-center justify-center bg-byki-dark-green"
    >
      <Container className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-white/80 mb-8">
          Page not found. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col items-center gap-6">
          <Button variant="gradient" size="lg" asLink href="/">
            Go Home
          </Button>
          <div>
            <p className="text-white/60 text-sm mb-3">Or download BYKI:</p>
            <DownloadCTA />
          </div>
        </div>
      </Container>
    </section>
  );
}
