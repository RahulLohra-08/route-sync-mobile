;; DESIGN.md

# RouteSync — Design System

> **Design principle:** Clean, professional, trustworthy, and transport-focused UI with Emerald Green as the primary brand color.

---

## 1. Design Philosophy

RouteSync is a real-time public transportation platform.

The UI should communicate:

- **Trust** — users should feel that the information is reliable.
- **Live movement** — real-time tracking should be visually obvious.
- **Clarity** — important information such as ETA, bus status, and route should be easy to scan.
- **Professionalism** — avoid excessive colors, gradients, shadows, and decorative elements.
- **Consistency** — Passenger, Driver, and Admin applications should feel like one product.

### Core visual rule

**Emerald = RouteSync identity**

Use emerald primarily for:

- Primary buttons
- Active navigation
- Live indicators
- Bus markers
- Important actions
- Selected states
- Progress indicators

Do not introduce unrelated primary colors such as navy blue, purple, or orange unless there is a specific semantic reason.

---

# 2. Color System

The main color source is:

`src/theme/colors.ts`

## Primary — Emerald

| Token       | Color     | Usage                         |
| ----------- | --------- | ----------------------------- |
| primary.50  | `#ECFDF5` | Very light backgrounds        |
| primary.100 | `#D1FAE5` | Selected/light states         |
| primary.200 | `#A7F3D0` | Soft borders                  |
| primary.300 | `#6EE7B7` | Light accents                 |
| primary.400 | `#34D399` | Secondary accent              |
| primary.500 | `#10B981` | Main brand color              |
| primary.600 | `#059669` | Primary action / strong brand |
| primary.700 | `#047857` | Pressed / dark brand          |
| primary.800 | `#065F46` | Very dark brand               |
| primary.900 | `#064E3B` | Brand text on light surfaces  |

### Primary usage

```text
Primary CTA      → primary.600
Primary icon     → primary.600
Active state     → primary.600
Live indicator   → status.success
Bus marker       → map.bus
Light green BG   → primary.50 / primary.100
```

---

# 3. Background Colors

```text
background.primary   #FFFFFF
background.secondary #F8FAFC
background.tertiary  #F1F5F9
```

### Usage

**Primary**

- Main screen background
- Cards
- Modal surfaces

**Secondary**

- Main application screen
- Section backgrounds
- Passenger dashboard

**Tertiary**

- Input backgrounds
- Small information containers
- Disabled/light UI sections

---

# 4. Text Colors

```text
text.primary   #0F172A
text.secondary #475569
text.muted     #94A3B8
text.inverse   #FFFFFF
```

### Rules

Use:

```text
Primary   → headings, important values, bus number, ETA
Secondary → descriptions, supporting information
Muted     → timestamps, hints, disabled information
Inverse   → text on emerald/dark backgrounds
```

Avoid using pure black `#000000`.

---

# 5. Border Colors

```text
border.light  #E2E8F0
border.medium #CBD5E1
```

Default:

```text
border.light
```

Use `border.medium` only when stronger separation is required.

---

# 6. Status Colors

```text
success #16A34A
warning #F59E0B
error   #DC2626
info    #2563EB
```

### Important rule

Status colors should communicate **meaning**, not branding.

```text
Green  → Success / active
Amber  → Warning / approaching / attention
Red    → Error / cancelled
Blue   → Informational
```

Do not use amber as the main application brand color.

---

# 7. Map Colors

```text
map.bus   #059669
map.route #0F766E
map.user  #2563EB
```

### Map

```text
Bus marker  → map.bus
Route line  → map.route
Passenger   → map.user
```

The passenger/user marker may remain blue because blue is useful for distinguishing the user's location from buses and routes.

---

# 8. Spacing System

Source:

`src/theme/spacing.ts`

```text
xs      4
sm      8
md      12
lg      16
xl      20
xxl     24
xxxl    32
huge    40
section 48
```

### Recommended usage

```text
Screen horizontal padding → 20–24
Card padding              → 16–20
Between cards             → 12–16
Section spacing           → 32–48
Icon/text gap             → 8
```

Avoid random values such as:

```text
margin: 13
padding: 17
gap: 19
```

Prefer design tokens.

---

# 9. Border Radius

Source:

`src/theme/radius.ts`

```text
sm   8
md   12
lg   16
xl   20
xxl  24
pill 999
```

### Usage

```text
Input       → md
Small card  → md
Normal card → lg
Large card  → xl
Status chip → pill
Button      → lg / pill
```

RouteSync should have a **soft rounded design**, but avoid making every component extremely rounded.

---

# 10. Typography

Source:

`src/theme/typography.ts`

### Display

```text
32 / 40 / 800
```

Use for:

- Large ETA
- Major dashboard numbers

### H1

```text
28 / 36 / 800
```

Use for:

- Screen titles

### H2

```text
22 / 30 / 700
```

Use for:

- Major sections

### H3

```text
18 / 26 / 700
```

Use for:

- Card titles

### Body

```text
16 / 24 / 400
```

Use for:

- Normal content

### Body Medium

```text
16 / 24 / 500
```

Use for:

- Important supporting information

### Caption

```text
13 / 18 / 400
```

Use for:

- Metadata
- Timestamps
- Secondary information

### Button

```text
15 / 20 / 600
```

Use for:

- Buttons
- CTA labels

---

# 11. Animation

Source:

`src/theme/animation.ts`

### Durations

```text
fast   150ms
normal 250ms
slow   400ms
```

### Spring

```text
damping   18
stiffness 180
mass      0.8
```

### Press interaction

```text
normal 1
pressed 0.97
```

### Animation philosophy

Animations should make the interface feel:

- Responsive
- Smooth
- Modern
- Alive

Avoid unnecessary animations.

Good examples:

```text
Button press
Card entrance
Bottom sheet
Live bus movement
Status transition
Loading state
```

---

# 12. Cards

Default RouteSync card:

```text
Background → #FFFFFF
Border     → border.light
Radius     → radius.lg
Padding    → spacing.lg
```

Use subtle elevation/shadow only where hierarchy requires it.

### Card hierarchy

```text
Screen
 └── Section
      └── Card
           ├── Title
           ├── Main information
           └── Supporting information
```

Do not put heavy shadows on every card.

---

# 13. Buttons

## Primary Button

```text
Background → primary.600
Text       → text.inverse
Radius     → radius.lg
Height     → approximately 48–52
```

Pressed:

```text
Background → primary.700
Scale      → animation.scale.pressed
```

## Secondary Button

```text
Background → primary.50
Text       → primary.700
Border     → primary.200
```

## Destructive Button

```text
Background → status.error
Text       → text.inverse
```

---

# 14. Status Chips

Status chips should use:

```text
Soft background
Dark semantic text
Small icon
Pill radius
```

Example:

```text
LIVE

Background → primary.100
Text       → primary.700
Icon       → status.success
```

---

# 15. Passenger App Design

Passenger screens should prioritize:

1. Current bus
2. ETA
3. Live status
4. Route
5. Pickup/drop location
6. Real-time map

### Passenger dashboard hierarchy

```text
Header
 ↓
Current Trip / Search
 ↓
Live Bus Card
 ↓
ETA
 ↓
Route Information
 ↓
Live Map
 ↓
Additional Information
```

The **ETA should be one of the strongest visual elements** because it is the most useful passenger information.

---

# 16. Passenger Color Rules

Do not use a separate navy theme for Passenger.

Passenger uses the global RouteSync color system.

```text
Brand         → primary.600
Brand light   → primary.50
Brand soft    → primary.100
Heading       → text.primary
Body          → text.secondary
Muted         → text.muted
Card          → background.primary
Screen        → background.secondary
Border        → border.light
Live          → status.success
Warning       → status.warning
Cancelled     → status.error
Information  → status.info
Bus           → map.bus
Route         → map.route
User          → map.user
```

---

# 17. Trip Status Design

## SCHEDULED

```text
Text       → status.info
Background → #EFF6FF
Icon       → calendar-outline
```

## BOARDING

```text
Text       → #B45309
Background → #FEF3C7
Icon       → walk-outline
```

## IN_PROGRESS

```text
Text       → primary.700
Background → primary.100
Icon       → radio-outline
```

## COMPLETED

```text
Text       → text.secondary
Background → background.tertiary
Icon       → checkmark-circle-outline
```

## CANCELLED

```text
Text       → #B91C1C
Background → #FEE2E2
Icon       → close-circle-outline
```

---

# 18. Driver App Design

Driver UI should emphasize:

```text
Current Trip
 ↓
Trip Status
 ↓
Start / Stop Trip
 ↓
GPS Status
 ↓
Passenger/route information
```

Driver controls can use the same RouteSync emerald branding.

---

# 19. Admin Dashboard Design

Admin should use:

```text
White cards
Slate text
Emerald active states
Minimal shadows
Clear data hierarchy
```

Avoid making every dashboard metric green.

Use semantic colors only where necessary.

---

# 20. Real-Time Tracking UI

Real-time state should be visually obvious.

Example:

```text
● LIVE

Green dot
+
LIVE text
+
last updated time
```

Example:

```text
● Live
Updated 8 seconds ago
```

For stale data:

```text
● Updating...
```

For disconnected:

```text
● Connection lost
```

---

# 21. Design Token Rule

Components should **not** directly invent colors.

Bad:

```tsx
backgroundColor: "#123456";
```

Good:

```tsx
backgroundColor: colors.primary[600];
```

Better:

```tsx
backgroundColor: palette.brand;
```

where `palette.brand` internally maps to the global design system.

---

# 22. Source of Truth

RouteSync should follow this architecture:

```text
src/theme/
│
├── colors.ts        ← Global colors
├── spacing.ts       ← Spacing
├── typography.ts    ← Typography
├── radius.ts        ← Border radius
├── animation.ts     ← Animation
├── index.ts         ← Theme exports
│
└── passenger.ts     ← Passenger semantic theme
```

### Important

`colors.ts` defines **raw design tokens**.

Feature themes such as `passenger.ts` define **semantic meaning**.

Example:

```text
colors.primary.600
        ↓
passenger.palette.brand
        ↓
Passenger Button
```

This allows the whole application to be redesigned without changing every component.

---

# 23. Design Consistency Checklist

Before creating a new screen, check:

- [ ] Am I using `colors.ts`?
- [ ] Am I using spacing tokens?
- [ ] Am I using typography tokens?
- [ ] Am I using radius tokens?
- [ ] Am I using animation tokens?
- [ ] Did I avoid hard-coded colors?
- [ ] Is emerald the primary brand color?
- [ ] Are status colors semantic?
- [ ] Is the most important information visually strongest?
- [ ] Does this screen look like RouteSync?

---

# 24. Golden Rule

> **One RouteSync, one visual language.**

Passenger, Driver, and Admin can have different layouts and feature-specific components, but they should share:

```text
Colors
Typography
Spacing
Radius
Animation
Status semantics
Interaction principles
```

Only the **semantic usage** should change.

This keeps RouteSync professional, scalable, and easy to maintain.
