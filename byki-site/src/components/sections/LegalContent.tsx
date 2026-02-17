import { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

interface LegalContentProps {
  children: ReactNode;
}

export function LegalContent({ children }: LegalContentProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <Container narrow>
        <div className="prose prose-lg max-w-none text-byki-dark-gray leading-relaxed">
          {children}
        </div>
      </Container>
    </section>
  );
}
