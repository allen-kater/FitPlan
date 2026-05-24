import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const adminRoutes = Router();

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
    const [userCount, planCount, todayLogins] = await Promise.all([
      prisma.user.count(),
      prisma.fitnessPlan.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    res.json({
      code: 200,
      data: { userCount, planCount, todayLogins },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取统计数据失败');
  }
});
