-- Anonymous events. No cookies, no IPs: visitor is a hash of a daily random salt + IP + user agent.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  visitor TEXT NOT NULL,
  type TEXT NOT NULL,          -- view | session | scan
  path TEXT,                   -- site path (view)
  referrer TEXT,               -- referring host only (view)
  cmd TEXT,                    -- /watchdog-go-* command (scan)
  critical INTEGER, high INTEGER, medium INTEGER, low INTEGER,
  device TEXT,
  country TEXT
);
CREATE INDEX IF NOT EXISTS events_day_type ON events (day, type);
CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL);
