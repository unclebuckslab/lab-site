// The lab site's Worker. It serves the static site and handles one route: POST /api/subscribe,
// which passes a signup to beehiiv's API (decision 2026-11-21: no beehiiv script on the site).
//
// Secrets (set in the Cloudflare dashboard, never in code): BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID.
// Var (wrangler.jsonc): SIGNUPS_OPEN. Until it is "true", signups are refused on the production
// domain and only work on preview links, where they are tagged utm_source "preview" for deletion.

const PRODUCTION_HOSTS = new Set(['unclebuckslab.com', 'www.unclebuckslab.com']);
const LISTS = new Set(['dispatch', 'ai-money-report']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const redirect = (url, path) => Response.redirect(new URL(path, url).toString(), 303);

export async function subscribe(request, env, fetchImpl = fetch) {
  const url = new URL(request.url);
  const isProduction = PRODUCTION_HOSTS.has(url.hostname);

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });

  // Only accept forms posted from this site.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== url.host) return new Response('Forbidden', { status: 403 });

  if (isProduction && env.SIGNUPS_OPEN !== 'true') return redirect(url, '/signup/closed');

  let form;
  try {
    form = await request.formData();
  } catch {
    return redirect(url, '/signup/error');
  }

  // Bots fill the hidden field. Pretend it worked and send nothing.
  if (form.get('website')) return redirect(url, '/signup/thanks');

  const email = String(form.get('email') ?? '').trim();
  const list = String(form.get('list') ?? 'dispatch');
  if (!EMAIL.test(email) || email.length > 254 || !LISTS.has(list)) return redirect(url, '/signup/error');

  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error('subscribe: beehiiv secrets are not set');
    return redirect(url, '/signup/error');
  }

  const res = await fetchImpl(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.BEEHIIV_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      reactivate_existing: false,
      send_welcome_email: true,
      utm_source: isProduction ? 'site' : 'preview',
      utm_medium: 'signup-form',
      utm_campaign: list,
      referring_site: url.origin,
    }),
  });

  if (!res.ok) {
    console.error(`subscribe: beehiiv returned ${res.status}`);
    return redirect(url, '/signup/error');
  }
  return redirect(url, '/signup/thanks');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/subscribe') return subscribe(request, env);
    return env.ASSETS.fetch(request);
  },
};
