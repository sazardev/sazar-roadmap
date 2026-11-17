-- Three `index.md` files used to be parsed as topics named "Index". The seed now skips them.
-- Remove only the junk rows that have never been touched by a learner.
DELETE FROM topics
WHERE slug = 'index'
  AND NOT EXISTS (SELECT 1 FROM user_topic_progress p WHERE p.topic_id = topics.id)
  AND NOT EXISTS (SELECT 1 FROM practice_attempts a WHERE a.topic_id = topics.id)
  AND NOT EXISTS (SELECT 1 FROM study_sessions s WHERE s.topic_id = topics.id)
  AND NOT EXISTS (SELECT 1 FROM notes n WHERE n.topic_id = topics.id)
  AND NOT EXISTS (SELECT 1 FROM coach_threads t WHERE t.topic_id = topics.id)
  AND NOT EXISTS (SELECT 1 FROM daily_plans d WHERE d.focus_topic_id = topics.id);
