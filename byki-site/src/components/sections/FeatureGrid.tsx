"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const features = [
  {
    title: "AI Mechanic",
    desc: '"What does P0300 mean?" Ask BYKI. Our AI analyzes millions of repair records to give you context, not just definitions.',
    span: "lg:col-span-2",
    gradient: "",
    dark: true,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=80",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 16h4M16 16h2M10 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        <circle cx="24" cy="8" r="4" fill="currentColor" opacity="0.3"/>
        <path d="M22.5 8l1 1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: "Live Engine Data",
    desc: "Monitor standard parameters in real-time. Coolant temp, RPM, battery voltage, and more — visualized clearly.",
    span: "",
    gradient: "",
    dark: false,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 24l6-8 4 4 6-10 8 6" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4" cy="24" r="2" fill="#28b55f"/>
        <circle cx="28" cy="16" r="2" fill="#28b55f"/>
      </svg>
    ),
  },
  {
    title: "Full System Scan",
    desc: "Don't just check the engine. We scan Transmission (TCM), ABS, SRS Airbags, and Body Control Modules.",
    span: "",
    gradient: "",
    dark: false,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="#28b55f" strokeWidth="2"/>
        <circle cx="16" cy="16" r="4" fill="#28b55f" opacity="0.2"/>
        <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "VIN Decoder",
    desc: "Know exactly what you're driving. Decode your VIN for factory specs, recall checks, and gearbox identification.",
    span: "",
    gradient: "",
    dark: false,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="16" rx="2" stroke="#28b55f" strokeWidth="2"/>
        <path d="M8 14h4M14 14h2M18 14h6M8 18h8M18 18h6" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Diagnostic Reports",
    desc: "Generate a diagnostic summary you can save and share with any workshop of your choosing.",
    span: "lg:col-span-2",
    gradient: "",
    dark: true,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
    hasMockup: true,
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="4" width="20" height="24" rx="2" stroke="#28b55f" strokeWidth="2"/>
        <path d="M11 10h10M11 14h10M11 18h6" stroke="#28b55f" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M20 22l2 2 4-4" stroke="#28b55f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function FeatureGrid() {
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
            <SectionLabel>Features</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl md:text-[2.75rem] leading-tight">
              Everything you need to{" "}
              <span className="text-byki-green italic">diagnose.</span>
            </h2>
            <p className="mt-4 text-lg text-byki-dark-gray">
              Skip the confusing codes. This is your pocket diagnostic tool.
            </p>
          </motion.div>
        </div>

        {/* Feature cards — Stripe-like bento grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                f.image
                  ? "min-h-[280px] md:min-h-[320px]"
                  : ""
              } ${
                f.dark && !f.image
                  ? `bg-linear-to-br ${f.gradient} text-white shadow-[0_4px_24px_rgba(0,78,60,0.2)]`
                  : f.dark && f.image
                  ? "text-white shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
                  : "bg-byki-light-gray border border-byki-medium-gray/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              } ${f.span}`}
            >
              {/* Background image for hero cards */}
              {f.image && (
                <>
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                </>
              )}

              <div className={`relative z-10 ${f.image ? "flex flex-col justify-end h-full p-7 md:p-8" : "p-7 md:p-8"}`}>
                {/* Arrow icon — Stripe pattern */}
                {!f.image && (
                  <div className={`absolute top-6 right-6 ${f.dark ? "text-white/40" : "text-byki-dark-gray/30"}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 15L15 1M15 1H5M15 1v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-5 ${f.dark ? "text-white" : "text-byki-green"}`}>
                  {f.icon}
                </div>

                {/* Text */}
                <h3 className={`text-xl font-bold mb-2 ${f.dark ? "text-white" : "text-byki-black"}`}>
                  {f.title}
                </h3>
                <p className={`text-[15px] leading-relaxed ${f.dark ? "text-white/80" : "text-byki-dark-gray"}`}>
                  {f.desc}
                </p>

                {/* Mockup placeholder for report card */}
                {f.hasMockup && (
                  <div className="mt-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-2 w-2 rounded-full bg-byki-green" />
                      <span className="text-xs font-bold text-white">Diagnostic Report</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 rounded bg-white/20" />
                      <div className="h-2 w-1/2 rounded bg-white/20" />
                      <div className="h-2 w-2/3 rounded bg-byki-green/30" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
