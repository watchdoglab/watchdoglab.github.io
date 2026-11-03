import type { PagesFunction } from '@cloudflare/workers-types';
import { deviceFromUserAgent, isBot, parseEvent, utcDay, visitorId } from '../_lib/analytics';
import type { Env } from '../_lib/env';

const MAX_BODY = 512;
const RETENTION_DAYS = 365;

async function dailySalt(env: Env, day: string): Promise<string> {
	const row = await env.DB.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first<{ salt: string }>();
	if (row) return row.salt;
	const fresh = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
	// First event of the day: store today's salt, forget older salts and expired events
	await env.DB.batch([
		env.DB.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, fresh),
		env.DB.prepare('DELETE FROM salts WHERE day < ?').bind(day),
		env.DB.prepare(`DELETE FROM events WHERE day < date('now', '-${RETENTION_DAYS} days')`)
	]);
	const stored = await env.DB.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first<{ salt: string }>();
	return stored?.salt ?? fresh;
}

/** Receives anonymous site views and opt-in plugin counts. Always answers 204 so it never affects the caller. */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const done = new Response(null, { status: 204 });
	const ua = request.headers.get('user-agent') ?? '';
	const plugin = ua.startsWith('watchdog-plugin');
	const origin = request.headers.get('origin');
	// Browsers must come from this site; the plugin sends no Origin
	if (!plugin && (isBot(ua) || !origin || new URL(origin).host !== new URL(request.url).host)) return done;

	let body: unknown;
	try {
		const text = await request.text();
		if (text.length > MAX_BODY) return done;
		body = JSON.parse(text);
	} catch {
		return done;
	}
	const event = parseEvent(body);
	if (!event || (event.type !== 'view') !== plugin) return done;

	try {
		const now = new Date();
		const day = utcDay(now);
		const visitor = await visitorId(await dailySalt(env, day), request.headers.get('cf-connecting-ip') ?? '', ua);
		const country = (request as unknown as { cf?: { country?: string } }).cf?.country ?? null;
		const e = event as Record<string, unknown>;
		await env.DB.prepare(
			`INSERT INTO events (ts, day, visitor, type, path, referrer, cmd, critical, high, medium, low, device, country)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
			.bind(now.getTime(), day, visitor, event.type, e.path ?? null, e.referrer ?? null, e.cmd ?? null,
				e.critical ?? null, e.high ?? null, e.medium ?? null, e.low ?? null, deviceFromUserAgent(ua), country)
			.run();
	} catch {
		// Analytics must never break the site; drop the event
	}
	return done;
};
