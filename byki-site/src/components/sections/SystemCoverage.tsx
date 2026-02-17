"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const systems = [
  {
    name: "Engine (ECM)",
    image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=200&q=80",
  },
  {
    name: "Transmission (AT/CVT)",
    image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=200&q=80",
  },
  {
    name: "ABS Braking",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&q=80",
  },
  {
    name: "SRS Airbags",
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=200&q=80",
  },
  {
    name: "Battery Health",
    image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=200&q=80",
  },
  {
    name: "Coolant System",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=80",
  },
  {
    name: "O2 Sensors",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80",
  },
  {
    name: "Fuel System",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&q=80",
  },
];

export function SystemCoverage() {
  return (
    <section className="py-20 md:py-28 bg-byki-light-gray">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>System Coverage</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight">
              Works for every{" "}
              <span className="text-byki-green italic">major system.</span>
            </h2>
            <p className="mt-4 text-lg text-byki-dark-gray leading-relaxed">
              BYKI connects to all available ECUs to give you a complete health report.
              From engine codes to airbag status — one scan covers it all.
            </p>
            <p className="mt-4 text-sm text-byki-dark-gray/70 italic">
              * Coverage varies by vehicle make and model year.
            </p>
          </motion.div>

          {/* Right — system grid with photos */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {systems.map((sys, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="group flex items-center gap-3 rounded-xl bg-white p-3 sm:p-4 border border-byki-medium-gray/30 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-byki-green/20">
                  <Image
                    src={sys.image}
                    alt={sys.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="40px"
                  />
                </div>
                <span className="text-sm font-bold text-byki-black">{sys.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
