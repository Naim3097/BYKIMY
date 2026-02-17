You are a senior UX/UI designer, conversion-focused SEO strategist, and front-end architect.

TASK
Create a minimal multi-page, mobile-first, ultra-SEO-optimized website INFORMATION ARCHITECTURE + wireframe-level UI mockup specification for “BYKI” (car diagnostics mobile app). Output must be structure-first and implementation-ready for React (Next.js), but do NOT write full code—write a buildable blueprint: routes, components, sections, copy tokens, and SEO plan.

IMPORTANT WORKFLOW RULE (CONTENT + STYLE PROVIDED LATER)
- I will later provide two markdown files:
  1) style.md (visual direction: colors, typography, spacing, aesthetic references)
  2) content.md (final accurate product info, copy, FAQs, legal text, pricing, links)
- For THIS output:
  - Do NOT invent detailed claims, compatibility, certifications, or specs beyond “SAFE FACTS” below.
  - Use placeholder tokens for unknowns, e.g. {BYKI_TAGLINE}, {APPSTORE_URL}, {PLAYSTORE_URL}, {SUPPORTED_CARS}, {CONTACT_EMAIL}, {WHATSAPP_NUMBER}, {COMPANY_NAME}, {LEGAL_TEXT}.
  - You may write short generic draft copy only if it is safe and non-claimy. Prefer placeholders.

MARKET / OBJECTIVE
- Market: Malaysia
- Primary goal: drive app downloads (App Store + Google Play; dummy links for now)
- Secondary goal: provide a low-emphasis contact option (simple form) for users who insist on contacting
- Positioning constraint: BYKI must NOT appear as a workshop competitor. BYKI “diagnoses” only; it does not repair cars.
  - Avoid: “we fix”, “our workshop”, “book with us”, “come to our workshop”
  - Prefer: diagnose, understand, prepare, generate report, interpret codes, make informed decisions
  - If mentioning referrals/partners, keep it subtle and use placeholders (do not overpromise)

SAFE FACTS (ONLY THESE ARE CONFIRMED)
BYKI uses an ELM OBD device + app diagnostics.

Two versions (NOT tiers):
A) “BYKI Generic ELM Diagnosis” (entry)
- Manual VIN decoder
- Live data
- Freeze frame
- DTC fault code reading
- Basic analysis + report
- Limitation: no DTC clearing (upgrade required)
- Hardware reference: ELM RM60

B) “BYKI Diagnosis Pro”
- Brand selection for protocol
- VIN decoder
- VIN → engine/gearbox mapping
- ECU system scan (topology)
- Live data: raw + correlation + AI analysis + probability of causes/root issue
- DTC reading + clearing
- Hardware reference: ELM RM120

C) “Full flow layer” (NOT a separate tier; applies to A/B; roadmap/optional)
- booking
- e-commerce for auto products + installation booking
- SOS with location
- BNPL
- quotation
- battery service + towing
This must be presented as a careful {ROADMAP_OR_COMING_SOON_SECTION}.

IMPLEMENTATION TARGET (MUST FOLLOW)
- Framework: Next.js (App Router) with React
- Output must include:
  1) Minimal sitemap + rationale
  2) Proposed Next.js routes (e.g., app/page.tsx, app/how-it-works/page.tsx)
  3) Component map (reusable sections) with responsibilities + props driven by content tokens
  4) Layout rules (mobile-first, responsive)
  5) SEO strategy (metadata, OpenGraph, JSON-LD placeholders)
- Do NOT output full code. Provide pseudo-structure and component breakdown only.

PAGES CONSTRAINTS
- Multi-page but minimal; aim for 5–7 pages max.
- Every page must have an above-the-fold Download CTA.
- Contact must be low-emphasis (footer + small “Need help?” section near bottom + dedicated Contact page).
- Suggested candidates (merge if redundant; justify):
  - Home
  - How it works
  - Compare (Version A vs Version B)
  - FAQ
  - Contact
  - Privacy Policy
  - Terms

DESIGN (TEMPORARY UNTIL style.md)
- Propose a clean modern automotive-tech UI.
- Use tokenized design system values (placeholders):
  {COLOR_BG}, {COLOR_TEXT}, {COLOR_PRIMARY}, {COLOR_MUTED}, {FONT_FAMILY}, {RADIUS}, {SHADOW}, {SPACING_SCALE}
- Must be mobile responsive, fast, and accessible (contrast, readable font sizes, tap targets).

DELIVERABLE FORMAT (MUST INCLUDE ALL SECTIONS BELOW)

SECTION 1 — MINIMAL SITEMAP + RATIONALE
- List each page, URL slug, and 1–2 sentences describing purpose for SEO + conversion.
- Keep it minimal; justify why each page exists.

SECTION 2 — NEXT.JS ROUTE MAP
- Provide a tree like:
  app/
    layout.tsx
    page.tsx
    how-it-works/page.tsx
    compare/page.tsx
    faq/page.tsx
    contact/page.tsx
    privacy/page.tsx
    terms/page.tsx
  components/
    ...
- Include brief notes on what goes into layout.tsx (header/footer/global SEO, fonts).

SECTION 3 — GLOBAL UI COMPONENT SPEC
Define:
- Sticky Header:
  - Left: {BYKI_LOGO}
  - Nav: minimal links (e.g., How it works, Compare, FAQ, Contact)
  - Right: primary CTA “Download BYKI” (dropdown or two buttons)
- Download CTA component:
  - Two store buttons with dummy tokens {APPSTORE_URL}, {PLAYSTORE_URL}
  - Fallback: {DOWNLOAD_FALLBACK_TEXT} if links not ready
- Footer:
  - Links: FAQ, Contact, Privacy, Terms
  - {COMPANY_DETAILS} placeholders
  - Optional: social links {SOCIAL_LINKS}
- Contact Form component:
  - Fields (minimal):
    * Name (optional)
    * Preferred contact method selector {CONTACT_METHOD} (Email or WhatsApp) OR choose one required (use placeholder decision)
    * Email or WhatsApp input (required)
    * Message (required)
    * Reason dropdown (optional): App help, ELM setup, Understanding fault code, Other
    * Consent checkbox: {PDPA_CONSENT_TEXT}
  - Success state: Thank-you + primary next step = Download

SECTION 4 — PAGE-BY-PAGE WIREFRAME SPECS (MOBILE-FIRST)
For EACH page, include:
- Page goal
- SEO:
  - Meta title (use tokens if needed)
  - Meta description (use tokens)
  - H1
  - H2 list (planned headings)
- Above-the-fold layout (mobile):
  - exact order of elements
  - CTA placement
- Section-by-section structure:
  For each section provide:
  - Section name
  - Purpose
  - UI components (cards, icons, accordion, carousel, etc.)
  - Copy tokens/placeholders (no lorem ipsum)
  - Notes for responsiveness (mobile → desktop)
  - Notes for SEO/internal linking (where to link next)

MINIMUM PAGE CONTENT EXPECTATIONS
HOME (/)
- Hero with H1 + short subhead + store buttons
- “How BYKI works” 3-step section
- “What you can do with BYKI” (capabilities) — safe, non-claimy
- Version snapshot (A vs B) with “Compare” link
- Roadmap/Coming soon (Version C full flow layer) — careful language
- Screenshot/device mock section (placeholder images)
- FAQ teaser (3–5 questions) linking to full FAQ page
- Low-emphasis “Need help?” contact teaser + link to Contact
- Disclaimer snippet

HOW IT WORKS (/how-it-works)
- Simple steps: Get ELM → Connect → Read codes/data → Get report → Next steps
- Include “diagnostics-only” positioning and safety disclaimers
- Reinforce download CTA

COMPARE (/compare)
- Side-by-side comparison table for Version A vs Version B
- Clarify A limitation: no DTC clearing; B includes DTC clearing
- Include hardware references RM60/RM120 as placeholders if needed {ELM_PRICE_A}, {ELM_PRICE_B}
- Strong CTA to download

FAQ (/faq)
- Accordion with 8–12 questions (generic safe questions ok; prefer placeholders)
- Include FAQ schema placeholders
- Include contact teaser at bottom

CONTACT (/contact)
- Low-emphasis page: short intro + form + alternative contact method placeholders
- Include expectations: response time placeholder {RESPONSE_TIME}

PRIVACY (/privacy) and TERMS (/terms)
- Minimal legal pages with placeholders to be filled by content.md
- Include disclaimer placeholder and company identity placeholders

SECTION 5 — SEO PLAN (SAFE, MALAYSIA-RELEVANT)
- Provide 10–15 target keyword phrases (English; optionally include BM variants in parentheses).
- Provide 5–8 FAQ Schema question suggestions (generic).
- Provide recommended structured data plan:
  - Organization schema placeholders
  - WebSite schema with SearchAction (optional)
  - FAQPage schema on /faq
- Provide internal linking plan (which pages link to which, and why).
- Provide performance notes for Core Web Vitals (image optimization, lazy loading).

SECTION 6 — COPY SAFETY / DISCLAIMERS (MUST)
- Provide 2–3 short disclaimer copy options as placeholders, e.g.:
  {DIAGNOSTICS_ONLY_DISCLAIMER_OPTION_1}
  {DIAGNOSTICS_ONLY_DISCLAIMER_OPTION_2}
- They must clearly state “diagnostics insights only; repairs are handled by independent providers/workshops” without sounding alarming.
- Recommend exact placement: footer + FAQ + near Compare.

FINAL OUTPUT REQUIREMENTS
- Use clear headings and bullet points.
- No lorem ipsum.
- Use placeholders/tokens where unknown.
- Do not add features beyond SAFE FACTS; if something might be needed, label it {TBD}.

NOW GENERATE THE COMPLETE STRUCTURE + WIREFRAME SPEC.ad