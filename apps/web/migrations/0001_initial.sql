PRAGMA foreign_keys = ON;

CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  locale TEXT NOT NULL DEFAULT 'en',
  onboarding_completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'system',
  density TEXT NOT NULL DEFAULT 'comfortable',
  reduced_motion INTEGER NOT NULL DEFAULT 0,
  week_start INTEGER NOT NULL DEFAULT 1,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 30,
  weekly_goal_minutes INTEGER NOT NULL DEFAULT 180,
  ai_enabled INTEGER NOT NULL DEFAULT 1,
  ai_model TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE roadmaps (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner',
  estimated_hours INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'route',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'catalog',
  content_status TEXT NOT NULL DEFAULT 'preview',
  source_topic_count INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX roadmaps_slug_idx ON roadmaps (slug);

CREATE TABLE roadmap_stages (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  estimated_hours INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX roadmap_stages_slug_idx ON roadmap_stages (roadmap_id, slug);
CREATE INDEX roadmap_stages_order_idx ON roadmap_stages (roadmap_id, sort_order);

CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL REFERENCES roadmap_stages(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  key_concepts TEXT NOT NULL,
  practice TEXT NOT NULL,
  pitfalls TEXT NOT NULL,
  content_md TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  estimated_minutes INTEGER NOT NULL DEFAULT 45,
  difficulty TEXT NOT NULL DEFAULT 'core',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX topics_slug_idx ON topics (roadmap_id, slug);
CREATE INDEX topics_stage_idx ON topics (stage_id, sort_order);
CREATE INDEX topics_roadmap_idx ON topics (roadmap_id, sort_order);

CREATE TABLE topic_edges (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  from_topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  to_topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'next'
);
CREATE UNIQUE INDEX topic_edges_unique_idx ON topic_edges (from_topic_id, to_topic_id, kind);
CREATE INDEX topic_edges_roadmap_idx ON topic_edges (roadmap_id);

CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT REFERENCES roadmaps(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'article',
  provider TEXT,
  description TEXT,
  estimated_minutes INTEGER,
  is_free INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  CHECK (roadmap_id IS NOT NULL OR topic_id IS NOT NULL)
);
CREATE INDEX resources_topic_idx ON resources (topic_id, sort_order);
CREATE INDEX resources_roadmap_idx ON resources (roadmap_id, sort_order);
CREATE INDEX resources_kind_idx ON resources (kind);

CREATE TABLE user_topic_progress (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started',
  confidence INTEGER NOT NULL DEFAULT 0,
  minutes_spent INTEGER NOT NULL DEFAULT 0,
  last_studied_at TEXT,
  completed_at TEXT,
  notes TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, topic_id)
);
CREATE INDEX progress_user_status_idx ON user_topic_progress (user_id, status);

CREATE TABLE study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  kind TEXT NOT NULL DEFAULT 'read',
  started_at TEXT NOT NULL,
  ended_at TEXT,
  minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT
);
CREATE INDEX sessions_user_idx ON study_sessions (user_id, started_at);

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'weekly',
  target_value INTEGER NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'minutes',
  due_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX goals_user_status_idx ON goals (user_id, status);

CREATE TABLE goal_milestones (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value INTEGER,
  completed_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX milestones_goal_idx ON goal_milestones (goal_id, sort_order);

CREATE TABLE flashcards (
  id TEXT PRIMARY KEY,
  roadmap_id TEXT NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT,
  explanation TEXT,
  tags TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'seed',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX cards_topic_idx ON flashcards (topic_id);
CREATE INDEX cards_roadmap_idx ON flashcards (roadmap_id);

CREATE TABLE flashcard_reviews (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  lapses INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'new',
  due_at TEXT NOT NULL,
  last_reviewed_at TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, card_id)
);
CREATE INDEX reviews_due_idx ON flashcard_reviews (user_id, due_at);

CREATE TABLE flashcard_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  elapsed_ms INTEGER
);
CREATE INDEX attempts_user_idx ON flashcard_attempts (user_id, reviewed_at);

CREATE TABLE coach_threads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT 'coach',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX threads_user_idx ON coach_threads (user_id, updated_at);

CREATE TABLE coach_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES coach_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  citations TEXT NOT NULL,
  model TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX messages_thread_idx ON coach_messages (thread_id, created_at);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'internal',
  external_id TEXT,
  external_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX notes_user_idx ON notes (user_id, updated_at);

CREATE TABLE bookmarks (
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, resource_id)
);

CREATE TABLE people (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  expertise TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  last_contacted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX people_user_idx ON people (user_id, name);

CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  person_id TEXT REFERENCES people(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  answer TEXT,
  created_at TEXT NOT NULL,
  answered_at TEXT
);
CREATE INDEX questions_user_status_idx ON questions (user_id, status);

CREATE TABLE activity_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX activity_user_idx ON activity_events (user_id, created_at);

CREATE TABLE daily_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_date TEXT NOT NULL,
  focus_topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
  target_minutes INTEGER NOT NULL DEFAULT 30,
  completed_minutes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX daily_plan_user_date_idx ON daily_plans (user_id, plan_date);

CREATE TABLE integrations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  last_synced_at TEXT,
  metadata TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX integrations_user_provider_idx ON integrations (user_id, provider);

CREATE VIRTUAL TABLE topics_fts USING fts5(
  title,
  summary,
  why_it_matters,
  key_concepts,
  content_md,
  content = 'topics',
  content_rowid = 'rowid',
  tokenize = 'porter unicode61'
);

CREATE TRIGGER topics_ai AFTER INSERT ON topics BEGIN
  INSERT INTO topics_fts(rowid, title, summary, why_it_matters, key_concepts, content_md)
  VALUES (new.rowid, new.title, new.summary, new.why_it_matters, new.key_concepts, new.content_md);
END;
CREATE TRIGGER topics_ad AFTER DELETE ON topics BEGIN
  INSERT INTO topics_fts(topics_fts, rowid, title, summary, why_it_matters, key_concepts, content_md)
  VALUES ('delete', old.rowid, old.title, old.summary, old.why_it_matters, old.key_concepts, old.content_md);
END;
CREATE TRIGGER topics_au AFTER UPDATE ON topics BEGIN
  INSERT INTO topics_fts(topics_fts, rowid, title, summary, why_it_matters, key_concepts, content_md)
  VALUES ('delete', old.rowid, old.title, old.summary, old.why_it_matters, old.key_concepts, old.content_md);
  INSERT INTO topics_fts(rowid, title, summary, why_it_matters, key_concepts, content_md)
  VALUES (new.rowid, new.title, new.summary, new.why_it_matters, new.key_concepts, new.content_md);
END;

CREATE VIRTUAL TABLE resources_fts USING fts5(
  title,
  description,
  provider,
  content = 'resources',
  content_rowid = 'rowid',
  tokenize = 'porter unicode61'
);
CREATE TRIGGER resources_ai AFTER INSERT ON resources BEGIN
  INSERT INTO resources_fts(rowid, title, description, provider)
  VALUES (new.rowid, new.title, new.description, new.provider);
END;
CREATE TRIGGER resources_ad AFTER DELETE ON resources BEGIN
  INSERT INTO resources_fts(resources_fts, rowid, title, description, provider)
  VALUES ('delete', old.rowid, old.title, old.description, old.provider);
END;
CREATE TRIGGER resources_au AFTER UPDATE ON resources BEGIN
  INSERT INTO resources_fts(resources_fts, rowid, title, description, provider)
  VALUES ('delete', old.rowid, old.title, old.description, old.provider);
  INSERT INTO resources_fts(rowid, title, description, provider)
  VALUES (new.rowid, new.title, new.description, new.provider);
END;

CREATE VIRTUAL TABLE notes_fts USING fts5(
  title,
  body_md,
  content = 'notes',
  content_rowid = 'rowid',
  tokenize = 'porter unicode61'
);
CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, title, body_md) VALUES (new.rowid, new.title, new.body_md);
END;
CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, body_md) VALUES ('delete', old.rowid, old.title, old.body_md);
END;
CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, title, body_md) VALUES ('delete', old.rowid, old.title, old.body_md);
  INSERT INTO notes_fts(rowid, title, body_md) VALUES (new.rowid, new.title, new.body_md);
END;
