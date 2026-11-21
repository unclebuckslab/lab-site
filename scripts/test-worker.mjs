// Tests for worker/index.js with a fake beehiiv. Run: npm run test:worker
import assert from 'node:assert/strict';
import { subscribe } from '../worker/index.js';

const env = { BEEHIIV_API_KEY: 'k', BEEHIIV_PUBLICATION_ID: 'pub_x', SIGNUPS_OPEN: 'false' };
const post = (host, fields, headers = {}) =>
  new Request(`https://${host}/api/subscribe`, { method: 'POST', body: new URLSearchParams(fields), headers: { Origin: `https://${host}`, ...headers } });
const fakeBeehiiv = (status = 200) => { const calls = []; const f = async (url, init) => { calls.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization }); return new Response('{}', { status }); }; f.calls = calls; return f; };
const where = (r) => new URL(r.headers.get('Location')).pathname;
const preview = 'abc-lab-site.example.workers.dev';
let n = 0; const t = async (name, fn) => { await fn(); n++; console.log(`  ok ${name}`); };

await t('production refuses until launch', async () => {
  const f = fakeBeehiiv(); const r = await subscribe(post('unclebuckslab.com', { email: 'a@b.co' }), env, f);
  assert.equal(r.status, 303); assert.equal(where(r), '/signup/closed'); assert.equal(f.calls.length, 0);
});
await t('production works once launched, tagged site', async () => {
  const f = fakeBeehiiv(); const r = await subscribe(post('unclebuckslab.com', { email: 'a@b.co' }), { ...env, SIGNUPS_OPEN: 'true' }, f);
  assert.equal(where(r), '/signup/thanks'); assert.equal(f.calls[0].body.utm_source, 'site');
});
await t('preview subscribes, tagged preview, list in campaign', async () => {
  const f = fakeBeehiiv(); const r = await subscribe(post(preview, { email: ' a@b.co ', list: 'ai-money-report' }), env, f);
  assert.equal(where(r), '/signup/thanks');
  assert.equal(f.calls[0].url, 'https://api.beehiiv.com/v2/publications/pub_x/subscriptions');
  assert.equal(f.calls[0].auth, 'Bearer k');
  assert.deepEqual([f.calls[0].body.email, f.calls[0].body.utm_source, f.calls[0].body.utm_campaign, f.calls[0].body.reactivate_existing], ['a@b.co', 'preview', 'ai-money-report', false]);
});
await t('honeypot pretends success, sends nothing', async () => {
  const f = fakeBeehiiv(); const r = await subscribe(post(preview, { email: 'a@b.co', website: 'x' }), env, f);
  assert.equal(where(r), '/signup/thanks'); assert.equal(f.calls.length, 0);
});
await t('bad email and unknown list go to error', async () => {
  const f = fakeBeehiiv();
  assert.equal(where(await subscribe(post(preview, { email: 'nope' }), env, f)), '/signup/error');
  assert.equal(where(await subscribe(post(preview, { email: 'a@b.co', list: 'other' }), env, f)), '/signup/error');
  assert.equal(f.calls.length, 0);
});
await t('missing secrets go to error', async () => {
  assert.equal(where(await subscribe(post(preview, { email: 'a@b.co' }), { SIGNUPS_OPEN: 'false' }, fakeBeehiiv())), '/signup/error');
});
await t('beehiiv failure goes to error', async () => {
  assert.equal(where(await subscribe(post(preview, { email: 'a@b.co' }), env, fakeBeehiiv(500))), '/signup/error');
});
await t('cross-site post and GET are refused', async () => {
  assert.equal((await subscribe(post(preview, { email: 'a@b.co' }, { Origin: 'https://evil.example' }), env, fakeBeehiiv())).status, 403);
  assert.equal((await subscribe(new Request(`https://${preview}/api/subscribe`), env, fakeBeehiiv())).status, 405);
});
console.log(`worker: ${n} tests pass`);
