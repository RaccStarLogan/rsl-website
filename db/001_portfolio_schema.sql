PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS portfolio_items (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('art', 'music', 'project')),
  visibility TEXT NOT NULL CHECK (visibility IN ('sfw', 'nsfw', 'both')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  logo_url TEXT,
  media_url TEXT,
  external_url TEXT,
  commission_type TEXT,
  is_commission INTEGER NOT NULL DEFAULT 0 CHECK (is_commission IN (0, 1)),
  is_personal INTEGER NOT NULL DEFAULT 0 CHECK (is_personal IN (0, 1)),
  tags_json TEXT NOT NULL DEFAULT '[]',
  published_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (item_id) REFERENCES portfolio_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_kind_visibility
  ON portfolio_items (kind, visibility, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_slug
  ON portfolio_items (slug);

CREATE INDEX IF NOT EXISTS idx_project_sections_item_sort
  ON project_sections (item_id, sort_order, id);
