- Rooms: All authenticated users, district-specific rooms

2. **alert_acknowledged**
    - Emitted when alert is acknowledged
    - Payload: `{ alertId: string, acknowledgedBy: string, acknowledgedAt: date }`
    - Rooms: All authenticated users

3. **alert_resolved**
    - Emitted when alert is resolved
    - Payload: `{ alertId: string, resolvedBy: string, resolvedAt: date }`
    - Rooms: All authenticated users

4. **new_case**
    - Emitted when new case is reported
    - Payload: Case object
    - Rooms: District-specific rooms

5. **stats_update**
    - Emitted every 5 minutes with updated statistics
    - Payload: Dashboard stats object
    - Rooms: All authenticated users

**Events (Client → Server):**

1. **join_district**
    - Subscribe to district-specific updates
    - Payload: `{ district: string }`

2. **leave_district**
    - Unsubscribe from district updates
    - Payload: `{ district: string }`

---

## Alert Logic & ML Algorithm

### Threshold-Based Alert System

**Alert Trigger Conditions:**

The system monitors case reports in real-time and generates alerts based on configurable thresholds. Alerts are triggered when case counts exceed predefined limits within specific timeframes.

**Severity Calculation Logic:**

1. **CRITICAL Alert:**
    - ≥15 cases of same disease in 24 hours within same district
    - OR ≥10 cases in 12 hours within same block
    - OR ≥5 cases in 6 hours within same village
    - OR case-fatality ratio >20% within 48 hours

2. **HIGH Alert:**
    - ≥10 cases of same disease in 48 hours within same district
    - OR ≥8 cases in 24 hours within same block
    - OR 100% week-over-week increase with ≥5 cases

3. **MEDIUM Alert:**
    - ≥5 cases of same disease in 72 hours within same district
    - OR ≥50% week-over-week increase with ≥3 cases
    - OR seasonal pattern anomaly detected

4. **LOW Alert:**
    - ≥3 cases of same disease in 7 days within same district
    - OR any statistical anomaly in baseline pattern
    - OR adjacent district has HIGH/CRITICAL alert

**Alert Generation Process:**

```
1. New case is submitted to database
2. Background job aggregates cases by:
   - Disease type
   - Geographic location (district/block/village)
   - Time window (6h, 12h, 24h, 48h, 72h, 7d)
3. Compare aggregated counts against thresholds
4. If threshold exceeded:
   a. Calculate severity level
   b. Check if similar alert already exists (de-duplication)
   c. If new outbreak pattern:
      - Create alert record in database
      - Calculate risk score (0-100)
      - Identify affected cases
      - Generate alert title and description
      - Determine notification recipients
5. Trigger notifications:
   - Real-time WebSocket to dashboard
   - Email to district health officers
   - SMS to on-call personnel (critical only)
6. Log alert creation for audit trail
```

---

### Machine Learning Pattern Recognition

**Phase 1 (MVP): Simple Statistical Model**

**Purpose:** Detect anomalies and trends without complex ML infrastructure

**Approach:**
- Calculate baseline case rates for each disease by district (30-day rolling average)
- Use standard deviation to identify statistical anomalies
- Track week-over-week and month-over-month changes
- Flag unusual patterns for investigation

**Algorithm:**
```
Baseline Rate = Average daily cases over last 30 days
Standard Deviation = Calculate σ from baseline
Current Rate = Cases in last 24 hours

If Current Rate > (Baseline + 2σ):
  → Statistical anomaly detected
  → Generate LOW alert for investigation

If Current Rate > (Baseline + 3σ):
  → Significant anomaly
  → Generate MEDIUM/HIGH alert depending on absolute count
```

**Phase 2 (Future): Advanced ML Model**

**Purpose:** Predictive outbreak forecasting using historical patterns

**Approach:**
- Time series forecasting (ARIMA/LSTM)
- Feature engineering:
    - Historical case data
    - Seasonal patterns (monsoon correlation)
    - Water quality indicators
    - Population density
    - Healthcare infrastructure availability
- Train model on historical outbreak data
- Predict case trends 7-14 days ahead
- Generate proactive alerts for high-risk periods

**Risk Score Calculation:**

```
Risk Score (0-100) = weighted combination of:
- Case count severity (40%): Based on threshold exceeded
- Growth rate (30%): Week-over-week percentage increase
- Geographic spread (15%): Number of affected villages/blocks
- Disease severity (10%): Clinical severity of disease type
- Historical patterns (5%): Comparison to past outbreaks

Example:
- Case count: 12 cases in 24h = 80 points (×0.4) = 32
- Growth rate: 150% increase = 90 points (×0.3) = 27
- Geographic spread: 3 villages = 60 points (×0.15) = 9
- Disease severity: Cholera = 90 points (×0.1) = 9
- Historical: Above 90th percentile = 85 points (×0.05) = 4.25

Total Risk Score = 81.25 → HIGH severity
```

---

## Notification System

### Multi-Channel Alert Delivery

**Channel Priority by Severity:**

| Severity | Dashboard | Email | SMS | Push | Sound |
|----------|-----------|-------|-----|------|-------|
| CRITICAL | ✅ Immediate | ✅ Immediate | ✅ Yes | ✅ Yes | 🔔 Alert sound |
| HIGH | ✅ Immediate | ✅ Within 5 min | ❌ No | ✅ Yes | 🔔 Alert sound |
| MEDIUM | ✅ Real-time | ✅ Batched (15 min) | ❌ No | ✅ Yes | 🔕 Silent |
| LOW | ✅ Real-time | ✅ Daily digest | ❌ No | ❌ No | 🔕 Silent |

**Notification Recipients:**

1. **CRITICAL Alerts:**
    - District Health Officer (primary)
    - All health officers in affected district
    - State Health Department (notification)
    - On-call mobile medical teams

2. **HIGH Alerts:**
    - District Health Officer
    - Block-level supervisors in affected area
    - Adjacent district officers (awareness)

3. **MEDIUM Alerts:**
    - District Health Officer
    - Analysts monitoring the region

4. **LOW Alerts:**
    - System logs only (unless user subscribed to all alerts)

**Email Template Structure:**

```
Subject: [SEVERITY] Health Alert: [Disease] outbreak detected in [Location]

Body:
---
🚨 [SEVERITY LEVEL] ALERT

Disease: [Disease Name]
Location: [Village], [Block], [District]
Cases Reported: [Count] in [Timeframe]
Risk Score: [Score]/100
# Smart Community Health Monitoring and Early Warning System - PRD

---

## Project Information

### Project Title

**HealthGuard NER - Smart Disease Alert System**

---

### Project Description

**Short Description:**
A real-time health surveillance platform that monitors water-borne disease patterns in rural Northeast India and sends instant alerts to health officials when potential outbreaks are detected.

**Long Description:**

Water-borne diseases like cholera, typhoid, and diarrhea pose significant health risks in rural and tribal areas of Northeast India, particularly during monsoon seasons. The challenge is compounded by difficult terrain, limited connectivity, and delayed response times from health authorities.

HealthGuard NER addresses this critical gap by creating an intelligent early warning system that collects health data from community sources, analyzes patterns using AI/ML, and instantly alerts district health officials when outbreak risks are detected. The system acts as a digital bridge between ground-level health workers and decision-makers, enabling rapid intervention before small clusters become full-blown epidemics.

The platform prioritizes simplicity and reliability, working seamlessly in low-connectivity environments common in NER. By focusing on real-time alerts and actionable intelligence, HealthGuard NER empowers health departments to allocate resources efficiently, deploy medical teams strategically, and save lives through timely intervention.

This solution directly supports the Ministry of Development of North Eastern Region's mission to improve healthcare access and outcomes in underserved communities, while aligning with national health and water quality initiatives.

**Expected Impact:**
- Reduce outbreak response time from days to hours
- Enable data-driven resource allocation for health departments
- Prevent disease spread through early detection
- Create a replicable model for other rural health challenges

---

### Learning Objectives

**Primary Learning Outcomes:**

- Full-stack web application development with React and Node.js
- RESTful API design and implementation for healthcare data
- Real-time notification systems using WebSockets
- AI/ML integration for pattern recognition and outbreak prediction
- Geospatial data visualization with interactive mapping

**Secondary Learning Outcomes:**

- Healthcare data privacy and security best practices
- Offline-first architecture for low-connectivity environments
- Performance optimization for resource-constrained devices
- User experience design for diverse literacy levels

---

### Technology Stack

**Frontend:**

- **Build Tool:** Vite 6.x
- **Framework:** React 19 with TypeScript 5
- **Routing:** React Router v7
- **State Management:** Zustand 5.x
- **Styling:** TailwindCSS v4 + DaisyUI v5.5
- **Icons:** Google Material Symbols (Rounded variant)
- **Additional Libraries:**
  - Leaflet.js (map visualization)
  - Recharts (data charts)
  - date-fns (date handling)
  - React Hook Form (form management)
  - Zod (validation)

**Backend:**

- **Runtime:** Node.js v22 LTS
- **Language:** TypeScript 5
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose v9
- **Real-time:** Socket.IO v4
- **Authentication:** JWT (JSON Web Tokens)
- **Additional Libraries:**
  - Nodemailer (email alerts)
  - Bull (job queue for batch processing)
  - Winston (logging)

---

### MVP Scope

**Phase 1: Core Alert System (Days 1-8)**
**Priority: P0 (Must Have)**

1. **Health Data Collection Interface**
   - Simple symptom reporting form (fever, diarrhea, vomiting, etc.)
   - Location-based case entry (district/block/village)
   - Timestamp and severity tracking
   - Batch upload capability for offline data collection

2. **Real-Time Alert System**
   - Automated threshold-based alerts (e.g., 5+ cases in 24 hours)
   - Multi-channel notifications (email, SMS, web dashboard)
   - Alert severity levels (Low, Medium, High, Critical)
   - Geographic clustering detection
   - Alert acknowledgment and response tracking

3. **Health Official Dashboard**
   - Live case map with hotspot visualization
   - Alert feed with filtering (by region, severity, date)
   - Basic analytics (cases per day, disease types, affected areas)
   - Mobile-responsive design for field access

**Phase 2: Enhanced Intelligence (Days 9-11)**
**Priority: P1 (Should Have)**

4. **Pattern Recognition Engine**
   - Simple ML model for trend detection
   - Historical comparison (week-over-week, month-over-month)
   - Seasonal pattern alerts
   - Risk score calculation per region

5. **Reporting & Communication**
   - Automated daily/weekly summary reports
   - Export functionality (PDF, CSV)
   - SMS templates for community alerts
   - Multilingual support (English, Hindi, Assamese)

**Phase 3: Advanced Features (Day 12 - Optional)**
**Priority: P2 (Nice to Have)**

6. **Integration & Scalability**
   - Water quality data integration (manual entry)
   - Weather data correlation
   - Mobile app prototype (PWA)
   - Advanced predictive models

---

### Target Users / Personas

**Primary Persona: District Health Officer**

- **Demographics:**
  - Age: 35-50
  - Location: District headquarters (Guwahati, Imphal, Shillong, etc.)
  - Occupation: Government health administrator
  - Tech Savviness: Medium

- **Goals & Motivations:**
  - Detect disease outbreaks before they spread
  - Allocate medical resources efficiently
  - Respond quickly to health emergencies
  - Report accurate data to state/national authorities

- **Pain Points:**
  - Delayed information from remote areas
  - Difficulty identifying outbreak patterns
  - Manual data aggregation is time-consuming
  - Lack of real-time situational awareness

- **User Needs:**
  - Instant alerts when cases spike
  - Geographic visualization of health threats
  - Simple, actionable intelligence
  - Mobile access for field work

**Secondary Persona: ASHA Worker / Community Health Volunteer**

- **Demographics:**
  - Age: 25-45
  - Location: Remote villages in NER
  - Occupation: Community health worker
  - Tech Savviness: Low to Medium

- **Goals & Motivations:**
  - Report health issues from their community
  - Receive guidance on outbreak response
  - Protect community health

- **Pain Points:**
  - Limited internet connectivity
  - Low literacy in English
  - Complex forms are intimidating
  - Uncertain about when to escalate

- **User Needs:**
  - Simple data entry (minimal fields)
  - Offline functionality
  - Regional language support
  - Clear instructions

**Tertiary Persona: State Health Department Analyst**

- **Demographics:**
  - Age: 30-45
  - Location: State capital
  - Occupation: Health data analyst
  - Tech Savviness: High

- **Goals & Motivations:**
  - Monitor statewide health trends
  - Generate reports for policy decisions
  - Identify systemic issues

- **Pain Points:**
  - Inconsistent data quality
  - Lack of historical analysis tools
  - Difficult to export data

- **User Needs:**
  - Advanced filtering and search
  - Data export capabilities
  - Historical trend analysis
  - Integration with existing systems

---

## Branding, Theming & Visual Identity

### Brand Identity

**Brand Name:** HealthGuard NER

**Brand Personality:**
- **Tone:** Professional yet accessible, authoritative but caring
- **Voice:** Clear, urgent when needed, reassuring
- **Mood:** Trustworthy, efficient, community-focused

**Brand Values:**
- **Vigilance** - Constant monitoring for community safety
- **Speed** - Rapid alerts save lives
- **Clarity** - Complex data made simple and actionable
- **Trust** - Reliable system health officials can depend on

**Brand Story:**
HealthGuard NER was born from the need to protect vulnerable communities in Northeast India from preventable disease outbreaks. Like a guardian watching over the community, our system never sleeps—continuously monitoring health patterns and sounding the alarm at the first sign of danger. We bridge the gap between remote villages and health authorities, ensuring no outbreak goes unnoticed and no community is left behind.

---

### Logo & Visual Assets

**Logo Specifications:**
- **Primary Logo:** Shield with heartbeat line and water droplet symbol
- **Logo Variations:** 
  - Full color (primary)
  - White (for dark backgrounds)
  - Icon-only (mobile app)
  - Monochrome (official documents)
- **Safe Space:** Minimum 20px clear space around logo
- **Minimum Size:** 32px height for digital, 0.5 inch for print
- **File Formats:** SVG (web), PNG (fallback)

**Imagery Style:**
- **Photography:** Authentic community health workers, rural landscapes, hopeful tone
- **Illustrations:** Simple, flat style icons for diseases, symptoms, and geography
- **Icons:** Google Material Symbols - Rounded variant (friendly, approachable)
- **Patterns/Textures:** Subtle topographic map patterns for backgrounds

---

### Color System (OKLCH)

**Understanding OKLCH:**
OKLCH provides perceptual uniformity, ensuring colors are accessible and visually consistent across different devices—critical for health systems where clarity can save lives.

**Color Palette Definition:**

#### Primary Brand Color - Medical Blue
```css
--color-primary: oklch(55% 0.18 240);
--color-primary-content: oklch(100% 0 0);
```

**Primary Blue:** `oklch(55% 0.18 240)` - Professional medical blue
- **Usage:** Primary CTAs, key alerts, navigation, trust indicators
- **Meaning:** Medical professionalism, reliability, authority
- **Accessibility:** Contrast ratio with base-100: 7.2:1 (AAA)

**Color Variations:**
- Lighter: `oklch(70% 0.15 240)` - Hover states, light backgrounds
- Darker: `oklch(40% 0.20 240)` - Active states, emphasis

---

#### Secondary Brand Color - Health Green
```css
--color-secondary: oklch(65% 0.16 145);
--color-secondary-content: oklch(20% 0.05 145);
```

**Health Green:** `oklch(65% 0.16 145)` - Positive health indicator
- **Usage:** Success states, "all clear" indicators, positive trends
- **Meaning:** Health, safety, growth, prevention
- **Accessibility:** Contrast ratio with base-100: 5.8:1 (AA)

---

#### Accent Color - Alert Orange
```css
--color-accent: oklch(70% 0.19 50);
--color-accent-content: oklch(25% 0.05 50);
```

**Alert Orange:** `oklch(70% 0.19 50)` - Attention-grabbing warm accent
- **Usage:** Important notifications, "medium" alerts, highlights
- **Meaning:** Attention needed, warmth, community focus
- **Accessibility:** Contrast ratio with base-100: 6.1:1 (AA)

---

#### Neutral Colors
```css
--color-neutral: oklch(30% 0.02 240);
--color-neutral-content: oklch(95% 0.01 240);
```

**Neutral Gray:** `oklch(30% 0.02 240)` - Professional dark gray
- **Usage:** Text, borders, secondary UI elements
- **Meaning:** Professionalism, readability

---

#### Base Colors (Backgrounds & Surfaces)
```css
--color-base-100: oklch(98% 0.005 240); /* Main background */
--color-base-200: oklch(94% 0.01 240);  /* Cards, panels */
--color-base-300: oklch(88% 0.015 240); /* Dividers, borders */
--color-base-content: oklch(25% 0.015 240); /* Primary text */
```

**Light Theme (Default):**
- Clean, clinical feel appropriate for medical contexts
- High contrast for readability in various lighting conditions
- Subtle blue tint maintains brand consistency

---

#### Semantic Colors

**Info:**
```css
--color-info: oklch(60% 0.17 240); /* Blue for informational */
--color-info-content: oklch(100% 0 0);
```
- **Usage:** General information, help text, system messages

**Success:**
```css
--color-success: oklch(65% 0.16 145); /* Green for success */
--color-success-content: oklch(20% 0.05 145);
```
- **Usage:** Successful operations, healthy status, no alerts

**Warning:**
```css
--color-warning: oklch(75% 0.18 80); /* Amber for warnings */
--color-warning-content: oklch(25% 0.05 80);
```
- **Usage:** Medium-priority alerts, cautions, approaching thresholds

**Error:**
```css
--color-error: oklch(58% 0.22 25); /* Red for critical alerts */
--color-error-content: oklch(100% 0 0);
```
- **Usage:** Critical alerts, errors, outbreak warnings, urgent attention needed

---

### Color Usage Guidelines

**Do's:**
- ✅ Use error (red) for CRITICAL outbreak alerts requiring immediate action
- ✅ Use warning (amber) for MEDIUM alerts that need attention
- ✅ Use success (green) for "all clear" status and resolved situations
- ✅ Use primary (blue) for standard navigation and non-urgent actions
- ✅ Ensure all alerts are distinguishable by icon/text, not just color
- ✅ Test color contrast in bright sunlight (field use)

**Don'ts:**
- ❌ Don't use red for anything except critical health alerts
- ❌ Don't use color as the only indicator (accessibility)
- ❌ Don't use green and red in close proximity (colorblind users)
- ❌ Don't use low-contrast combinations on maps
- ❌ Don't use decorative colors that might confuse alert severity

---

### Color Accessibility Matrix

| Text Color | Background | Contrast Ratio | WCAG Level | Use Case |
|------------|------------|----------------|------------|----------|
| base-content | base-100 | 13.5:1 | AAA | Body text |
| primary-content | primary | 7.2:1 | AAA | Primary buttons |
| error-content | error | 8.1:1 | AAA | Critical alerts |
| warning-content | warning | 9.2:1 | AAA | Warning alerts |
| success-content | success | 6.8:1 | AA | Success messages |

**Testing Tools:**
- WebAIM Contrast Checker
- Browser DevTools Accessibility Panel
- Test on actual devices used in field (budget smartphones)

---

### Alert Color System (Critical for Health System)

**Alert Severity Visual Coding:**

1. **CRITICAL (Red)** - `oklch(58% 0.22 25)`
    - Immediate action required
    - Outbreak confirmed or imminent
    - Icon: warning filled
    - Example: "15+ cholera cases in 24 hours"

2. **HIGH (Dark Orange)** - `oklch(62% 0.20 40)`
    - Urgent attention needed
    - Threshold exceeded
    - Icon: error outline
    - Example: "8 cases in 48 hours, trending up"

3. **MEDIUM (Amber)** - `oklch(75% 0.18 80)`
    - Monitor closely
    - Approaching threshold
    - Icon: warning outlined
    - Example: "5 cases in 72 hours"

4. **LOW (Light Blue)** - `oklch(70% 0.12 240)`
    - Informational
    - Pattern detected
    - Icon: info
    - Example: "Slight increase from baseline"

5. **ALL CLEAR (Green)** - `oklch(65% 0.16 145)`
    - No concerns
    - Normal levels
    - Icon: check_circle
    - Example: "No unusual activity"

---

## UI/UX Design System

### Design Principles

- **Clarity Over Complexity:** Every element serves a purpose; remove anything that doesn't aid decision-making
- **Speed is Life:** Minimize clicks to critical actions; alerts must be visible instantly
- **Accessibility First:** Design for low-tech literacy, poor connectivity, and various devices
- **Mobile-First:** Health officials need access in the field, not just at desks
- **Trust Through Transparency:** Show data sources, update times, and confidence levels

---

### DaisyUI 5 Theme Configuration

**Complete Theme Definition:**

```css
@plugin "daisyui/theme" {
  name: "healthguard";
  default: true;
  prefersdark: false;
  color-scheme: "light";
  
  /* Base Colors */
  --color-base-100: oklch(98% 0.005 240);
  --color-base-200: oklch(94% 0.01 240);
  --color-base-300: oklch(88% 0.015 240);
  --color-base-content: oklch(25% 0.015 240);
  
  /* Brand Colors */
  --color-primary: oklch(55% 0.18 240);
  --color-primary-content: oklch(100% 0 0);
  --color-secondary: oklch(65% 0.16 145);
  --color-secondary-content: oklch(20% 0.05 145);
  --color-accent: oklch(70% 0.19 50);
  --color-accent-content: oklch(25% 0.05 50);
  --color-neutral: oklch(30% 0.02 240);
  --color-neutral-content: oklch(95% 0.01 240);
  
  /* Semantic Colors */
  --color-info: oklch(60% 0.17 240);
  --color-info-content: oklch(100% 0 0);
  --color-success: oklch(65% 0.16 145);
  --color-success-content: oklch(20% 0.05 145);
  --color-warning: oklch(75% 0.18 80);
  --color-warning-content: oklch(25% 0.05 80);
  --color-error: oklch(58% 0.22 25);
  --color-error-content: oklch(100% 0 0);
  
  /* Border Radius */
  --radius-selector: 0.25rem;
  --radius-field: 0.5rem;
  --radius-box: 0.75rem;
  
  /* Sizing */
  --size-selector: 1.5rem;
  --size-field: 2.5rem;
  
  /* Effects */
  --border: 1px;
  --depth: 3;
  --noise: 0;
}
```

---

### Typography

**Google Fonts Integration:**

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

**Font System:**

**Primary Font (UI & Headings):**
- **Font Family:** Inter
- **Weights:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Usage:** All interface elements, headings, buttons, navigation
- **Characteristics:** Modern, highly readable, excellent at small sizes

**Secondary Font (Data/Numbers):**
- **Font Family:** IBM Plex Sans
- **Weights:** 400, 500, 600
- **Usage:** Data tables, statistics, numerical displays
- **Characteristics:** Clear distinction between similar characters (1/l, 0/O)

**Typography Scale:**

```
Heading Styles:
H1: 32px / 40px - font-weight: 700 (Dashboard titles)
H2: 24px / 32px - font-weight: 600 (Section headers)
H3: 20px / 28px - font-weight: 600 (Card titles)
H4: 18px / 24px - font-weight: 600 (Subsections)
H5: 16px / 24px - font-weight: 500 (Small headers)
H6: 14px / 20px - font-weight: 500 (Labels)

Body Styles:
Body Large: 18px / 28px - font-weight: 400 (Alert descriptions)
Body Regular: 16px / 24px - font-weight: 400 (Standard text)
Body Small: 14px / 20px - font-weight: 400 (Secondary info)

UI Elements:
Button Text: 16px / 24px - font-weight: 500
Label: 14px / 20px - font-weight: 500
Caption: 12px / 16px - font-weight: 400 (Timestamps, metadata)

Data Display:
Stat Large: 36px / 44px - font-weight: 600 (Key metrics)
Stat Medium: 24px / 32px - font-weight: 600 (Dashboard stats)
Stat Small: 18px / 24px - font-weight: 500 (Table numbers)
```

**Responsive Typography:**

- **Mobile (<768px):** H1: 24px, H2: 20px, Body: 16px
- **Tablet (768-1279px):** H1: 28px, H2: 22px, Body: 16px
- **Desktop (≥1280px):** Full scale as defined above

---

### Icons - Google Material Symbols

**Integration:**

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
```

**Icon Variant:** Rounded (friendly, approachable for health context)

**Icon Usage by Category:**

| Category | Icon Names | Purpose |
|----------|-----------|---------|
| **Alerts** | warning, error, notification_important, campaign, priority_high | Alert indicators, notifications |
| **Health** | medical_services, local_hospital, health_and_safety, vaccines, emergency | Health-related actions |
| **Location** | location_on, map, place, pin_drop, my_location | Geographic features |
| **Data** | analytics, trending_up, trending_down, insights, query_stats | Data visualization |
| **Navigation** | home, dashboard, menu, close, arrow_back, settings | Site navigation |
| **Actions** | add, edit, delete, save, refresh, download, upload, filter_alt | User actions |
| **Status** | check_circle, cancel, help, info, verified, timer | Status indicators |
| **Communication** | mail, sms, phone, notifications, send, chat | Communication methods |
| **User** | person, group, admin_panel_settings, badge | User management |
| **Time** | schedule, history, update, alarm, watch_later | Time-related features |

**Icon Sizes:**

- **Small (16px):** Inline with text, table icons
- **Medium (20px):** Buttons, list items
- **Large (24px):** Primary actions, navigation
- **XL (32px):** Alert icons, feature highlights
- **XXL (48px):** Empty states, major status indicators

---

### Responsive Design

**Breakpoint System:**

```
sm: 640px   - Large phones
md: 768px   - Tablets
lg: 1024px  - Laptops
xl: 1280px  - Desktops
2xl: 1536px - Large monitors
```

**Layout Patterns:**

**Desktop (≥1024px):**
- Sidebar + main content layout
- Multi-column alert cards (2-3 columns)
- Full map view with side panel
- Expanded data tables
- Hover tooltips for additional info

**Tablet (768px - 1023px):**
- Collapsible sidebar
- 2-column layouts
- Touch-optimized controls (min 44px)
- Simplified map controls
- Scrollable tables

**Mobile (<768px):**
- Full-screen mobile navigation
- Single column stacked layout
- Bottom navigation bar for key actions
- Simplified map (full screen or hidden)
- Swipeable cards
- Large touch targets (min 48px)

---

### Accessibility Requirements

**WCAG 2.1 AA Compliance Checklist:**

**Perceivable:**
- All alert icons have descriptive text (not just color)
- Map markers include text labels for screen readers
- Color contrast ≥ 4.5:1 for all text
- Color contrast ≥ 3:1 for large text (18pt+)
- Critical alerts use multiple indicators (color + icon + text + sound option)
- Charts include data tables as alternatives
- Text resizable to 200% without loss of functionality

**Operable:**
- All dashboard controls keyboard accessible (Tab, Enter, Space)
- No keyboard traps in modals or drawers
- Focus indicators clearly visible (2px solid outline)
- Skip to main content link
- Alert acknowledgment via keyboard
- Map navigation via keyboard (arrow keys, +/-)

**Understandable:**
- Page language declared (html lang attribute)
- Consistent navigation structure
- Form labels clearly associated with inputs
- Error messages provide clear guidance
- Alert severity explained in plain language
- Medical terms have tooltips/definitions

**Robust:**
- Semantic HTML throughout
- ARIA roles for custom widgets (map, charts)
- ARIA live regions for real-time alerts
- Valid HTML (no parsing errors)
- Works with screen readers (NVDA/VoiceOver compatible)

**Health-Specific Accessibility:**
- Critical alerts announced immediately via screen reader
- Alert sounds available (optional, for visually impaired users)
- High contrast mode for outdoor use
- Simple language mode (avoid jargon)
- Offline-first design (PWA capabilities)

---

## Component Design System

### Component Organization Structure

```
src/components/
├── atoms/              (Basic UI elements)
│   ├── Button
│   ├── Badge
│   ├── Icon
│   ├── Stat
│   ├── AlertIndicator
│   └── StatusDot
│
├── molecules/          (Combinations of atoms)
│   ├── AlertCard
│   ├── StatCard
│   ├── MapMarker
│   ├── FilterControl
│   ├── DateRangePicker
│   └── SearchBar
│
├── organisms/          (Complex UI sections)
│   ├── Navbar
│   ├── AlertFeed
│   ├── DiseaseMap
│   ├── AnalyticsDashboard
│   ├── FilterPanel
│   └── DataTable
│
├── layouts/           (Page-level layouts)
│   ├── DashboardLayout
│   ├── AuthLayout
│   └── MobileLayout
│
└── pages/             (Route-level pages)
    ├── Dashboard
    ├── Alerts
    ├── Analytics
    ├── DataEntry
    └── Login
```

---

### Atom Components Inventory

| Component | Purpose | Key Props | States | Accessibility Features |
|-----------|---------|-----------|--------|----------------------|
| **Button** | Action triggers | variant (primary/secondary/accent/error/ghost), size (sm/md/lg), loading, disabled, icon, iconPosition | default, hover, active, focus, loading, disabled | ARIA labels, keyboard accessible, focus visible |
| **AlertIndicator** | Show alert severity | severity (critical/high/medium/low/clear), showIcon, showLabel, size | critical, high, medium, low, clear | Color + icon + text for redundancy |
| **Stat** | Display metrics | label, value, change, trend (up/down/stable), icon, valueColor | default, with trend | Semantic structure, clear labels |
| **StatusDot** | Status indicators | status (active/resolved/monitoring/offline), size, withLabel | active, resolved, monitoring, offline | ARIA live for status changes |
| **Icon** | Visual symbols | name, size (sm/md/lg/xl/xxl), filled, ariaLabel | default, filled | ARIA hidden when decorative, labeled when meaningful |
| **Badge** | Labels and tags | variant, size, content | default | Proper color contrast |

---

### Molecule Components Inventory

| Component | Combines | Purpose | Key Props | Accessibility |
|-----------|----------|---------|-----------|---------------|
| **AlertCard** | AlertIndicator + Stats + Button + StatusDot | Display individual alert details | alert object, onAcknowledge, onViewDetails | ARIA article role, semantic structure, keyboard actions |
| **StatCard** | Stat + Card container | Clickable metric display cards | StatProps + clickable, onClick | Button role when interactive |
| **MapMarker** | Icon + Tooltip + Badge | Interactive map location markers | location, severity, caseCount, onClick | ARIA label with full details |
| **FilterControl** | Label + Select + Icon | Dropdown filter selection | label, options array, value, onChange, icon | Proper form semantics, label association |
| **DateRangePicker** | Input fields + Calendar widget | Date range selection for filtering | startDate, endDate, onChange, minDate, maxDate | Date input accessibility, keyboard navigation |
| **SearchBar** | Input + Icon + Button | Search and filter interface | value, onSearch, placeholder, loading | Search landmark role |

---

### Organism Components Inventory

| Component | Purpose | Complexity | Key Features | Accessibility |
|-----------|---------|------------|--------------|---------------|
| **Navbar** | Site navigation | Medium | Logo, main nav links, user menu, notifications badge, mobile hamburger | Skip links, keyboard navigation, ARIA landmarks |
| **AlertFeed** | Alert list with filters | High | Real-time alert list, severity/status filtering, sorting, pagination, acknowledgment actions | ARIA live regions for new alerts, keyboard navigation |
| **DiseaseMap** | Geographic visualization | High | Interactive Leaflet map, custom markers sized by severity, clustering, popup details, legend | Keyboard map navigation, alternative text view |
| **AnalyticsDashboard** | Statistics overview | High | Multiple stat cards, trend charts (line/bar), time period selector, export functionality | Alt text for charts, data table alternatives |
| **FilterPanel** | Advanced filtering | Medium | Multiple filter types (dropdown, date range, search), clear filters button, active filter tags | Form semantics, clear focus order |
| **DataTable** | Tabular data display | High | Sortable columns, pagination, row selection, inline actions, export | ARIA table, sortable headers, keyboard navigation |

---

### Layout Components Inventory

| Layout | Purpose | Structure | Use Cases |
|--------|---------|-----------|-----------|
| **DashboardLayout** | Main authenticated app layout | Sticky navbar + main content area + optional sidebar | All authenticated pages (Dashboard, Alerts, Analytics, Data Entry) |
| **AuthLayout** | Authentication pages | Centered form card + branding + background | Login, Signup, Password Reset, Email Verification |
| **MobileLayout** | Mobile-optimized view | Bottom navigation + full screen content | Mobile app view with bottom tab bar |

---

### Page Components Inventory

| Page | Route | Layout | Key Sections | Purpose |
|------|-------|--------|--------------|---------|
| **Dashboard** | `/dashboard` | DashboardLayout | Key stats grid, disease map, recent alerts feed, quick actions | Main overview and command center |
| **Alerts** | `/alerts` | DashboardLayout | Alert feed with advanced filters, alert details modal | Manage and respond to all alerts |
| **Analytics** | `/analytics` | DashboardLayout | Time series charts, disease breakdown, geographic heatmap, export reports | Data analysis and reporting |
| **DataEntry** | `/entry` | DashboardLayout | Multi-step form (location, symptoms, patient details), batch upload | Submit new health case data |
| **Login** | `/login` | AuthLayout | Login form with email/password, forgot password link | User authentication |
| **AlertDetails** | `/alerts/:id` | DashboardLayout | Full alert info, case timeline, response actions, related cases | Detailed alert investigation |

---

### Component Design Guidelines

**Naming Conventions:**
- **Files:** PascalCase (Button.tsx, AlertCard.tsx)
- **Components:** PascalCase (Button, AlertCard)
- **Props Interfaces:** ComponentNameProps (ButtonProps, AlertCardProps)
- **Variants:** lowercase with hyphens ('primary', 'critical', 'outlined')

**Accessibility Requirements Per Component:**
- All interactive elements must be keyboard accessible
- Use semantic HTML elements (button, nav, main, article, aside)
- Provide ARIA labels for icon-only buttons
- Ensure color contrast meets WCAG 2.1 AA minimum
- Include visible focus states (2px outline minimum)
- Support screen reader announcements for dynamic content

**Responsive Behavior:**
- Components must adapt to mobile, tablet, and desktop viewports
- Touch targets minimum 48px on mobile
- Stack layouts vertically on mobile, grid on desktop
- Hide secondary information on mobile, show on hover/click

---

## Google Stitch Wireframe Structure

### Page 1: Dashboard (Main Command Center)

**Route:** `/dashboard`

**Purpose:** Provide health officials with immediate situational awareness of disease outbreaks across regions

**Layout Type:** Desktop: Sidebar + Main content | Mobile: Bottom nav + Full screen

---

**Block 1 - Page Header:**
- **Component Type:** Header section
- **Elements:**
    - Page title (H1): "Health Surveillance Dashboard"
    - Subtitle: Current date and last updated timestamp
    - Quick action buttons: "New Alert", "Refresh Data"
- **Responsive:** Stack buttons vertically on mobile

**Block 2 - Key Statistics Grid:**
- **Component Type:** 4-column stats grid (1 column on mobile)
- **Elements:**
    - Stat Card 1: "Active Cases (24h)" - Large number with trend arrow
    - Stat Card 2: "New Alerts" - Count with severity breakdown
    - Stat Card 3: "Critical Areas" - Number with map icon
    - Stat Card 4: "Avg Response Time" - Time value with trend
- **Placeholder Content:** Real-time aggregated data from database
- **Responsive:** Stack vertically on mobile, 2x2 grid on tablet, 4 columns on desktop

**Block 3 - Disease Map (Primary Visualization):**
- **Component Type:** Full-width interactive map
- **Elements:**
    - Leaflet map centered on NER region
    - Color-coded markers (red=critical, orange=high, yellow=medium, blue=low)
    - Marker size proportional to case count
    - Click to view location details popup
    - Map controls: zoom, fullscreen, layer selector
    - Legend showing severity levels
- **Placeholder Content:** Geolocation data of all active cases
- **Responsive:** Full height on mobile (collapsible), side-by-side with alerts on desktop

**Block 4 - Recent Alerts Feed:**
- **Component Type:** Alert list with cards
- **Elements:**
    - Filter bar (severity, status, date range)
    - Alert cards showing: severity badge, disease name, location, case count, timestamp
    - Action buttons: "Acknowledge", "View Details"
    - Pagination controls
- **Placeholder Content:** Latest 20 alerts from database
- **Responsive:** Single column on mobile, 2 columns on tablet, 3 columns on desktop

**Navigation:**
- **Entry Points:** Login redirect, navbar "Dashboard" link
- **Exit Points:** Navbar links to Alerts, Analytics, Data Entry
- **Primary CTA:** "Acknowledge" button on new alerts

---

### Page 2: Alerts (Alert Management Center)

**Route:** `/alerts`

**Purpose:** Comprehensive view and management of all health alerts with advanced filtering

**Layout Type:** Full-width with sidebar filters

---

**Block 1 - Page Header:**
- **Component Type:** Header with action buttons
- **Elements:**
    - Page title (H1): "Alert Management"
    - Subtitle: Total alert count and filter summary
    - Action buttons: "Export Report", "Refresh", "Create Manual Alert"
- **Responsive:** Stack buttons on mobile

**Block 2 - Filter Sidebar (Desktop) / Filter Sheet (Mobile):**
- **Component Type:** Filter panel
- **Elements:**
    - Severity filter (checkboxes: Critical, High, Medium, Low, Clear)
    - Status filter (radio: All, New, Acknowledged, Resolved)
    - Date range picker
    - District/Block/Village dropdown cascade
    - Disease type multi-select
    - "Apply Filters" and "Clear All" buttons
- **Responsive:** Collapsible sidebar on desktop, bottom sheet on mobile

**Block 3 - Alert Grid:**
- **Component Type:** Responsive card grid
- **Elements:**
    - Alert cards in 3-column grid (each card as described in AlertCard component)
    - Sort dropdown: "Most Recent", "Highest Severity", "Most Cases"
    - View toggle: Grid view / List view
- **Placeholder Content:** Filtered alert results
- **Responsive:** 1 column mobile, 2 columns tablet, 3 columns desktop

**Block 4 - Alert Details Modal:**
- **Component Type:** Modal overlay (opens on "View Details")
- **Elements:**
    - Full alert information
    - Case timeline chart
    - Affected population demographics
    - Response actions taken
    - Related alerts in same region
    - Action buttons: "Mark Resolved", "Escalate", "Add Notes"
- **Responsive:** Full screen on mobile, centered modal on desktop

**Navigation:**
- **Entry Points:** Dashboard "View All Alerts", Navbar "Alerts"
- **Exit Points:** Click alert to details, Navbar to other pages
- **Primary CTA:** "Acknowledge Alert" or "Mark Resolved"

---

### Page 3: Analytics (Data Insights)

**Route:** `/analytics`

**Purpose:** Visualize health trends, patterns, and generate reports for policy decisions

**Layout Type:** Full-width dashboard with multiple chart sections

---

**Block 1 - Page Header:**
- **Component Type:** Header with date range selector
- **Elements:**
    - Page title (H1): "Health Analytics"
    - Date range picker (default: Last 30 days)
    - Export button: "Download Report (PDF/CSV)"
- **Responsive:** Stack controls on mobile

**Block 2 - Overview Metrics:**
- **Component Type:** Stats grid
- **Elements:**
    - Total cases this period
    - Week-over-week change percentage
    - Most affected disease type
    - Most affected district
- **Responsive:** 2x2 grid on mobile, 4 columns on desktop

**Block 3 - Time Series Chart:**
- **Component Type:** Line chart
- **Elements:**
    - X-axis: Date (daily/weekly/monthly view toggle)
    - Y-axis: Case count
    - Multiple lines for different disease types
    - Legend with color coding
    - Hover tooltips showing exact values
- **Placeholder Content:** Historical case data aggregated by date
- **Responsive:** Simplified chart on mobile, full interactive on desktop

**Block 4 - Disease Breakdown:**
- **Component Type:** Pie/Donut chart + Table
- **Elements:**
    - Pie chart showing percentage by disease type
    - Adjacent table with disease name, case count, percentage
    - Click to filter other visualizations
- **Responsive:** Chart above table on mobile, side-by-side on desktop

**Block 5 - Geographic Heatmap:**
- **Component Type:** Choropleth map
- **Elements:**
    - Map of NER with districts color-coded by case intensity
    - Color scale legend (light to dark based on case density)
    - Hover to show district name and case count
- **Responsive:** Full width on all screens, simplified controls on mobile

**Block 6 - Trend Insights:**
- **Component Type:** Insight cards
- **Elements:**
    - Card 1: "Peak outbreak periods" - Seasonal pattern analysis
    - Card 2: "High-risk areas" - List of districts with increasing trends
    - Card 3: "Response effectiveness" - Average time to resolution
- **Responsive:** Stack vertically on mobile

**Navigation:**
- **Entry Points:** Dashboard stat cards (click through), Navbar "Analytics"
- **Exit Points:** Navbar to other pages
- **Primary CTA:** "Export Report"

---

### Page 4: Data Entry (Case Reporting)

**Route:** `/entry`

**Purpose:** Allow health workers to submit new disease case data quickly and accurately

**Layout Type:** Centered form with multi-step wizard

---

**Block 1 - Page Header:**
- **Component Type:** Header with progress indicator
- **Elements:**
    - Page title (H1): "Report New Case"
    - Step indicator: "Step 1 of 3" with progress bar
    - "Save Draft" button (for incomplete submissions)
- **Responsive:** Compact on mobile

**Block 2 - Step 1: Location Details:**
- **Component Type:** Form section
- **Elements:**
    - District dropdown (required)
    - Block dropdown (cascades from district)
    - Village/area text input
    - GPS coordinates (auto-detect or manual entry)
    - Date and time of case detection
    - "Next" button
- **Placeholder Content:** Pre-populate if user has default location
- **Responsive:** Full width form fields

**Block 3 - Step 2: Symptom Information:**
- **Component Type:** Form section
- **Elements:**
    - Symptom checklist (fever, diarrhea, vomiting, abdominal pain, dehydration, etc.)
    - Severity selector (Mild, Moderate, Severe)
    - Disease type dropdown (if known: Cholera, Typhoid, Diarrhea, Hepatitis A, Other)
    - Additional notes textarea
    - "Back" and "Next" buttons
- **Responsive:** Checkboxes in 2 columns on desktop, single column on mobile

**Block 4 - Step 3: Patient Demographics:**
- **Component Type:** Form section
- **Elements:**
    - Age (number input)
    - Gender (radio: Male, Female, Other)
    - Patient ID (optional, for tracking)
    - Contact information (optional, phone number)
    - "Back" and "Submit" buttons
- **Responsive:** Single column layout

**Block 5 - Bulk Upload Option:**
- **Component Type:** Alternative entry method
- **Elements:**
    - CSV file upload dropzone
    - Template download link: "Download CSV template"
    - Instructions for bulk format
    - "Upload and Process" button
- **Placeholder Content:** Example CSV format specification
- **Responsive:** Full width

**Block 6 - Submission Confirmation:**
- **Component Type:** Success message (after submit)
- **Elements:**
    - Success icon and message: "Case reported successfully"
    - Case ID for reference
    - Buttons: "Report Another Case", "View on Map", "Go to Dashboard"
- **Responsive:** Centered on all screens

**Navigation:**
- **Entry Points:** Dashboard "Report Case" button, Navbar "Data Entry"
- **Exit Points:** After submission, return to Dashboard or start new entry
- **Primary CTA:** "Submit Case Report"

---

### Page 5: Login (Authentication)

**Route:** `/login`

**Purpose:** Secure access to the health surveillance system

**Layout Type:** Centered form with branding

---

**Block 1 - Branding Header:**
- **Component Type:** Logo and tagline
- **Elements:**
    - HealthGuard NER logo
    - Tagline: "Early Detection, Rapid Response"
    - Background: Subtle map pattern or health-related image
- **Responsive:** Logo scales down on mobile

**Block 2 - Login Form:**
- **Component Type:** Card with form
- **Elements:**
    - Email/Username input field
    - Password input field (with show/hide toggle)
    - "Remember me" checkbox
    - "Forgot password?" link
    - "Sign In" button (primary, full width)
    - Loading spinner on submission
- **Placeholder Content:** Demo credentials note for testing
- **Responsive:** Max width 400px, full width on mobile

**Block 3 - Additional Options:**
- **Component Type:** Links section
- **Elements:**
    - "New user? Request access" link
    - "System requirements" link
    - Language selector (English, Hindi, Assamese)
- **Responsive:** Center-aligned text links

**Block 4 - Footer:**
- **Component Type:** Footer with info
- **Elements:**
    - Copyright notice
    - "Privacy Policy" and "Terms of Use" links
    - Government logo/affiliation
- **Responsive:** Single column, smaller text on mobile

**Navigation:**
- **Entry Points:** App root, Logout action, Session timeout
- **Exit Points:** Successful login → Dashboard
- **Primary CTA:** "Sign In" button

---

### Responsive Constraints Summary

**Desktop (≥1280px):**
- Multi-column layouts maximize screen real estate
- Side-by-side components (map + alerts, charts + tables)
- Hover interactions for additional information
- Full navigation bar always visible
- Large touch targets not necessary (mouse precision)

**Tablet (768px - 1279px):**
- 2-column layouts where appropriate
- Collapsible sidebars/filters to save space
- Touch-friendly targets (minimum 44px)
- Responsive charts with simplified controls
- Bottom sheets for mobile-style filters

**Mobile (<768px):**
- Single column stacked layouts
- Bottom navigation bar for primary actions
- Full-screen modals and sheets
- Swipeable cards for horizontal navigation
- Large touch targets (minimum 48px)
- Hamburger menu for secondary navigation
- Simplified map with essential controls only
- Priority content first, collapsible sections for details

---

## Database Schema

### Collections Overview

**Collections:**
1. **users** - Health officials, ASHA workers, administrators
2. **cases** - Individual disease case reports
3. **alerts** - System-generated outbreak alerts
4. **locations** - Hierarchical geographic data (districts, blocks, villages)
5. **diseases** - Disease type definitions and metadata
6. **responses** - Actions taken in response to alerts
7. **reports** - Generated analytical reports

---

### Collection: users

**Purpose:** Store user accounts with roles and permissions

**Schema:**
```
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  name: String (required),
  role: String (enum: ['admin', 'district_officer', 'health_worker', 'analyst']),
  district: String (reference to locations),
  phone: String,
  language: String (enum: ['en', 'hi', 'as'], default: 'en'),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)
- `role`
- `district`

---

### Collection: cases

**Purpose:** Store individual health case reports

**Schema:**
```
{
  _id: ObjectId,
  caseId: String (unique, auto-generated, e.g., "NER-2024-001234"),
  
  // Location data
  location: {
    district: String (required),
    block: String,
    village: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Health data
  disease: String (reference to diseases collection),
  symptoms: [String] (array of symptom names),
  severity: String (enum: ['mild', 'moderate', 'severe']),
  
  // Patient data (anonymized if needed)
  patient: {
    age: Number,
    gender: String (enum: ['male', 'female', 'other']),
    patientId: String (optional, for tracking)
  },
  
  // Metadata
  reportedBy: ObjectId (reference to users),
  reportedAt: Date (required),
  detectedAt: Date (when symptoms started),
  status: String (enum: ['active', 'recovered', 'fatal', 'unknown'], default: 'active'),
  notes: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `caseId` (unique)
- `location.district`
- `disease`
- `reportedAt` (descending)
- `detectedAt` (descending)
- Compound index: `{disease: 1, location.district: 1, reportedAt: -1}`

---

### Collection: alerts

**Purpose:** Store system-generated outbreak alerts

**Schema:**
```
{
  _id: ObjectId,
  alertId: String (unique, auto-generated, e.g., "ALERT-2024-0089"),
  
  // Alert classification
  severity: String (enum: ['critical', 'high', 'medium', 'low'], required),
  status: String (enum: ['new', 'acknowledged', 'resolved'], default: 'new'),
  
  // Outbreak data
  disease: String (required),
  location: {
    district: String (required),
    block: String,
    village: String
  },
  
  // Trigger data
  caseCount: Number (required),
  timeframe: String (e.g., "24 hours", "7 days"),
  threshold: Number (the threshold that triggered this alert),
  riskScore: Number (0-100, calculated by ML model),
  
  // Description
  title: String (auto-generated summary),
  description: String (detailed explanation),
  
  // Related cases
  affectedCases: [ObjectId] (references to cases collection),
  
  // Response tracking
  acknowledgedBy: ObjectId (reference to users),
  acknowledgedAt: Date,
  resolvedBy: ObjectId (reference to users),
  resolvedAt: Date,
  resolutionNotes: String,
  
  // Notifications sent
  notificationsSent: {
    email: [String] (list of recipient emails),
    sms: [String] (list of phone numbers),
    push: [ObjectId] (list of user IDs)
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `alertId` (unique)
- `status`
- `severity`
- `location.district`
- `disease`
- `createdAt` (descending)
- Compound index: `{status: 1, severity: 1, createdAt: -1}`

---

### Collection: locations

**Purpose:** Hierarchical geographic data for Northeast India

**Schema:**
```
{
  _id: ObjectId,
  type: String (enum: ['state', 'district', 'block', 'village'], required),
  name: String (required),
  parentId: ObjectId (reference to parent location),
  
  // Geographic data
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  boundaries: {
    type: String ('Polygon'),
    coordinates: [[[Number]]] (GeoJSON format)
  },
  
  // Metadata
  population: Number,
  waterSources: [String] (e.g., ['river', 'well', 'piped']),
  healthFacilities: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `type`
- `name`
- `parentId`
- `coordinates` (2dsphere index for geospatial queries)

---

### Collection: diseases

**Purpose:** Disease type definitions and metadata

**Schema:**
```
{
  _id: ObjectId,
  name: String (unique, required, e.g., "Cholera"),
  category: String (enum: ['water_borne', 'vector_borne', 'airborne', 'other']),
  
  // Clinical data
  symptoms: [String] (common symptoms),
  incubationPeriod: {
    min: Number (days),
    max: Number (days)
  },
  severity: String (enum: ['low', 'medium', 'high', 'critical']),
  
  // Alert thresholds (cases in timeframe)
  alertThresholds: {
    critical: Number (e.g., 15 cases in 24h),
    high: Number (e.g., 10 cases in 48h),
    medium: Number (e.g., 5 cases in 72h)
  },
  
  // Prevention and treatment info
  preventionMeasures: [String],
  treatment: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name` (unique)
- `category`

---

### Collection: responses

**Purpose:** Track actions taken in response to alerts

**Schema:**
```
{
  _id: ObjectId,
  alertId: ObjectId (reference to alerts, required),
  
  // Response details
  responseType: String (enum: ['medical_team_deployed', 'water_testing', 'community_alert', 'resource_allocation', 'other']),
  description: String (required),
  
  // Personnel and resources
  responsibleOfficer: ObjectId (reference to users),
  teamMembers: [String] (names or IDs),
  resourcesUsed: String,
  
  // Timing
  initiatedAt: Date (required),
  completedAt: Date,
  
  // Outcome
  outcome: String,
  effectiveness: String (enum: ['very_effective', 'effective', 'somewhat_effective', 'ineffective']),
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `alertId`
- `responsibleOfficer`
- `initiatedAt` (descending)

---

### Collection: reports

**Purpose:** Store generated analytical reports

**Schema:**
```
{
  _id: ObjectId,
  reportId: String (unique, auto-generated),
  
  // Report metadata
  title: String (required),
  type: String (enum: ['daily', 'weekly', 'monthly', 'custom']),
  period: {
    startDate: Date (required),
    endDate: Date (required)
  },
  
  // Coverage
  locations: [String] (districts covered),
  diseases: [String] (diseases included),
  
  // Report data (stored as JSON)
  data: Object ({
    totalCases: Number,
    alertCount: Number,
    criticalAreas: [String],
    trendAnalysis: Object,
    recommendations: [String]
  }),
  
  // File references
  pdfUrl: String (S3 or file path),
  csvUrl: String,
  
  // Generation info
  generatedBy: ObjectId (reference to users),
  generatedAt: Date,
  
  createdAt: Date
}
```

**Indexes:**
- `reportId` (unique)
- `type`
- `period.startDate`
- `generatedAt` (descending)

---

## API Endpoints

### Authentication Endpoints

**POST /api/auth/login**
- **Purpose:** User authentication
- **Request Body:**
  ```
  {
    email: string,
    password: string
  }
  ```
- **Response:**
  ```
  {
    success: boolean,
    token: string (JWT),
    user: {
      id: string,
      name: string,
      role: string,
      district: string
    }
  }
  ```
- **Status Codes:** 200 (success), 401 (invalid credentials), 400 (validation error)

**POST /api/auth/logout**
- **Purpose:** Invalidate user session
- **Headers:** Authorization: Bearer {token}
- **Response:** `{ success: boolean }`
- **Status Codes:** 200 (success), 401 (unauthorized)

**POST /api/auth/refresh**
- **Purpose:** Refresh JWT token
- **Headers:** Authorization: Bearer {token}
- **Response:** `{ success: boolean, token: string }`
- **Status Codes:** 200 (success), 401 (invalid token)

---

### Case Management Endpoints

**GET /api/cases**
- **Purpose:** Get list of cases with filtering
- **Query Parameters:**
    - `district` (string, optional)
    - `disease` (string, optional)
    - `startDate` (ISO date, optional)
    - `endDate` (ISO date, optional)
    - `severity` (string, optional)
    - `page` (number, default: 1)
    - `limit` (number, default: 20)
- **Response:**
  ```
  {
    cases: [Case],
    pagination: {
      total: number,
      page: number,
      limit: number,
      totalPages: number
    }
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid parameters), 401 (unauthorized)

**POST /api/cases**
- **Purpose:** Submit new case report
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
  ```
  {
    location: {
      district: string,
      block: string (optional),
      village: string (optional),
      coordinates: { latitude: number, longitude: number } (optional)
    },
    disease: string,
    symptoms: [string],
    severity: string,
    patient: {
      age: number,
      gender: string,
      patientId: string (optional)
    },
    detectedAt: ISO date string,
    notes: string (optional)
  }
  ```
- **Response:**
  ```
  {
    success: boolean,
    caseId: string,
    case: Case object
  }
  ```
- **Status Codes:** 201 (created), 400 (validation error), 401 (unauthorized)

**GET /api/cases/:id**
- **Purpose:** Get single case details
- **Response:** Case object
- **Status Codes:** 200 (success), 404 (not found), 401 (unauthorized)

**PATCH /api/cases/:id**
- **Purpose:** Update case status or information
- **Headers:** Authorization: Bearer {token}
- **Request Body:** Partial Case object
- **Response:** Updated Case object
- **Status Codes:** 200 (success), 404 (not found), 400 (validation error), 401 (unauthorized)

**POST /api/cases/bulk**
- **Purpose:** Bulk upload cases from CSV
- **Headers:** Authorization: Bearer {token}, Content-Type: multipart/form-data
- **Request Body:** CSV file upload
- **Response:**
  ```
  {
    success: boolean,
    imported: number,
    failed: number,
    errors: [{ row: number, message: string }]
  }
  ```
- **Status Codes:** 200 (success), 400 (validation error), 401 (unauthorized)

---

### Alert Management Endpoints

**GET /api/alerts**
- **Purpose:** Get list of alerts with filtering
- **Query Parameters:**
    - `status` (string: new/acknowledged/resolved)
    - `severity` (string: critical/high/medium/low)
    - `district` (string, optional)
    - `disease` (string, optional)
    - `startDate` (ISO date, optional)
    - `endDate` (ISO date, optional)
    - `page` (number, default: 1)
    - `limit` (number, default: 20)
- **Response:**
  ```
  {
    alerts: [Alert],
    pagination: { total, page, limit, totalPages }
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid parameters), 401 (unauthorized)

**GET /api/alerts/:id**
- **Purpose:** Get single alert details with related cases
- **Response:**
  ```
  {
    alert: Alert object,
    relatedCases: [Case],
    responses: [Response]
  }
  ```
- **Status Codes:** 200 (success), 404 (not found), 401 (unauthorized)

**PATCH /api/alerts/:id/acknowledge**
- **Purpose:** Mark alert as acknowledged
- **Headers:** Authorization: Bearer {token}
- **Response:** Updated Alert object
- **Status Codes:** 200 (success), 404 (not found), 401 (unauthorized)

**PATCH /api/alerts/:id/resolve**
- **Purpose:** Mark alert as resolved
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
  ```
  {
    resolutionNotes: string (required)
  }
  ```
- **Response:** Updated Alert object
- **Status Codes:** 200 (success), 404 (not found), 400 (validation error), 401 (unauthorized)

---

### Analytics Endpoints

**GET /api/analytics/dashboard**
- **Purpose:** Get dashboard statistics
- **Query Parameters:**
    - `district` (string, optional - filter by district)
    - `startDate` (ISO date, default: 30 days ago)
    - `endDate` (ISO date, default: today)
- **Response:**
  ```
  {
    activeCases: number,
    newAlerts: number,
    criticalAreas: number,
    avgResponseTime: string,
    casesByDisease: [{ disease: string, count: number }],
    casesByDistrict: [{ district: string, count: number }],
    timeline: [{ date: string, cases: number }]
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid parameters), 401 (unauthorized)

**GET /api/analytics/trends**
- **Purpose:** Get time series data for trends
- **Query Parameters:**
    - `disease` (string, optional)
    - `district` (string, optional)
    - `groupBy` (string: day/week/month, default: day)
    - `startDate` (ISO date, required)
    - `endDate` (ISO date, required)
- **Response:**
  ```
  {
    data: [{ date: string, caseCount: number, alertCount: number }],
    summary: {
      totalCases: number,
      peakDate: string,
      trend: string (increasing/decreasing/stable)
    }
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid parameters), 401 (unauthorized)

**GET /api/analytics/heatmap**
- **Purpose:** Get geographic case distribution data
- **Query Parameters:**
    - `disease` (string, optional)
    - `startDate` (ISO date, optional)
    - `endDate` (ISO date, optional)
- **Response:**
  ```
  {
    locations: [{
      district: string,
      caseCount: number,
      severity: string,
      coordinates: { lat: number, lng: number }
    }]
  }
  ```
- **Status Codes:** 200 (success), 400 (invalid parameters), 401 (unauthorized)

---

### Location Endpoints

**GET /api/locations/districts**
- **Purpose:** Get list of all districts
- **Response:** `[{ id: string, name: string }]`
- **Status Codes:** 200 (success)

**GET /api/locations/blocks/:districtId**
- **Purpose:** Get blocks within a district
- **Response:** `[{ id: string, name: string, districtId: string }]`
- **Status Codes:** 200 (success), 404 (district not found)

**GET /api/locations/villages/:blockId**
- **Purpose:** Get villages within a block
- **Response:** `[{ id: string, name: string, blockId: string }]`
- **Status Codes:** 200 (success), 404 (block not found)

---

### Report Generation Endpoints

**POST /api/reports/generate**
- **Purpose:** Generate analytical report
- **Headers:** Authorization: Bearer {token}
- **Request Body:**
  ```
  {
    type: string (daily/weekly/monthly/custom),
    period: {
      startDate: ISO date,
      endDate: ISO date
    },
    locations: [string] (district IDs),
    diseases: [string] (disease names),
    format: string (pdf/csv/both)
  }
  ```
- **Response:**
  ```
  {
    success: boolean,
    reportId: string,
    downloadUrls: {
      pdf: string (optional),
      csv: string (optional)
    }
  }
  ```
- **Status Codes:** 201 (created), 400 (validation error), 401 (unauthorized)

**GET /api/reports**
- **Purpose:** Get list of generated reports
- **Query Parameters:**
    - `type` (string, optional)
    - `page` (number, default: 1)
    - `limit` (number, default: 20)
- **Response:**
  ```
  {
    reports: [Report],
    pagination: { total, page, limit, totalPages }
  }
  ```
- **Status Codes:** 200 (success), 401 (unauthorized)

**GET /api/reports/:id/download**
- **Purpose:** Download report file
- **Query Parameters:** `format` (pdf/csv)
- **Response:** File stream
- **Status Codes:** 200 (success), 404 (not found), 401 (unauthorized)

---

### Real-Time WebSocket Events

**Connection:** `ws://[server]/socket.io`

**Events (Server → Client):**

1. **new_alert**
    - Emitted when new alert is created
    - Payload: Alert object
    - Rooms: All authenticated users,