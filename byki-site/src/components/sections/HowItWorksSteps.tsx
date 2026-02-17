"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const steps = [
  {
    step: "01",
    title: "Plug In",
    desc: "Locate your car's OBD-II port (usually under the steering wheel) and plug in your ELM327 adapter.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="8" y="4" width="16" height="24" rx="3" stroke="#28b55f" strokeWidth="2"/>
        <circle cx="16" cy="22" r="2" fill="#28b55f"/>
        <path d="M12 9h8M12 13h8" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    step: "02",
    title: "Connect",
    desc: "Turn on ignition, open the BYKI app, and pair via Bluetooth. It takes seconds.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 6v20M16 6l6 5-6 5M16 16l6 5-6 5" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 11l-3 2M10 21l-3-2M7 16H4" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    step: "03",
    title: "Scan",
    desc: "Hit 'Quick Scan'. BYKI reads fault codes from Engine, Transmission, ABS, and Airbag systems.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="14" cy="14" r="8" stroke="#28b55f" strokeWidth="2"/>
        <path d="M20 20l6 6" stroke="#28b55f" strokeWidth="2" strokeLinecap="round"/>
        <path d="M11 14h6M14 11v6" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    step: "04",
    title: "Understand",
    desc: "Get a plain English report. AI explains severity, likely causes, and estimated repair costs.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="4" width="20" height="24" rx="2" stroke="#28b55f" strokeWidth="2"/>
        <path d="M11 10h10M11 14h10M11 18h6" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="22" cy="22" r="5" fill="#28b55f" opacity="0.15"/>
        <path d="M20 22l1.5 1.5L24 20" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function HowItWorksSteps() {
  return (
    <section className="py-20 md:py-28 bg-byki-light-gray">
      <Container>
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl md:text-[2.75rem] leading-tight">
              From check engine light to{" "}
              <span className="text-byki-green">peace of mind.</span>
            </h2>
            <p className="mt-4 text-lg text-byki-dark-gray">
              Four simple steps. Under 60 seconds.
            </p>
          </motion.div>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative rounded-2xl bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-byki-medium-gray/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              {/* Step number */}
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-byki-green">
                Step {step.step}
              </span>

              {/* Icon */}
              <div className="mt-4 mb-4">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-byki-black mb-2">
                {step.title}
              </h3>
              <p className="text-[15px] text-byki-dark-gray leading-relaxed">
                {step.desc}
              </p>

              {/* Connector line (hidden on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-byki-medium-gray" />
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
