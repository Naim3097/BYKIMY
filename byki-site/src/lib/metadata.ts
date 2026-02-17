import type { Metadata } from "next";
import { TOKENS } from "./constants";

// Base metadata shared across all pages
const baseMetadata: Partial<Metadata> = {
  metadataBase: new URL(TOKENS.SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: "BYKI",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function createMetadata(page: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${TOKENS.SITE_URL}${page.path || ""}`;

  return {
    ...baseMetadata,
    title: page.title,
    description: page.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: page.title,
      description: page.description,
      url,
    },
    twitter: {
      ...baseMetadata.twitter,
      title: page.title,
      description: page.description,
    },
    ...(page.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

// Pre-built metadata for each page
export const PAGE_METADATA = {
  home: createMetadata({
    title: "BYKI — Car Diagnostics App for Malaysia",
    description:
      "Diagnose your car with BYKI. Read fault codes, get AI-powered reports, and understand what's wrong — all from your phone. Download free on App Store & Google Play.",
    path: "/",
  }),
  howItWorks: createMetadata({
    title: "How BYKI Works — Car Diagnostics in Simple Steps",
    description:
      "Plug in your ELM device, connect via Bluetooth, scan, and get a diagnostic report. BYKI makes car fault diagnosis simple. Download now.",
    path: "/how-it-works",
  }),
  compare: createMetadata({
    title: "BYKI Generic vs Pro — Compare Car Diagnostic Features",
    description:
      "Compare BYKI Generic ELM Diagnosis and BYKI Diagnosis Pro. See features, hardware, and what's included in each version.",
    path: "/compare",
  }),
  faq: createMetadata({
    title: "FAQ — BYKI Car Diagnostics App | Common Questions Answered",
    description:
      "Get answers to frequently asked questions about BYKI, ELM OBD devices, car fault codes, compatibility, and more.",
    path: "/faq",
  }),
  contact: createMetadata({
    title: "Contact Us — BYKI Car Diagnostics Support",
    description:
      "Have a question about BYKI or your ELM device? Reach out via email or WhatsApp. We typically respond within 24 hours.",
    path: "/contact",
  }),
  privacy: createMetadata({
    title: "Privacy Policy — BYKI",
    description:
      "Read the BYKI privacy policy. Learn how we collect, use, and protect your personal data in compliance with Malaysia's PDPA.",
    path: "/privacy",
  }),
  terms: createMetadata({
    title: "Terms of Service — BYKI",
    description:
      "Read the BYKI terms of service. Understand the conditions for using the BYKI car diagnostics app and ELM OBD devices.",
    path: "/terms",
  }),
};
