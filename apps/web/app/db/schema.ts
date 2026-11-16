import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = () => new Date().toISOString();

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  timezone: text("timezone").notNull().default("UTC"),
  locale: text("locale").notNull().default("en"),
  onboardingCompletedAt: text("onboarding_completed_at"),
  createdAt: text("created_at").notNull().$defaultFn(now),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  density: text("density").notNull().default("comfortable"),
  accent: text("accent").notNull().default("iris"),
  corners: text("corners").notNull().default("soft"),
  textSize: text("text_size").notNull().default("standard"),
  reducedMotion: integer("reduced_motion", { mode: "boolean" }).notNull().default(false),
  weekStart: integer("week_start").notNull().default(1),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(30),
  weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(180),
  aiEnabled: integer("ai_enabled", { mode: "boolean" }).notNull().default(true),
  aiModel: text("ai_model"),
  createdAt: text("created_at").notNull().$defaultFn(now),
  updatedAt: text("updated_at").notNull().$defaultFn(now),
});

export const roadmaps = sqliteTable(
  "roadmaps",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull(),
    description: text("description").notNull(),
    level: text("level").notNull().default("beginner"),
    estimatedHours: integer("estimated_hours").notNull().default(0),
    icon: text("icon").notNull().default("route"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").notNull().default("catalog"),
    contentStatus: text("content_status").notNull().default("preview"),
    sourceTopicCount: integer("source_topic_count").notNull().default(0),
    source: text("source"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [uniqueIndex("roadmaps_slug_idx").on(table.slug)],
);

export const roadmapStages = sqliteTable(
  "roadmap_stages",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    estimatedHours: integer("estimated_hours").notNull().default(0),
  },
  (table) => [
    uniqueIndex("roadmap_stages_slug_idx").on(table.roadmapId, table.slug),
    index("roadmap_stages_order_idx").on(table.roadmapId, table.sortOrder),
  ],
);

export const topics = sqliteTable(
  "topics",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    stageId: text("stage_id")
      .notNull()
      .references(() => roadmapStages.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    whyItMatters: text("why_it_matters").notNull(),
    keyConcepts: text("key_concepts", { mode: "json" }).$type<string[]>().notNull(),
    practice: text("practice").notNull(),
    pitfalls: text("pitfalls", { mode: "json" }).$type<string[]>().notNull(),
    contentMd: text("content_md").notNull().default(""),
    sourceUrl: text("source_url"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(45),
    difficulty: text("difficulty").notNull().default("core"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [
    uniqueIndex("topics_slug_idx").on(table.roadmapId, table.slug),
    index("topics_stage_idx").on(table.stageId, table.sortOrder),
    index("topics_roadmap_idx").on(table.roadmapId, table.sortOrder),
  ],
);

export const resources = sqliteTable(
  "resources",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id").references(() => roadmaps.id, { onDelete: "cascade" }),
    topicId: text("topic_id").references(() => topics.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    kind: text("kind").notNull().default("article"),
    provider: text("provider"),
    description: text("description"),
    estimatedMinutes: integer("estimated_minutes"),
    isFree: integer("is_free", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: text("created_at").notNull().$defaultFn(now),
  },
  (table) => [
    index("resources_topic_idx").on(table.topicId, table.sortOrder),
    index("resources_roadmap_idx").on(table.roadmapId, table.sortOrder),
    index("resources_kind_idx").on(table.kind),
  ],
);

export const userTopicProgress = sqliteTable(
  "user_topic_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("not_started"),
    confidence: integer("confidence").notNull().default(0),
    minutesSpent: integer("minutes_spent").notNull().default(0),
    lastStudiedAt: text("last_studied_at"),
    completedAt: text("completed_at"),
    notes: text("notes"),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.topicId] }),
    index("progress_user_status_idx").on(table.userId, table.status),
  ],
);

export const studySessions = sqliteTable(
  "study_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    topicId: text("topic_id").references(() => topics.id, { onDelete: "set null" }),
    kind: text("kind").notNull().default("read"),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    minutes: integer("minutes").notNull().default(0),
    notes: text("notes"),
  },
  (table) => [index("sessions_user_idx").on(table.userId, table.startedAt)],
);

export const goals = sqliteTable(
  "goals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    kind: text("kind").notNull().default("weekly"),
    targetValue: integer("target_value").notNull(),
    currentValue: integer("current_value").notNull().default(0),
    unit: text("unit").notNull().default("minutes"),
    dueAt: text("due_at"),
    status: text("status").notNull().default("active"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [index("goals_user_status_idx").on(table.userId, table.status)],
);

export const goalMilestones = sqliteTable(
  "goal_milestones",
  {
    id: text("id").primaryKey(),
    goalId: text("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    targetValue: integer("target_value"),
    completedAt: text("completed_at"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("milestones_goal_idx").on(table.goalId, table.sortOrder)],
);

export const flashcards = sqliteTable(
  "flashcards",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    hint: text("hint"),
    explanation: text("explanation"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull(),
    source: text("source").notNull().default("seed"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [
    index("cards_topic_idx").on(table.topicId),
    index("cards_roadmap_idx").on(table.roadmapId),
  ],
);

export const flashcardReviews = sqliteTable(
  "flashcard_reviews",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => flashcards.id, { onDelete: "cascade" }),
    easeFactor: real("ease_factor").notNull().default(2.5),
    intervalDays: integer("interval_days").notNull().default(0),
    repetitions: integer("repetitions").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    state: text("state").notNull().default("new"),
    dueAt: text("due_at").notNull(),
    lastReviewedAt: text("last_reviewed_at"),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.cardId] }),
    index("reviews_due_idx").on(table.userId, table.dueAt),
  ],
);

export const flashcardAttempts = sqliteTable(
  "flashcard_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => flashcards.id, { onDelete: "cascade" }),
    rating: text("rating").notNull(),
    reviewedAt: text("reviewed_at").notNull(),
    elapsedMs: integer("elapsed_ms"),
  },
  (table) => [index("attempts_user_idx").on(table.userId, table.reviewedAt)],
);

export const practiceAttempts = sqliteTable(
  "practice_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    response: text("response").notNull(),
    verdict: text("verdict").notNull(),
    score: integer("score").notNull().default(0),
    feedback: text("feedback").notNull(),
    strengths: text("strengths", { mode: "json" }).$type<string[]>().notNull(),
    gaps: text("gaps", { mode: "json" }).$type<string[]>().notNull(),
    nextStep: text("next_step"),
    model: text("model"),
    createdAt: text("created_at").notNull().$defaultFn(now),
  },
  (table) => [
    index("practice_attempts_user_topic_idx").on(table.userId, table.topicId, table.createdAt),
    index("practice_attempts_user_idx").on(table.userId, table.createdAt),
  ],
);

export const coachThreads = sqliteTable(
  "coach_threads",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    topicId: text("topic_id").references(() => topics.id, { onDelete: "set null" }),
    mode: text("mode").notNull().default("coach"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [index("threads_user_idx").on(table.userId, table.updatedAt)],
);

export const coachMessages = sqliteTable(
  "coach_messages",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => coachThreads.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    citations: text("citations", { mode: "json" }).$type<string[]>().notNull(),
    model: text("model"),
    createdAt: text("created_at").notNull().$defaultFn(now),
  },
  (table) => [index("messages_thread_idx").on(table.threadId, table.createdAt)],
);

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    bodyMd: text("body_md").notNull(),
    topicId: text("topic_id").references(() => topics.id, { onDelete: "set null" }),
    source: text("source").notNull().default("internal"),
    externalId: text("external_id"),
    externalUrl: text("external_url"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [index("notes_user_idx").on(table.userId, table.updatedAt)],
);

export const bookmarks = sqliteTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    resourceId: text("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().$defaultFn(now),
  },
  (table) => [primaryKey({ columns: [table.userId, table.resourceId] })],
);

export const people = sqliteTable(
  "people",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role"),
    expertise: text("expertise", { mode: "json" }).$type<string[]>().notNull(),
    url: text("url"),
    notes: text("notes"),
    lastContactedAt: text("last_contacted_at"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [index("people_user_idx").on(table.userId, table.name)],
);

export const questions = sqliteTable(
  "questions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    topicId: text("topic_id").references(() => topics.id, { onDelete: "set null" }),
    personId: text("person_id").references(() => people.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    status: text("status").notNull().default("open"),
    answer: text("answer"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    answeredAt: text("answered_at"),
  },
  (table) => [index("questions_user_status_idx").on(table.userId, table.status)],
);

export const activityEvents = sqliteTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    createdAt: text("created_at").notNull().$defaultFn(now),
  },
  (table) => [index("activity_user_idx").on(table.userId, table.createdAt)],
);

export const dailyPlans = sqliteTable(
  "daily_plans",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    planDate: text("plan_date").notNull(),
    focusTopicId: text("focus_topic_id").references(() => topics.id, { onDelete: "set null" }),
    targetMinutes: integer("target_minutes").notNull().default(30),
    completedMinutes: integer("completed_minutes").notNull().default(0),
    status: text("status").notNull().default("planned"),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [uniqueIndex("daily_plan_user_date_idx").on(table.userId, table.planDate)],
);

export const integrations = sqliteTable(
  "integrations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("available"),
    lastSyncedAt: text("last_synced_at"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    createdAt: text("created_at").notNull().$defaultFn(now),
    updatedAt: text("updated_at").notNull().$defaultFn(now),
  },
  (table) => [uniqueIndex("integrations_user_provider_idx").on(table.userId, table.provider)],
);
