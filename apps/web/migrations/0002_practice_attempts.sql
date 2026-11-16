CREATE TABLE practice_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  verdict TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL,
  strengths TEXT NOT NULL,
  gaps TEXT NOT NULL,
  next_step TEXT,
  model TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX practice_attempts_user_topic_idx ON practice_attempts (user_id, topic_id, created_at);
CREATE INDEX practice_attempts_user_idx ON practice_attempts (user_id, created_at);
