# lab-site

The website for Uncle Buck's Laboratory. Rules live in [lab-hq](https://github.com/unclebuckslab/lab-hq); the spec is `decisions/2026-11-10-site-and-newsletters.md` there.

## Run it

```
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

Both commands first pull the project list from lab-hq. If GitHub can't be reached, the last committed copy in `src/data/projects.yaml` is used.

## Layout

| Path | What lives there |
| --- | --- |
| `src/pages/` | Home, About, one page per project, legal pages |
| `src/lib/projects.ts` | Reads the project list and keeps private fields off the site |
| `src/components/` | The signup block and project cards |
| `src/styles/global.css` | All styles, light and dark |
| `scripts/sync-registry.mjs` | Pulls `registry/projects.yaml` from lab-hq |

## Deploy

Cloudflare Workers static assets (`wrangler.jsonc`), connected to this repo through Workers Builds.

- Build command `npm run build` (runs the registry sync first); deploy command `npx wrangler deploy`; preview command `npx wrangler preview`.
- Merging to `main` deploys to unclebuckslab.com. Every PR gets a preview link on workers.dev, behind Cloudflare Access.
- Cloudflare holds the build token. No agent or person needs a deploy token.
- `public/_headers` keeps the whole site out of search engines until launch. Remove that rule on launch day.
- Analytics is Cloudflare Web Analytics, switched on in the dashboard. There is no analytics code here.
- Rollback: Workers & Pages > lab-site > Deployments > Rollback, then revert the bad commit on `main`.
