import type { PagesFunction } from '@cloudflare/workers-types';
import type { Env } from '../_lib/env';

const json = (data: unknown, status = 200) =>
	new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const ORG = 'watchdoglab';
const REVIEW_HEAD = '## 🐕 Watchdog security review';

async function gh(env: Env, path: string): Promise<any> {
	const res = await fetch(`https://api.github.com/${path}`, {
		headers: {
			accept: 'application/vnd.github+json',
			'user-agent': 'watchdog-admin',
			...(env.GITHUB_TOKEN ? { authorization: `Bearer ${env.GITHUB_TOKEN}` } : {})
		}
	});
	return res.ok ? res.json() : null;
}

async function repo(env: Env, name: string) {
	const r = `repos/${ORG}/${name}`;
	const [info, views, clones, referrers, paths, releases, issues, pulls] = await Promise.all([
		gh(env, r), gh(env, `${r}/traffic/views`), gh(env, `${r}/traffic/clones`),
		gh(env, `${r}/traffic/popular/referrers`), gh(env, `${r}/traffic/popular/paths`),
		gh(env, `${r}/releases?per_page=20`), gh(env, `${r}/issues?state=all&per_page=100`),
		gh(env, `${r}/pulls?state=closed&per_page=100`)
	]);
	const merged = (pulls ?? []).filter((p: any) => p.merged_at);
	const reviewed = await Promise.all(
		merged.slice(0, 30).map(async (p: any) => ((await gh(env, `${r}/pulls/${p.number}/reviews`)) ?? []).length > 0)
	);
	return {
		info: { stars: info?.stargazers_count ?? 0, forks: info?.forks_count ?? 0 },
		views: views ?? { count: 0, uniques: 0, views: [] },
		clones: clones ?? { count: 0, uniques: 0, clones: [] },
		referrers: referrers ?? [],
		paths: (paths ?? []).map((p: any) => ({ path: p.path, count: p.count, uniques: p.uniques })),
		releases: (releases ?? []).map((x: any) => ({ tag: x.tag_name, date: x.published_at })),
		issues: (issues ?? []).filter((i: any) => !i.pull_request).map((i: any) => ({
			number: i.number, title: i.title, url: i.html_url, state: i.state.toUpperCase(),
			bug: i.labels.some((l: any) => /bug/i.test(l.name))
		})),
		prs: merged.map((p: any, i: number) => ({ number: p.number, title: p.title, url: p.html_url, reviewed: reviewed[i] ?? false }))
	};
}

/** PRs in other repos that the Watchdog Action reviewed, with finding counts by severity */
async function actionReviews(env: Env) {
	const found = await gh(env, `search/issues?q=${encodeURIComponent('"Watchdog security review" is:pr')}&per_page=50`);
	const out = [];
	for (const item of found?.items ?? []) {
		const repoName = item.repository_url.split('/repos/')[1];
		const reviews = (await gh(env, `repos/${repoName}/pulls/${item.number}/reviews`)) ?? [];
		const mine = reviews.filter((r: any) => (r.body ?? '').startsWith(REVIEW_HEAD)).at(-1);
		if (!mine) continue;
		const findings: Record<string, number> = {};
		for (const [, n, sev] of (mine.body.split('\n\n')[1] ?? '').matchAll(/(\d+) (critical|high|medium|low|info)/g)) findings[sev] = +n;
		out.push({ repo: repoName, number: item.number, title: item.title, url: item.html_url, state: item.pull_request?.merged_at ? 'merged' : item.state, findings });
	}
	return out;
}

async function github(env: Env) {
	const [plugin, action, site, reviews, users] = await Promise.all([
		repo(env, 'watchdog'), repo(env, 'watchdog-action'), repo(env, 'watchdoglab.github.io'), actionReviews(env),
		gh(env, `search/code?q=${encodeURIComponent('watchdoglab/watchdog-action path:.github/workflows')}&per_page=100`)
	]);
	const actionUsers = [...new Set<string>((users?.items ?? []).map((i: any) => i.repository.full_name))].filter((n) => !n.startsWith(`${ORG}/`));
	return { plugin, action: { ...action, reviews, users: actionUsers }, site };
}

/** Everything /admin shows. Only reachable through functions/_middleware.ts, which requires the admin password. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
	if (!env.ADMIN_PASSWORD) return json({ error: 'Unauthorized' }, 401);
	const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get('days')) || 30));
	const from = new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
	const q = (sql: string) => env.DB.prepare(sql).bind(from).all().then((r) => r.results).catch(() => []);

	// GitHub data changes slowly and costs many API calls; cache it for 10 minutes
	const cache = (caches as any).default as Cache;
	const key = new Request('https://cache.internal/watchdog-admin-github');
	let gitData = ((await cache.match(key).then((r) => r?.json()).catch(() => null)) ?? null) as Record<string, unknown> | null;
	if (!gitData) {
		gitData = await github(env);
		waitUntil(cache.put(key, new Response(JSON.stringify(gitData), { headers: { 'cache-control': 'max-age=600' } })));
	}

	const [totals, daily, pages, referrers, countries, devices, pluginTotals, scans] = await Promise.all([
		q(`SELECT COUNT(DISTINCT day || visitor) AS visitors, COUNT(*) AS views FROM events WHERE type = 'view' AND day >= ?`),
		q(`SELECT day, COUNT(DISTINCT visitor) AS visitors, COUNT(*) AS views FROM events WHERE type = 'view' AND day >= ? GROUP BY day ORDER BY day`),
		q(`SELECT path, COUNT(*) AS count FROM events WHERE type = 'view' AND day >= ? GROUP BY path ORDER BY count DESC LIMIT 10`),
		q(`SELECT COALESCE(referrer, '(direct)') AS name, COUNT(DISTINCT day || visitor) AS count FROM events WHERE type = 'view' AND day >= ? GROUP BY name ORDER BY count DESC LIMIT 10`),
		q(`SELECT COALESCE(country, '??') AS name, COUNT(DISTINCT day || visitor) AS count FROM events WHERE type = 'view' AND day >= ? GROUP BY name ORDER BY count DESC LIMIT 10`),
		q(`SELECT device AS name, COUNT(DISTINCT day || visitor) AS count FROM events WHERE type = 'view' AND day >= ? GROUP BY name ORDER BY count DESC`),
		q(`SELECT SUM(type = 'session') AS sessions, COUNT(DISTINCT CASE WHEN type = 'session' THEN day || visitor END) AS users, SUM(type = 'scan') AS scans,
		   SUM(critical) AS critical, SUM(high) AS high, SUM(medium) AS medium, SUM(low) AS low FROM events WHERE type IN ('session', 'scan') AND day >= ?`),
		q(`SELECT cmd AS name, COUNT(*) AS count FROM events WHERE type = 'scan' AND day >= ? GROUP BY cmd ORDER BY count DESC`)
	]);
	return json({
		generated: new Date().toISOString(), days,
		visits: { ...(totals[0] as object), daily, pages, referrers, countries, devices },
		pluginUse: { ...(pluginTotals[0] as object), scans_by: scans },
		...gitData
	});
};
