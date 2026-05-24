import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';
import { config } from '../config/index.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const authRoutes = Router();

/** POST /api/auth/register */
authRoutes.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      throw createError(409, '用户名或邮箱已存在');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, role: 'USER' },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' } as jwt.SignOptions,
    );

    res.status(201).json({
      code: 201,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      },
      message: '注册成功',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '注册失败');
  }
});

/** POST /api/auth/login */
authRoutes.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createError(401, '邮箱或密码错误');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw createError(401, '邮箱或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' } as jwt.SignOptions,
    );

    res.json({
      code: 200,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      },
      message: '登录成功',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '登录失败');
  }
});

/** GET /api/auth/me */
authRoutes.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, email: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw createError(404, '用户不存在');
    }
    res.json({ code: 200, data: user, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取用户信息失败');
  }
});
