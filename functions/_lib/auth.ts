/** Paths that require the admin password */
export function isProtectedPath(pathname: string): boolean {
	return (
		pathname === '/admin' ||
		pathname.startsWith('/admin/') ||
		pathname === '/admin.html' ||
		pathname === '/api/stats' || pathname === '/admin/index.html'
	);
}

/** Extract the password from an `Authorization: Basic …` header (the username is ignored) */
export function basicPassword(header: string | null): string | null {
	if (!header?.startsWith('Basic ')) return null;
	try {
		const decoded = atob(header.slice(6).trim());
		const i = decoded.indexOf(':');
		return i < 0 ? null : decoded.slice(i + 1);
	} catch {
		return null;
	}
}

/** Compare secrets without leaking their length or content through timing */
export async function safeEqual(a: string, b: string): Promise<boolean> {
	const enc = new TextEncoder();
	const [ha, hb] = await Promise.all([
		crypto.subtle.digest('SHA-256', enc.encode(a)),
		crypto.subtle.digest('SHA-256', enc.encode(b))
	]);
	const x = new Uint8Array(ha);
	const y = new Uint8Array(hb);
	let diff = 0;
	for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
	return diff === 0;
}

export const SESSION_COOKIE = '__Host-wd_admin';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

async function hmac(secret: string, data: string): Promise<string> {
	const enc = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		enc.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
	return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Stateless session token: `<expiry>.<hmac>`, signed with the admin password */
export async function createSession(secret: string): Promise<string> {
	const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
	return `${exp}.${await hmac(secret, `admin-session:${exp}`)}`;
}

export async function verifySession(token: string | null, secret: string): Promise<boolean> {
	if (!token) return false;
	const [expStr, sig] = token.split('.');
	const exp = Number(expStr);
	if (!sig || !Number.isFinite(exp) || exp < Date.now() / 1000) return false;
	return safeEqual(sig, await hmac(secret, `admin-session:${exp}`));
}

export function readCookie(header: string | null, name: string): string | null {
	for (const part of header?.split(';') ?? []) {
		const i = part.indexOf('=');
		if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
	}
	return null;
}
