# BYKI UI/UX Implementation Guide
*Built with Next.js 15, React, TypeScript, and Tailwind CSS*
*BYKI Brand Identity FIRST - Stripe Layout Patterns SECOND*
*Last Updated: February 17, 2026*

---

## 🎯 DESIGN PHILOSOPHY

### **BYKI BRAND FIRST**
This design system is built **100% on BYKI's brand identity** from BrandKit.md:
- **Colors**: BYKI green (#28b55f, #004e3c, #28b660) - NO Stripe purple
- **Typography**: Satoshi Regular & Bold ONLY
- **Buttons**: Pill-shaped as specified in BrandKit
- **Visual**: Clean, automotive, minimal - NOT vibrant/gradient-heavy

### **Stripe Patterns SECOND**  
We borrow **layout patterns and interaction design** from Stripe:
- Card-based layouts
- Hover states and animations
- Section structure and spacing
- Grid systems
- BUT we keep BYKI colors, fonts, and brand identity

---

## 📐 DESIGN SYSTEM OVERVIEW

### Design Foundation Documents (Priority Order)
1. **BrandKit.md** ⭐ PRIMARY - BYKI colors, Satoshi fonts, pill buttons, automotive aesthetic
2. **INSTRUCTION.md** - Requirements, mobile responsiveness, features
3. **STRIPE_DESIGN_EXTRACTION.md** - Layout patterns and interaction inspiration ONLY

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Custom CSS (globals.css with BYKI tokens)
- **Typography**: Satoshi Regular (400) & Satoshi Bold (700) - loaded via next/font
- **Icons**: Lucide React (minimal usage per BrandKit)
- **Animations**: CSS transitions (simple, clean)
- **Images**: Unsplash for placeholders, Next.js Image component

---

## 🎨 BYKI DESIGN TOKENS (from BrandKit.md)

### Color Palette - EXACT from BrandKit

```css
/* BYKI Primary Brand Colors */
--byki-dark-green: #004e3c;      /* Headers, navigation bars */
--byki-primary-green: #28b55f;   /* Buttons, actions, highlights, icons */
--byki-light-green: #28b660;     /* Gradient endpoint, accents */

/* BYKI Neutral Colors */
--byki-black: #212123;           /* Headlines, primary body text */
--byki-dark-gray: #7c7c7c;       /* Subheadlines, secondary text, labels */
--byki-medium-gray: #e0e0e0;     /* Backgrounds, secondary buttons, dividers */
--byki-light-gray: #f6f6f6;      /* Canvas background, page backgrounds */
--byki-white: #ffffff;           /* Containers, cards, button text */

/* BYKI Gradients - Simple, Clean */
--byki-gradient-primary: linear-gradient(to right, #004d3d, #28b660);
--byki-gradient-vertical: linear-gradient(to bottom, #004d3d, #28b660);
/* NOTE: NOT multi-color like Stripe - keep it automotive and clean */
```

### Typography - BYKI Satoshi Font ONLY

**Font Family**: Satoshi (loaded via next/font)
**Weights Available**: 
- Regular (400) - Body text, secondary content
- Bold (700) - Headlines, buttons, emphasis

**DO NOT USE**:
- ❌ Inter, SF Pro, or other fonts
- ❌ Font weights like 500, 600, 800, 900
- ✅ USE ONLY: Satoshi Regular (400) and Satoshi Bold (700)

```css
/* Headlines - Satoshi Bold, #212123 (black) */
h1: font-weight: 700; color: #212123; font-size: 36-64px;
h2: font-weight: 700; color: #212123; font-size: 32-48px;
h3: font-weight: 700; color: #212123; font-size: 24-32px;

/* Body Text - Satoshi Regular, #7c7c7c (dark gray) */
p: font-weight: 400; color: #7c7c7c; font-size: 16-18px;

/* Labels - Satoshi Regular, #7c7c7c, uppercase */
label: font-weight: 400; color: #7c7c7c; font-size: 14px;
```

### UI Components - BYKI BrandKit Specifications

#### Buttons - PILL SHAPED (from BrandKit)

**Primary Button:**
- Background: `#28b55f` (solid) OR gradient `#004d3d → #28b660`
- Text: `#ffffff` (white)
- Font: **Satoshi Bold (700)**
- Shape: **Pill-shaped** (border-radius: 9999px)
- Text Transform: Sentence case or Title Case
- Padding: 12px 24px

```css
.btn-primary {
  background: var(--byki-gradient-primary);
  color: var(--byki-white);
  font-weight: 700;
  border-radius: 9999px; /* PILL SHAPE */
  padding: 12px 24px;
}
```

**Secondary Button:**
- Background: `#e0e0e0` (light gray)
- Text: `#7c7c7c` (dark gray)
- Font: **Satoshi Regular (400)** - per BrandKit
- Shape: **Pill-shaped**

```css
.btn-secondary {
  background: var(--byki-medium-gray);
  color: var(--byki-dark-gray);
  font-weight: 400; /* Regular, not Bold */
  border-radius: 9999px; /* PILL SHAPE */
}
```

#### Cards & Containers - BYKI Style

**Standard Card:**
- Background: `#ffffff` (white)
- Border: Subtle 1px or none
- Border Radius: **12-16px** (rounded corners, not pill)
- Shadow: 3% drop shadow
- Padding: 16-24px

```css
.card {
  background: var(--byki-white);
  border-radius: 12px; /* or 16px for larger cards */
  padding: 16px-24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}
```

**Canvas Background:**
- Background: `#f6f6f6` - use for page backgrounds behind white cards

#### Status Badges - BYKI Style

- Background: `#28b55f` (primary green)
- Text: `#ffffff` (white)
- Font: **Satoshi Bold (700)**
- Style: Small, rounded pill
- Text Transform: UPPERCASE or Title Case

```css
.status-badge {
  background: var(--byki-primary-green);
  color: var(--byki-white);
  font-weight: 700;
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 12px;
  text-transform: uppercase;
}
```

---

## 📱 LAYOUT SYSTEM

### Responsive Breakpoints

```css
mobile: 320px - 640px
tablet: 641px - 1024px
desktop: 1025px - 1440px
wide: 1441px+
```

### Container Widths

```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;  /* mobile */
  padding: 0 48px;  /* tablet */
  padding: 0 80px;  /* desktop */
}
```

### Grid Systems

**Feature Grid (3-column desktop, 1-column mobile):**
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 24px;

@media (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 640px) {
  grid-template-columns: 1fr;
}
```

**Statistics Grid (4-column desktop, 2-column mobile):**
```css
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 40px;

@media (max-width: 768px) {
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}
```

---

## 🧱 COMPONENT LIBRARY

### 1. Hero Section

**Requirements:**
- Full viewport height (min-height: 100vh or 600-800px)
- Vibrant diagonal gradient background
- Live counter banner at top
- Large headline with selective green highlighting
- Two-button CTA (Download + Watch Demo)
- Vehicle brand logo row
- Optional: Animated mockup on right side

**Implementation:**

```tsx
// components/sections/Hero.tsx
export function Hero() {
  return (
    <section className="hero-section">
      {/* Live Counter Banner */}
      <div className="live-counter-banner">
        <p className="text-sm">
          Scans performed today: <span className="counter-number">12,847</span>
        </p>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-headline">
            Know your car. <span className="text-highlight">Inside out.</span>
          </h1>
          
          <p className="hero-subtext">
            Professional-grade OBD2 diagnostics in your pocket.
            Decode VINs, read fault codes, and verify vehicle health – 
            from your first scan to your thousandth.
          </p>

          <div className="hero-ctas">
            <button className="btn-primary">
              Download App <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary">
              <Play className="w-5 h-5" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Optional: Device mockup or animated visual */}
        <div className="hero-visual">
          {/* Placeholder for app mockup */}
        </div>
      </div>

      {/* Vehicle Brand Logos */}
      <div className="brand-logos">
        <img src="/brands/ford.svg" alt="Ford" />
        <img src="/brands/bmw.svg" alt="BMW" />
        <img src="/brands/toyota.svg" alt="Toyota" />
        <img src="/brands/mercedes.svg" alt="Mercedes-Benz" />
        <img src="/brands/honda.svg" alt="Honda" />
        <img src="/brands/vw.svg" alt="Volkswagen" />
      </div>
    </section>
  );
}
```

**Corresponding CSS (already in globals.css):**
```css
.hero-section {
  background: var(--gradient-hero);
  /* All styling defined in globals.css */
}
```

---

### 2. Statistics Section (4-Column Grid)

**Pattern:** Inspired by Stripe's "The backbone of global commerce" section

**Requirements:**
- 4 equal columns (2 on mobile)
- Very large numbers (56-64px)
- One number highlighted in green
- Small gray descriptive text
- Counter animation on scroll into view

**Implementation:**

```tsx
// components/sections/Statistics.tsx
export function Statistics() {
  return (
    <section className="stats-section">
      <div className="stats-container">
        <h2 className="stats-headline">
          The diagnostic standard<br />
          for car enthusiasts and professionals
        </h2>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">50,000+</div>
            <div className="stat-description">
              Fault codes in database
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-number highlight">99.9%</div>
            <div className="stat-description">
              Diagnostic accuracy
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-number">200+</div>
            <div className="stat-description">
              Vehicle brands supported
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-number">15K+</div>
            <div className="stat-description">
              Monthly active users
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### 3. Feature Cards (2-Column Large Cards)

**Pattern:** Stripe's feature showcase with embedded mockups

**Requirements:**
- 2-column grid (1-column mobile)
- Arrow icon (↗) in top-right corner
- Gradient or solid backgrounds
- Embedded product mockups
- Hover: lift + shadow increase + arrow movement

**Implementation:**

```tsx
// components/sections/FeatureCards.tsx
const features = [
  {
    title: "Scan and diagnose fault codes – live and historical",
    gradient: "from-byki-green-dark to-byki-green-primary",
    mockup: "/mockups/scan-interface.png",
  },
  {
    title: "Track vehicle diagnostic trends over time",
    gradient: "from-white to-green-50",
    mockup: "/mockups/analytics-chart.png",
  },
];

export function FeatureCards() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="arrow-icon">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              
              <h3 className="feature-card-title">{feature.title}</h3>
              
              <div className="mockup-container">
                <Image 
                  src={feature.mockup || "/api/placeholder/400/300"}
                  alt={feature.title}
                  width={400}
                  height={300}
                  className="mockup-image"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 4. Icon Feature Grid (3-Column)

**Pattern:** Stripe's expert services section

**Requirements:**
- 3 equal columns (1-column mobile)
- Circular icon backgrounds (green)
- Headline + description + arrow link
- Consistent spacing and alignment

**Implementation:**

```tsx
// components/sections/IconFeatureGrid.tsx
const iconFeatures = [
  {
    icon: Gauge,
    title: "Get to diagnostics faster",
    description: "Launch and diagnose vehicle issues with lower operational overhead using embedded components and intuitive tools.",
    link: "/features",
  },
  {
    icon: TrendingUp,
    title: "Understand vehicle health",
    description: "Monitor diagnostic trends including fault patterns, component health, and preventive maintenance needs.",
    link: "/how-it-works",
  },
  {
    icon: Shield,
    title: "Prevent costly repairs",
    description: "Stay ahead with tools for early detection, recall verification, fraud prevention and issue tracking.",
    link: "/features",
  },
];

export function IconFeatureGrid() {
  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {iconFeatures.map((feature, index) => (
            <div key={index} className="icon-feature-item">
              <div className="icon-circle">
                <feature.icon className="w-6 h-6 text-byki-green-primary" />
              </div>
              
              <h3 className="icon-feature-title">{feature.title}</h3>
              <p className="icon-feature-description">{feature.description}</p>
              
              <a href={feature.link} className="arrow-link">
                Learn more <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 5. Testimonial Section

**Pattern:** Stripe's Mindbody testimonial (center-aligned)

**Requirements:**
- Company/person logo at top
- Large quote text in gray
- Attribution (name, title, organization)
- "Read story" CTA
- Center-aligned with max-width

**Implementation:**

```tsx
// components/sections/Testimonial.tsx
export function Testimonial() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-container">
        {/* Logo */}
        <div className="testimonial-logo">
          <Image 
            src="/logos/bmw.svg" 
            alt="BMW" 
            width={120} 
            height={40}
            className="opacity-60"
          />
        </div>

        {/* Quote */}
        <blockquote className="testimonial-quote">
          "BYKI has transformed how we diagnose vehicles.
          From identifying issues to verifying repairs,
          it's become an essential tool in our workshop."
        </blockquote>

        {/* Attribution */}
        <p className="testimonial-attribution">
          Michael Chen, Senior Technician, Premium Auto Care
        </p>

        {/* CTA */}
        <a href="/case-studies" className="testimonial-cta">
          Read the full story <ArrowRight className="inline w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
```

---

### 6. FAQ Accordion

**Pattern:** Expandable list with + icons

**Requirements:**
- Logo/icon + question + expand icon layout
- Light green background on + icon
- Smooth expansion animation
- Mobile-friendly tap targets (min 44px)

**Implementation:**

```tsx
// components/sections/FAQAccordion.tsx
'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "Which vehicles are compatible with BYKI?",
    answer: "BYKI supports 200+ vehicle brands manufactured after 1996 (OBD-II standard). This includes all major manufacturers like Ford, BMW, Toyota, Mercedes-Benz, Honda, and more."
  },
  {
    question: "Do I need a separate OBD2 scanner?",
    answer: "Yes, BYKI works with standard Bluetooth OBD2 adapters. We recommend devices from Veepeak, OBDLink, or BlueDriver for best compatibility."
  },
  // ... more FAQs
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="section-headline mb-12">Frequently Asked Questions</h2>
        
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="faq-question">{faq.question}</span>
                <div className="expand-icon">
                  {openIndex === index ? <Minus /> : <Plus />}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### 7. Horizontal Gradient Program Cards

**Pattern:** Stripe's startup/enterprise program cards

**Requirements:**
- Side-by-side 2-column layout
- Different horizontal gradients
- White or dark text based on background
- Headline + description + CTA link

**Implementation:**

```tsx
// components/sections/ProgramCards.tsx
export function ProgramCards() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* BYKI Pro */}
          <div className="program-card bg-gradient-to-r from-byki-green-dark to-byki-green-primary text-white">
            <h3 className="program-card-title">BYKI Pro</h3>
            <p className="program-card-description">
              Advanced diagnostic features, unlimited scans, and priority support for professional mechanics and enthusiasts.
            </p>
            <a href="/pro" className="program-card-link">
              Upgrade now →
            </a>
          </div>

          {/* BYKI Business */}
          <div className="program-card bg-gradient-to-r from-cyan-600 to-cyan-400 text-white">
            <h3 className="program-card-title">BYKI Business</h3>
            <p className="program-card-description">
              Multi-user accounts, fleet management, and comprehensive reporting for auto repair shops and dealerships.
            </p>
            <a href="/business" className="program-card-link">
              Get started →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 📄 PAGE-SPECIFIC IMPLEMENTATIONS

### Home Page (/)

**Sections in order:**
1. Hero with diagonal gradient + CTAs
2. Statistics grid (4-column)
3. Feature cards (2-column large)
4. Icon feature grid (3-column)
5. How It Works steps
6. Testimonial (center-aligned)
7. FAQ accordion (first 5 questions)
8. Final CTA section

---

### Features Page (/features)

**Structure:**
1. Hero (simpler, text-focused)
2. Icon feature grid (all features, 6-9 items)
3. Feature cards with mockups
4. Comparison table (Free vs Pro)
5. CTA section

---

### How It Works Page (/how-it-works)

**Structure:**
1. Hero with step overview
2. Step-by-step cards (numbered)
3. Visual flow diagram
4. Video demo section
5. FAQ specific to process
6. CTA section

---

### Compare Page (/compare)

**Structure:**
1. Hero explaining comparison tool
2. Side-by-side comparison section:
   - BYKI vs Mechanic visit
   - BYKI vs Other apps
   - Price, time, features grid
3. Statistics backing up claims
4. CTA section

**Implementation:**

```tsx
// app/compare/page.tsx
export default function ComparePage() {
  return (
    <>
      <CompareHero />
      <ComparisonTable />
      <Statistics />
      <FinalCTA />
    </>
  );
}

// components/sections/ComparisonTable.tsx
export function ComparisonTable() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="comparison-grid">
          <div className="comparison-header">
            <div></div>
            <div>BYKI</div>
            <div>Mechanic Visit</div>
            <div>Other Apps</div>
          </div>

          <div className="comparison-row">
            <div className="comparison-label">Cost per scan</div>
            <div className="comparison-value highlight">Free</div>
            <div className="comparison-value">$50-100</div>
            <div className="comparison-value">$10-30</div>
          </div>

          {/* More rows */}
        </div>
      </div>
    </section>
  );
}
```

---

### FAQ Page (/faq)

**Structure:**
1. Simple hero
2. Full FAQ accordion (all questions, categorized)
3. Contact CTA section

---

### Contact Page (/contact)

**Structure:**
1. Two-column layout:
   - Left: Contact form
   - Right: Contact info + map (optional)
2. Form fields with focus states
3. Submit button with loading state

**Implementation:**

```tsx
// app/contact/page.tsx
export default function ContactPage() {
  return (
    <section className="py-24 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h1 className="section-headline mb-8">Get in touch</h1>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" className="form-input" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" className="form-input" />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows={6} className="form-input" />
              </div>

              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h3 className="mb-4">Support</h3>
            <p className="mb-2">support@byki.app</p>
            <p className="mb-8 text-gray-600">We typically respond within 24 hours</p>

            <h3 className="mb-4">Community</h3>
            <div className="flex gap-4">
              {/* Social links */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### VIN Decoder Page (/vin-decoder)

**Structure:**
1. Hero explaining VIN decoder
2. VIN input section (large, prominent)
3. Example VIN results (before user input)
4. How VIN decoding works
5. FAQ about VIN
6. CTA section

---

## 🎨 USING UNSPLASH IMAGES

Since BYKI assets aren't ready, use Unsplash for:

**Automotive Photography:**
```
Hero backgrounds: https://unsplash.com/s/photos/car-dashboard
Workshop scenes: https://unsplash.com/s/photos/auto-mechanic
Vehicle exteriors: https://unsplash.com/s/photos/modern-car
Road/driving: https://unsplash.com/s/photos/highway-aerial
```

**Implementation with Next.js Image:**
```tsx
<Image
  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200"
  alt="Modern vehicle dashboard"
  width={1200}
  height={800}
  className="object-cover"
  priority // for hero images
/>
```

---

## 🎬 ANIMATIONS & INTERACTIONS

### Scroll-Triggered Animations

**Using Intersection Observer:**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function FadeInOnScroll({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}
    >
      {children}
    </div>
  );
}
```

### Counter Animation

```tsx
'use client';

import { useEffect, useState, useRef } from 'react';

export function CountUp({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}
```

---

## 📱 MOBILE RESPONSIVENESS

### Key Principles

1. **Mobile-First Approach**
   - Design for 375px width first
   - Add complexity for larger screens
   - Test on real devices

2. **Touch Targets**
   - Minimum 44px × 44px for all interactive elements
   - Increase padding on buttons for mobile
   - Add more spacing between clickable items

3. **Typography Scaling**
   ```css
   /* Mobile */
   .hero-headline { font-size: 36px; }
   .section-headline { font-size: 32px; }
   
   /* Tablet */
   @media (min-width: 768px) {
     .hero-headline { font-size: 48px; }
     .section-headline { font-size: 40px; }
   }
   
   /* Desktop */
   @media (min-width: 1024px) {
     .hero-headline { font-size: 64px; }
     .section-headline { font-size: 48px; }
   }
   ```

4. **Grid Collapsing**
   - 4-column → 2-column → 1-column
   - Always test breakpoints

5. **Image Optimization**
   ```tsx
   <Image
     src={src}
     alt={alt}
     width={1200}
     height={800}
     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
     className="object-cover"
   />
   ```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Setup (Complete)
- [x] Design system in globals.css
- [x] Color tokens
- [x] Typography system
- [x] Component base styles
- [x] Responsive utilities

### Phase 2: Core Components
- [ ] Update Hero section with new design
- [ ] Create Statistics component
- [ ] Update FeatureGrid with card pattern
- [ ] Create IconFeatureGrid component
- [ ] Update Testimonials component
- [ ] Update FAQAccordion with new design

### Phase 3: Pages
- [ ] Update Home page layout
- [ ] Update Compare page
- [ ] Update FAQ page
- [ ] Update Contact page
- [ ] Update How It Works page
- [ ] Update VIN Decoder page

### Phase 4: Polish
- [ ] Add scroll animations
- [ ] Add counter animations
- [ ] Add hover states
- [ ] Optimize images
- [ ] Test mobile responsiveness
- [ ] Test cross-browser

### Phase 5: Content
- [ ] Replace placeholder images with Unsplash
- [ ] Write compelling copy
- [ ] Add real testimonials
- [ ] Complete all FAQ content
- [ ] Add meta descriptions

---

## 🚀 NEXT STEPS

I'm ready to implement the actual components now. We'll start with:

1. **Hero Section** - Complete redesign with gradient, CTAs, and layout
2. **Statistics Section** - New 4-column grid with counter animations
3. **FeatureGrid** - Update with Stripe-inspired card layout
4. **All other sections** following the same patterns

Would you like me to start implementing these components now?

---

*End of Implementation Guide*
