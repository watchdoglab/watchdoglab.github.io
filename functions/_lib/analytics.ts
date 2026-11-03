/**
 * Privacy model: no cookies and no stored IP addresses. A visitor is a hash of (daily random salt + IP +
 * user agent); the salt rotates every UTC day and old salts are deleted, so people can't be linked across days.
 * Site views carry only the path and referring host. Plugin events (opt-in) carry only the command and
 * finding counts by severity.
 */
export type AnalyticsEvent =
	| { type: 'view'; path: string; referrer?: string }
	| { type: 'session' }
	| { type: 'scan'; cmd: string; critical: number; high: number; medium: number; low: number };

const PATH = /^\/[a-z0-9\-/.]{0,100}$/;
const HOST = /^[a-z0-9.-]{1,100}$/;
const CMD = /^[a-z0-9-]{1,40}$/;
const count = (n: unknown) => (typeof n === 'number' && Number.isInteger(n) && n >= 0 ? Math.min(n, 999) : 0);

export function parseEvent(input: unknown): AnalyticsEvent | null {
	if (!input || typeof input !== 'object') return null;
	const o = input as Record<string, unknown>;
	if (o.type === 'view') {
		if (typeof o.path !== 'string' || !PATH.test(o.path)) return null;
		const ref = typeof o.referrer === 'string' ? o.referrer.toLowerCase() : '';
		return { type: 'view', path: o.path, ...(HOST.test(ref) ? { referrer: ref } : {}) };
	}
	if (o.type === 'session') return { type: 'session' };
	if (o.type === 'scan' && typeof o.cmd === 'string' && CMD.test(o.cmd)) {
		return { type: 'scan', cmd: o.cmd, critical: count(o.critical), high: count(o.high), medium: count(o.medium), low: count(o.low) };
	}
	return null;
}

export const utcDay = (d: Date) => d.toISOString().slice(0, 10);

export async function visitorId(salt: string, ip: string, ua: string): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}|${ip}|${ua}`));
	return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function deviceFromUserAgent(ua: string): string {
	if (ua.startsWith('watchdog-plugin')) return 'plugin';
	if (/ipad|tablet/i.test(ua)) return 'tablet';
	if (/mobi|android|iphone/i.test(ua)) return 'mobile';
	return 'desktop';
}

export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(ua);
