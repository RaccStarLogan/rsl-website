CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,              -- e.g. P-A-2026-01-12-2
  scope TEXT NOT NULL,              -- personal | commission
  medium TEXT NOT NULL,             -- art | music | voice | writing
  y INTEGER NOT NULL,
  m INTEGER NOT NULL,
  d INTEGER NOT NULL,
  n INTEGER,                        -- nullable
  title TEXT NOT NULL,
  desc_md TEXT,
  r2_key_primary TEXT NOT NULL,     -- full file (img/audio/pdf)
  r2_key_thumb TEXT,                -- thumb image if applicable
  created_at TEXT NOT NULL          -- ISO string
);

CREATE TABLE IF NOT EXISTS tags (
  name TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id TEXT NOT NULL,
  tag_name TEXT NOT NULL,
  PRIMARY KEY (post_id, tag_name),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_name) REFERENCES tags(name) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_scope_medium_date ON posts(scope, medium, y, m, d);
