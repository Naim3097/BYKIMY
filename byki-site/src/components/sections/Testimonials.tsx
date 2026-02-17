"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

const reviews = [
  {
    name: "Ahmad F.",
    role: "Perodua Myvi Owner",
    text: "Check engine light came on. Workshop quoted RM400 for a sensor. BYKI told me it was just a loose fuel cap. Saved me a fortune.",
  },
  {
    name: "Sarah L.",
    role: "Proton X70 Owner",
    text: "I was worried about using a generic scanner on my X70. BYKI connected instantly and gave me data I actually understood.",
  },
  {
    name: "Rajiv M.",
    role: "DIY Enthusiast",
    text: "The AI explanation is a game changer. It doesn't just give the code — it tells you how urgent it is. Worth every sen.",
  },
  {
    name: "Jason T.",
    role: "First-time Car Owner",
    text: "I know nothing about cars. BYKI helped me not look like an idiot when I went to the mechanic. Highly recommend.",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 md:py-28 bg-byki-light-gray">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight mb-16">
              Trusted by drivers{" "}
              <span className="text-byki-green">across Malaysia.</span>
            </h2>
          </motion.div>

          {/* Quote — Stripe testimonial pattern */}
          <div className="relative min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center"
              >
                {/* Quote mark */}
                <svg width="40" height="32" viewBox="0 0 40 32" fill="none" className="mb-6 text-byki-green/20">
                  <path d="M0 32V19.2C0 6.4 8.8 0 17.6 0v6.4c-4.8 0-8 3.2-8 6.4h8V32H0zm22.4 0V19.2c0-12.8 8.8-19.2 17.6-19.2v6.4c-4.8 0-8 3.2-8 6.4h8V32H22.4z" fill="currentColor"/>
                </svg>

                <blockquote className="text-xl text-byki-dark-gray leading-relaxed max-w-2xl md:text-2xl">
                  &ldquo;{reviews[active].text}&rdquo;
                </blockquote>

                <div className="mt-8">
                  <p className="font-bold text-byki-black">{reviews[active].name}</p>
                  <p className="text-sm text-byki-dark-gray">{reviews[active].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  active === i ? "w-8 bg-byki-green" : "w-2 bg-byki-medium-gray hover:bg-byki-dark-gray/40"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
