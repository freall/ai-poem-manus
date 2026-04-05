import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllPoems,
  getPoemById,
  getPoemsByFestival,
  getPoemsBySeason,
  getQuestionsByPoemId,
  getUserLearningRecords,
  updateUserLearningRecord,
  recordUserAnswer,
  getUserAchievements,
  unlockAchievement,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 诗词路由
  poems: router({
    getAll: publicProcedure.query(async () => {
      return getAllPoems();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const poem = await getPoemById(input.id);
        const questions = poem ? await getQuestionsByPoemId(poem.id) : [];
        return { poem, questions };
      }),

    getByFestival: publicProcedure
      .input(z.object({ festival: z.string() }))
      .query(async ({ input }) => {
        return getPoemsByFestival(input.festival);
      }),

    getBySeason: publicProcedure
      .input(z.object({ season: z.string() }))
      .query(async ({ input }) => {
        return getPoemsBySeason(input.season);
      }),
  }),

  // 学习记录路由
  learning: router({
    getRecords: protectedProcedure.query(async ({ ctx }) => {
      return getUserLearningRecords(ctx.user.id);
    }),

    updateRecord: protectedProcedure
      .input(
        z.object({
          poemId: z.number(),
          isLearned: z.boolean().optional(),
          isFavorite: z.boolean().optional(),
          correctCount: z.number().optional(),
          totalAttempts: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateUserLearningRecord(ctx.user.id, input.poemId, {
          isLearned: input.isLearned,
          isFavorite: input.isFavorite,
          correctCount: input.correctCount,
          totalAttempts: input.totalAttempts,
          lastLearnedAt: new Date(),
        });
        return { success: true };
      }),

    recordAnswer: protectedProcedure
      .input(
        z.object({
          questionId: z.number(),
          userAnswer: z.string(),
          isCorrect: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await recordUserAnswer(ctx.user.id, input.questionId, input.userAnswer, input.isCorrect);
        return { success: true };
      }),
  }),

  // 成就路由
  achievements: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return getUserAchievements(ctx.user.id);
    }),

    unlock: protectedProcedure
      .input(
        z.object({
          achievementType: z.string(),
          achievementName: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await unlockAchievement(ctx.user.id, input.achievementType, input.achievementName, input.description);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
