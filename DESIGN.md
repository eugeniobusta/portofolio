# DESIGN.md — Eugenio Bustamante Portfolio

## Product
Personal portfolio for Eugenio Bustamante, CS student and AI builder.
Target audience: engineering recruiters, startup founders, and potential collaborators.

## Register: Brand
This is a marketing surface — the design IS the product. Every pixel is a signal about taste.

## Philosophy
Since AI can make crazy websites, I just want to represent myself in simple ways.
The constraint is the point. Restraint communicates confidence.

## Anti-references
- NOT a dark "hacker terminal" aesthetic
- NOT a gradient-heavy SaaS landing page
- NOT a Behance-style visual portfolio with large imagery
- NOT generic Bootstrap / Tailwind starter templates
- NOT Inter + purple-blue gradient (the AI SaaS default)

## Color strategy: Restrained
Warm monochrome canvas with one amber accent, used ≤10% of surface area.

| Token       | Value                     | Use                          |
|-------------|---------------------------|------------------------------|
| paper       | oklch(97.5% 0.006 85)     | Page background              |
| surface     | oklch(95.5% 0.007 85)     | Cards, blockquotes           |
| frame       | oklch(89.5% 0.006 85)     | Borders, dividers            |
| ink         | oklch(17% 0.008 250)      | Primary text                 |
| muted       | oklch(52% 0.006 250)      | Secondary text, labels       |
| accent      | oklch(72% 0.155 68)       | Amber — used sparingly       |

Alternative themes are pre-written in globals.css. Uncomment to switch.

## Typography
- Display / Hero: Instrument Serif 400, tight tracking (-0.02em to -0.04em)
- Body / UI: Geist Sans — clean, geometric, technical
- Code / tags: Geist Mono
- Body line length: max 65ch

## Elevation
No heavy shadows. Cards use `border: 1px solid var(--frame)` only.
On hover: border transitions to `frame-strong` + `box-shadow: 0 2px 12px oklch(0% 0 0 / 0.04)`.

## Motion
Spring physics throughout (Framer Motion type: "spring", damping: 32, stiffness: 280).
Entry: translateY(14px) + opacity 0 → 0 + 1, 600ms, ease [0.16, 1, 0.3, 1].
Never animate layout properties. Only transform + opacity.

## Key interaction: Game Portal
Button in Hero → full-screen overlay slides in from right (x: 100% → 0).
Main content scales to 0.96 + blurs (blur(4px)) simultaneously.
Close: Esc key or back button. Exit animation reverses entry.

## Sections
Hero · About · Projects (bento grid) · Skills (property list) · Contact (form) · Footer
Hidden: GamePortal overlay (triggered by CTA)
