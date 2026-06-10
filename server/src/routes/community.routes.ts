import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { createError } from '../middleware/errorHandler.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { awardExp } from './user.routes.js';

export const communityRoutes = Router();

// ==================== Posts ====================

/** GET /api/community/posts - 帖子列表 */
communityRoutes.get('/posts', async (req, res: Response) => {
  try {
    const { category, sort = 'latest', page = '1', pageSize = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category as string;
    }

    const orderBy: any = sort === 'hot'
      ? [{ likeCount: 'desc' as const }, { commentCount: 'desc' as const }]
      : { createdAt: 'desc' as const };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: size,
        include: {
          author: { select: { id: true, username: true } },
          _count: { select: { comments: true, likes: true, favorites: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      code: 200,
      data: {
        posts: posts.map(p => ({
          id: p.id,
          title: p.title,
          content: p.content.substring(0, 200) + (p.content.length > 200 ? '...' : ''),
          category: p.category,
          likeCount: p.likeCount,
          commentCount: p.commentCount,
          author: p.author,
          createdAt: p.createdAt,
        })),
        total,
        page: pageNum,
        pageSize: size,
        totalPages: Math.ceil(total / size),
      },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取帖子列表失败');
  }
});

/** GET /api/community/posts/:id - 帖子详情 */
communityRoutes.get('/posts/:id', async (req, res: Response) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { id: true, username: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, username: true } } },
        },
      },
    });

    if (!post) throw createError(404, '帖子不存在');

    // Check if current user liked/favorited
    let isLiked = false;
    let isFavorited = false;
    const userId = (req as AuthRequest).user?.id;
    if (userId) {
      const [like, fav] = await Promise.all([
        prisma.postLike.findUnique({ where: { postId_userId: { postId: post.id, userId } } }),
        prisma.postFavorite.findUnique({ where: { postId_userId: { postId: post.id, userId } } }),
      ]);
      isLiked = !!like;
      isFavorited = !!fav;
    }

    res.json({
      code: 200,
      data: { ...post, isLiked, isFavorited },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取帖子详情失败');
  }
});

/** POST /api/community/posts - 发布帖子 */
communityRoutes.post('/posts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      throw createError(400, '标题、内容和分类不能为空');
    }

    const validCategories = ['CHECK_IN', 'TRAINING', 'DIET', 'QUESTION', 'EXPERIENCE'];
    if (!validCategories.includes(category)) {
      throw createError(400, '无效的分类');
    }

    const post = await prisma.post.create({
      data: {
        authorId: req.user!.id,
        title: title.substring(0, 50),
        content: content.substring(0, 2000),
        category,
      },
      include: { author: { select: { id: true, username: true } } },
    });

    // 经验授予
    const expResult = await awardExp(req.user!.id, 'POST', 60, `发布帖子: ${title.substring(0, 20)}`);

    res.status(201).json({ code: 201, data: post, message: '发布成功', exp: expResult });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '发布帖子失败');
  }
});

/** DELETE /api/community/posts/:id - 删除帖子 */
communityRoutes.delete('/posts/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw createError(404, '帖子不存在');

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (post.authorId !== req.user!.id && user?.role !== 'ADMIN') {
      throw createError(403, '无权删除此帖子');
    }

    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ code: 200, data: null, message: '删除成功' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '删除帖子失败');
  }
});

// ==================== Comments ====================

/** POST /api/community/posts/:id/comments - 发表评论 */
communityRoutes.post('/posts/:id/comments', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) throw createError(400, '评论内容不能为空');

    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) throw createError(404, '帖子不存在');

    const comment = await prisma.comment.create({
      data: {
        postId: req.params.id,
        authorId: req.user!.id,
        content: content.substring(0, 500),
      },
      include: { author: { select: { id: true, username: true } } },
    });

    // Update comment count
    await prisma.post.update({
      where: { id: req.params.id },
      data: { commentCount: { increment: 1 } },
    });

    // 经验授予
    const expResult = await awardExp(req.user!.id, 'COMMENT', 15, `回复帖子`);

    res.status(201).json({ code: 201, data: comment, message: '评论成功', exp: expResult });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '评论失败');
  }
});

// ==================== Likes ====================

/** POST /api/community/posts/:id/like - 点赞/取消点赞 */
communityRoutes.post('/posts/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw createError(404, '帖子不存在');

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      await prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
      res.json({ code: 200, data: { liked: false }, message: '取消点赞' });
    } else {
      await prisma.postLike.create({ data: { postId, userId } });
      await prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
      res.json({ code: 200, data: { liked: true }, message: '点赞成功' });
    }
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '点赞操作失败');
  }
});

// ==================== Favorites ====================

/** POST /api/community/posts/:id/favorite - 收藏/取消收藏 */
communityRoutes.post('/posts/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw createError(404, '帖子不存在');

    const existing = await prisma.postFavorite.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await prisma.postFavorite.delete({ where: { id: existing.id } });
      res.json({ code: 200, data: { favorited: false }, message: '取消收藏' });
    } else {
      await prisma.postFavorite.create({ data: { postId, userId } });
      res.json({ code: 200, data: { favorited: true }, message: '收藏成功' });
    }
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '收藏操作失败');
  }
});

/** GET /api/community/favorites - 获取收藏列表 */
communityRoutes.get('/favorites', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const favorites = await prisma.postFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: { author: { select: { id: true, username: true } } },
        },
      },
    });

    res.json({
      code: 200,
      data: favorites.map(f => ({
        id: f.post.id,
        title: f.post.title,
        content: f.post.content.substring(0, 200),
        category: f.post.category,
        likeCount: f.post.likeCount,
        commentCount: f.post.commentCount,
        author: f.post.author,
        createdAt: f.post.createdAt,
        favoritedAt: f.createdAt,
      })),
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取收藏列表失败');
  }
});

// ==================== Rankings ====================

/** GET /api/community/rankings - 打卡排行榜 */
communityRoutes.get('/rankings', async (req, res: Response) => {
  try {
    const { period = 'weekly' } = req.query;
    const now = new Date();
    const startDate = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count CHECK_IN posts per user in the period
    const checkIns = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        category: 'CHECK_IN',
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Get user info for top users
    const userIds = checkIns.map(c => c.authorId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const rankings = checkIns.map(c => ({
      user: userMap.get(c.authorId) || { id: c.authorId, username: '未知用户' },
      checkInCount: c._count.id,
    }));

    res.json({ code: 200, data: rankings, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取排行榜失败');
  }
});

// ==================== My Posts ====================

/** GET /api/community/my-posts - 我的帖子 */
communityRoutes.get('/my-posts', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, username: true } } },
    });

    res.json({ code: 200, data: posts, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取我的帖子失败');
  }
});
