<div align="center">

# CounterYield Design System (DESIGN.md)

**Semantic Design Specification for CounterYield on Monad**

A clean, non-custodial fintech design system built for high clarity, fast execution, and tactile confidence.

<br />

<p align="center">
  <img src="https://img.shields.io/badge/Design_System-Uniswap_Spore_Dark-1F1F1F?style=for-the-badge" alt="Spore Dark" />
  <img src="https://img.shields.io/badge/Accent-Yellowish_Lime_%239FE825-9FE825?style=for-the-badge&labelColor=131313&color=9FE825" alt="Lime Accent" />
  <img src="https://img.shields.io/badge/Canvas-Matte_Charcoal_%23131313-131313?style=for-the-badge" alt="Matte Charcoal" />
  <img src="https://img.shields.io/badge/Tokens-Stitch_Compliant-836EF9?style=for-the-badge" alt="Stitch Compliant" />
</p>

[Theme & Atmosphere](#1-visual-theme--atmosphere) • [Color Palette](#2-color-palette--roles) • [Typography](#3-typography-rules) • [Components](#4-component-stylings) • [Layout](#5-layout-principles) • [Elevation](#6-depth--elevation) • [Guardrails](#7-dos-and-donts) • [Responsive](#8-responsive-behavior) • [Agent Prompt Guide](#9-agent-prompt-guide)

</div>

---

## 1. Visual Theme & Atmosphere

CounterYield presents high-throughput decentralized finance through the lens of a modern consumer banking application. It removes technical friction, replaces wallet jargon with clear financial metrics, and provides users with immediate tactile feedback.

- **Design Philosophy**: Minimalist dark fintech. Surface depth is communicated through calibrated charcoal shades and subtle borders rather than heavy blur effects or glowing dropshadows.
- **Density**: `Balanced Daily App` (Density 5/10). Critical account metrics (total balance, APY, safety margin) are immediately readable without visual clutter. Secondary operational details (orderbook ladders, telemetry heartbeats) are structured cleanly within subordinate views.
- **Variance**: `Offset Structured` (Variance 6/10). Balanced asymmetrical grids highlight the active position status, while action buttons anchor the bottom viewport.
- **Motion**: `Fluid Physical` (Motion 6/10). Interactions use weighted spring physics (`stiffness: 100, damping: 20`) giving inputs a solid, mechanical feel.

---

## 2. Color Palette & Roles

The palette is rooted in dark neutral surfaces with a single yellowish-lime accent. Pure white is reserved strictly for primary numbers and headlines.

### Primary Surfaces & Accents

| Token Name | Hex Code | Functional Role |
| :--- | :--- | :--- |
| **Canvas Background** | `#131313` | Deep matte background across all views. Never pure `#000000`. |
| **Surface Card** | `#1F1F1F` | Elevated card surfaces for metrics, positions, and input containers. |
| **Surface Elevated** | `#282828` | Modals, floating sheets, and interactive overlays. |
| **Surface Input** | `#181818` | Recessed input containers and search bars. |
| **Primary Accent** | `#9FE825` | Calibrated yellowish lime for primary CTAs, active pills, and positive yield. |
| **Accent Active** | `#7BC91E` | Pressed button state for primary actions. |
| **Accent Subtle** | `rgba(159, 232, 37, 0.08)` | Tonal background for success pills and badges. |

### Text & Contrast Hierarchy

| Token Name | Value | Usage Rule |
| :--- | :--- | :--- |
| **Text Primary** | `#FFFFFF` | Primary numbers, balances, page headings, and active labels. |
| **Text Secondary** | `rgba(255, 255, 255, 0.65)` | Subheadings, section captions, and parameter keys. |
| **Text Tertiary** | `rgba(255, 255, 255, 0.38)` | Footnotes, timestamps, and inactive status indicators. |
| **Border Subtle** | `rgba(255, 255, 255, 0.08)` | Structural dividers and resting container borders. |
| **Border Highlight** | `rgba(159, 232, 37, 0.35)` | Focused inputs and selected amount chips. |

### Ecosystem Signal Colors

| Venue / Signal | Hex Code | Role |
| :--- | :--- | :--- |
| **Monad Violet** | `#836EF9` | Monad testnet indicators and chain status pills. |
| **Kuru Orange** | `#FF5722` | Kuru spot orderbook badges and buy-leg metrics. |
| **Perpl Cyan** | `#22D3EE` | Perpl perpetual futures badges and short-leg metrics. |
| **Amber Warning** | `#F59E0B` | Tier 1 top-up warnings and margin caution alerts. |
| **Crimson Critical** | `#FF5F52` | Tier 3 emergency unwinds and error alerts. |

---

## 3. Typography Rules

The typography system uses clean geometric sans-serif fonts for interfaces and tabular monospace fonts for all numerical metrics.

```text
Display / Headlines:   Cabinet Grotesk / Geist (Tight tracking, medium/bold weights)
Body Text:             Geist / Outfit (Comfortable reading line-height)
Numbers / Financial:   Geist Mono / JetBrains Mono (Tabular numerals, strict monospace)
```

### Hierarchy Scale

| Level | Size / Line-Height | Weight | Font Category | Application |
| :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `36px` / `42px` | SemiBold (600) | Geometric Sans | Hero balance displays (`$1,000.00`) |
| **Heading 1** | `24px` / `30px` | SemiBold (600) | Geometric Sans | Screen headers and modal titles |
| **Heading 2** | `18px` / `24px` | Medium (500) | Geometric Sans | Section headers and card groups |
| **Body Large** | `16px` / `22px` | Regular (400) | Neutral Sans | Action button labels and input fields |
| **Body Small** | `13px` / `18px` | Regular (400) | Neutral Sans | Explanations, helper descriptions |
| **Monospace Num** | `14px` / `20px` | Medium (500) | Monospace | Prices, transaction hashes, block numbers |
| **Micro Caption** | `11px` / `14px` | Regular (400) | Neutral Sans | Status badges, timestamps |

---

## 4. Component Stylings

### Primary Action Button

- **Resting**: Background `#9FE825`, Text `#131313`, Height `54px`, Border-Radius `14px`, Font Weight `600`.
- **Active / Pressed**: Background `#7BC91E`, Scale `0.98`, Transition `100ms ease-out`.
- **Disabled**: Background `rgba(255, 255, 255, 0.08)`, Text `rgba(255, 255, 255, 0.35)`.
- **No Neon Glow**: Buttons rely on contrast against `#131313`, without outer box-shadow glows.

### Secondary / Ghost Button

- **Resting**: Background `#1F1F1F`, Border `1px solid rgba(255, 255, 255, 0.08)`, Text `#FFFFFF`.
- **Pressed**: Background `#282828`, Border `1px solid rgba(255, 255, 255, 0.16)`.

### Metric & Status Cards

- **Container**: Background `#1F1F1F`, Border `1px solid rgba(255, 255, 255, 0.08)`, Border-Radius `16px`, Padding `16px 20px`.
- **Highlight Container**: Background `#1F1F1F`, Border `1px solid rgba(159, 232, 37, 0.35)`.
- **Sub-label**: `12px` Text Secondary (`rgba(255, 255, 255, 0.65)`).
- **Metric Value**: `20px` Tabular Monospace (`#FFFFFF`).

### Input Fields & Amount Selectors

- **Input Frame**: Background `#181818`, Border `1px solid rgba(255, 255, 255, 0.08)`, Height `52px`, Radius `12px`.
- **Focus**: Border `1px solid rgba(159, 232, 37, 0.50)`.
- **Preset Chips**: Background `#242424`, Text `rgba(255, 255, 255, 0.85)`, Active chip takes `#9FE825` text and subtle lime border.

---

## 5. Layout Principles

- **Mobile Viewport Focus**: Designed for single-hand mobile use with bottom-anchored action bars.
- **Touch Targets**: Every interactive button, selector chip, or tab bar icon maintains a minimum `44px x 44px` physical touch bounding box.
- **Section Spacing**: Clean `20px` to `24px` margins between logical cards.
- **No Overlapping Elements**: Elements live in their own dedicated spatial layout. No floating text over charts.

---

## 6. Depth & Elevation

Depth is created through solid tone steps, avoiding muddy shadows:

| Elevation Tier | Surface Token | Border Definition | Typical Element |
| :--- | :--- | :--- | :--- |
| **0: Canvas** | `#131313` | None | Page foundation background |
| **1: Card Base** | `#1F1F1F` | `1px solid rgba(255, 255, 255, 0.08)` | Position metrics, status sections |
| **2: Card High** | `#282828` | `1px solid rgba(255, 255, 255, 0.12)` | Active deposit card, orderbook list |
| **3: Overlays** | `#1F1F1F` (94% blur) | `1px solid rgba(255, 255, 255, 0.16)` | Bottom floating tab bar, confirmation modals |

---

## 7. Do's and Don'ts

### Strict Rules

- **Zero Emojis**: Do not use emojis anywhere in the interface, code comments, or documentation.
- **No Neon Gradients**: Do not use heavy purple/cyan gradient fills or outer blur glows.
- **No Pure Black**: Do not use pure `#000000` for screen backgrounds; always use matte charcoal `#131313`.
- **No Generic Serif Fonts**: Never use Times New Roman or Georgia.
- **No Complex Jargon**: Use plain language ("Safety reserve", "Buys MON", "Shorts MON", "Exit trade"). Avoid "delta-neutral primitives" or "cash-and-carry basis arbitrage" in user-facing views.

---

## 8. Responsive Behavior

- **Mobile (< 768px)**: Single-column vertical stream. Fixed bottom navigation bar with `44px` touch targets.
- **Tablet / Desktop (>= 768px)**: Centered layout with max-width `520px` to maintain the mobile-first focus, or two-column split (dashboard on the left, live orderbook/activity on the right).

---

## 9. Agent Prompt Guide

When asking an AI coding agent to implement or style a screen in CounterYield, use this quick reference:

```text
Build a CounterYield screen adhering to DESIGN.md:
- Canvas: #131313
- Surface cards: #1F1F1F with 1px border rgba(255, 255, 255, 0.08)
- Primary CTA: #9FE825 with dark text #131313
- Accent colors: Monad violet #836EF9, Kuru orange #FF5722, Perpl cyan #22D3EE
- Numbers: Tabular monospace font
- Language: Plain English (buy MON, short MON, safety reserve)
- Zero emojis
```
