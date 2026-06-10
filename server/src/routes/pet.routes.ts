import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { feedPet, syncPetBody, syncPetStage } from '../services/pet.service.js';

export const petRoutes = Router();

/** GET /api/pet — 获取我的宠物 */
petRoutes.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pet = await prisma.pet.findUnique({
      where: { userId: req.user!.id },
    });
    if (!pet) {
      return res.json({ code: 200, data: null, message: '暂无宠物' });
    }

    // 同步成长阶段
    await syncPetStage(req.user!.id);

    const updated = await prisma.pet.findUnique({ where: { userId: req.user!.id } });
    res.json({ code: 200, data: updated, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取宠物信息失败');
  }
});

/** POST /api/pet/adopt — 领养宠物 */
petRoutes.post('/adopt', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) throw createError(400, '请提供宠物名称和类型');
    if (!['cat', 'dog', 'dragon', 'fox'].includes(type)) {
      throw createError(400, '无效的宠物类型');
    }

    const existing = await prisma.pet.findUnique({ where: { userId: req.user!.id } });
    if (existing) throw createError(400, '你已经有一只宠物了');

    const pet = await prisma.pet.create({
      data: { userId: req.user!.id, name, type },
    });

    // 初始化宠物身材
    await syncPetBody(req.user!.id);

    const updated = await prisma.pet.findUnique({ where: { id: pet.id } });
    res.status(201).json({ code: 201, data: updated, message: '领养成功！' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '领养失败');
  }
});

/** POST /api/pet/feed — 喂食（根据用户当日营养数据） */
petRoutes.post('/feed', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pet = await prisma.pet.findUnique({ where: { userId: req.user!.id } });
    if (!pet) throw createError(404, '你还没有宠物');

    const { date } = req.body;
    const feedDate = date || new Date().toISOString().slice(0, 10);

    // 读取用户当日营养数据
    const nutrition = await prisma.dailyNutrition.findUnique({
      where: { userId_date: { userId: req.user!.id, date: feedDate } },
    });

    if (!nutrition) {
      throw createError(400, '请先记录今日的营养数据');
    }

    // 检查今日是否已喂过
    const todayFed = await prisma.petFeedingLog.findFirst({
      where: { petId: pet.id, date: feedDate },
    });
    if (todayFed) throw createError(400, '今天已经喂过宠物了');

    const updated = await feedPet(
      pet.id,
      feedDate,
      nutrition.carbG,
      nutrition.proteinG,
      nutrition.fatG,
    );

    res.json({ code: 200, data: updated, message: '喂食成功！' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '喂食失败');
  }
});

/** GET /api/pet/feeding-logs — 喂食记录 */
petRoutes.get('/feeding-logs', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const pet = await prisma.pet.findUnique({ where: { userId: req.user!.id } });
    if (!pet) throw createError(404, '你还没有宠物');

    const logs = await prisma.petFeedingLog.findMany({
      where: { petId: pet.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({ code: 200, data: logs, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取喂食记录失败');
  }
});
