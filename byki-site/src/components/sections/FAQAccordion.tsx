"use client";

import { FAQ_ITEMS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

interface FAQAccordionProps {
  limit?: number;
  showLink?: boolean;
  items?: readonly { question: string; answer: string }[];
}

export function FAQAccordion({
  limit,
  showLink = true,
  items = FAQ_ITEMS,
}: FAQAccordionProps) {
  const displayItems = limit ? items.slice(0, limit) : items;

  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left column — sticky header */}
          <div className="lg:w-1/3 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <SectionLabel>FAQ</SectionLabel>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight">
                Frequently Asked{" "}
                <span className="text-byki-green italic">Questions</span>
              </h2>
              <p className="mt-4 text-base text-byki-dark-gray leading-relaxed">
                Everything you need to know about BYKI, compatibility, features, and support.
              </p>
              {showLink && (
                <div className="mt-6">
                  <Button variant="outline" size="sm" asLink href="/faq">
                    See all FAQs →
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — accordion */}
          <div className="lg:w-2/3">
            {displayItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Accordion title={item.question}>
                  <p className="text-[15px] text-byki-dark-gray leading-relaxed">
                    {item.answer}
                  </p>
                </Accordion>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
