"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export function ContactTeaser() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/5 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center md:text-left flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-between"
        >
          <div>
            <h3 className="text-2xl font-bold mb-3 text-byki-black">Need help?</h3>
            <p className="text-byki-dark-gray text-lg">
              Have a question about BYKI or your ELM device? <br className="hidden md:block" />
              We&apos;re here to help.
            </p>
          </div>
          
          <Button variant="ghost" asLink href="/contact" className="shrink-0">
            Get in touch →
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
