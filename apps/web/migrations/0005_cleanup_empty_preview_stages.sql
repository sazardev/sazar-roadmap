-- Eight guided roadmaps kept an empty "Preview topics" stage from when they
-- were catalog previews. It renders first on the map and inflates stage counts.
DELETE FROM roadmap_stages
WHERE slug = 'preview'
  AND roadmap_id IN (SELECT id FROM roadmaps WHERE status = 'guided')
  AND NOT EXISTS (SELECT 1 FROM topics WHERE topics.stage_id = roadmap_stages.id);
