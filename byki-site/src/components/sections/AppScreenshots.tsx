"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BarChart3, Search, Activity, FileText } from "lucide-react";

export function AppScreenshots() {
  const screens = [
    {
      label: "Intelligent Dashboard",
      icon: <BarChart3 className="w-6 h-6" />,
      desc: "Real-time vitals at a glance.",
    },
    {
      label: "Deep Scan",
      icon: <Search className="w-6 h-6" />,
      desc: "Detect hidden fault codes instantly.",
    },
    {
      label: "Live Data Stream",
      icon: <Activity className="w-6 h-6" />,
      desc: "Visualize engine parameters in real-time.",
    },
    {
      label: "AI Reports",
      icon: <FileText className="w-6 h-6" />,
      desc: "Get plain English explanations for every issue.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-byki-light-gray">
      <Container>
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionLabel>App Interface</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-byki-black sm:text-4xl leading-tight">
            See BYKI in <span className="text-byki-green">Action.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {screens.map((screen, i) => (
            <motion.div
              key={i}
              className="group bg-white rounded-[12px] border border-byki-medium-gray/40 p-6 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Screenshot placeholder */}
              <div className="aspect-[9/16] rounded-lg bg-byki-light-gray mb-4 flex items-center justify-center border border-byki-medium-gray/30">
                <div className="text-byki-green">{screen.icon}</div>
              </div>
              <h3 className="text-base font-bold text-byki-black mb-1">
                {screen.label}
              </h3>
              <p className="text-sm text-byki-dark-gray leading-relaxed">
                {screen.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
