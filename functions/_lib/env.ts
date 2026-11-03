import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
	DB: D1Database;
	/** Password for /admin and /api/stats (Pages secret) */
	ADMIN_PASSWORD?: string;
	/** GitHub token with push access to watchdoglab, for repo traffic (Pages secret) */
	GITHUB_TOKEN?: string;
}
