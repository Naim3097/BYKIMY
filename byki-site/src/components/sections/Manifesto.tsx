"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

const stats = [
  { number: "50,000+", label: "Fault codes in database", highlight: false },
  { number: "200+", label: "Vehicle brands supported", highlight: true },
  { number: "99.9%", label: "Diagnostic accuracy", highlight: false },
  { number: "15K+", label: "Monthly active users", highlight: true },
];

export function Manifesto() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <Container>
        {/* Copy block */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight text-byki-black sm:text-4xl md:text-[2.75rem] leading-tight mb-6"
          >
            Your car talks.{" "}
            <span className="text-byki-green">BYKI translates.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-byki-dark-gray leading-relaxed max-w-2xl mx-auto"
          >
            Every check engine light is a conversation waiting to happen. BYKI gives you the data
            to ask the right questions. We don&apos;t replace your mechanic — we make sure you&apos;re both
            speaking the same language.
          </motion.p>
        </div>

        {/* Statistics — 4-column grid (Stripe pattern) */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div
                className={`text-3xl font-bold tracking-tight sm:text-4xl md:text-[3.25rem] leading-none mb-3 ${
                  stat.highlight ? "text-byki-green" : "text-byki-black"
                }`}
              >
                {stat.number}
              </div>
              <p className="text-sm text-byki-dark-gray leading-snug md:text-[15px]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
