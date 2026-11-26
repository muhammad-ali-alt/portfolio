// ─────────────────────────────────────────────────────────────
// CMS LOGIN, step 1 (Cloudflare Pages Function at /api/auth)
// The CMS opens this in a popup. It sends you to GitHub to approve,
// with a random "state" value saved in a cookie to stop forged logins.
// Needs GITHUB_CLIENT_ID set in Cloudflare (Settings, Variables and Secrets).
// ─────────────────────────────────────────────────────────────
export async function onRequestGet({ request, env }) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('CMS login is not set up yet: add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in Cloudflare Pages settings.', { status: 500 });
  }
  const origin = new URL(request.url).origin;
  const state = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('redirect_uri', `${origin}/api/callback`);
  github.searchParams.set('scope', 'repo'); // needed to save to a private repository
  github.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `cms_oauth_state=${state}; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}
