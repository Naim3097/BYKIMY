"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const steps = [
  {
    step: "01",
    title: "Plug In",
    desc: "Locate your car's OBD-II port (usually under the steering wheel) and plug in your ELM327 adapter.",
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&q=80",
    imageAlt: "Car interior steering wheel area",
  },
  {
    step: "02",
    title: "Connect",
    desc: "Turn on ignition, open the BYKI app, and pair via Bluetooth. It takes seconds.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
    imageAlt: "Person using smartphone app",
  },
  {
    step: "03",
    title: "Scan",
    desc: "Hit 'Quick Scan'. BYKI reads fault codes from Engine, Transmission, ABS, and Airbag systems.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
    imageAlt: "Car diagnostic scanning",
  },
  {
    step: "04",
    title: "Understand",
    desc: "Get a plain English report. AI explains severity, likely causes, and estimated repair costs.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
    imageAlt: "Data analytics dashboard",
  },
];

export function HowItWorksSteps() {
  return (
    <section className="py-20 md:py-28 bg-byki-light-gray">
      <Container>
        {/* Header */}
        <div className="mb-16 max-w-2xl mx-auto text-center lg:text-left lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>How it works</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl md:text-[2.75rem] leading-tight">
              From check engine light to{" "}
              <span className="text-byki-green italic">peace of mind.</span>
            </h2>
            <p className="mt-4 text-lg text-byki-dark-gray">
              Four simple steps. Under 60 seconds.
            </p>
          </motion.div>
        </div>

        {/* Steps — visual cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative flex flex-col rounded-2xl bg-white overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-byki-medium-gray/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Step badge overlaying the image */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-[0.1em] text-byki-green">
                    Step {step.step}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <h3 className="text-xl font-bold text-byki-black mb-2">
                  {step.title}
                </h3>
                <p className="text-[15px] text-byki-dark-gray leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Connector line (hidden on last & mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 -right-3 w-6 border-t-2 border-dashed border-byki-green/40" />
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
