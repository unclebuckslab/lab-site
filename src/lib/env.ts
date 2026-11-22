// Where this build is headed. Workers Builds sets WORKERS_CI_BRANCH; anything not on main is a PR preview.
export const isPreview = import.meta.env.DEV || (process.env.WORKERS_CI_BRANCH ?? 'main') !== 'main';

// Launch switch for email signups. Keep in step with SIGNUPS_OPEN in wrangler.jsonc:
// flip both to true in one PR when the report is ready. Until then the form only works on previews.
export const SIGNUPS_LAUNCHED = false;

export const signupsOpen = SIGNUPS_LAUNCHED || isPreview;
