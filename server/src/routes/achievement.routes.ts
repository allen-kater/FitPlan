import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const achievementRoutes = Router();

/** GET /api/achievements - 所有成就列表 */
achievementRoutes.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { threshold: 'asc' }],
    });
    res.json({ code: 200, data: achievements, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取成就列表失败');
  }
});

/** GET /api/achievements/my - 我的成就 */
achievementRoutes.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    // 获取所有成就，标记哪些已解锁
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { threshold: 'asc' }],
    });

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    const result = allAchievements.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: userAchievements.find((ua) => ua.achievementId === a.id)?.unlockedAt || null,
    }));

    // 计算用户等级
    const unlockedCount = userAchievements.length;
    const level = Math.floor(Math.sqrt(unlockedCount)) + 1;
    const expForNextLevel = level * level; // 下一级需要的总成就数

    res.json({
      code: 200,
      data: {
        achievements: result,
        level,
        unlockedCount,
        expForNextLevel,
        totalAchievements: allAchievements.length,
      },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取我的成就失败');
  }
});

/** POST /api/achievements/check - 检查并解锁新成就 */
achievementRoutes.post('/check', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const newlyUnlocked: string[] = [];

    // 获取用户当前统计数据
    const [planCount, logCount, postCount, nutritionCount, weightCount] = await Promise.all([
      prisma.fitnessPlan.count({ where: { userId } }),
      prisma.trainingLog.count({ where: { userId } }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.dailyNutrition.count({ where: { userId } }),
      prisma.weightRecord.count({ where: { userId } }),
    ]);

    // 检查是否在早起后练时段生成过方案
    const earlyMorningPlan = await prisma.fitnessPlan.findFirst({
      where: { userId },
      include: { bodyData: true },
    });
    const hasEarlyBird = earlyMorningPlan?.bodyData?.trainingTime === 'EARLY_MORNING';

    // 成就条件映射
    const achievementChecks: Array<{ key: string; condition: boolean }> = [
      { key: 'FIRST_PLAN', condition: planCount >= 1 },
      { key: 'PLAN_MASTER', condition: planCount >= 5 },
      { key: 'PLAN_EXPERT', condition: planCount >= 10 },
      { key: 'THIRTY_DAY_STREAK', condition: logCount >= 30 },
      { key: 'HUNDRED_LOGS', condition: logCount >= 100 },
      { key: 'NUTRITION_TRACKER', condition: nutritionCount >= 7 },
      { key: 'NUTRITION_MASTER', condition: nutritionCount >= 30 },
      { key: 'COMMUNITY_STAR', condition: postCount >= 10 },
      { key: 'WEIGHT_WARRIOR', condition: weightCount >= 30 },
      { key: 'EARLY_BIRD', condition: hasEarlyBird },
    ];

    // 检查连续7天训练日志
    const recentLogs = await prisma.trainingLog.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
      orderBy: { date: 'desc' },
      take: 7,
    });
    if (recentLogs.length >= 7) {
      const dates = recentLogs.map((l) => new Date(l.date).getTime()).sort((a, b) => b - a);
      let streak = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i - 1] - dates[i]) / (1000 * 60 * 60 * 24);
        if (diff <= 1.5) streak++;
        else break;
      }
      if (streak >= 7) {
        achievementChecks.push({ key: 'SEVEN_DAY_STREAK', condition: true });
      }
    }

    // 逐个检查并解锁
    for (const check of achievementChecks) {
      if (!check.condition) continue;

      const achievement = await prisma.achievement.findUnique({ where: { key: check.key } });
      if (!achievement) continue;

      const existing = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id },
        });
        newlyUnlocked.push(achievement.name);
      }
    }

    res.json({
      code: 200,
      data: { newlyUnlocked, count: newlyUnlocked.length },
      message: newlyUnlocked.length > 0 ? `恭喜解锁新成就: ${newlyUnlocked.join(', ')}` : '暂无新成就',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '检查成就失败');
  }
});
