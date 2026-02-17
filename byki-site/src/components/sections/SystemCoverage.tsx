"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const systems = [
  { name: "Engine (ECM)", icon: "⚙️" },
  { name: "Transmission (AT/CVT)", icon: "🔧" },
  { name: "ABS Braking", icon: "🛞" },
  { name: "SRS Airbags", icon: "🛡️" },
  { name: "Battery Health", icon: "🔋" },
  { name: "Coolant System", icon: "🌡️" },
  { name: "O2 Sensors", icon: "📡" },
  { name: "Fuel System", icon: "⛽" },
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
              <span className="text-byki-green">major system.</span>
            </h2>
            <p className="mt-4 text-lg text-byki-dark-gray leading-relaxed">
              BYKI connects to all available ECUs to give you a complete health report.
              From engine codes to airbag status — one scan covers it all.
            </p>
            <p className="mt-4 text-sm text-byki-dark-gray/70 italic">
              * Coverage varies by vehicle make and model year.
            </p>
          </motion.div>

          {/* Right — system grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {systems.map((sys, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl bg-white p-4 border border-byki-medium-gray/30 shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
              >
                <span className="text-xl">{sys.icon}</span>
                <span className="text-sm font-bold text-byki-black">{sys.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
