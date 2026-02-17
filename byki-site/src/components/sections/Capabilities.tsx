"use client";

import { CAPABILITIES } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Card } from "@/components/ui/Card";
import { DownloadCTA } from "@/components/cta/DownloadCTA";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  fault: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#28b55f" strokeWidth="2"/>
      <path d="M18 18l6 6" stroke="#28b55f" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  live: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M2 20l6-8 4 4 6-10 8 6" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  vin: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="7" width="22" height="14" rx="2" stroke="#28b55f" strokeWidth="2"/>
      <path d="M7 12h6M7 16h4M15 12h6" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  report: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="5" y="3" width="18" height="22" rx="2" stroke="#28b55f" strokeWidth="2"/>
      <path d="M9 9h10M9 13h10M9 17h6" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  ai: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="8" stroke="#28b55f" strokeWidth="2"/>
      <circle cx="14" cy="14" r="3" fill="#28b55f" opacity="0.3"/>
      <path d="M14 6v3M14 19v3M6 14h3M19 14h3" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  ecu: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="6" width="16" height="16" rx="2" stroke="#28b55f" strokeWidth="2"/>
      <rect x="10" y="10" width="8" height="8" rx="1" fill="#28b55f" opacity="0.2"/>
      <path d="M10 3v3M18 3v3M10 22v3M18 22v3M3 10h3M3 18h3M22 10h3M22 18h3" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export function Capabilities() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight">
              What you can do with BYKI
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full">
                <div className="mb-4">
                  {iconMap[cap.icon] || iconMap.fault}
                </div>
                <h3 className="text-lg font-bold text-byki-black mb-2 flex items-center gap-2">
                  {cap.title}
                  {"pro" in cap && cap.pro && (
                    <span className="rounded-full bg-byki-green/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-byki-green">
                      Pro
                    </span>
                  )}
                </h3>
                <p className="text-[15px] text-byki-dark-gray leading-relaxed">
                  {cap.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <DownloadCTA />
        </div>
      </Container>
    </section>
  );
}
