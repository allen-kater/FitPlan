import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { FOODS, FAT_LOSS_QA, MUSCLE_GAIN_QA, TRAINING_PLANS, ACHIEVEMENTS } from '../data/seedData.js';

export const adminRoutes = Router();

/**
 * POST /api/admin/run-seed
 * 一次性端点：用 master key 直接执行 seed（用于首次部署/生产库缺数据时）
 * 请求体：{ "masterKey": "<SEED_MASTER_KEY 环境变量或默认值>" }
 * 默认 masterKey: 'fitplan-seed-2026'（生产环境强烈建议改成自己的）
 */
adminRoutes.post('/run-seed', async (req, res: Response) => {
  const expected = process.env.SEED_MASTER_KEY || 'fitplan-seed-2026';
  if (!req.body || req.body.masterKey !== expected) {
    throw createError(403, 'Master key 不正确');
  }
  try {
    const bcrypt = (await import('bcryptjs')).default;
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@fitplan.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@fitplan.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });

    // 1. 清空静态表
    await prisma.food.deleteMany({});
    await prisma.qAArticle.deleteMany({});
    await prisma.trainingPlan.deleteMany({});

    // 2. Foods
    await prisma.food.createMany({ data: FOODS });

    // 3. QAs
    await prisma.qAArticle.createMany({
      data: [
        ...FAT_LOSS_QA.map((q) => ({ type: 'FAT_LOSS', ...q })),
        ...MUSCLE_GAIN_QA.map((q) => ({ type: 'MUSCLE_GAIN', ...q })),
      ],
    });

    // 4. Training Plans（去掉 tips 字段，tips 改在前端写死或单独存）
    // exercises 字段是 JSON 字符串，需要 stringify
    const trainingPlanRecords = TRAINING_PLANS.map((p) => ({
      type: p.type,
      dayNumber: p.dayNumber,
      groupName: p.groupName,
      exercises: typeof p.exercises === 'string' ? p.exercises : JSON.stringify(p.exercises),
    }));
    await prisma.trainingPlan.createMany({ data: trainingPlanRecords });

    // 5. Achievements（upsert，保留 userAchievement）
    for (const a of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { key: a.key },
        update: {
          name: a.name,
          description: a.description,
          icon: a.icon,
          category: a.category,
          threshold: a.threshold,
        },
        create: a,
      });
    }

    const [foods, qas, plans, achievements] = await Promise.all([
      prisma.food.count(),
      prisma.qAArticle.count(),
      prisma.trainingPlan.count(),
      prisma.achievement.count(),
    ]);

    res.json({
      code: 200,
      data: { foods, qas, plans, achievements },
      message: 'Seed 写入完成',
    });
  } catch (error: any) {
    console.error('Seed endpoint error:', error);
    throw createError(500, `Seed 执行失败: ${error?.message || String(error)}`);
  }
});

/** GET /api/admin/users */
adminRoutes.get('/users', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { plans: true, weightRecords: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    res.json({
      code: 200,
      data: { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取用户列表失败');
  }
});

/** GET /api/admin/users/:id */
adminRoutes.get('/users/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        bodyData: { orderBy: { createdAt: 'desc' }, take: 1 },
        plans: { orderBy: { createdAt: 'desc' }, take: 5 },
        weightRecords: { orderBy: { recordedAt: 'desc' }, take: 10 },
      },
    });
    if (!user) {
      throw createError(404, '用户不存在');
    }
    res.json({ code: 200, data: user, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取用户详情失败');
  }
});

/** GET /api/admin/stats */
adminRoutes.get('/stats', authMiddleware, adminMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const [userCount, planCount, todayLogins, foodCount, qaCount, planDbCount, achievementCount] = await Promise.all([
      prisma.user.count(),
      prisma.fitnessPlan.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.food.count(),
      prisma.qAArticle.count(),
      prisma.trainingPlan.count(),
      prisma.achievement.count(),
    ]);

    res.json({
      code: 200,
      data: { userCount, planCount, todayLogins, foodCount, qaCount, planDbCount, achievementCount },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取统计数据失败');
  }
});
