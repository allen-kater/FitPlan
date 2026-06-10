import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bodyDataSchema, weightRecordSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';
import { getCultivationLevel, EXP_RULES } from '../services/level.service.js';

export const userRoutes = Router();

/** 经验授予工具函数（供其他路由调用） */
export async function awardExp(
  userId: string,
  source: string,
  amount: number,
  note: string,
): Promise<{ newExp: number; leveledUp: boolean; oldLevel: string; newLevel: string }> {
  // 检查每日上限
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const rule = EXP_RULES.find(r => r.source === source);
  if (rule && rule.dailyCap > 0) {
    const todayExp = await prisma.expLog.aggregate({
      where: {
        userId,
        source,
        createdAt: { gte: today },
      },
      _sum: { amount: true },
    });
    const todayTotal = todayExp._sum.amount || 0;
    if (todayTotal >= rule.dailyCap) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { exp: true } });
      const level = getCultivationLevel(user?.exp || 0);
      return { newExp: user?.exp || 0, leveledUp: false, oldLevel: level.displayName, newLevel: level.displayName };
    }
    // 限制到上限
    amount = Math.min(amount, rule.dailyCap - todayTotal);
  }

  const oldUser = await prisma.user.findUnique({ where: { id: userId }, select: { exp: true } });
  const oldLevel = getCultivationLevel(oldUser?.exp || 0);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { exp: { increment: amount } },
    select: { exp: true },
  });

  await prisma.expLog.create({
    data: { userId, amount, source, note },
  });

  const newLevel = getCultivationLevel(updated.exp);
  const leveledUp = newLevel.totalLevel > oldLevel.totalLevel;

  return {
    newExp: updated.exp,
    leveledUp,
    oldLevel: oldLevel.displayName,
    newLevel: newLevel.displayName,
  };
}

/** GET /api/users/profile */
userRoutes.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        exp: true,
        createdAt: true,
        bodyData: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    if (!user) {
      throw createError(404, '用户不存在');
    }
    res.json({ code: 200, data: user, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取个人信息失败');
  }
});

/** PUT /api/users/body-data */
userRoutes.put('/body-data', authMiddleware, validate(bodyDataSchema), async (req: AuthRequest, res: Response) => {
  try {
    const bodyData = await prisma.userBodyData.create({
      data: {
        userId: req.user!.id,
        gender: req.body.gender,
        height: req.body.height,
        weight: req.body.weight,
        age: req.body.age,
        goal: req.body.goal,
        trainingTime: req.body.trainingTime,
        trainingLevel: req.body.trainingLevel,
        hasCardio: req.body.hasCardio,
        cardioHeartRate: req.body.cardioHeartRate ?? null,
        restingHeartRate: req.body.restingHeartRate ?? null,
        cardioDuration: req.body.cardioDuration ?? null,
      },
    });
    res.json({ code: 200, data: bodyData, message: '身体数据更新成功' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '更新身体数据失败');
  }
});

/** POST /api/users/weight */
userRoutes.post('/weight', authMiddleware, validate(weightRecordSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { weight, recordedAt } = req.body;
    const record = await prisma.weightRecord.upsert({
      where: {
        userId_recordedAt: {
          userId: req.user!.id,
          recordedAt,
        },
      },
      update: { weight },
      create: {
        userId: req.user!.id,
        weight,
        recordedAt,
      },
    });
    res.json({ code: 200, data: record, message: '体重记录保存成功' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '保存体重记录失败');
  }
});

/** GET /api/users/weight-records */
userRoutes.get('/weight-records', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.weightRecord.findMany({
      where: { userId: req.user!.id },
      orderBy: { recordedAt: 'asc' },
    });
    res.json({ code: 200, data: records, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取体重记录失败');
  }
});

/** GET /api/users/level — 获取修仙等级 */
userRoutes.get('/level', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { exp: true },
    });
    if (!user) throw createError(404, '用户不存在');

    const level = getCultivationLevel(user.exp);
    res.json({ code: 200, data: { exp: user.exp, ...level }, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取等级信息失败');
  }
});

/** GET /api/users/exp/log — 经验获取历史 */
userRoutes.get('/exp/log', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const logs = await prisma.expLog.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({ code: 200, data: logs, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取经验记录失败');
  }
});

/** GET /api/users/exp/rules — 经验获取规则 */
userRoutes.get('/exp/rules', async (_req, res: Response) => {
  res.json({ code: 200, data: EXP_RULES, message: 'success' });
});
