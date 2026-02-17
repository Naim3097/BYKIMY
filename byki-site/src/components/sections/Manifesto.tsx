"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const stats = [
  { number: "50,000+", label: "Fault codes in database", highlight: false },
  { number: "200+", label: "Vehicle brands supported", highlight: true },
  { number: "99.9%", label: "Diagnostic accuracy", highlight: false },
  { number: "15K+", label: "Monthly active users", highlight: true },
];

const brands = [
  { name: "Toyota", logo: "/images/brands/TOYOTA.png" },
  { name: "Honda", logo: "/images/brands/HONDA.png" },
  { name: "Proton", logo: "/images/brands/PROTON.png" },
  { name: "Perodua", logo: "/images/brands/PERODUA.png" },
  { name: "BMW", logo: "/images/brands/BMW.png" },
  { name: "Mercedes", logo: "/images/brands/MERCEDES.png" },
  { name: "Nissan", logo: "/images/brands/NISSAN.png" },
  { name: "Mazda", logo: "/images/brands/MAZDA.png" },
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
            <span className="text-byki-green italic">BYKI translates.</span>
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

        {/* Statistics — 4-column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12 mb-20">
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

        {/* Brand logos — trusted-by bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-center text-xs font-bold uppercase tracking-[0.15em] text-byki-dark-gray/50 mb-8">
            Works with brands you drive
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {brands.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="group relative h-10 w-20 md:h-12 md:w-24 grayscale opacity-40 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
              >
                <Image
                  src={brand.logo}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
