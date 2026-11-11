# lab-site

The website for Uncle Buck's Laboratory. lab-hq's `CLAUDE.md` and handbook apply here; this file adds to them.

- The spec is `lab-hq/decisions/2026-11-10-site-and-newsletters.md`.
- Project pages come from `lab-hq/registry/projects.yaml`, synced into `src/data/projects.yaml` by `npm run sync` (it runs before every dev and build). Change projects in the registry, not here.
- Only public registry fields reach a page (`src/lib/projects.ts`). Never render `notes`, `agents` or private repo names.
- Copy marked `[VOICE PENDING]` waits for VOICE.md (milestone B1). Don't write brand copy before it exists.
- Every page meets WCAG AA: real headings, labels on every input, visible focus, 44px tap targets, contrast checked in light and dark.
- No external scripts or fonts. Analytics is added by Cloudflare at deploy, not in code.
- Every change is a PR; check the Cloudflare preview before merging.
