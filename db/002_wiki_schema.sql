PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS wiki_entries (
  id TEXT PRIMARY KEY CHECK (id LIKE 'WIKI-%'),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  relation_icon_svg TEXT,
  summary TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  entry_type TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  visibility TEXT NOT NULL CHECK (visibility IN ('sfw', 'nsfw', 'both', 'none')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wiki_info_images (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  tab_label TEXT,
  caption TEXT,
  nsfw_only INTEGER NOT NULL DEFAULT 0 CHECK (nsfw_only IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_info_song (
  entry_id TEXT PRIMARY KEY,
  audio_url TEXT NOT NULL,
  stream_url TEXT,
  stream_label TEXT,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_info_rows (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  row_key TEXT NOT NULL,
  row_label TEXT NOT NULL,
  row_value TEXT NOT NULL,
  row_format TEXT NOT NULL DEFAULT 'text' CHECK (row_format IN ('text', 'markdown', 'html')),
  nsfw_only INTEGER NOT NULL DEFAULT 0 CHECK (nsfw_only IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_info_links (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  is_download INTEGER NOT NULL DEFAULT 0 CHECK (is_download IN (0, 1)),
  nsfw_only INTEGER NOT NULL DEFAULT 0 CHECK (nsfw_only IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_quotes (
  entry_id TEXT PRIMARY KEY,
  quote_text TEXT NOT NULL,
  audio_url TEXT,
  attribution TEXT,
  voice_credit TEXT,
  nsfw_only INTEGER NOT NULL DEFAULT 0 CHECK (nsfw_only IN (0, 1)),
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_sections (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  section_title TEXT NOT NULL,
  section_body TEXT NOT NULL,
  section_format TEXT NOT NULL DEFAULT 'markdown' CHECK (section_format IN ('text', 'markdown', 'html')),
  nsfw_only INTEGER NOT NULL DEFAULT 0 CHECK (nsfw_only IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_trivia (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  item_text TEXT NOT NULL,
  nsfw_only INTEGER NOT NULL DEFAULT 0 CHECK (nsfw_only IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_relationships (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  related_entry_id TEXT NOT NULL,
  relation_label TEXT NOT NULL,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (related_entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wiki_theme (
  entry_id TEXT PRIMARY KEY,
  primary_clr TEXT,
  secondary_clr TEXT,
  accent_clr TEXT,
  primary_txt TEXT,
  secondary_txt TEXT,
  accent_txt TEXT,
  primary_bg TEXT,
  secondary_bg TEXT,
  tertiary_bg TEXT,
  hover_bg TEXT,
  warning_clr TEXT,
  tab_clr TEXT,
  tab_hover TEXT,
  tab_active TEXT,
  font TEXT,
  font_url TEXT,
  body_clr TEXT,
  links TEXT,
  custom_css TEXT,
  FOREIGN KEY (entry_id) REFERENCES wiki_entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wiki_entries_slug ON wiki_entries (slug);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_visibility_type ON wiki_entries (visibility, entry_type, sort_order, label);
CREATE INDEX IF NOT EXISTS idx_wiki_info_images_entry ON wiki_info_images (entry_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_wiki_info_rows_entry ON wiki_info_rows (entry_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_wiki_info_links_entry ON wiki_info_links (entry_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_wiki_sections_entry ON wiki_sections (entry_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_wiki_trivia_entry ON wiki_trivia (entry_id, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_wiki_relationships_entry ON wiki_relationships (entry_id, sort_order, id);
