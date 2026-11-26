// ─────────────────────────────────────────────────────────────
// CMS LOGIN, step 2 (Cloudflare Pages Function at /api/callback)
// GitHub sends you back here. This checks the state cookie, swaps the
// one time code for a token (using the secret, which never reaches the
// browser), and hands the token only to the CMS window on this same site.
// ─────────────────────────────────────────────────────────────
const page = (body, status = 200) =>
  new Response(`<!doctype html><meta charset="utf-8"><title>Signing in</title><body style="font:15px system-ui;padding:24px">${body}`, {
    status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Set-Cookie': 'cms_oauth_state=; Path=/api; Max-Age=0' },
  });

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)cms_oauth_state=([a-f0-9]+)/)?.[1];
  if (!code || !state || !cookie || state !== cookie) return page('Sign in failed: the request could not be verified. Close this window and try again.', 400);

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'portfolio-cms' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: `${url.origin}/api/callback` }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) return page(`Sign in failed: ${String(data.error_description || data.error || 'GitHub did not return a token').replace(/[<>&]/g, '')}. Close this window and try again.`, 401);

  // Decap CMS popup handshake. The token is only posted to a window on this site's own origin.
  const message = JSON.stringify(`authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}`);
  const origin = JSON.stringify(url.origin);
  return page(`Signing in… <script>
    (function () {
      var origin = ${origin}, message = ${message};
      if (!window.opener) { document.body.textContent = 'Sign in worked, but the editor window was closed. Open /admin/ and try again.'; return; }
      function receive(e) {
        if (e.origin !== origin) return;
        window.removeEventListener('message', receive);
        window.opener.postMessage(message, origin);
        setTimeout(function () { window.close(); }, 200);
      }
      window.addEventListener('message', receive);
      window.opener.postMessage('authorizing:github', origin);
    })();
  </script>`);
}
