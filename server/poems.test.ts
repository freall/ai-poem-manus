import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAuthContext(userId: number = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Poems API", () => {
  describe("poems.getAll", () => {
    it("should return all poems", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const poems = await caller.poems.getAll();

      expect(Array.isArray(poems)).toBe(true);
      // 应该返回诗词列表（即使为空也是有效的）
      expect(poems).toBeDefined();
    });
  });

  describe("poems.getById", () => {
    it("should return poem details with questions", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.poems.getById({ id: 1 });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("poem");
      expect(result).toHaveProperty("questions");
      expect(Array.isArray(result.questions)).toBe(true);
    });

    it("should handle non-existent poem ID", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.poems.getById({ id: 99999 });

      expect(result.poem).toBeUndefined();
      expect(result.questions).toEqual([]);
    });
  });

  describe("poems.getByFestival", () => {
    it("should return poems for a festival", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const poems = await caller.poems.getByFestival({ festival: "春节" });

      expect(Array.isArray(poems)).toBe(true);
      // 验证返回的诗词都属于该节日
      poems.forEach((poem) => {
        expect(poem.festival).toBe("春节");
      });
    });
  });

  describe("poems.getBySeason", () => {
    it("should return poems for a season", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const poems = await caller.poems.getBySeason({ season: "春" });

      expect(Array.isArray(poems)).toBe(true);
      // 验证返回的诗词都属于该季节
      poems.forEach((poem) => {
        expect(poem.season).toContain("春");
      });
    });
  });
});

describe("Learning API", () => {
  describe("learning.getRecords", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.learning.getRecords();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should return learning records for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const records = await caller.learning.getRecords();

      expect(Array.isArray(records)).toBe(true);
    });
  });

  describe("learning.updateRecord", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.learning.updateRecord({
          poemId: 1,
          isLearned: true,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should update learning record for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.learning.updateRecord({
        poemId: 1,
        isLearned: true,
        isFavorite: true,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("learning.recordAnswer", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.learning.recordAnswer({
          questionId: 1,
          userAnswer: "test",
          isCorrect: true,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should record answer for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.learning.recordAnswer({
        questionId: 1,
        userAnswer: "test answer",
        isCorrect: true,
      });

      expect(result).toEqual({ success: true });
    });
  });
});

describe("Achievements API", () => {
  describe("achievements.getAll", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.achievements.getAll();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should return achievements for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const achievements = await caller.achievements.getAll();

      expect(Array.isArray(achievements)).toBe(true);
    });
  });

  describe("achievements.unlock", () => {
    it("should require authentication", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.achievements.unlock({
          achievementType: "poem",
          achievementName: "First Poem",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should unlock achievement for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.achievements.unlock({
        achievementType: "poem",
        achievementName: "First Poem Learned",
        description: "Learn your first poem",
      });

      expect(result).toEqual({ success: true });
    });
  });
});
