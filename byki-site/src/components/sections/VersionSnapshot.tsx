"use client";

import { TOKENS, GENERIC_FEATURES, GENERIC_LIMITATIONS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function VersionSnapshot() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <SectionLabel>Compare</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight">
            Which version is right for you?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Generic Card */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-byki-medium-gray/50 bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-byki-light-gray text-byki-dark-gray">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3l-7 4v6l7 4 7-4V7l-7-4z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-byki-black">BYKI Generic</h3>
            </div>

            <ul className="space-y-3 mb-8">
              {GENERIC_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                    <path d="M3 8l3.5 3.5L13 5" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-byki-dark-gray">{f}</span>
                </li>
              ))}
              {GENERIC_LIMITATIONS.map((f, i) => (
                <li key={`l-${i}`} className="flex items-start gap-2.5 text-sm opacity-50">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="#7c7c7c" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-byki-dark-gray">{f}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-byki-medium-gray/40 pt-4">
              <p className="text-sm text-byki-dark-gray font-normal">
                Hardware: ELM {TOKENS.ELM_PRICE_A}
              </p>
            </div>
          </motion.div>

          {/* Pro Card */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-linear-to-br from-byki-dark-green to-byki-light-green p-8 text-white shadow-[0_4px_24px_rgba(0,78,60,0.2)]"
          >
            <span className="absolute top-4 right-4 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              Recommended
            </span>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2l2.4 5.2L18 8l-4 3.8 1 5.8L10 14.7 5 17.6l1-5.8-4-3.8 5.6-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">BYKI Pro</h3>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Everything in Generic",
                "Brand selection for protocol",
                "VIN → engine/gearbox mapping",
                "ECU system scan (topology)",
                "AI-powered live data analysis",
                "DTC reading + clearing",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                    <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-white/90">{f}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/20 pt-4">
              <p className="text-sm text-white/70 font-normal">
                Hardware: ELM {TOKENS.ELM_PRICE_B}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="md" asLink href="/compare">
            See full comparison →
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
