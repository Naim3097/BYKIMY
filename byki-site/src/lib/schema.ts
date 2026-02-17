import { TOKENS, FAQ_ITEMS } from "./constants";

// Organization schema — site-wide
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: TOKENS.COMPANY_NAME,
    url: TOKENS.SITE_URL,
    logo: `${TOKENS.SITE_URL}/images/logo.svg`,
    contactPoint: {
      "@type": "ContactPoint",
      email: TOKENS.CONTACT_EMAIL,
      contactType: "customer support",
      areaServed: "MY",
      availableLanguage: ["English", "Malay"],
    },
    sameAs: [
      TOKENS.SOCIAL_FACEBOOK,
      TOKENS.SOCIAL_INSTAGRAM,
      TOKENS.SOCIAL_WHATSAPP,
    ],
  };
}

// WebSite schema — site-wide
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BYKI",
    url: TOKENS.SITE_URL,
  };
}

// SoftwareApplication schema — home page
export function getSoftwareAppSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BYKI",
    operatingSystem: "iOS, Android",
    applicationCategory: "UtilitiesApplication",
    description:
      "Car diagnostics app — read fault codes, get AI-powered reports, and understand your car.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MYR",
    },
  };
}

// FAQPage schema — faq page
export function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
