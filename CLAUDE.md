# lab-site

The website for Uncle Buck's Laboratory. lab-hq's `CLAUDE.md` and handbook apply here; this file adds to them.

- The spec is `lab-hq/decisions/2026-11-10-site-and-newsletters.md`.
- Project pages come from `lab-hq/registry/projects.yaml`, synced into `src/data/projects.yaml` by `npm run sync` (it runs before every dev and build). Change projects in the registry, not here.
- Only public registry fields reach a page (`src/lib/projects.ts`). Never render `notes`, `agents` or private repo names.
- Copy marked `[VOICE PENDING]` waits for VOICE.md (milestone B1). Don't write brand copy before it exists.
- Every page meets WCAG AA: real headings, labels on every input, visible focus, 44px tap targets, contrast checked in light and dark.
- No external scripts or fonts. Analytics is added by Cloudflare at deploy, not in code.
- Every change is a PR; check the Cloudflare preview before merging.
- The look is Workshop + Fog. Colors, fonts and sizes come from `design/fog.tokens.json` (generated into `src/styles/tokens.css` on build). Never hard-code a color; change the token. Product and brand output (charts, screenshots) keeps its own style.
- Fonts are self-hosted from npm (Fraunces, IBM Plex Sans, IBM Plex Mono). Don't subset or rename Plex (Reserved Font Name).

## Check commands

Run before asking for review. CI runs the same.

- `npm run build`: registry sync (public fields only), tokens with a contrast check, then Astro.
- `npm run check:privacy`: fails if any private registry value is in `dist/`.
- `npm run check:a11y`: axe WCAG 2.2 AA on every page, light and dark, desktop and phone, plus the 44px tap-target rule. Locally, set `CHROME_PATH` if Playwright's Chromium isn't installed.
- `npm run check`: all of the above.
