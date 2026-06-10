import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { dailyNutritionSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { awardExp } from './user.routes.js';

export const nutritionRoutes = Router();

/** POST /api/nutrition - 记录/更新当日营养素 */
nutritionRoutes.post('/', authMiddleware, validate(dailyNutritionSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, carbG, proteinG, fatG, calories: rawCalories } = req.body;
    // 如果热量为0或未提供，自动根据宏量营养素计算
    const calories = rawCalories && rawCalories > 0 ? rawCalories : carbG * 4 + proteinG * 4 + fatG * 9;

    // 判断是否为当日首次记录
    const existing = await prisma.dailyNutrition.findUnique({
      where: { userId_date: { userId, date } },
    });
    const isFirstToday = !existing;

    // upsert: 如果当天已有记录则更新，否则创建
    const nutrition = await prisma.dailyNutrition.upsert({
      where: { userId_date: { userId, date } },
      update: { carbG, proteinG, fatG, calories },
      create: { userId, date, carbG, proteinG, fatG, calories },
    });

    // 经验授予：每日首次营养追踪
    let expResult = null;
    if (isFirstToday) {
      expResult = await awardExp(userId, 'NUTRITION', 50, `每日营养追踪: ${date}`);

      // 检查连续7天营养记录
      const recentDates = await prisma.dailyNutrition.findMany({
        where: { userId },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 7,
      });
      if (recentDates.length >= 7) {
        const dates = recentDates.map(r => r.date).sort();
        let consecutive = 1;
        for (let i = dates.length - 1; i > 0; i--) {
          const curr = new Date(dates[i]);
          const prev = new Date(dates[i - 1]);
          const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (Math.abs(diffDays - 1) < 0.1) {
            consecutive++;
          } else {
            break;
          }
        }
        if (consecutive >= 7) {
          await awardExp(userId, 'STREAK_7_NUTRITION', 150, `连续7天营养追踪奖励`);
        }
      }
    }

    res.json({ code: 200, data: nutrition, message: '营养记录保存成功', exp: expResult });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '保存营养记录失败');
  }
});

/** GET /api/nutrition - 查询营养记录 */
nutritionRoutes.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, startDate, endDate } = req.query;

    const where: any = { userId };
    if (date) {
      where.date = date as string;
    } else if (startDate && endDate) {
      where.date = { gte: startDate as string, lte: endDate as string };
    }

    const records = await prisma.dailyNutrition.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json({ code: 200, data: records, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取营养记录失败');
  }
});
