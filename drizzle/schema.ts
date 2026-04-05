import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 诗词表
export const poems = mysqlTable("poems", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 100 }).notNull(),
  dynasty: varchar("dynasty", { length: 50 }).notNull(),
  content: text("content").notNull(),
  translation: text("translation"),
  background: text("background"),
  imageUrl: text("imageUrl"),
  category: mysqlEnum("category", ["节气", "节日"]).notNull(),
  season: varchar("season", { length: 20 }),
  festival: varchar("festival", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Poem = typeof poems.$inferSelect;
export type InsertPoem = typeof poems.$inferInsert;

// 诗词问答题表
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  poemId: int("poemId").notNull(),
  question: text("question").notNull(),
  correctAnswer: text("correctAnswer").notNull(),
  explanation: text("explanation"),
  options: json("options").$type<string[]>(),
  questionIndex: int("questionIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// 用户学习记录表
export const userLearningRecords = mysqlTable("userLearningRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  poemId: int("poemId").notNull(),
  isLearned: boolean("isLearned").default(false).notNull(),
  isFavorite: boolean("isFavorite").default(false).notNull(),
  correctCount: int("correctCount").default(0).notNull(),
  totalAttempts: int("totalAttempts").default(0).notNull(),
  lastLearnedAt: timestamp("lastLearnedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserLearningRecord = typeof userLearningRecords.$inferSelect;
export type InsertUserLearningRecord = typeof userLearningRecords.$inferInsert;

// 用户答题记录表
export const userAnswers = mysqlTable("userAnswers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  userAnswer: text("userAnswer").notNull(),
  isCorrect: boolean("isCorrect").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAnswer = typeof userAnswers.$inferSelect;
export type InsertUserAnswer = typeof userAnswers.$inferInsert;

// 用户成就表
export const userAchievements = mysqlTable("userAchievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  achievementType: varchar("achievementType", { length: 50 }).notNull(),
  achievementName: varchar("achievementName", { length: 100 }).notNull(),
  description: text("description"),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;