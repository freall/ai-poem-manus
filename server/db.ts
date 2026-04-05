import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, poems, questions, userLearningRecords, userAnswers, userAchievements, InsertUserLearningRecord } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// 诗词查询函数
export async function getAllPoems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(poems).orderBy(poems.id);
}

export async function getPoemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(poems).where(eq(poems.id, id)).limit(1);
  return result[0];
}

export async function getPoemsByFestival(festival: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(poems).where(eq(poems.festival, festival)).orderBy(poems.id);
}

export async function getPoemsBySeason(season: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(poems).where(eq(poems.season, season)).orderBy(poems.id);
}

// 问答题查询函数
export async function getQuestionsByPoemId(poemId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.poemId, poemId)).orderBy(questions.questionIndex);
}

// 用户学习记录函数
export async function getUserLearningRecord(userId: number, poemId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userLearningRecords)
    .where(eq(userLearningRecords.userId, userId) && eq(userLearningRecords.poemId, poemId))
    .limit(1);
  return result[0];
}

export async function getUserLearningRecords(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userLearningRecords).where(eq(userLearningRecords.userId, userId));
}

export async function updateUserLearningRecord(userId: number, poemId: number, data: Partial<InsertUserLearningRecord>) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserLearningRecord(userId, poemId);
  if (existing) {
    await db.update(userLearningRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userLearningRecords.userId, userId) && eq(userLearningRecords.poemId, poemId));
  } else {
    await db.insert(userLearningRecords).values({
      userId,
      poemId,
      ...data,
    });
  }
}

// 用户答题记录函数
export async function recordUserAnswer(userId: number, questionId: number, userAnswer: string, isCorrect: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userAnswers).values({
    userId,
    questionId,
    userAnswer,
    isCorrect,
  });
}

// 用户成就函数
export async function unlockAchievement(userId: number, achievementType: string, achievementName: string, description?: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userAchievements).values({
    userId,
    achievementType,
    achievementName,
    description,
  });
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
}
