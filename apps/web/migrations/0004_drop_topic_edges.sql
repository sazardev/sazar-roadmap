-- topic_edges was never read by the application. Topic ordering comes from
-- roadmap_stages.sort_order and topics.sort_order. Removing the table saves
-- 3,224 rows, two indexes and thousands of seed writes per content update.
DROP TABLE IF EXISTS topic_edges;
