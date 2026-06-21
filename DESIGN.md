---
name: Freelance Escrow
description: Milestone-based USDC escrow for Southeast Asian freelancers, built on Soroban.
colors:
  settlement-indigo: "oklch(58% 0.19 265)"
  settlement-indigo-hover: "oklch(52% 0.20 265)"
  settlement-indigo-foreground: "oklch(99% 0.005 265)"
  ink-light: "oklch(20% 0.014 265)"
  ink-dark: "oklch(96% 0.006 265)"
  paper-light: "oklch(99% 0.003 265)"
  paper-dark: "oklch(15% 0.012 265)"
  mist-light: "oklch(97% 0.006 265)"
  mist-dark: "oklch(20% 0.014 265)"
  hairline-light: "oklch(89% 0.012 265)"
  hairline-dark: "oklch(32% 0.02 265)"
  escrow-green: "oklch(60% 0.14 152)"
  escrow-green-bg-light: "oklch(96% 0.04 152)"
  amber-review: "oklch(58% 0.15 70)"
  amber-review-bg-light: "oklch(96% 0.06 80)"
  dispute-red: "oklch(58% 0.20 25)"
  dispute-red-bg-light: "oklch(96% 0.03 25)"
typography:
  heading:
    fontFamily: "Geist Sans, -apple-system, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Sans, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Geist Sans, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Sans, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.06em"
  data:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  control: "8px"
  panel: "16px"
  pill: "9999px"
spacing:
  tight: "8px"
  default: "16px"
  loose: "24px"
  section: "48px"
  hero: "96px"
components:
  button-primary:
    backgroundColor: "{colors.settlement-indigo}"
    textColor: "{colors.settlement-indigo-foreground}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.settlement-indigo-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  panel:
    backgroundColor: "{colors.paper-light}"
    rounded: "{rounded.panel}"
    padding: "24px"
  status-badge-approved:
    backgroundColor: "{colors.escrow-green-bg-light}"
    textColor: "{colors.escrow-green}"
    rounded: "{rounded.pill}"
  status-badge-submitted:
    backgroundColor: "{colors.amber-review-bg-light}"
    textColor: "{colors.amber-review}"
    rounded: "{rounded.pill}"
  status-badge-disputed:
    backgroundColor: "{colors.dispute-red-bg-light}"
    textColor: "{colors.dispute-red}"
    rounded: "{rounded.pill}"
---

# Design System: Freelance Escrow

## 1. Overview

**Creative North Star: "The Notarized Handshake"**

Freelance Escrow looks like a wallet a freelancer would actually trust with rent money, not a trading terminal and not a bank's online portal. It borrows Phantom and Rainbow's confidence about being visibly on-chain, Stripe's clarity around money and state, and Linear's refusal to waste a pixel on decoration that isn't doing work. One deliberate accent, Settlement Indigo, carries every brand moment and every primary action; everything else is quiet, tinted neutrals so the indigo never has to compete.

This system explicitly rejects the corporate-bank look (stiff navy-and-gold, bureaucratic distance), the crypto-trading-terminal look (dense neon-on-black panels built for speculators), and the generic AI-SaaS-template look (gradient hero text, identical icon-card grids, big-number hero-metric blocks).

**Key Characteristics:**
- One indigo accent, used on purpose, not decoration
- Status communicated through three semantic colors (escrow green, amber review, dispute red), never invented ad hoc
- Addresses, amounts, and tx hashes always rendered in mono, never disguised as prose
- Flat surfaces, tonal layering instead of shadows
- Responsive motion only: state changes and feedback, no orchestrated reveals

## 2. Colors

Tinted neutrals carry the page; Settlement Indigo is reserved for brand presence and primary actions; three semantic colors carry milestone and transaction state.

### Primary
- **Settlement Indigo** (`oklch(58% 0.19 265)`, dark mode `oklch(72% 0.16 265)`): the one saturated color in the system. Primary buttons, links, active nav state, the wordmark mark, and the hero band background. Nowhere else.

### Neutral
- **Paper** (`oklch(99% 0.003 265)` light / `oklch(15% 0.012 265)` dark): page background, tinted toward indigo rather than true white or black.
- **Ink** (`oklch(20% 0.014 265)` light / `oklch(96% 0.006 265)` dark): primary text.
- **Mist** (`oklch(97% 0.006 265)` light / `oklch(20% 0.014 265)` dark): secondary surface for panels sitting on top of Paper, e.g. the wallet card, the inline balance row.
- **Hairline** (`oklch(89% 0.012 265)` light / `oklch(32% 0.02 265)` dark): all borders and dividers. Never pure black or white at full opacity.

### Semantic (milestone & transaction state)
- **Escrow Green** (`oklch(60% 0.14 152)`): milestone Approved, funds released, successful transaction.
- **Amber Review** (`oklch(58% 0.15 70)`): milestone Submitted and awaiting client approval, pending/in-progress states.
- **Dispute Red** (`oklch(58% 0.20 25)`): milestone Disputed, transaction error, destructive action.

### Named Rules
**The One Indigo Rule.** Settlement Indigo appears on primary actions, brand marks, and the hero band, and nowhere else. If a second saturated color shows up outside the three semantic state colors, it's wrong.

## 3. Typography

**Sans Font:** Geist Sans (with `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` fallback)
**Mono Font:** Geist Mono (with `ui-monospace, monospace` fallback)

**Character:** One sans for every UI role from heading to label; it's a product surface, not an editorial page, so the pairing does the work through weight and size, not multiple families. Mono is reserved exclusively for on-chain data, which makes its appearance itself a signal: "this is a real address, amount, or hash."

### Hierarchy
- **Heading** (600, `clamp(1.75rem, 3vw, 2.75rem)`, 1.15 line-height): page-level headline only, appears once per page.
- **Title** (600, 1.125rem, 1.3 line-height): section and card titles.
- **Body** (400, 0.9375rem, 1.6 line-height): all prose; capped at 65-75ch measure.
- **Label** (600, 0.75rem, 1.3 line-height, 0.06em tracking, uppercase): field labels, section eyebrows, status badges.
- **Data** (400, 0.875rem, 1.5 line-height, mono): wallet addresses, XLM/USDC amounts, transaction hashes, contract IDs. Always mono, never the sans.

### Named Rules
**The Mono-Means-Real Rule.** Any value that exists on-chain (address, amount, hash, contract ID) renders in Geist Mono. If it's mono, it's literally verifiable on a block explorer; if it isn't, it's UI copy.

## 4. Elevation

Flat by default. Depth comes from the Paper/Mist tonal layering and hairline borders, not shadows. The hero band is the one place that breaks flatness, using a solid Settlement Indigo fill rather than a shadow or gradient to separate itself from the page.

### Named Rules
**The Flat-By-Default Rule.** No `box-shadow` on cards, panels, or buttons at rest. A subtle ring (`0 0 0 1px var(--border)`) on focus is the only shadow-adjacent treatment, and it signals keyboard focus, not generic elevation.

## 5. Components

### Buttons
- **Shape:** fully rounded pill (`border-radius: 9999px`), matching the existing wallet actions.
- **Primary:** Settlement Indigo background, indigo-foreground text, `10px 20px` padding. Hover darkens to `oklch(52% 0.20 265)` (light) / lightens to `oklch(78% 0.15 265)` (dark).
- **Secondary / Ghost:** transparent background, hairline border, Ink text. Hover fills with a faint Mist tint, never with Settlement Indigo.

### Status Badges
- **Shape:** small pill, `label` typography, uppercase.
- **Approved:** Escrow Green text on a pale green tint background.
- **Submitted:** Amber Review text on a pale amber tint background.
- **Disputed:** Dispute Red text on a pale red tint background.
- **Pending:** Ink text on Mist background; pending has no saturated color, it's the absence of action yet.

### Cards / Panels
- **Corner Style:** 16px radius.
- **Background:** Paper for the page-level panel, Mist for a nested inline row (balance display, address chip) inside that panel. Never nest two Paper-on-Paper or Mist-on-Mist layers.
- **Shadow Strategy:** none (see Elevation). Separation comes from the Paper/Mist contrast and a 1px Hairline border.
- **Internal Padding:** 24px.

### Inputs / Fields
- **Style:** transparent background, 1px Hairline border, 8px radius.
- **Focus:** border shifts to full-strength Ink (light) / Paper (dark); no glow, no color shift to indigo.
- **Error:** Dispute Red text in a pale red banner below the field, not a colored border.

### Navigation
- **Style:** single header row, wordmark mark in Settlement Indigo plus "Freelance Escrow" in Ink, a small "Testnet" label badge, no dropdown menus. Stays Mist-on-Paper, never goes indigo itself; the mark carries the brand color so the bar itself can stay quiet.

## 6. Do's and Don'ts

### Do:
- **Do** keep Settlement Indigo to primary actions, the brand mark, and the hero band; everything else stays neutral.
- **Do** render every address, amount, and tx hash in Geist Mono.
- **Do** use the three semantic colors (Escrow Green, Amber Review, Dispute Red) for milestone and transaction state, consistently, everywhere they appear.
- **Do** keep transitions in the 150-250ms range and tied to a real state change (hover, focus, loading, success/error reveal).

### Don't:
- **Don't** build a corporate-bank look: no navy-and-gold, no stiff bureaucratic distance.
- **Don't** build a crypto-trading-terminal look: no dense neon-on-black panels, no intimidating data-trader chrome.
- **Don't** build a generic-AI-SaaS look: no gradient hero text, no identical icon+heading+text card grids repeated for their own sake, no big-number hero-metric block with a gradient accent.
- **Don't** use `border-left` or `border-right` accent stripes on cards or alerts; use full borders or background tint instead.
- **Don't** add box-shadow to cards or panels at rest; this system is flat by design.
- **Don't** introduce a second saturated accent color outside the documented palette.
