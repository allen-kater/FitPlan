import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { validate } from '../middleware/validate.js';
import { strengthPredictSchema } from '../validators/index.js';
import { predictStrength } from '../services/strength-predictor.service.js';
import { createError } from '../middleware/errorHandler.js';

export const trainingRoutes = Router();

/** GET /api/training/plans */
trainingRoutes.get('/plans', async (_req, res: Response) => {
  try {
    const plans = await prisma.trainingPlan.findMany({
      orderBy: [{ type: 'asc' }, { dayNumber: 'asc' }],
    });
    const result = plans.map((plan) => ({
      ...plan,
      exercises: JSON.parse(plan.exercises),
    }));
    res.json({ code: 200, data: result, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取训练计划失败');
  }
});

/** GET /api/training/plans/:type */
trainingRoutes.get('/plans/:type', async (req, res: Response) => {
  try {
    const plans = await prisma.trainingPlan.findMany({
      where: { type: req.params.type },
      orderBy: { dayNumber: 'asc' },
    });
    if (plans.length === 0) {
      throw createError(404, '未找到该类型的训练计划');
    }
    const result = plans.map((plan) => ({
      ...plan,
      exercises: JSON.parse(plan.exercises),
    }));
    res.json({ code: 200, data: result, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取训练计划失败');
  }
});

/** POST /api/training/strength-predict */
trainingRoutes.post('/strength-predict', validate(strengthPredictSchema), async (req, res: Response) => {
  try {
    const { weight, reps } = req.body;
    const results = predictStrength(weight, reps);
    res.json({ code: 200, data: results, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '力量预测失败');
  }
});
