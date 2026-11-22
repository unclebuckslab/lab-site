# Launch checklist

Going live is one PR that does the "Switch on" steps below, after the "Before" steps are done. Nothing here happens before the founder says so.

## Before

- [ ] Voice copy: no `[VOICE PENDING]` left on any page (`grep -rn "VOICE PENDING" src` comes back empty). Needs VOICE.md (milestone B1).
- [ ] Privacy and Disclosures reviewed by the founder; the `[DRAFT…]` notes removed; a contact address added.
- [ ] The first real Thoughts post written, or the Thoughts tab's empty state accepted.
- [ ] `src/content/thoughts/sample-draft.md` deleted.
- [ ] Share images current: `npm run og` (set `CHROME_PATH` if needed), then check `public/og/`.
- [ ] beehiiv: welcome email rewritten in the lab's voice (Automations → Welcome); publication name and sender details checked.

## Switch on (one PR)

- [ ] Signups: `SIGNUPS_LAUNCHED = true` in `src/lib/env.ts` and `"SIGNUPS_OPEN": "true"` in `wrangler.jsonc` (top level, not `previews`).
- [ ] Search: delete `public/_headers` (the `X-Robots-Tag: noindex` line), the `<meta name="robots" content="noindex" />` tag in `src/layouts/Base.astro`, and the noindex step in `.github/workflows/ci.yml`.
- [ ] `npm run check` passes; the preview looks right in light and dark, on a phone.

## Right after merge

- [ ] Sign up on unclebuckslab.com with a test address; confirm the welcome email and the beehiiv row (source `site`).
- [ ] In beehiiv, delete the test subscribers with source `preview` (and the live test address).
- [ ] Share a page in a message to yourself and check the link preview shows the right image.
- [ ] Submit `https://unclebuckslab.com/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
- [ ] Update lab-desk `BOARD.md`.
