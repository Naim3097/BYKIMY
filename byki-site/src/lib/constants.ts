// ============================================
// BYKI — Content Tokens & Constants
// Replace placeholders with real values from content.md
// ============================================

export const TOKENS = {
  // --- Brand ---
  BYKI_TAGLINE: "Understand your car. Before the workshop does.",
  BYKI_H1: "Understand your car before the workshop does.",
  BYKI_SUBHEAD:
    "Read fault codes, get AI-powered diagnostics, and make informed decisions — all from your phone.",

  // --- Store Links ---
  APPSTORE_URL: "#",
  PLAYSTORE_URL: "#",
  APP_RATING: "4.8",
  REVIEW_COUNT: "100+",
  DOWNLOAD_FALLBACK_TEXT: "Coming soon to App Store and Google Play.",

  // --- Company ---
  COMPANY_NAME: "{COMPANY_NAME}",
  CONTACT_EMAIL: "{CONTACT_EMAIL}",
  WHATSAPP_NUMBER: "{WHATSAPP_NUMBER}",
  SITE_URL: "https://byki.my",

  // --- Social ---
  SOCIAL_FACEBOOK: "#",
  SOCIAL_INSTAGRAM: "#",
  SOCIAL_WHATSAPP: "#",

  // --- Hardware ---
  ELM_PRICE_A: "RM60",
  ELM_PRICE_B: "RM120",
  ELM_PURCHASE_INFO: "{ELM_PURCHASE_INFO}",

  // --- Response ---
  RESPONSE_TIME: "24 hours",

  // --- Legal ---
  PDPA_CONSENT_TEXT:
    "I agree to the processing of my personal data in accordance with the Privacy Policy.",
  PRIVACY_LAST_UPDATED: "{PRIVACY_LAST_UPDATED}",
  TERMS_LAST_UPDATED: "{TERMS_LAST_UPDATED}",

  // --- Disclaimers ---
  DIAGNOSTICS_DISCLAIMER_1:
    "BYKI provides vehicle diagnostic insights based on OBD-II data. BYKI does not perform, recommend, or facilitate vehicle repairs. Any maintenance or repair work should be carried out by a qualified automotive professional of your choosing.",
  DIAGNOSTICS_DISCLAIMER_2:
    "BYKI helps you understand what your car is telling you — but we're not a workshop. Use your diagnostic report to have informed conversations with any mechanic you trust.",
  DIAGNOSTICS_DISCLAIMER_3:
    "Diagnostics only. Repairs are handled by independent workshops and service providers.",

  // --- Roadmap ---
  ROADMAP_HEADLINE: "More is on the way.",
  ROADMAP_DESCRIPTION:
    "We're building additional features to make your car ownership experience even smoother. Stay tuned.",
  ROADMAP_DISCLAIMER:
    "Features shown are in development and subject to change. Availability may vary.",

  // --- Footer ---
  FOOTER_CTA_HEADLINE: "Ready to understand your car?",
} as const;

// --- Navigation links ---
export const NAV_LINKS = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "VIN Decoder", href: "/vin-decoder" },
  { label: "Compare", href: "/compare" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

// --- Footer link groups ---
export const FOOTER_LINKS = {
  product: [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Compare", href: "/compare" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;

// --- Generic version features ---
export const GENERIC_FEATURES = [
  "Manual VIN decoder",
  "Live data",
  "Freeze frame",
  "DTC fault code reading",
  "Basic analysis + report",
] as const;

export const GENERIC_LIMITATIONS = [
  "DTC clearing (upgrade to Pro)",
] as const;

// --- Pro version features ---
export const PRO_FEATURES = [
  "Everything in Generic, plus:",
  "Brand selection for protocol",
  "VIN → engine/gearbox mapping",
  "ECU system scan (topology)",
  "AI-powered live data analysis",
  "Probability of causes / root issue",
  "DTC reading + clearing",
] as const;

// --- Capabilities (Home page) ---
export const CAPABILITIES = [
  {
    title: "Read Fault Codes",
    description:
      "See what your car's computer is reporting — in plain language.",
    icon: "fault",
  },
  {
    title: "Live Data Stream",
    description:
      "Monitor real-time engine data like RPM, temperature, and voltage.",
    icon: "live",
  },
  {
    title: "VIN Decoder",
    description:
      "Decode your vehicle identification number to confirm specs.",
    icon: "vin",
  },
  {
    title: "Generate Reports",
    description:
      "Get a diagnostic summary you can share with any workshop.",
    icon: "report",
  },
  {
    title: "AI Analysis",
    description:
      "Get probability-based insights on root causes. Pro only.",
    icon: "ai",
    pro: true,
  },
  {
    title: "ECU System Scan",
    description:
      "Map your car's electronic control units for a full system overview. Pro only.",
    icon: "ecu",
    pro: true,
  },
] as const;

// --- How it works steps ---
export const HOW_IT_WORKS_STEPS = [
  {
    title: "Get your ELM device",
    description:
      "Plug the compact OBD reader into your car's diagnostic port.",
  },
  {
    title: "Connect & scan",
    description:
      "Open the BYKI app, connect via Bluetooth, and run a diagnostic scan.",
  },
  {
    title: "Get your report",
    description:
      "Receive a clear, readable report with fault codes and insights.",
  },
] as const;

// --- Detailed how-it-works steps (full page) ---
export const HOW_IT_WORKS_DETAILED = [
  {
    title: "Get your ELM device",
    description:
      "Purchase the BYKI-compatible ELM reader. Generic (RM60) or Pro (RM120).",
  },
  {
    title: "Plug it in",
    description:
      "Locate the OBD-II port under your dashboard and plug in the device.",
  },
  {
    title: "Connect via Bluetooth",
    description: "Open the BYKI app and pair with the ELM device.",
  },
  {
    title: "Run your scan",
    description:
      "Choose your scan type — read fault codes, view live data, or run a full diagnostic.",
  },
  {
    title: "Review your report",
    description:
      "Get a clear, readable report with fault codes, descriptions, and actionable insights.",
  },
] as const;

// --- Roadmap features ---
export const ROADMAP_FEATURES = [
  "Workshop booking",
  "Auto parts e-commerce + installation",
  "SOS with live location",
  "Buy-now-pay-later options",
  "Battery service & towing",
] as const;

// --- FAQ items ---
export const FAQ_ITEMS = [
  {
    question: "What is BYKI?",
    answer:
      "BYKI is a car diagnostics app that connects to an ELM OBD-II device to read fault codes, stream live data, and generate diagnostic reports — all from your phone.",
  },
  {
    question: "What do I need to use BYKI?",
    answer:
      "You need a compatible ELM OBD-II device (RM60 for Generic or RM120 for Pro) and a smartphone with Bluetooth.",
  },
  {
    question: "Does BYKI work with my car?",
    answer:
      "BYKI supports most OBD-II compliant vehicles. Most cars manufactured after 2000 have an OBD-II port.",
  },
  {
    question: "Can BYKI fix my car?",
    answer:
      "No. BYKI is a diagnostic tool only. It helps you understand what's happening so you can make informed decisions. Repairs are handled by independent workshops of your choice.",
  },
  {
    question: "What's the difference between Generic and Pro?",
    answer:
      "Generic covers basic fault code reading, live data, freeze frame, and VIN decoding. Pro adds AI-powered analysis, ECU system scanning, DTC clearing, and brand-specific protocols.",
  },
  {
    question: "How do I connect the ELM device?",
    answer:
      "Plug it into your car's OBD-II port (usually under the dashboard), open BYKI, and pair via Bluetooth. It takes less than a minute.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Yes. Your diagnostic data is processed securely and is not shared with third parties without your consent.",
  },
  {
    question: "Can I share my report with a mechanic?",
    answer:
      "Absolutely. Reports can be saved and shared with any workshop of your choice.",
  },
  {
    question: "Where can I buy the ELM device?",
    answer:
      "ELM devices can be purchased through our recommended channels. Contact us for availability in Malaysia.",
  },
  {
    question: "Is the app free?",
    answer:
      "Download is free. Some features may require a compatible ELM device (sold separately).",
  },
  {
    question: "What if my question isn't answered here?",
    answer:
      "Feel free to reach out via our Contact page. We typically respond within 24 hours.",
  },
] as const;

// --- Comparison table data ---
export const COMPARISON_FEATURES = [
  { feature: "Manual VIN decoder", generic: true, pro: true },
  { feature: "Live data", generic: true, pro: true },
  { feature: "Freeze frame", generic: true, pro: true },
  { feature: "DTC fault code reading", generic: true, pro: true },
  { feature: "Basic analysis + report", generic: true, pro: true },
  { feature: "Brand selection for protocol", generic: false, pro: true },
  { feature: "VIN → engine/gearbox mapping", generic: false, pro: true },
  { feature: "ECU system scan (topology)", generic: false, pro: true },
  { feature: "AI-powered live data analysis", generic: false, pro: true },
  { feature: "Probability of causes / root issue", generic: false, pro: true },
  { feature: "DTC clearing", generic: "upgrade", pro: true },
] as const;

// --- Contact form reasons ---
export const CONTACT_REASONS = [
  "App help",
  "ELM setup",
  "Understanding fault code",
  "Other",
] as const;
