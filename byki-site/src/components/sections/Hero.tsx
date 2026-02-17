"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { DownloadCTA } from "@/components/cta/DownloadCTA";

const fade = (delay: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
});

const phoneFade = (delay: number, rotate: number, x: number) => ({
  hidden: { opacity: 0, y: 80, rotate: 0, x: 0 },
  visible: {
    opacity: 1,
    y: 0,
    rotate,
    x,
    transition: { delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
});

/* Phone mockup screens */
const SCREENS = [
  { src: "/images/mockups/screen-1.jpeg", alt: "BYKI Dashboard" },
  { src: "/images/mockups/screen-2.jpeg", alt: "BYKI Live Data" },
  { src: "/images/mockups/screen-3.jpeg", alt: "BYKI Fault Codes" },
  { src: "/images/mockups/screen-4.jpeg", alt: "BYKI VIN Decoder" },
];

/* Fan arrangement: [rotation, translateX, translateY, zIndex, delay] */
const FAN_POSITIONS: [number, number, number, number, number][] = [
  [-12, -120,  18, 1, 0.55],   // far left, tilted left
  [ -4,  -40,   4, 2, 0.65],   // center-left, slight tilt
  [  4,   40,   4, 2, 0.75],   // center-right, slight tilt
  [ 12,  120,  18, 1, 0.85],   // far right, tilted right
];

/* Supported brand logos — text placeholders for now */
const BRANDS = ["Toyota", "Honda", "Proton", "Perodua", "BMW", "Mercedes", "Mazda"];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-byki-light-gray">
      {/* Decorative gradient orb */}
      <div className="pointer-events-none absolute -top-32 right-0 h-[600px] w-[600px] rounded-full bg-linear-to-br from-byki-green/15 via-byki-light-green/10 to-transparent blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-linear-to-tr from-byki-dark-green/10 to-transparent blur-[80px]" />

      <Container className="relative z-10 py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div initial="hidden" animate="visible" className="flex flex-col items-center gap-6">
            {/* Badge */}
            <motion.div variants={fade(0)}>
              <span className="inline-flex items-center gap-2 rounded-full bg-byki-green/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-byki-green">
                <span className="h-1.5 w-1.5 rounded-full bg-byki-green animate-pulse" />
                Car Diagnostics App
              </span>
            </motion.div>

            {/* H1 — "Know your car. Inside out." */}
            <motion.h1
              variants={fade(0.1)}
              className="text-[2.5rem] leading-[1.08] font-bold tracking-tight text-byki-black sm:text-5xl md:text-6xl lg:text-[4.25rem]"
            >
              Know your car.{" "}
              <span className="text-byki-green">Inside out.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fade(0.2)}
              className="max-w-xl text-lg text-byki-dark-gray md:text-xl"
            >
              Professional-grade OBD2 diagnostics in your pocket. Decode VINs, read fault codes, and
              understand what your car is telling you.
            </motion.p>

            {/* Store buttons */}
            <motion.div variants={fade(0.3)} className="pt-4">
              <DownloadCTA size="large" />
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fade(0.4)} className="flex items-center gap-4 pt-4 text-sm text-byki-dark-gray">
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1l2.12 4.3 4.74.69-3.43 3.34.81 4.72L8 11.74l-4.24 2.31.81-4.72L1.14 5.99l4.74-.69L8 1z" fill="#28b55f"/>
                </svg>
                4.8/5 Rating
              </span>
              <span className="h-3 w-px bg-byki-medium-gray" />
              <span>ELM327 Compatible</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Phone mockups — fanned arrangement */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative flex items-end justify-center" style={{ height: "clamp(360px, 50vw, 540px)" }}>
            {SCREENS.map((screen, i) => {
              const [rotate, x, y, z, delay] = FAN_POSITIONS[i];
              return (
                <motion.div
                  key={screen.src}
                  initial="hidden"
                  animate="visible"
                  variants={phoneFade(delay, rotate, x)}
                  className="absolute"
                  style={{
                    zIndex: z,
                    translateY: y,
                    width: "clamp(150px, 22vw, 230px)",
                  }}
                >
                  <div className="overflow-hidden rounded-[20px] border-[3px] border-byki-black/10 bg-byki-black shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_24px_rgba(0,0,0,0.1)]">
                    {/* Phone notch */}
                    <div className="relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 h-5 w-[45%] rounded-b-xl bg-byki-black" />
                      <Image
                        src={screen.src}
                        alt={screen.alt}
                        width={230}
                        height={497}
                        className="w-full h-auto"
                        priority={i < 2}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Brand logos row — Stripe pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mx-auto mt-16 max-w-2xl"
        >
          <p className="mb-6 text-center text-xs font-normal uppercase tracking-[0.1em] text-byki-dark-gray">
            Works with major car brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {BRANDS.map((brand) => (
              <span
                key={brand}
                className="text-sm font-bold text-byki-dark-gray/40 transition-colors hover:text-byki-dark-gray/70"
              >
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
