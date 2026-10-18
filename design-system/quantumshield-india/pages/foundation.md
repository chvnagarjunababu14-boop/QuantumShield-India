# Foundation screen

Overrides `MASTER.md` for the Phase 1 home screen only.

## Layout

- One column, max width 42rem, centered.
- Horizontal padding is 20px below 640px and 32px from 640px up.
- Sections stack in this order: brand header, purpose, service connection, footer.
- No feature grid, pricing band, or testimonial row. Those showcase sections came from the raw design-system match and do not belong on a screen whose only working action is a service check.

## Content

- The H1 states the learning purpose.
- Body copy names the subjects the platform is for: cybersecurity, quantum computing, and other emerging technologies, plus community discussion as the product direction.
- The connection panel is the only interactive region. It must render loading, connected, and unavailable states from a real request.

## Motion

No scroll-reveal. The GSAP snippet from the motion dial is intentionally unused.
