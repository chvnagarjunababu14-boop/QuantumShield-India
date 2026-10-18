# QuantumShield India — Design Master

Global source of truth for the public learning platform. Page files in `pages/` override this document only where they say so.

## Search record

Generated with UI/UX Pro Max on 18 October 2026, then corrected where the match did not fit the product.

- Design system query: `education learning cybersecurity community` (`--design-system`, variance 3, motion 2, density 4).
- The raw match selected a feature-rich showcase, indigo `#4F46E5` with an orange CTA, and the kids pairing Baloo 2 + Comic Neue.
- A narrower typography retry, `professional education clean sans`, returned Corporate Trust: Lexend + Source Sans 3. That pairing fits an adult learning product and is the one in use.
- Style search `glassmorphism light education` confirmed frosted surfaces, with a required text contrast of 4.5:1.
- UX searches covered status announcements, error alerts, visible keyboard focus, and reduced motion.
- Stack searches covered React async errors and Tailwind `focus-visible` rings.
- Icon search selected Phosphor `Shield`, `Check`, `XCircle`, and `ArrowsClockwise` at regular weight.

## Applied direction

QuantumShield India is a calm educational technology brand. The foundation screen is a single reading column, not an admin dashboard and not a feature grid.

| Token | Value | Use |
| --- | --- | --- |
| `--color-canvas` | `#D7EBFA` | Page background, light blue |
| `--color-surface` | `#FFFFFF` | Solid white fallback |
| `--color-ink` | `#0B1F3A` | Headings and body, dark navy |
| `--color-muted` | `#334155` | Secondary text |
| `--color-action` | `#1D4ED8` | Royal-blue actions and brand accent |
| `--color-action-pressed` | `#1E3A8A` | Hover and pressed action |
| `--color-ok` | `#0F766E` | Connected status text |
| `--color-danger` | `#B91C1C` | Unavailable status text |
| `--color-disabled` | `#E2E8F0` | Disabled action fill |
| `--font-heading` | Lexend | Headings, self-hosted |
| `--font-sans` | Source Sans 3 | Body, self-hosted |

Checked contrast ratios: navy on white 16.5:1, navy on canvas 13.5:1, muted on canvas 8.5:1, white on `#1D4ED8` 6.7:1. Classic royal `#4169E1` also clears 4.5:1 (4.9:1) but `#1D4ED8` is the action token because the margin is larger.

Glass panels use about 82% white plus a 16px blur, with a solid white fallback when `backdrop-filter` is unavailable. The catalog's 15–30% white overlay would fail text contrast on this light canvas, so the panel stays a white surface with a light frost. A navy-tinted border and soft shadow separate the panel from the canvas.

## Interaction

- One purposeful motion: the action color transition (about 200ms). The loading state is text, not a spinner.
- `prefers-reduced-motion: reduce` removes that transition.
- Status changes use one `role="status"` region. Failures use `role="alert"`.
- Keyboard focus uses a 2px royal-blue ring on `:focus-visible` only.
- Action targets are at least 44px tall. Disabled actions do not submit a second check.
- Icons sit beside visible text and are `aria-hidden`. Stroke weight stays regular.
- Do not add decorative charts, looping animation, or gradient meshes.

## Out of scope for the visual system

Dark theme, chat transcripts, and dashboards stay out. Phase 2 adds a publication-style catalogue, lesson reader, sample quiz, and a community page that describes future rooms. Do not draw fake messages or member activity.
