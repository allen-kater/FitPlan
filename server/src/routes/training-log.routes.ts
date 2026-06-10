import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { trainingLogSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { awardExp } from './user.routes.js';

export const trainingLogRoutes = Router();

/** POST /api/training-logs - 创建训练日志 */
trainingLogRoutes.post('/', authMiddleware, validate(trainingLogSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, exerciseName, sets, reps, weight, notes } = req.body;

    const log = await prisma.trainingLog.create({
      data: { userId, date, exerciseName, sets, reps, weight, notes: notes || null },
    });

    // 经验授予：检查是否为当日第一条日志
    const todayLogs = await prisma.trainingLog.count({
      where: { userId, date },
    });
    const isFirstToday = todayLogs <= 1;

    let expResult = null;
    if (isFirstToday) {
      expResult = await awardExp(userId, 'TRAINING_LOG_FIRST', 80, `每日首次训练日志: ${date}`);
    } else {
      expResult = await awardExp(userId, 'TRAINING_LOG', 20, `训练日志: ${exerciseName}`);
    }

    // 检查连续7天训练
    const recentDates = await prisma.trainingLog.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
      orderBy: { date: 'desc' },
      take: 7,
    });
    if (recentDates.length >= 7) {
      const dates = recentDates.map(r => r.date).sort();
      const todayDate = new Date(date);
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
        await awardExp(userId, 'STREAK_7_TRAINING', 200, `连续7天训练奖励`);
      }
    }

    res.status(201).json({
      code: 201,
      data: log,
      message: '训练日志创建成功',
      exp: expResult,
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '创建训练日志失败');
  }
});

/** GET /api/training-logs - 查询训练日志（按日期） */
trainingLogRoutes.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, startDate, endDate } = req.query;

    const where: any = { userId };
    if (date) {
      where.date = date as string;
    } else if (startDate && endDate) {
      where.date = { gte: startDate as string, lte: endDate as string };
    }

    const logs = await prisma.trainingLog.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ code: 200, data: logs, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取训练日志失败');
  }
});

/** PUT /api/training-logs/:id - 更新训练日志 */
trainingLogRoutes.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const log = await prisma.trainingLog.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!log) throw createError(404, '训练日志不存在');

    const updated = await prisma.trainingLog.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ code: 200, data: updated, message: '更新成功' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '更新训练日志失败');
  }
});

/** DELETE /api/training-logs/:id - 删除训练日志 */
trainingLogRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const log = await prisma.trainingLog.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!log) throw createError(404, '训练日志不存在');

    await prisma.trainingLog.delete({ where: { id: req.params.id } });
    res.json({ code: 200, data: null, message: '删除成功' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '删除训练日志失败');
  }
});
