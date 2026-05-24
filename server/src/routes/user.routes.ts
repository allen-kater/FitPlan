import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bodyDataSchema, weightRecordSchema } from '../validators/index.js';
import { createError } from '../middleware/errorHandler.js';

export const userRoutes = Router();

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
