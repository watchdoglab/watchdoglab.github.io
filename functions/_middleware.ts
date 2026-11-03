import type { PagesFunction } from '@cloudflare/workers-types';
import {
	SESSION_COOKIE,
	SESSION_TTL_SECONDS,
	basicPassword,
	createSession,
	isProtectedPath,
	readCookie,
	safeEqual,
	verifySession
} from './_lib/auth';
import type { Env } from './_lib/env';

const MIN_PASSWORD_LENGTH = 12;

const PRIVATE_HEADERS = {
	'cache-control': 'no-store',
	'x-robots-tag': 'noindex'
};

function loginPage(failed: boolean, status = 401) {
	const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Watchdog admin</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e1514;color:#f8f7f4;font:15px/1.4 system-ui,-apple-system,sans-serif;padding:16px}
form{width:100%;max-width:340px;display:grid;gap:12px}h1{font-size:20px;margin:0 0 4px}
input,button{font:inherit;padding:12px 14px;border-radius:10px;border:1px solid #273634}
input{background:#16201f;color:inherit}input:focus{outline:2px solid #3cc2b4;outline-offset:1px}
button{background:#3cc2b4;color:#0e1514;border:0;font-weight:600;cursor:pointer}
.err{color:#ff6b6b;margin:0;font-size:14px}
</style></head><body>
<form method="post" action="/admin/login">
<h1>Watchdog admin</h1>
${failed ? '<p class="err">Wrong password.</p>' : ''}
<input type="password" name="password" placeholder="Password" autocomplete="current-password" required autofocus>
<button type="submit">Sign in</button>
</form></body></html>`;
	return new Response(html, {
		status,
		headers: { 'content-type': 'text/html; charset=utf-8', ...PRIVATE_HEADERS }
	});
}

function redirect(location: string, cookie?: string) {
	const headers = new Headers({ location, ...PRIVATE_HEADERS });
	if (cookie) headers.set('set-cookie', cookie);
	return new Response(null, { status: 303, headers });
}

/**
 * Password-protects the private dashboard and its stats API.
 * Sign in via the form at /admin (session cookie) or HTTP Basic auth.
 * The password lives only in the ADMIN_PASSWORD secret; without it, everything stays locked.
 */
export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
	const { pathname } = new URL(request.url);
	if (!isProtectedPath(pathname)) return next();

	const secret = env.ADMIN_PASSWORD;
	if (!secret || secret.length < MIN_PASSWORD_LENGTH) {
		return new Response('Dashboard locked: set the ADMIN_PASSWORD secret (12+ characters).', {
			status: 503,
			headers: { 'cache-control': 'no-store' }
		});
	}

	if (pathname === '/admin/login') {
		if (request.method !== 'POST') return redirect('/admin');
		const form = await request.formData().catch(() => null);
		const given = form?.get('password');
		if (typeof given !== 'string' || !(await safeEqual(given, secret))) {
			return loginPage(true);
		}
		const token = await createSession(secret);
		return redirect(
			'/admin',
			`${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`
		);
	}

	if (pathname === '/admin/logout') {
		return redirect(
			'/admin',
			`${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`
		);
	}

	const session = readCookie(request.headers.get('cookie'), SESSION_COOKIE);
	const basic = basicPassword(request.headers.get('authorization'));
	const authed =
		(await verifySession(session, secret)) || (!!basic && (await safeEqual(basic, secret)));

	if (!authed) {
		if (pathname.startsWith('/api/')) {
			return new Response('Sign in required.', { status: 401, headers: PRIVATE_HEADERS });
		}
		return loginPage(false);
	}

	const response = await next();
	const headers = new Headers(response.headers);
	for (const [k, v] of Object.entries(PRIVATE_HEADERS)) headers.set(k, v);
	return new Response(response.body, { status: response.status, headers });
};
