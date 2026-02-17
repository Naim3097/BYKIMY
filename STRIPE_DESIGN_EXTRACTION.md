# Stripe Design System Extraction
*Extracted from https://stripe.com/en-my*
*Date: February 17, 2026*
*Updated with screenshot analysis: February 17, 2026*

---

## 📸 SCREENSHOT ANALYSIS - KEY OBSERVATIONS

### Hero Section (Top of Page)
1. **Top Banner**: Small text "Global GDP running on Stripe: 1.876594 RYR" - live counter
2. **Navigation Bar**: 
   - Left: Stripe logo
   - Center: Products ▼ | Solutions ▼ | Developers ▼ | Resources ▼ | Pricing
   - Right: "Sign in" (text link) | "Contact sales →" (purple button)
3. **Main Headline**: "Financial infrastructure to grow your revenue."
   - Word "revenue" highlighted in brand purple (#635BFF)
   - Large, bold typography (~60-72px estimated)
4. **Subheadline**: Gray text explaining value proposition (2 lines)
5. **CTAs**: 
   - "Get started →" (filled purple button)
   - "Sign up with Google" (white/ghost button with Google icon)
6. **Background**: STUNNING diagonal gradient
   - Colors flow: Orange → Pink → Purple → Magenta
   - Direction: Top-right to bottom-left
   - Organic, wavy, flowing appearance (not straight linear)
7. **Client Logos Row**: OpenAI | Amazon | NVIDIA | Ford | coinbase | Google | Shopify
   - Horizontal layout, evenly spaced
   - Mix of color and monochrome logos

### Section Headline
- "Flexible solutions for every business model." (bold, black)
- Followed by gray descriptive text
- Center-aligned or left-aligned

### Feature Cards Grid
**Layout**: 2-column grid (from screenshot), expands to more rows

**Card 1: "Accept and optimise payments globally – online and in person"**
- Arrow icon (↗) in top-right corner
- Mobile device mockup showing payment interface
- Background: Orange to purple gradient
- Device shows "US$5.46" payment screen

**Card 2: "Enable any billing model"**
- Arrow icon (↗) in top-right corner  
- Usage chart with purple bar graph
- Text showing "Pro Plan" and usage meters
- Background: White to light purple gradient

**Card 3: "Monetise through agentic commerce"**
- Particle/dot explosion visualization in pink/red tones

**Card 4: "Create a card issuing programme"**
- Physical card mockup with vibrant gradient (pink/purple/orange)
- VISA logo visible on card
- 3D perspective/angle

**Card 5: "Access borderless money movement with stablecoins and crypto"**
- Particle visualization forming Africa continent shape
- Blue/purple color scheme

**Card 6: "Embed payments in your platform"**
- "Connected Accounts" interface screenshot
- Clean table/data layout

### Design Elements Observed
- **Border Radius**: Cards appear to be 12-16px rounded corners
- **Shadows**: Soft, subtle shadows on cards creating floating effect
- **Spacing**: Generous gaps between cards (~24-32px estimated)
- **Arrow Icons**: Consistent ↗ symbol in top-right of each card
- **Gradients**: Each card has unique gradient or solid background
- **Typography**: Sans-serif, bold headlines, clean hierarchy
- **Mockups**: High-quality product screenshots embedded in cards
- **Aspect Ratio**: Cards appear roughly 1.2:1 to 1.5:1 height-to-width ratio

---

## 📸 SCREENSHOT 2-4 ANALYSIS - ADDITIONAL OBSERVATIONS

### Photography Integration (Screenshot 2 & 3)
**Conference/Event Cards:**
- Dark background (#1A1B3D) with large venue photography
- Text overlays in white
- Multiple information elements (event name, date, location, logo)
- Photography shows screens with brand gradient for cohesion

**Case Study Hero Images (Hertz Example):**
- **Aerial/Bird's Eye Photography**: Street intersection from above
- Professional, high-quality stock or custom photography
- Real-world context (vehicles, urban environment)
- **Stats Bar Below Image**: 3 metrics in small gray text
  - "160 countries" | "11K+ locations globally" | "Products used..."
- Link: "Read the story →" in purple, right-aligned
- Logo badge introducing case study (yellow square with "H")

**BYKI Adaptation:**
- Aerial highway/road photography
- Workshop/garage environment photos
- OBD2 connection close-ups
- Stats: "50,000+ fault codes" | "200+ vehicle brands" | "Features used: VIN Decoder, Live Scan, AI Analysis"

---

### Purple Diagonal Stripe Pattern (Screenshot 2)
**Observed on "Embed Payments" Card:**
- Subtle diagonal stripe pattern overlay
- Purple/violet color (#635BFF with transparency)
- Top-right corner accent
- Creates visual interest without overwhelming content
- Pattern angle: ~45 degrees

**CSS Implementation:**
```css
.card-with-pattern {
  position: relative;
  overflow: hidden;
}

.card-with-pattern::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 150%;
  height: 150%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(99, 91, 255, 0.03) 10px,
    rgba(99, 91, 255, 0.03) 20px
  );
  pointer-events: none;
}
```

**BYKI Adaptation:**
```css
.byki-card-pattern::before {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(40, 181, 95, 0.04) 10px,
    rgba(40, 181, 95, 0.04) 20px
  );
}
```

---

### Statistics Section - 4-Column Grid (Screenshot 2)
**Layout Observed:**
```
Section Headline (Center-aligned):
"The backbone
 of global commerce"

Stats Grid (4 equal columns):
[   135+    ] [ US$1.4tn  ] [  99.999%  ] [  200M+    ]
[currencies ] [ in payments] [historical ] [   active  ]
[and payment] [ volume pro-] [  uptime   ] [subscript- ]
[  methods  ] [ cessed 2024] [for Stripe ] [   ions    ]
```

**Styling Details:**
- **Numbers**: Very large (~56-64px), bold, dominant
- **Column 2 (US$1.4tn)**: Uses brand purple color (#635BFF)
- **Other numbers**: Black or dark navy
- **Description text**: 14-15px, gray (#6B7280), 2-line max
- **Spacing**: Equal gaps between columns (~32-40px)
- **Background**: Clean white

**BYKI Implementation:**
```
Section Headline:
"The diagnostic standard
 for car enthusiasts and professionals"

Stats Grid:
[  50,000+  ] [    99.9%   ] [   200+    ] [   15K+    ]
[Fault codes] [ Diagnostic ] [  Vehicle  ] [  Monthly  ]
[in database] [  accuracy  ] [   brands  ] [  active   ]
[           ] [           ] [ supported ] [   users   ]
```

**CSS:**
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-top: 64px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 12px;
  color: #212123;
}

.stat-number.highlight {
  color: #28b55f; /* Highlight every 2nd or key stat */
}

.stat-description {
  font-size: 15px;
  color: #7c7c7c;
  line-height: 1.4;
  max-width: 200px;
  margin: 0 auto;
}
```

---

### Abstract Data Visualizations (Screenshot 2)
**Radial Burst Pattern:**
- **Design**: Lines radiating from center point
- **Colors**: Light blue (#6BA3FF) on white/light blue gradient background
- **Purpose**: Visual break between sections, reinforces tech/connectivity theme
- **Effect**: Creates depth and movement

**BYKI Adaptation:**
- **Radial network lines** suggesting vehicle connections/diagnostics
- **Colors**: Green (#28b55f) radiating lines
- **Center**: Could be car icon or OBD2 port icon
- **Background**: White to light green gradient

**SVG/CSS Approach:**
```css
.data-viz-section {
  padding: 96px 0;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
  position: relative;
  overflow: hidden;
}

.radial-burst {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  opacity: 0.4;
}
```

---

### Expandable/Accordion Case Studies (Screenshot 3)
**Layout Pattern:**
```
[Logo Icon] Case study headline text                                    [+]
```

**Observed Examples:**
1. **URBN**: Black square logo - "URBN consolidates $5 billion..." - Purple + button
2. **Instacart**: Green carrot icon - "Instacart powers online grocery..." - Purple + button  
3. **Le Monde**: Black square logo - "Le Monde improves local..." - Purple + button

**Styling:**
- **Background**: White
- **Border**: Bottom border or divider line
- **Padding**: ~24px vertical, ~0px horizontal
- **+ Icon**: Light purple background circle (#F3F0FF), right side
- **Hover**: Slight background color change, cursor pointer
- **Typography**: Bold headline, ~18-20px

**CSS:**
```css
.case-study-accordion-item {
  display: flex;
  align-items: center;
  padding: 24px 0;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.case-study-accordion-item:hover {
  background-color: #fafafa;
}

.case-study-logo {
  width: 48px;
  height: 48px;
  margin-right: 20px;
  flex-shrink: 0;
}

.case-study-text {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #212123;
}

.expand-icon {
  width: 32px;
  height: 32px;
  background: #F3F0FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #635BFF;
  font-size: 20px;
  font-weight: 300;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.case-study-accordion-item:hover .expand-icon {
  transform: scale(1.1);
}
```

**BYKI Adaptation:**
- **Supported Vehicle Brands**: "BMW supports 300+ diagnostic parameters with BYKI"
- **OBD2 Device Partners**: "Veepeak OBD2 adapters integrate seamlessly with BYKI"
- **Repair Shops**: "AutoZone recommends BYKI for customer diagnostics"

---

### Horizontal Gradient Cards (Screenshot 4)
**Pattern 1: Pink → Purple Gradient**
```css
.gradient-card-pink-purple {
  background: linear-gradient(90deg, #EC4899 0%, #9B59FF 100%);
  color: white;
  padding: 32px;
  border-radius: 12px;
}

.gradient-card-pink-purple a {
  color: #ffffff;
  text-decoration: underline;
}
```

**Pattern 2: Orange → Yellow Gradient**
```css
.gradient-card-orange-yellow {
  background: linear-gradient(90deg, #FF6B35 0%, #FFA500 100%);
  color: #1a1a1a;
  padding: 32px;
  border-radius: 12px;
}

.gradient-card-orange-yellow a {
  color: #635BFF;
  font-weight: 600;
}
```

**Layout**: 2-column grid, side-by-side
**Use Case**: Product/program promotion cards
**Content**: Headline + description + CTA link

**BYKI Adaptation:**
```css
/* BYKI Pro Program - Green Gradient */
.byki-gradient-green {
  background: linear-gradient(90deg, #004e3c 0%, #28b660 100%);
  color: white;
}

/* BYKI Business - Teal Gradient */
.byki-gradient-teal {
  background: linear-gradient(90deg, #0891b2 0%, #06b6d4 100%);
  color: white;
}
```

---

### Large Gradient Canvas with Embedded Mockup (Screenshot 4)
**Full-Width Feature Card:**
- **Background**: Large vibrant gradient (purple → pink → orange → yellow)
- **Direction**: Diagonal, left-to-right with vertical flow
- **Embedded Element**: White code/interface mockup (bottom-left)
  - Floating appearance
  - Subtle shadow for depth
  - Shows actual product interface
- **Border Radius**: 16-20px (card itself)
- **Mockup Radius**: 8-12px

**Purpose**: Showcase product/feature with high visual impact

**CSS Structure:**
```css
.large-gradient-canvas {
  background: linear-gradient(135deg, 
    #9B59FF 0%,
    #EC4899 25%,
    #FF6B35 60%,
    #FFA500 100%
  );
  border-radius: 20px;
  padding: 64px;
  position: relative;
  min-height: 500px;
  overflow: hidden;
}

.embedded-mockup {
  position: absolute;
  bottom: 40px;
  left: 40px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}
```

**BYKI Implementation:**
- **Background**: Green gradient (dark green → bright green → teal → lime)
- **Mockup**: Diagnostic scan interface showing live fault codes
- **Position**: Bottom-left or center

---

### Testimonial Section Pattern (Screenshot 4)
**Layout (All Center-Aligned):**
```
[Company Logo]

"Large quote text in gray,
span multiple lines, center-aligned"

Attribution Name, Title, Company

[Read the story →]
```

**Styling Details:**
- **Logo**: Simple wordmark, black, ~100px width
- **Quote**: Large (~24-28px), gray (#6B7280), center-aligned
- **Quote Marks**: Optional, can use typographic quotes
- **Attribution**: Smaller (16px), black, center-aligned
- **CTA**: Purple link, center-aligned
- **Background**: Clean white
- **Padding**: Generous (~80px vertical)
- **Max Width**: ~900px for quote text

**CSS:**
```css
.testimonial-section {
  padding: 96px 80px;
  text-align: center;
  background: white;
}

.testimonial-logo {
  margin: 0 auto 48px;
  height: 32px;
}

.testimonial-quote {
  font-size: 28px;
  line-height: 1.5;
  color: #6B7280;
  max-width: 900px;
  margin: 0 auto 32px;
  font-weight: 400;
}

.testimonial-attribution {
  font-size: 16px;
  color: #212123;
  margin-bottom: 24px;
}

.testimonial-cta {
  color: #635BFF;
  font-weight: 600;
  text-decoration: none;
}

.testimonial-cta:hover {
  text-decoration: underline;
}
```

**BYKI Example:**
```
[BMW Logo or Auto Shop Logo]

"BYKI has transformed how we diagnose vehicles.
From identifying issues to verifying repairs,
it's become an essential tool in our workshop."

Michael Chen, Senior Technician, Premium Auto Care

[Read the full story →]
```

---

### Client Logo Grid (Screenshot 4)
**Horizontal Row Pattern:**
```
[mindbody]  [JOBBER]  [substack]  [lightspeed]
```

**Styling:**
- **Filter**: Grayscale or low opacity for uniformity
- **Sizing**: Consistent height (~24-32px), variable width
- **Spacing**: Equal gaps (~40-56px)
- **Alignment**: Center-aligned
- **Background**: Light gray (#F9FAFB) or white
- **Hover**: Can increase opacity or remove grayscale

**CSS:**
```css
.client-logo-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 56px;
  padding: 48px 0;
  background: #F9FAFB;
}

.client-logo {
  height: 28px;
  width: auto;
  filter: grayscale(100%) opacity(0.6);
  transition: filter 0.3s;
}

.client-logo:hover {
  filter: grayscale(0%) opacity(1);
}
```

**BYKI Implementation:**
- Vehicle brand logos: Ford, BMW, Toyota, Honda, etc.
- OBD2 device partners: Veepeak, OBDLink, BlueDriver, etc.
- Or: Number of brands supported as text

---

### Dark Footer Introduction (Screenshot 4)
**Background:** Dark navy (#0A2540)
**Text:** White and light gray
**Pattern:**
```
Large Headline (White, Bold)
Subheadline (Light gray, Regular)
```

**Example:**
"Reliable, extensible infrastructure for every stack."
"Adapt Stripe to your technical needs with flexible integration options."

**CSS:**
```css
.footer-intro {
  background: #0A2540;
  padding: 96px 80px;
  color: white;
}

.footer-headline {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.footer-subheadline {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.7);
  max-width: 700px;
}
```

**BYKI Adaptation:**
```
"Comprehensive diagnostics for every vehicle."
"BYKI supports 200+ vehicle brands with real-time
fault code analysis and AI-powered insights."
```

---

## 🎨 VISUAL AESTHETIC OVERVIEW

### Core Design Philosophy
- **Clean, Modern & Professional** - Enterprise-grade fintech aesthetic
- **Vibrant & Bold** - Striking gradient backgrounds with orange, pink, purple, and magenta
- **Asset-Heavy** - High-quality imagery, illustrations, and UI mockups throughout
- **Interactive & Animated** - Smooth transitions, micro-interactions, scroll-driven animations
- **Product-Focused** - Heavy use of product screenshots and interface mockups embedded in cards
- **Data-Driven** - Large numbers, statistics, and metrics prominently displayed (e.g., "Global GDP running on Stripe: 1.876594 RYR")
- **Whitespace** - Generous use of negative space for breathing room
- **Gradient-Rich** - Flowing, organic gradients create depth and visual interest

---

## 🖼️ ASSET STRATEGY

### Visual Asset Types

#### 1. **Product Screenshots & UI Mockups**
- High-fidelity mockups of payment terminals, checkout screens, dashboards
- **Embedded in cards** with gradient backgrounds
- **Floating appearance** with shadows
- Examples observed:
  - Mobile payment terminal interfaces ("US$5.46" payment screen)
  - E-commerce checkout screens with multiple payment options
  - Usage-based billing panels with charts and meters (purple bar graphs)
  - "Connected Accounts" table interfaces with data
  - Code snippets/API examples in white containers
  
**Implementation for BYKI:**
- High-quality mockups of the diagnostic scanner interface
- Mobile app screenshots showing OBD2 connection process
- Dashboard previews with fault code readings
- VIN decoder results screens
- Diagnostic report visualizations

#### 2. **Product Photography**
- Clean, professional product images
- Subtle shadows and depth
- Minimal backgrounds (white/light gray)

**Implementation for BYKI:**
- OBD2 scanner device photography
- Car diagnostic scenarios
- Mobile device showing app in use
- Diagnostic connector close-ups

#### 3. **Brand Logos & Client Showcase**
- **Horizontal row layout** below hero CTAs
- Logos observed in hero: OpenAI, Amazon, NVIDIA, Ford, coinbase, Google, Shopify
- **Logo introduction badges**: Square or circular badges with logo (Yellow "H" for Hertz)
- **Monochrome logo grid**: mindbody, JOBBER, substack, lightspeed (grayscale, equal sizing)
- **Client story cards**: Company logo + abstract graphic or photography
- Clean, consistent sizing and spacing (40-56px gaps)
- Filter: Grayscale at 60% opacity, full color on hover

**Implementation for BYKI:**
- **Hero row**: Ford | BMW | Toyota | Mercedes-Benz | Honda | Volkswagen | Audi | Nissan
- **Badge introductions**: Circular logo badges for featured vehicle brands
- **OBD2 Partners grid**: Veepeak, OBDLink, BlueDriver, Carista (monochrome)
- Compatible OBD2 device brands showcase
- Auto parts retailer partnerships (AutoZone, O'Reilly, NAPA)

#### 4. **Atmospheric/Conceptual Photography**
- High-quality lifestyle and conceptual images
- Examples observed:
  - **Aerial views**: Street intersection with crosswalks, yellow taxi (Hertz case study)
  - **Conference photography**: Large venue with crowd, stage, branded screens
  - **Dynamic backgrounds**: Teal water waves (Runway card)
  - **Professional, high-resolution** stock or custom photography
- Subtle brand integration in photography
- **Stats bar beneath photos**: 3 metrics in gray text ("160 countries | 11K+ locations | Products used...")

**Implementation for BYKI:**
- **Aerial automotive photography**: Highway intersections, parking lots with vehicles
- Workshop/garage environments with mechanics
- Road trip/driving scenarios (dashboard view)
- OBD2 connection close-ups
- Under-the-hood diagnostic scenarios
- Modern vehicle interiors
- Stats beneath: "50,000+ codes | 200+ brands | Features: VIN, Live Scan, AI"

#### 5. **Data Visualizations & Charts**
- Bar charts showing usage over time
- Real-time counters (e.g., "Global GDP running on Stripe: 1.876594 RYR")
- Statistics displays
- **Abstract visualizations**: Radial burst patterns, particle formations
- **Usage charts**: Purple bar graphs embedded in cards
- **Live metrics**: Top banner displaying real-time data

**Implementation for BYKI:**
- Fault code trend graphs (bar charts with green accent)
- Diagnostic history charts (line graphs showing scan patterns)
- Vehicle health scores (circular progress indicators)
- Mileage verification visualizations
- Radial network diagram (OBD2 parameters radiating from center)
- Live scan counter in top banner

---

## 🎭 LAYOUT & COMPOSITION

### Page Structure

#### Hero Section
```
- Small top banner with live metric (e.g., "Global GDP running on Stripe: 1.876594 RYR")
- Bold, large headline (H1) with selective color highlighting ("revenue" in purple/blue)
- Concise subheadline explaining value proposition (2-3 lines)
- Primary CTA buttons (2 options: filled button + ghost/outline button)
- Background: VIBRANT diagonal gradient (orange → pink → purple → magenta)
- Gradient flows diagonally from top-right to bottom-left
- Client logos row below CTAs (7-8 major brands)
- Often includes animated hero visual or product mockup
```

**Example from Stripe:**
```
Top banner: "Global GDP running on Stripe: 1.876594 RYR"

Headline: "Financial infrastructure to grow your revenue."
[Note: "revenue" is highlighted in brand purple color]

Subtext: "Accept payments, offer financial services and implement 
custom revenue models – from your first transaction to your billionth."

CTAs: [Get started →] (purple button) [Sign up with Google] (white/outline button with icon)

Logos: OpenAI | Amazon | NVIDIA | Ford | coinbase | Google | Shopify
```

**Adaptation for BYKI:**
```
Top banner: "Scans performed today: 12,847" (or similar live metric)

Headline: "Know your car. Inside out."
[Note: "Inside out" in brand green #28b55f]

Subtext: "Professional-grade OBD2 diagnostics in your pocket. 
Decode VINs, read fault codes, and verify vehicle health – 
from your first scan to your thousandth."

CTAs: [Download App →] (green gradient button) [Watch Demo] (white/outline button with play icon)

Background: Diagonal gradient (dark green → bright green → teal → lime)
OR automotive-themed gradient (charcoal → green → silver)

Logos: Ford | BMW | Toyota | Mercedes-Benz | Honda | Volkswagen | Audi
```

#### Feature Grid Sections
- **Two or Three-column grid layouts** (desktop) - screenshot shows 2-column for larger cards
- **Card-based design** with rounded corners (~12-16px border radius)
- **Each card contains:**
  - Headline at top (bold, ~24-28px)
  - Arrow icon in top-right corner (↗) indicating clickability
  - Large product mockup/screenshot embedded in card
  - Gradient or solid color background within card
  - Soft shadow effect (floating appearance)
- **Varied background gradients per card** (purple, orange, pink combinations)
- **Generous spacing** between cards (~24-32px gaps)
- **Section headline above grid** ("Flexible solutions for every business model.")
- **Secondary description text** in gray below section headline

#### Product Showcase Sections
- Large product screenshots/mockups on one side
- Text content on the other
- Alternating left/right image placement
- Scroll-triggered animations

#### Statistics Sections
```
Layout: 4-column grid
Style: Large number + description below
Example:
  135+                    US$1.4tn
  currencies and          in payments volume
  payment methods         processed in 2024
```

**Adaptation for BYKI:**
```
  50,000+                 200+
  fault codes             vehicle makes
  in database             supported

  99.9%                   10K+
  diagnostic              active users
  accuracy                scanning daily
```

#### Client Showcase / Case Studies
- Card-based layouts
- Company logo + headline + brief description
- "Read story" CTA links
- Soft shadows on cards

---

## 🎨 COLOR PALETTE

### Stripe's Color System (Observed from Screenshot)

#### Primary Colors
- **Stripe Purple/Blue** - `#635BFF` (buttons, highlighted text, accents)
- **Deep Navy/Black** - `#0A2540` (text, navigation items)
- **White** - `#FFFFFF` (backgrounds, ghost buttons)

#### Accent Colors
- **Bright Blue** - For links and interactive elements
- **Soft Gray** - Background sections (`#F6F9FC` approximate)
- **Medium Gray** - Secondary text (`#425466` approximate)
- **Light Gray** - Borders and dividers (`#E3E8EE`)

#### Hero Gradient Colors (Exact from Screenshot)
- **Orange** - `#FF9A56` or `#FF8C42` (approximate)
- **Pink** - `#FF6B9D` or `#FF7BAC` (approximate)
- **Purple** - `#9B59FF` or `#A855F7` (approximate)  
- **Magenta** - `#E64398` or `#EC4899` (approximate)
- **Gradient Direction**: Diagonal from top-right to bottom-left (~135deg)
- **Gradient Type**: Smooth, flowing, organic (not purely linear - appears to use mesh or radial overlays)
- **Gradient Stops**: Colors blend seamlessly with large transition zones
- **Visual Effect**: Creates depth, energy, and premium feel

**CSS Implementation (Approximate):**
```css
.stripe-hero-gradient {
  background: linear-gradient(135deg, 
    #FF8C42 0%,      /* Orange */
    #FF7BAC 30%,     /* Pink */
    #A855F7 60%,     /* Purple */
    #EC4899 100%     /* Magenta */
  );
}

/* More advanced with radial overlay for organic feel */
.stripe-hero-gradient-advanced {
  background: 
    radial-gradient(circle at 80% 20%, rgba(255, 140, 66, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 60% 40%, rgba(255, 123, 172, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.8) 0%, transparent 50%),
    linear-gradient(135deg, #FF8C42 0%, #EC4899 100%);
}
```

#### Card Background Gradients
- **Orange to Purple** - Used in payment cards section
- **White to Light Purple** - Used in billing/analytics cards
- **Pink/Purple particles** - Abstract visualizations
- **Blue/Purple particles** - Crypto/borderless sections

---

## 📐 TYPOGRAPHY

### Stripe's Typography System (Observed from Screenshot)

#### Font Family
- **Sans-serif system** - Clean, modern, appears to be custom font or well-optimized web font
- High readability with geometric proportions
- Likely Inter, SF Pro, or custom Stripe font

#### Hierarchy (Measured from Screenshot)
```
Top Banner:
  - Font Size: ~13-14px
  - Weight: Regular (400)
  - Color: Dark (#0A2540)
  - Letter Spacing: Normal

Navigation:
  - Font Size: ~15-16px
  - Weight: Medium (500-600)
  - Color: Dark (#0A2540)
  - Hover: Slight color shift or underline

H1 (Hero Headlines):
  - Font Size: ~60-72px (estimated from screenshot)
  - Weight: Bold (700)
  - Line Height: 1.1-1.2
  - Letter Spacing: Tight (-0.02em to -0.01em)
  - Color: Dark (#0A2540) with selective highlighting
  - Highlighting: Key word(s) in brand color (#635BFF)
  - Example: "Financial infrastructure to grow your revenue."
    (word "revenue" in purple)

H2 (Section Headlines - "Flexible solutions..."):
  - Font Size: ~40-48px
  - Weight: Bold (700)
  - Line Height: 1.2-1.3
  - Color: Dark (#0A2540)

H3 (Card Headlines):
  - Font Size: ~22-26px
  - Weight: Bold (600-700)
  - Line Height: 1.3-1.4
  - Color: Dark (#0A2540) or White (on gradient cards)

Body Text (Subheadlines):
  - Font Size: 18-20px
  - Weight: Regular (400)
  - Line Height: 1.5-1.6
  - Color: Medium gray (#6B7280 or similar)

Body Text (General):
  - Font Size: 16-18px
  - Weight: Regular (400)
  - Line Height: 1.5-1.6
  - Color: Dark gray (#425466)

Button Text:
  - Font Size: 16px
  - Weight: Semi-bold (600)
  - Color: White (primary) or Dark (secondary)

Small Text / Labels:
  - Font Size: 14px
  - Weight: Medium (500)
  - Color: Medium gray
```

### Adaptation for BYKI
Use **Satoshi** font family (from BrandKit) with similar hierarchy:

```
Top Banner (Live Counter):
  - Font: Satoshi Regular
  - Size: 13-14px
  - Color: #212123
  - Example: "Scans performed today: 12,847"

Navigation:
  - Font: Satoshi Medium
  - Size: 15-16px
  - Color: #212123
  - Hover: #28b55f

H1 (Hero Headlines):
  - Font: Satoshi Bold
  - Size: 56-68px
  - Line Height: 1.1
  - Letter Spacing: -0.02em
  - Color: #212123
  - Highlighting: Key phrase in #28b55f
  - Example: "Know your car. Inside out."
    ("Inside out" in green)

H2 (Section Headlines):
  - Font: Satoshi Bold
  - Size: 40-48px
  - Line Height: 1.2
  - Color: #212123

H3 (Card Headlines):
  - Font: Satoshi Bold
  - Size: 24-28px
  - Line Height: 1.3
  - Color: #212123

Body (Hero Subheadline):
  - Font: Satoshi Regular
  - Size: 18-20px
  - Line Height: 1.5
  - Color: #7c7c7c

Body (General):
  - Font: Satoshi Regular
  - Size: 16-18px
  - Line Height: 1.6
  - Color: #212123

Button Text:
  - Font: Satoshi Bold
  - Size: 16px
  - Color: White or #212123

Small / Labels:
  - Font: Satoshi Regular
  - Size: 14px
  - Color: #7c7c7c
```

**Implementation Example:**
```css
/* Headline with selective highlighting */
.hero-headline {
  font-family: 'Satoshi', sans-serif;
  font-size: 64px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #212123;
}

.hero-headline .highlight {
  color: #28b55f;
}
```

```jsx
// React/JSX Example
<h1 className="hero-headline">
  Know your car. <span className="highlight">Inside out.</span>
</h1>
```

---

## 🎬 ANIMATIONS & INTERACTIONS

### Observed Animation Patterns

#### 1. **Scroll-Triggered Animations**
- Fade in + slide up on scroll
- Stagger animations for list items
- Parallax effects (subtle)
- Image reveals

#### 2. **Hover States**
- Cards lift slightly with shadow increase
- Buttons change background color
- Links underline or shift color
- Smooth transitions (200-300ms)

#### 3. **Loading States**
- Skeleton screens for content loading
- Smooth transitions between states

#### 4. **Micro-interactions**
- Button click feedback
- Form input focus states
- Dropdown animations
- Modal entrance/exit animations

### Implementation Approach
```javascript
// Example: Scroll-triggered fade-in
.fade-in-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 🧱 UI COMPONENTS

### Buttons (Observed from Screenshot)

#### Primary Button (Stripe Style - "Get started")
```css
.btn-primary-stripe {
  background: #635BFF; /* Solid purple/blue */
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(99, 91, 255, 0.2);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary-stripe::after {
  content: '→';
  font-size: 18px;
}

.btn-primary-stripe:hover {
  background: #5046E5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3);
}
```

#### Secondary/Ghost Button (Stripe Style - "Sign up with Google")
```css
.btn-secondary-stripe {
  background: white;
  color: #0A2540;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  border: 1px solid #E3E8EE;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.btn-secondary-stripe:hover {
  background: #F6F9FC;
  border-color: #D1D5DB;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Icon (Google logo) */
.btn-secondary-stripe .icon {
  width: 20px;
  height: 20px;
}
```

#### BYKI Adaptation - Buttons
```css
/* Primary CTA Button - "Download App" */
.btn-primary-byki {
  background: linear-gradient(180deg, #28b660 0%, #1a8a47 100%);
  color: white;
  padding: 14px 28px;
  border-radius: 8px; /* Slightly more rounded than Stripe */
  font-family: 'Satoshi', sans-serif;
  font-weight: 700;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(40, 181, 95, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary-byki::after {
  content: '→';
  font-size: 18px;
}

.btn-primary-byki:hover {
  background: linear-gradient(180deg, #2dd46f 0%, #1f9d51 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(40, 181, 95, 0.35);
}

/* Secondary/Ghost Button - "Watch Demo" */
.btn-secondary-byki {
  background: white;
  color: #212123;
  padding: 14px 28px;
  border-radius: 8px;
  font-family: 'Satoshi', sans-serif;
  font-weight: 600;
  font-size: 16px;
  border: 2px solid rgba(40, 181, 95, 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-secondary-byki:hover {
  background: rgba(40, 181, 95, 0.05);
  border-color: #28b55f;
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(40, 181, 95, 0.15);
}

/* Icon for secondary button (play icon for "Watch Demo") */
.btn-secondary-byki .icon {
  width: 18px;
  height: 18px;
  color: #28b55f;
}

/* Outline variant - "Sign In" */
.btn-outline-byki {
  background: transparent;
  color: #28b55f;
  padding: 10px 20px;
  border-radius: 6px;
  font-family: 'Satoshi', sans-serif;
  font-weight: 600;
  font-size: 15px;
  border: 1.5px solid #28b55f;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-byki:hover {
  background: #28b55f;
  color: white;
  transform: translateY(-1px);
}
```

### Cards (Observed from Screenshot)

#### Stripe Card Component - Feature Cards
```css
.feature-card {
  position: relative;
  background: white; /* or gradient */
  border-radius: 12-16px; /* Observed */
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden; /* For gradient backgrounds */
  min-height: 400px; /* Approximate from screenshot */
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

/* Arrow icon in top-right corner */
.feature-card::after {
  content: '↗'; /* Diagonal arrow up-right */
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 24px;
  color: rgba(0, 0, 0, 0.4);
  transition: transform 0.2s, color 0.2s;
}

.feature-card:hover::after {
  transform: translate(4px, -4px);
  color: #635BFF;
}

/* Card headline */
.feature-card h3 {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0 0 24px 0;
  padding-right: 48px; /* Space for arrow */
  color: #0A2540;
}

/* Product mockup inside card */
.feature-card .mockup {
  margin-top: auto;
  transform: scale(1);
  transition: transform 0.3s;
}

.feature-card:hover .mockup {
  transform: scale(1.02);
}
```

#### BYKI Adaptation - Feature Cards
```css
.byki-feature-card {
  position: relative;
  background: #ffffff;
  border-radius: 16px; /* Slightly more rounded per BrandKit */
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 78, 60, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  overflow: hidden;
  min-height: 420px;
  cursor: pointer;
}

.byki-feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 78, 60, 0.15);
}

/* Arrow icon - use green accent */
.byki-feature-card .arrow-icon {
  position: absolute;
  top: 28px;
  right: 28px;
  width: 24px;
  height: 24px;
  opacity: 0.5;
  transition: all 0.3s;
}

.byki-feature-card:hover .arrow-icon {
  opacity: 1;
  transform: translate(4px, -4px);
  color: #28b55f;
}

/* Card with gradient background */
.byki-feature-card.with-gradient {
  background: linear-gradient(180deg, #FF6B35 0%, #9B59FF 100%);
  color: white;
}

.byki-feature-card.with-gradient h3 {
  color: white;
}

/* Product mockup positioning */
.byki-feature-card .device-mockup {
  margin-top: 40px;
  max-width: 100%;
  height: auto;
  transition: transform 0.3s;
}

.byki-feature-card:hover .device-mockup {
  transform: scale(1.03) translateY(-4px);
}
```

### Input Fields

#### Stripe Style
- Clean, minimal borders
- Focus states with color accent
- Floating labels or top-aligned labels
- Generous padding

```css
.input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #E3E8EE;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #635BFF;
  box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.1);
}
```

#### BYKI Adaptation
```css
.input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-family: 'Satoshi', sans-serif;
  font-size: 16px;
  color: #212123;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus {
  outline: none;
  border-color: #28b55f;
  box-shadow: 0 0 0 3px rgba(40, 181, 95, 0.1);
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints (Stripe-inspired)
```
Mobile: 320px - 640px
Tablet: 641px - 1024px
Desktop: 1025px - 1440px
Large Desktop: 1441px+
```

### Mobile Adaptations
- Single column layouts
- Stacked instead of side-by-side
- Larger touch targets (min 44px)
- Hamburger navigation
- Bottom navigation bars (for apps)

---

## 🧩 SPACING SYSTEM

### Stripe's Spacing Scale (8px base) - Observed from Screenshot

**Navigation Bar:**
- Height: ~64-72px
- Horizontal padding: ~80px (left/right page margins)
- Gap between nav items: ~28-32px
- Gap between nav sections: ~40px (between "Pricing" and "Sign in")

**Hero Section:**
- Top banner: ~40px height
- Headline font size: ~60-72px
- Subheadline font size: ~18-20px
- Gap between headline and subheadline: ~16-20px
- Gap between subheadline and CTAs: ~32px
- Gap between CTA buttons: ~12-16px
- Gap between CTAs and logo row: ~48-64px
- Logo row item spacing: ~40-48px

**Feature Cards Grid:**
- Gap between cards (horizontal): ~24px
- Gap between cards (vertical): ~24px
- Card padding (internal): ~32-40px
- Section headline to cards gap: ~48px

**General Spacing:**
```
2px   - Ultra-tight (borders)
4px   - Tight spacing
8px   - Small spacing (icon gaps)
12px  - Compact spacing (button icon gap)
16px  - Standard spacing (text blocks)
24px  - Medium spacing (card gaps)
32px  - Large spacing (section elements)
40px  - XL spacing (navigation items)
48px  - XXL spacing (between major sections)
64px  - Hero spacing (between hero and content)
80px  - Page margins (left/right)
96px  - Section spacing (between major sections)
128px - Hero spacing (top/bottom of hero)
```

### BYKI Spacing Implementation
Use the same 8px-based system for consistency and harmony.

**Recommended Application:**
- Page margins: 80px desktop, 24px mobile
- Section spacing: 96px desktop, 64px mobile  
- Card gaps: 24px
- Internal card padding: 32px
- Button padding: 14px (vertical) × 28px (horizontal)
- Headline to body gap: 16px
- Body to CTA gap: 32px

---

## 🎯 NAVIGATION

### Header/Navigation

### Navigation Header (Observed from Screenshot)

**Stripe's Navigation Pattern:**
```
[Logo]  [Products ▼] [Solutions ▼] [Developers ▼] [Resources ▼] [Pricing]          [Sign in] [Contact sales →]
```

- **Logo**: Left-aligned, ~100-120px width
- **Nav Items**: Horizontal menu with dropdown indicators (▼) for some items
- **Spacing**: ~24-32px between nav items
- **Right Side CTAs**: 
  - "Sign in" - Text link or subtle outline button
  - "Contact sales" - Purple/blue button with arrow (→)
- **Background**: White/transparent
- **Height**: ~60-72px
- **Font**: Sans-serif, medium weight (500-600)
- **Sticky**: Yes, with subtle shadow on scroll
- **Hover**: Underline or color change

#### BYKI Adaptation
```
[BYKI Logo] [Features ▼] [How It Works] [VIN Decoder] [FAQ] [Contact]     [Sign In] [Download App →]
```

- **Logo**: BYKI chevron + wordmark (~100px width)
- **Background**: White with subtle shadow on scroll  
- **Height**: ~64-72px
- **Font**: Satoshi Medium (nav items), Satoshi Bold (CTA buttons)
- **Colors**: 
  - Nav text: #212123
  - Hover: #28b55f
  - Sign In: Outline button (border: #28b55f)
  - Download App: Filled green gradient button with arrow →
- **Mobile**: Hamburger menu (☰) on right, collapse nav items

### Footer

#### Stripe's Footer Pattern
- Multi-column layout (4-5 columns)
- Product links, resources, company info
- Social media icons
- Legal links at bottom
- Dark or light background options

---

## 📊 SPECIFIC SECTIONS TO IMPLEMENT

### 1. Hero Section with Product Mockup
**Layout:**
- Left: Large headline + subtext + CTAs
- Right: Animated product screenshot/mockup
- Background: White or subtle gradient

### BYKI Adaptation (Following Stripe's Pattern)
```
[Top Banner - Small, centered]
"Scans performed today: 12,847" (live counter animation)

[Large Headline - Center aligned]
"Know your car. Inside out."
[Word "Inside out" in brand green #28b55f]

[Subtext - Center aligned, gray color]
"Professional-grade OBD2 diagnostics in your pocket.
Decode VINs, read fault codes, and verify vehicle health – 
from your first scan to your thousandth."

[CTAs - Center aligned]
[Get Started →] (green gradient button) [Watch Demo ▶] (white outline button)

[Client/Partner Logos Row]
Ford | BMW | Toyota | Mercedes | Honda | Volkswagen | Audi | Nissan
(Grayscale logos, equal sizing)

[Background]
Vibrant diagonal gradient (dark green → bright green → teal → lime)
Flowing from top-right to bottom-left, organic/wavy effect

[Optional Right Side - if not using full-width centered hero]
- Animated iPhone mockup showing BYKI app
- 3D rotation or scroll-triggered animation  
- Screenshot showing diagnostic scan in progress with fault codes
```

### 2. Feature Grid (2-3 Columns, Card-Based)
**BYKI Feature Cards (Following Stripe's card pattern):**

**Layout Options:**

**Option A: Large 2-Column Cards (Screenshot 1 pattern)**
- **Card 1: "Scan and diagnose fault codes globally – live and historical"**
  - Arrow icon (↗) in top-right
  - Mobile device mockup showing real-time OBD2 scan
  - Gradient background: Green to teal or Orange to purple
  - Rounded corners (16px)
  - Floating shadow effect

- **Card 2: "Track any vehicle diagnostic trend"**
  - Arrow icon (↗) in top-right
  - Chart/graph showing diagnostic trends over time
  - Gradient background: White to light green
  - Bar chart with green accent colors

**Option B: 3-Column Icon Grid (Screenshot 4 pattern)**
- **Equal columns** with circular icon backgrounds
- **Column 1: "Get to diagnostics faster"**
  - Purple circle icon (rocket/speed icon)
  - Description + "Learn more →" link
  
- **Column 2: "Understand vehicle health"**
  - Purple circle icon (graph/analytics icon)
  - Description + "Learn more →" link
  
- **Column 3: "Prevent costly repairs"**
  - Purple circle icon (shield/protection icon)
  - Description + "Learn more →" link

**Option C: Client Story Cards (Screenshot 3-4 pattern)**
- **Variable visual styles**: Abstract graphics, photography, logos
- **Card backgrounds**: Dark navy, gradient, or photographic
- **Content**: Logo + headline + description + "Read story →"
- **Examples**:
  - BMW: Abstract 3D gradient graphic on dark background
  - Toyota: Dynamic photograph with logo overlay
  - Ford: Green logo on dark background with grid pattern
  - Honda: Purple gradient with logo treatment

### 3. Product Showcase (Alternating Layouts)
**Section 1:** 
- Image Left: Screenshot of fault code library
- Text Right: "Access 50,000+ Fault Codes"

**Section 2:**
- Text Left: "Track Your Vehicle's Health Over Time"
- Image Right: Screenshot of history/timeline view

**Section 3:**
- Image Left: Screenshot of repair suggestions
- Text Right: "Get AI-Powered Repair Guidance"

### 4. Statistics Section
```
50,000+                    99.9%
Fault Codes                Diagnostic Accuracy

200+ Brands                10K+ Users
Vehicle Support            Active Scanners
```

### 5. Testimonials/Case Studies
Cards with:
- User photo or icon
- Quote
- Name + role (e.g., "Independent Mechanic" / "Car Enthusiast")
- Star rating

---

## 🎨 GRADIENT & SHADOW USAGE

### Gradients

#### Stripe Approach
- Subtle background gradients
- Radial gradients for glow effects
- Linear gradients on buttons and accents

#### BYKI Gradients (Stripe-Inspired)
```css
/* Hero Background Gradient - Diagonal, vibrant */
.gradient-hero {
  background: linear-gradient(135deg, 
    #004e3c 0%,      /* Dark green */
    #28b660 35%,     /* Primary green */
    #5DD68D 65%,     /* Light green */
    #A8E6CF 100%     /* Mint green */
  );
}

/* Alternative Hero - More automotive feel */
.gradient-hero-alt {
  background: linear-gradient(135deg,
    #1a1a1a 0%,      /* Charcoal */
    #004e3c 30%,     /* Dark green */
    #28b660 60%,     /* Primary green */
    #C0C0C0 100%     /* Silver */
  );
}

/* Button Gradient */
.gradient-button {
  background: linear-gradient(180deg, #28b660 0%, #004e3c 100%);
}

/* Card Background Gradients */
.card-gradient-1 {
  background: linear-gradient(180deg, #FF6B35 0%, #9B59FF 100%);
  /* Orange to purple - for feature highlights */
}

.card-gradient-2 {
  background: linear-gradient(180deg, #FFFFFF 0%, #E8D5FF 100%);
  /* White to light purple - for data/analytics */
}

/* Background Glow */
.bg-glow {
  background: radial-gradient(circle at top right, 
    rgba(40, 181, 95, 0.15) 0%, 
    rgba(40, 181, 95, 0.05) 40%,
    transparent 70%
  );
}
```

### Shadows

#### Stripe's Shadow System
```css
/* Small shadow - cards at rest */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Medium shadow - cards on hover */
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

/* Large shadow - modals, dropdowns */
box-shadow: 0 12px 48px rgba(0, 0, 0, 0.16);
```

#### BYKI Adaptation
```css
.shadow-sm {
  box-shadow: 0 2px 8px rgba(0, 78, 60, 0.08);
}

.shadow-md {
  box-shadow: 0 8px 24px rgba(0, 78, 60, 0.12);
}

.shadow-lg {
  box-shadow: 0 12px 48px rgba(0, 78, 60, 0.16);
}

/* Green glow for CTAs */
.shadow-glow {
  box-shadow: 0 4px 24px rgba(40, 181, 95, 0.3);
}
```

---

## 🖼️ IMAGE TREATMENT

### Stripe's Image Strategy

#### 1. **UI Mockups**
- High-resolution PNG exports
- Transparent backgrounds or subtle gradients
- Often shown at an angle (slight 3D perspective)
- Soft shadows beneath

#### 2. **Photography**
- Professional, high-quality stock or custom photography
- Consistent color grading
- Bright, inviting tones
- Minimal clutter in frame

#### 3. **Illustrations**
- Minimal, clean line art
- Accent color highlights
- Isometric or flat style

### BYKI Image Guidelines

#### UI Mockups
```
- Export app screenshots at 2x or 3x resolution
- Use iPhone/Android device frames
- Add subtle device shadows
- Consider showing motion/animation states
- Use actual UI with real fault codes
```

#### Photography
```
- Modern vehicles (2015+)
- Clean workshop environments
- Natural lighting preferred
- Green accent lighting where possible
- Close-ups of OBD2 connectors
- Hands holding smartphone with app
```

#### Icons
```
- Line icons (2px stroke weight)
- Circular or square backgrounds
- Primary green color (#28b55f)
- 24x24px or 32x32px standard sizes
```

---

## 🎬 ANIMATION LIBRARY RECOMMENDATIONS

Based on Stripe's animation approach:

### Recommended Libraries
1. **Framer Motion** (React) - For scroll animations, page transitions
2. **GSAP** - For complex sequenced animations
3. **Lottie** - For animated icons and illustrations
4. **Intersection Observer API** - For scroll-triggered animations

### Key Animations to Implement

#### 1. Fade In on Scroll
```jsx
// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {content}
</motion.div>
```

#### 2. Stagger Children
```jsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### 3. Number Counter Animation
For statistics section:
```javascript
// Count up animation for large numbers
const Counter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
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
  }, [target, duration]);
  
  return <span>{count.toLocaleString()}</span>;
};
```

---

## 📦 COMPONENT CHECKLIST

### Essential Components to Build

**From Screenshot Analysis:**

**Hero & Navigation:**
- [x] Hero Section with animated mockup and vibrant diagonal gradient
- [x] Top banner with live counter/metric
- [x] Selective word highlighting in headlines
- [x] Navigation Header (sticky) with dropdowns
- [x] Two-button CTA pattern (primary + secondary with icons)
- [x] Client logo row (horizontal, below CTAs)

**Content Sections:**
- [x] Feature Grid - 2-column large cards with arrow icons
- [x] Feature Grid - 3-column with circular icon backgrounds
- [x] Stats Counter Section (4-column grid)
- [x] Product Showcase (image + text alternating)
- [x] Abstract data visualization sections
- [x] Testimonial Section (center-aligned with logo)
- [x] Client logo grid (monochrome, horizontal)

**Card Components:**
- [x] Feature Card with gradient background and embedded mockup
- [x] Feature Card with arrow icon (↗) in corner
- [x] Card with purple diagonal stripe pattern overlay
- [x] Large gradient canvas card with floating mockup
- [x] Horizontal gradient program cards (2-column)
- [x] Client story cards with varied visuals
- [x] Conference/event card (dark background + photography)
- [x] Case study card with aerial photography

**Interactive Elements:**
- [x] Button Component (primary solid, secondary outline, with icons)
- [x] Expandable/accordion list with + icons
- [x] Arrow links (→) for secondary CTAs
- [x] Carousel navigation (left/right arrows)
- [x] Hover states (card lift, arrow movement, shadow increase)

**UI Basics:**
- [x] Input Component (text, search, select)
- [x] Badge/Tag Component (logo introduction badges)
- [x] Icon Component (circular backgrounds, purple accent)
- [x] Modal/Dialog
- [x] Footer (multi-column, dark background)

**Specialized:**
- [x] FAQ Accordion
- [x] CTA Section (headline + button + supporting text)
- [x] Stats bar (beneath photos, 3 metrics)
- [x] Live counter/ticker animation

---

## 📋 QUICK REFERENCE - SCREENSHOT OBSERVATIONS SUMMARY

### What Makes Stripe's Design Stand Out

**Visual Impact:**

1. **Vibrant Hero Gradient**
   - Bold, diagonal gradient (orange → pink → purple → magenta)
   - Creates immediate visual impact and premium feel
   - Sets energetic, modern tone
   - Also used in large feature cards

2. **Gradient Variety Throughout**
   - Each card section has unique gradient
   - Horizontal gradients (pink→purple, orange→yellow) for program cards
   - Large canvas gradients with embedded mockups
   - Purple diagonal stripe pattern overlays
   - Creates visual interest without chaos

3. **Selective Word Highlighting**
   - Key words in headline highlighted in brand color
   - Example: "revenue" in purple within black headline
   - Draws attention to important concepts

**Interactive Elements:**

4. **Arrow Icons on Cards**
   - Consistent ↗ arrow in top-right of feature cards
   - Indicates interactivity/clickability
   - Moves on hover (translate 4px up-right)
   - Subtle but effective visual cue

5. **Expandable Accordions**
   - + icon in purple circle background
   - Logo + headline + expand icon layout
   - Used for case study lists
   - Clean, space-efficient

6. **Two-Button CTA Pattern**
   - Primary action (filled button) + Secondary action (ghost button)
   - Provides choice without decision paralysis
   - Secondary often includes icon (Google logo, play icon)
   - Consistent throughout page

**Content Presentation:**

7. **Product Mockups in Cards**
   - Real, high-quality UI screenshots embedded in cards
   - Not generic icons or illustrations
   - Floating appearance with shadows
   - Shows actual product value
   - Embedded in gradient backgrounds

8. **Photography Integration**
   - Aerial/bird's eye photography (street intersections)
   - Conference/event photography (dark backgrounds)
   - Dynamic backgrounds (water waves, abstract)
   - Professional, high-resolution
   - Stats bar beneath photos (3 metrics)

9. **Statistics Section (4-Column Grid)**
   - Very large numbers (56-64px)
   - One number highlighted in brand color
   - Small gray descriptive text below
   - Creates credibility and scale

**Trust Building:**

10. **Live Metrics Display**
    - Top banner shows real-time data
    - Builds credibility and social proof
    - Creates dynamic, living feel

11. **Client Logo Showcases**
    - Horizontal display of major brands below hero
    - Monochrome logo grids for uniformity
    - Logo introduction badges (square/circle)
    - Client story cards with varied visuals
    - Builds immediate trust

12. **Testimonials (Center-Aligned)**
    - Company logo at top
    - Large quote text in gray
    - Attribution with name, title, company
    - "Read story" CTA
    - Clean, spacious layout

**Design Details:**

13. **Card Shadow & Depth**
    - Soft shadows create floating effect
    - Increases on hover for feedback
    - Maintains clean, modern aesthetic
    - Consistent 12-16px border radius

14. **Icon Grid Layouts**
    - 3-column equal grids
    - Circular purple icon backgrounds
    - Headline + description + link
    - Used for services/features

15. **Abstract Visualizations**
    - Radial burst patterns (blue lines)
    - Particle formations (dots creating shapes)
    - Visual breaks between sections
    - Reinforces tech/connectivity theme

16. **Generous Whitespace**
    - 96px+ between major sections
    - 24-32px gaps between cards
    - Breathing room around content
    - Prevents overwhelming feeling
    - Focuses attention on content

17. **Dark Contrast Sections**
    - Dark navy (#0A2540) for footer intro
    - Conference cards with dark backgrounds
    - Client story cards (varied backgrounds)
    - Creates rhythm and visual breaks

### Apply to BYKI

✅ **Implement - Core Patterns:**
- Vibrant diagonal gradient in hero (green-based: dark green → bright green → teal → lime)
- Selective word highlighting ("Inside out" in green, "diagnostic" in green, etc.)
- Arrow icons (↗) on all feature cards (top-right corner)
- Real app screenshots in cards (not generic icons)
- Two-button CTA (Download + Watch Demo with play icon)
- Live scan counter in top banner ("Scans performed today: 12,847")
- Vehicle brand logos below hero (Ford, BMW, Toyota, etc.)
- Purple → Green color translation throughout

✅ **Implement - Layout Patterns:**
- 4-column statistics grid with one highlighted number in green
- 3-column icon grid (circular green backgrounds)
- 2-column large gradient feature cards
- Expandable accordion for supported brands list (+ icons)
- Client story carousel (vehicle brands or repair shops)
- Center-aligned testimonial section
- Monochrome logo grid (OBD2 partners, vehicle brands)
- Stats bar beneath hero photography (3 metrics)

✅ **Implement - Card Variations:**
- Feature cards with gradient backgrounds + embedded mockups
- Large gradient canvas cards (green to lime) with floating interface
- Horizontal gradient program cards (BYKI Pro, BYKI Business)
- Dark card with photography (workshop environments)
- Case study cards with aerial automotive photography
- Purple diagonal stripe → Green diagonal stripe pattern overlay

✅ **Implement - Visual Elements:**
- Radial burst visualization (green lines radiating from OBD2 icon)
- Abstract data viz sections (particle formations creating car shape)
- Soft shadows with hover effects (lift + shadow increase)
- 12-16px border radius on all cards
- Generous whitespace (96px section gaps, 24px card gaps)
- Dark footer section (dark green or charcoal background)

✅ **Implement - Interactive Elements:**
- Accordion lists with + icons (light green circle backgrounds)
- Carousel navigation for case studies
- Hover states: card lift, arrow movement, shadow change
- Live counters with animated counting
- Video/demo play buttons with hover effects

✅ **Adapt - Content Themes:**
- "Financial" language → "Automotive" language
- "Accept payments" → "Scan diagnostics"
- "Global GDP" metric → "Scans performed" metric
- "Payment terminals" → "OBD2 scanners"
- "Stripe certifications" → "Supported vehicles"
- "Fortune 100 companies" → "200+ vehicle brands"
- "Payment volume" → "Fault codes analyzed"
- Payment mockups → Diagnostic scan mockups

✅ **Adapt - Photography Subjects:**
- Street intersections → Highway/roads, parking lots
- Conference venues → Auto repair workshops
- Financial dashboards → Diagnostic dashboards
- Payment terminals → OBD2 devices + smartphones
- Abstract tech → Abstract automotive (network of vehicles)

✅ **Maintain - Design Principles:**
- Card-based layouts with consistent structure
- Clean typography hierarchy (Satoshi font)
- Professional, premium feel
- Product-focused approach (show real interfaces)
- Data-driven messaging (statistics, metrics)
- High-quality asset production
- Smooth animations and transitions
- Mobile-first responsive design

---

## 🎯 KEY TAKEAWAYS FOR BYKI

### 1. **Invest in High-Quality Assets**
- Professional app screenshots (✓ observed in Stripe)
- Device mockups (✓ mobile devices in cards)
- Clean product photography
- Real UI, not placeholder graphics

### 2. **Use Animation Strategically**
- Smooth scroll-triggered reveals
- Subtle hover states (card lift, arrow movement)
- Counter animations for stats
- Loading state transitions

### 3. **Maintain Visual Hierarchy**
- Large, bold headlines (60-72px)
- Clear section separation (96px+ gaps)
- Generous whitespace
- Consistent spacing system (8px base)

### 4. **Build Trust Through Design**
- Professional, polished UI
- Consistent brand application
- Real product screenshots (not stock photos)
- Client logos / supported brands showcase
- Live metrics and data

### 5. **Optimize for Performance**
- Lazy load images
- Use WebP format for images
- Optimize animations (60fps)
- Progressive image loading

### 6. **Mobile-First Approach**
- Design for mobile, enhance for desktop
- Touch-friendly interactions (44px+ tap targets)
- Responsive images and typography
- Fast load times on mobile networks

---

*Document prepared for BYKI project*
*Based on Stripe.com design analysis and screenshot observations*
*Screenshot analyzed: February 17, 2026*
*To be used in conjunction with BYKI BrandKit.md*

### Phase 1: Foundation
1. Set up design tokens (colors, spacing, typography)
2. Build core components (Button, Card, Input)
3. Implement responsive grid system
4. Add Satoshi font family

### Phase 2: Assets
1. Create/source high-quality app screenshots
2. Design device mockups with BYKI UI
3. Source or create automotive photography
4. Design custom icons

### Phase 3: Sections
1. Build Hero section with animation
2. Create Feature Grid
3. Implement Stats Counter section
4. Build Product Showcase sections

### Phase 4: Polish
1. Add scroll animations
2. Implement hover states
3. Optimize images and performance
4. Test responsive behavior

### Phase 5: Content
1. Write compelling copy
2. Add real fault code data to screenshots
3. Create case studies or testimonials
4. Add FAQs

---

## 📐 FIGMA/DESIGN NOTES

### Design System Structure
```
Foundation/
  - Colors
  - Typography
  - Spacing
  - Shadows
  - Border Radius

Components/
  - Buttons
  - Cards
  - Inputs
  - Navigation
  - Footer
  - Badges
  - Icons

Sections/
  - Hero
  - Feature Grid
  - Stats
  - Product Showcase
  - Testimonials
  - CTA
  - FAQ

Pages/
  - Home
  - Features
  - How It Works
  - FAQ
  - Contact
  - VIN Decoder
  - Compare
```

---

## 🎨 BRAND COLOR MAPPING

### Stripe → BYKI Color Translation

| Stripe Element | Stripe Color | BYKI Equivalent | BYKI Color |
|----------------|--------------|-----------------|------------|
| Primary Brand | Purple #635BFF | Primary Green | #28b55f |
| Dark Accent | Navy #0A2540 | Dark Green | #004e3c |
| Background | Light Gray #F6F9FC | Light Gray | #f6f6f6 |
| Text Primary | Dark #0A2540 | Black | #212123 |
| Text Secondary | Gray #425466 | Dark Gray | #7c7c7c |
| Border/Divider | Light Gray #E3E8EE | Medium Gray | #e0e0e0 |
| Success/Active | Green | Primary Green | #28b55f |

---

## 🖼️ ASSET CREATION PRIORITIES

### High Priority
1. **App screenshots** - Multiple screens showing key features
2. **Device mockups** - iPhone/Android with BYKI app
3. **Hero image** - Main landing page visual
4. **Feature icons** - 8-10 custom icons

### Medium Priority
5. **Product photography** - OBD2 scanner, cables, setup
6. **Lifestyle images** - People using the app
7. **Logo grid** - Vehicle manufacturer logos
8. **Background patterns** - Subtle textures

### Low Priority
9. **Illustrations** - Custom artwork
10. **Video content** - Product demos
11. **3D renders** - Device 3D models

---

## 📱 MOBILE APP DESIGN NOTES

If building a mobile landing page or app store presence:

### App Store Screenshots
- Mimic Stripe's clean UI presentations
- Show one key feature per screenshot
- Add text overlays highlighting benefits
- Use device frames
- Consistent background color

### Mobile Web Optimizations
- Sticky CTA button at bottom
- Simplified navigation
- Larger tap targets
- Streamlined content

---

## 🛠️ IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- ✅ Set up design tokens (colors, spacing, typography)
- ✅ Build core components (Button, Card, Input)
- ✅ Implement responsive grid system
- ✅ Add Satoshi font family
- ✅ Create gradient system (hero, cards, buttons)
- ✅ Set up shadow system (sm, md, lg, glow)

### Phase 2: Assets (Week 2-3)
- 📸 Create/source high-quality app screenshots (diagnostic scan, VIN decoder, fault library, dashboard)
- 📸 Design device mockups with BYKI UI (iPhone, Android, tablet)
- 📸 Source automotive photography (aerial shots, workshops, OBD2 close-ups, vehicle interiors)
- 🎨 Design custom icons with circular green backgrounds
- 🏢 Prepare logo assets (vehicle manufacturers, OBD2 partners)

### Phase 3: Hero & Navigation (Week 3-4)
- ✅ Build hero with vibrant diagonal gradient, live counter, selective highlighting, two-button CTA, logo row
- ✅ Create sticky navigation with dropdowns, mobile menu, scroll shadow

### Phase 4: Content Sections (Week 4-6)
- ✅ 4-column statistics grid with count-up animations
- ✅ 2-column large feature cards with gradients + embedded mockups
- ✅ 3-column icon grid with circular backgrounds
- ✅ Testimonial section (center-aligned)
- ✅ Expanding accordion for supported brands
- ✅ Client logo grid (monochrome, horizontal)
- ✅ Abstract visualization section (radial burst/particles)

### Phase 5: Advanced Cards (Week 6-7)
- ✅ Large gradient canvas cards with floating mockups
- ✅ Horizontal program cards (2-column, different gradients)
- ✅ Case study photography cards with stats bars
- ✅ Client story carousel with varied visuals

### Phase 6: Polish & Animations (Week 7-8)
- 🎬 Scroll animations (fade-in, stagger, parallax)
- 🎬 Hover states (card lift, arrow movement, shadow)
- 🎬 Live counter animation
- 🎬 Micro-interactions (clicks, focus, modals)
- 🎬 Performance optimization (lazy load, WebP, 60fps)

### Phase 7: Content & Copy (Week 8-9)
- ✏️ Write headlines with selective highlighting
- ✏️ Create feature descriptions (benefit-focused)
- ✏️ Add statistics (fault codes, accuracy, brands, users)
- ✏️ Develop testimonials (mechanics, enthusiasts)
- ✏️ Write FAQs

### Phase 8: Testing & Optimization (Week 9-10)
- 🧪 Test responsive behavior (mobile, tablet, desktop)
- 🧪 Validate accessibility (contrast, keyboard, screen readers)
- 🧪 Performance testing (Lighthouse, load times)
- 🧪 Cross-browser testing
- 🧪 A/B testing (CTAs, headlines, layouts)

---

## NEXT STEPS

1. **Review & Refine** - Share this extraction with team
2. **Create Design System** - Build Figma file or similar
3. **Asset Production** - Start creating/sourcing images
4. **Component Development** - Build React components
5. **Content Strategy** - Write copy aligned with visual style
6. **User Testing** - Validate design decisions

---

*Document prepared for BYKI project*
*Based on Stripe.com design analysis (4 screenshots analyzed)*
*Updated: February 17, 2026*
*To be used in conjunction with BYKI BrandKit.md*

---

## 📸 APPENDIX: SCREENSHOT EXTRACTION SUMMARY

### Screenshot 1 - Hero & Feature Cards
**Extracted:**
- Vibrant diagonal gradient hero (orange → pink → purple → magenta)
- Top banner with live metric ("Global GDP running on Stripe")
- Navigation structure with dropdowns
- Selective word highlighting ("revenue" in purple)
- Two-button CTA pattern (filled + ghost with icon)
- Client logo row (7-8 brands horizontal)
- 2-column large feature cards with arrow icons (↗)
- Cards with embedded product mockups
- Unique gradient per card
- Section headline pattern

**Key Measurements:**
- Hero headline: ~60-72px
- Navigation height: ~64-72px
- Card border radius: 12-16px
- Card gaps: ~24px
- Arrow icon: Top-right corner

### Screenshot 2 - Stats, Photography & Data Viz
**Extracted:**
- Purple diagonal stripe pattern overlay on cards
- Conference/event card (dark background + venue photography)
- 4-column statistics grid (large numbers + descriptions)
- One stat highlighted in brand color
- Abstract data visualization (radial blue line burst)
- Section headline with primary/secondary text pattern
- Embedded interface mockups ("Connected Accounts" table)

**Key Measurements:**
- Stat numbers: ~56-64px
- Stat description: ~14-15px gray text
- Column gaps: ~32-40px
- Stats section background: Clean white

### Screenshot 3 - Case Studies & Accordions
**Extracted:**
- Featured case study with aerial bird's-eye photography (Hertz intersection)
- Logo introduction badges (yellow "H" square)
- Stats bar beneath photos (3 metrics: "160 countries | 11K+ locations | Products used...")
- Expandable/accordion list with + icons in purple circles
- Logo + headline + expand button layout
- 3-column expert services grid with circular icon backgrounds
- "Read the story →" CTA pattern
- Client story carousel with navigation arrows
- Varied card visual styles (abstract graphics, photography, logos)

**Key Measurements:**
- Logo badge: ~48px square
- + icon circle: ~32px diameter with light purple background
- Accordion item padding: ~24px vertical
- Stats bar text: ~14px gray

### Screenshot 4 - Programs, Testimonials & Gradients
**Extracted:**
- Horizontal gradient program cards (pink→purple, orange→yellow)
- Side-by-side 2-column layout for programs
- Large gradient canvas card (full vibrant gradient)
- Embedded white mockup in bottom-left (floating with shadow)
- 3-column feature grid with circular purple icon backgrounds
- "Read the guide →" CTA pattern
- Testimonial section (center-aligned):
  - Company logo at top
  - Large quote in gray
  - Attribution (name, title, company)
  - "Read the story →" CTA
- Monochrome client logo row (horizontal, grayscale)
- Dark footer introduction section (navy background, white text)

**Key Measurements:**
- Quote text: ~24-28px gray
- Logo row spacing: ~40-56px gaps
- Icon circles: ~48-56px diameter
- Program card padding: ~32px
- Large canvas gradient: min-height ~500px

### Design Patterns Catalog (All Screenshots)

**Gradients:**
- Hero diagonal (135deg)
- Horizontal program cards (90deg)
- Large canvas (135deg with radial overlays)
- Purple diagonal stripe pattern overlay

**Cards:**
- Large 2-column with embedded mockups
- 3-column icon grids
- Client story carousel cards
- Case study photography cards
- Horizontal program cards
- Dark conference/event cards

**Interactive Elements:**
- Arrow icons (↗) in card corners
- + icons for accordions
- Carousel navigation arrows
- Two-button CTA (primary + secondary)
- Arrow links (→) for secondary actions

**Typography Patterns:**
- Selective word highlighting
- Center-aligned testimonials
- Section headline + subheadline
- Stats: large number + small description
- Logo + headline + CTA structure

**Layout Patterns:**
- 4-column statistics grid
- 3-column icon/feature grid
- 2-column large cards
- Horizontal logo rows
- Expandable accordion lists
- Center-aligned testimonials
- Stats bar (3 metrics beneath photos)

---

**End of Document**
