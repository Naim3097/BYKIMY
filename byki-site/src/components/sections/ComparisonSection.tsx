"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { COMPARISON_FEATURES, TOKENS } from "@/lib/constants";

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        {/* Header */}
        <div className="mb-14 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>Compare</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight">
              Choose your{" "}
              <span className="text-byki-green">diagnostic level.</span>
            </h2>
            <p className="mt-4 text-lg text-byki-dark-gray">
              Both versions connect via ELM327. Pro unlocks the full diagnostic experience.
            </p>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-byki-medium-gray/50 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
        >
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_140px_140px] border-b border-byki-medium-gray/50">
            <div className="px-5 py-4 text-sm font-bold text-byki-dark-gray uppercase tracking-wide">
              Feature
            </div>
            <div className="px-4 py-4 text-center border-l border-byki-medium-gray/50">
              <div className="text-sm font-bold text-byki-black">Generic</div>
              <div className="text-xs text-byki-dark-gray mt-0.5">{TOKENS.ELM_PRICE_A}</div>
            </div>
            <div className="px-4 py-4 text-center border-l border-byki-medium-gray/50 bg-linear-to-b from-byki-green/5 to-transparent">
              <div className="text-sm font-bold text-byki-green">Pro</div>
              <div className="text-xs text-byki-dark-gray mt-0.5">{TOKENS.ELM_PRICE_B}</div>
            </div>
          </div>

          {/* Table rows */}
          {COMPARISON_FEATURES.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_120px_120px] sm:grid-cols-[1fr_140px_140px] border-b border-byki-medium-gray/30 last:border-b-0 hover:bg-byki-light-gray/50 transition-colors"
            >
              <div className="px-5 py-3.5 text-sm text-byki-black font-normal">
                {row.feature}
              </div>
              <div className="px-4 py-3.5 text-center border-l border-byki-medium-gray/30">
                {row.generic === true ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mx-auto">
                    <path d="M4 9l3.5 3.5L14 6" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : row.generic === "upgrade" ? (
                  <span className="inline-block rounded-full bg-byki-medium-gray/50 px-2.5 py-0.5 text-[11px] font-bold text-byki-dark-gray uppercase">
                    Upgrade
                  </span>
                ) : (
                  <span className="text-byki-medium-gray">—</span>
                )}
              </div>
              <div className="px-4 py-3.5 text-center border-l border-byki-medium-gray/30 bg-byki-green/[0.02]">
                {row.pro === true ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mx-auto">
                    <path d="M4 9l3.5 3.5L14 6" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-byki-medium-gray">—</span>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Button variant="gradient" size="lg" asLink href="/compare">
            View Full Comparison
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}
