# BYKI Website Blueprint & Specification

**Date:** February 16, 2026
**Status:** Draft (Sections 1–4)
**Target Market:** Malaysia
**Primary Goal:** Drive App Downloads

---

## SECTION 1 — MINIMAL SITEMAP + RATIONALE

| # | Page | URL Slug | Purpose |
|---|------|----------|---------|
| 1 | **Home** | `/` | Primary landing page. Establishes BYKI's value proposition, drives app downloads with above-the-fold CTA, provides a quick overview, version snapshot, and roadmap. Main SEO entry point. |
| 2 | **How It Works** | `/how-it-works` | Dedicated explainer for the ELM OBD diagnostic flow. Reinforces "diagnose only" positioning. Targets "how to diagnose car" queries using long-tail keywords. |
| 3 | **Compare** | `/compare` | Side-by-side comparison of Generic ELM Diagnosis vs Diagnosis Pro. Conversion-critical for users deciding between versions. |
| 4 | **FAQ** | `/faq` | Addresses common objections (compatibility, safety, capabilities). Powers FAQ Schema markup for rich snippets. Reduces support load. |
| 5 | **Contact** | `/contact` | Low-emphasis support page. Exists for trust signals (E-E-A-T) and users needing help, but de-prioritized vs. download CTA. |
| 6 | **Privacy Policy** | `/privacy` | Required legal page for app store compliance and PDPA (Malaysia). Placeholder content until `content.md` provided. |
| 7 | **Terms of Service** | `/terms` | Required legal page covering app usage terms. Placeholder content until `content.md` provided. |

### Rationale — Why 7 Pages?
- **No separate "About"**: BYKI is an app; trust is built on Home/FAQ.
- **No blog**: Out of scope for MVP.
- **Separate Legal Pages**: Required by app stores and search engines for trust.
- **Dedicated Compare**: Crucial for the upsell (Generic → Pro) and decision making.

---

## SECTION 2 — NEXT.JS ROUTE MAP

```
app/
├── layout.tsx                  # Root layout (global header/footer, fonts, JSON-LD)
├── page.tsx                    # Home (/)
├── how-it-works/
│   └── page.tsx                # How It Works (/how-it-works)
├── compare/
│   └── page.tsx                # Compare (/compare)
├── faq/
│   └── page.tsx                # FAQ (/faq)
├── contact/
│   └── page.tsx                # Contact (/contact)
├── privacy/
│   └── page.tsx                # Privacy Policy (/privacy)
├── terms/
│   └── page.tsx                # Terms of Service (/terms)
├── globals.css                 # Global styles + design tokens
├── fonts.ts                    # Font configuration
└── not-found.tsx               # Custom 404 page with download CTA

components/
├── layout/
│   ├── Header.tsx              # Sticky nav with glassmorphism
│   ├── Footer.tsx              # Curtain-reveal footer
│   ├── MobileNav.tsx           # Slide-in mobile menu
│   └── NavLink.tsx             # Animated links
├── cta/
│   ├── DownloadCTA.tsx         # Dual store buttons
│   ├── DownloadDropdown.tsx    # Header dropdown
│   └── StoreBadge.tsx          # Store icon + rating
├── sections/
│   ├── Hero.tsx                # Home hero
│   ├── HowItWorksSteps.tsx     # 3-5 step flow
│   ├── Capabilities.tsx        # Feature cards
│   ├── VersionSnapshot.tsx     # A vs B preview
│   ├── ComparisonTable.tsx     # Full comparison table
│   ├── Roadmap.tsx             # Coming soon features
│   ├── AppScreenshots.tsx      # Device mockup gallery
│   ├── FAQAccordion.tsx        # FAQ list
│   ├── ContactTeaser.tsx       # "Need help?" block
│   ├── ContactForm.tsx         # Full contact form
│   ├── Disclaimer.tsx          # Diagnostics-only text
│   └── LegalContent.tsx        # Markdown renderer for legal text
├── ui/
│   ├── Button.tsx              # Pill buttons (primary/secondary)
│   ├── Card.tsx                # Rounded cards
│   ├── Accordion.tsx           # Expandable items
│   ├── Badge.tsx               # Numbered steps
│   ├── PhoneMockup.tsx         # Device frame wrapper
│   ├── SectionLabel.tsx        # Uppercase tracking labels
│   ├── Container.tsx           # Layout wrapper
│   └── Input.tsx               # Form fields
└── seo/
    ├── JsonLd.tsx              # Schema injector
    └── MetaTags.tsx            # Metadata helper

lib/
├── constants.ts                # Token definitions ({BYKI_TAGLINE}, etc.)
├── metadata.ts                 # Metadata generators
└── schema.ts                   # Schema generators
```

---

## SECTION 3 — GLOBAL UI COMPONENT SPEC

### 3.1 Sticky Header
- **Position**: Fixed, top: 0, z-index: 1000.
- **States**: Transparent (default) → White/Glassmorphism (scrolled).
- **Left**: `{BYKI_LOGO}` (SVG).
- **Center**: Nav links (Home, How It Works, Compare, FAQ).
- **Right**: "Download BYKI" pill button (Gradient BG).
- **Mobile**: Hamburger menu toggles right-side slide-in panel.

### 3.2 Download CTA
- **Layout**: Row (desktop) / Stack (mobile).
- **Components**: two `StoreBadge` buttons (App Store + Google Play).
- **Fallback**: Display `{DOWNLOAD_FALLBACK_TEXT}` if links empty.

### 3.3 Footer (Curtain Reveal)
- **Behavior**: `position: fixed` behind main content. Main content has rounded bottom corners and scrolls up to reveal footer.
- **Content**:
  - `{FOOTER_CTA_HEADLINE}` + Large Download CTA.
  - Links: Product, Support, Legal.
  - `{COMPANY_DETAILS}` + `{SOCIAL_LINKS}`.
  - Copyright + `{DIAGNOSTICS_ONLY_DISCLAIMER}`.

### 3.4 Contact Form
- **Fields**: Name (opt), Method (Email/WhatsApp), Input (Email/Phone), Reason (opt), Message (req), Consent (req).
- **Consents**: `{PDPA_CONSENT_TEXT}` required checkbox.
- **Success**: Replaced by "Thank you" message + Download CTA.

---

## SECTION 4 — PAGE-BY-PAGE WIREFRAME SPECS

### 4.1 HOME (`/`)
**Goal:** Drive downloads.
- **Hero**: Full viewport. H1 `{BYKI_H1}`, Subhead `{BYKI_SUBHEAD}`, Download CTA, Phone Mockup rising from bottom.
- **How It Works (Teaser)**: 3 steps (Get ELM → Connect → Report). Link to `/how-it-works`.
- **Capabilities**: 4-6 cards (Fault codes, Live data, VIN).
- **Version Snapshot**: Card A (Generic) vs Card B (Pro). Link to `/compare`.
- **Roadmap**: "Coming Soon" list (Booking, E-commerce) - clearly marked as future.
- **Screenshots**: Swiper carousel of app screens.
- **FAQ Teaser**: Top 5 questions. Link to `/faq`.
- **Contact Teaser**: Low emphasis "Need help?".

### 4.2 HOW IT WORKS (`/how-it-works`)
**Goal:** Explain flow & "diagnose only" positioning.
- **Hero**: Compact. H1 "How BYKI Works".
- **Requirements**: Icons for ELM Device + Phone + Car.
- **Step-by-Step**: 5 steps (Buy Device, Plug in, Bluetooth, Scan, Report) with illustrations/icons.
- **Post-Scan**: Explains report value (plain language, shareable).
- **Disclaimer Section**: "Diagnostics Only — We don't repair."

### 4.3 COMPARE (`/compare`)
**Goal:** Decision support (Generic vs Pro).
- **Hero**: Compact. H1 "Compare Versions".
- **Table**: Feature matrix. Key diffs: DTC clearing, Brand protocols, AI analysis.
- **Hardare**: RM60 (Generic) vs RM120 (Pro) device cards.
- **Guidance**: "Choose Generic if..." vs "Choose Pro if..." blocks.

### 4.4 FAQ (`/faq`)
**Goal:** Support & SEO.
- **Hero**: Compact. H1 "Frequently Asked Questions".
- **Accordion**: 8-12 items.
  - Questions: Compatibility, "Can it fix my car?", Data safety.
- **Schema**: `FAQPage` JSON-LD.
- **Sidebar**: Sticky "Need help?" contact teaser (desktop).

### 4.5 CONTACT (`/contact`)
**Goal:** Support (low emphasis).
- **Hero**: Compact. H1 "Get in touch".
- **Form**: Full contact form.
- **Alternatives**: Email & WhatsApp icon blocks.
- **Nudge**: "While you wait, download BYKI" CTA.

### 4.6 PRIVACY (`/privacy`) & TERMS (`/terms`)
**Goal:** Compliance.
- **Header**: Simple H1 + Last Updated date.
- **Content**: Markdown text block `{LEGAL_TEXT}` (placeholder).
- **Identity**: Company details footer.
- **Disclaimer**: Must include "Diagnostics Only" disclaimer in Terms.

---

## SECTION 5 — SEO PLAN (SAFE, MALAYSIA-RELEVANT)

### 5.1 Target Keywords (15 Phrases)

| # | Keyword (EN) | BM Variant | Intent | Target Page |
|---|-------------|------------|--------|-------------|
| 1 | car diagnostic app Malaysia | aplikasi diagnostik kereta | Info / Transactional | Home |
| 2 | OBD2 scanner app | aplikasi OBD2 | Transactional | Home |
| 3 | read car fault codes app | baca kod kereta | Informational | Home, How It Works |
| 4 | car engine check app | semak enjin kereta | Informational | Home |
| 5 | ELM327 OBD app | — | Transactional | Home, Compare |
| 6 | car diagnostic tool for phone | — | Transactional | Home |
| 7 | how to diagnose car problems with phone | cara diagnos masalah kereta | Informational | How It Works |
| 8 | car fault code reader Malaysia | — | Transactional | Home, Compare |
| 9 | DTC code reader app | — | Transactional | Compare |
| 10 | best car diagnostic app Malaysia | aplikasi diagnostik kereta terbaik | Transactional | Home |
| 11 | OBD2 live data app | — | Informational | Compare |
| 12 | car ECU scan app | — | Informational | Compare |
| 13 | clear car fault codes app | padam kod kerosakan kereta | Transactional | Compare |
| 14 | understand car warning lights | lampu amaran kereta | Informational | FAQ |
| 15 | car diagnostic report app | laporan diagnostik kereta | Informational | How It Works |

### 5.2 FAQ Schema Suggestions

| # | Question | Target Rich Snippet |
|---|----------|---------------------|
| 1 | What is an OBD2 car diagnostic app? | Definition |
| 2 | How do I connect an ELM device to my car? | Step |
| 3 | Can I read car fault codes with my phone? | Yes/No |
| 4 | What is the difference between basic and professional car diagnostics? | Comparison |
| 5 | Does a diagnostic app work on all cars in Malaysia? | Compatibility |
| 6 | Can a car diagnostic app fix my car? | Clarification (no) |
| 7 | What is a DTC fault code? | Definition |
| 8 | Is it safe to use an OBD2 scanner on my car? | Trust/safety |

### 5.3 Structured Data Plan

| Schema | Page | Purpose |
|--------|------|---------|
| `Organization` | `layout.tsx` (all pages) | Company identity, contact, social links |
| `WebSite` + `SearchAction` | `layout.tsx` (all pages) | Site-level search (optional, points to `/faq?q=`) |
| `SoftwareApplication` | Home (`/`) | App listing with rating, price, OS |
| `FAQPage` | FAQ (`/faq`) | All Q&A pairs for rich snippets |

### 5.4 Internal Linking Plan

```
HOME → /how-it-works, /compare, /faq, /contact, /privacy, /terms
HOW IT WORKS → /compare, /faq
COMPARE → /how-it-works, /faq
FAQ → /compare, /how-it-works, /contact, /privacy
CONTACT → /faq, /privacy
PRIVACY ↔ TERMS (cross-linked)
All pages → Home (logo), Footer (all links)
```

### 5.5 Core Web Vitals Strategy

| Metric | Target | How |
|--------|--------|-----|
| **LCP** | < 2.5s | Server-rendered H1, `priority` hero images, preloaded fonts |
| **INP** | < 200ms | Minimal client JS, CSS animations, lightweight state |
| **CLS** | < 0.1 | Explicit image dimensions, font fallback metrics, no layout shifts |

**Images:** WebP, Next.js `<Image>`, lazy-load below fold, eager above fold.
**Fonts:** `next/font/local`, self-hosted, weights 400/600/700 only.
**Code splitting:** Automatic via App Router. Swiper loaded dynamically.

---

## SECTION 6 — COPY SAFETY / DISCLAIMERS

### 6.1 Disclaimer Copy Options

**Option 1 — Neutral (footer + Terms):**
> "BYKI provides vehicle diagnostic insights based on OBD-II data. BYKI does not perform, recommend, or facilitate vehicle repairs. Any maintenance or repair work should be carried out by a qualified automotive professional of your choosing."

**Option 2 — Friendly (FAQ + How It Works):**
> "BYKI helps you understand what your car is telling you — but we're not a workshop. Use your diagnostic report to have informed conversations with any mechanic you trust."

**Option 3 — Short (Compare + Home):**
> "Diagnostics only. Repairs are handled by independent workshops and service providers."

### 6.2 Placement Map

| Location | Option | Format |
|----------|--------|--------|
| Footer (all pages) | 1 | 14px muted text, above copyright |
| FAQ ("Can BYKI fix my car?") | 2 | Inline answer text |
| How It Works (positioning section) | 2 | Dedicated paragraph |
| Compare (above bottom CTA) | 3 | Centered one-liner |
| Terms of Service | 1 | Full paragraph |
| Home (before footer) | 3 | Small text block |

### 6.3 Language Rules

**Use:** diagnose, understand, interpret, read, scan, generate report, identify, analyze, prepare, make informed decisions, share with any workshop.

**Never use:** fix, repair, solve, our workshop, book with us, come to our shop, we'll handle it.

**Careful:** "partner workshops" only if confirmed (use `{PARTNER_WORKSHOPS}` token). "Coming soon" features always labeled "in development, subject to change."
