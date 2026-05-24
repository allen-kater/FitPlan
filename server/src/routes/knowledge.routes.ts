import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { createError } from '../middleware/errorHandler.js';

export const knowledgeRoutes = Router();

/** GET /api/knowledge/foods */
knowledgeRoutes.get('/foods', async (req, res: Response) => {
  try {
    const { category } = req.query;
    const where = category ? { category: category as string } : {};
    const foods = await prisma.food.findMany({ where, orderBy: { category: 'asc' } });
    res.json({ code: 200, data: foods, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取食物列表失败');
  }
});

/** GET /api/knowledge/qa */
knowledgeRoutes.get('/qa', async (req, res: Response) => {
  try {
    const { type } = req.query;
    const where = type ? { type: type as string } : {};
    const articles = await prisma.qAArticle.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ code: 200, data: articles, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取问答列表失败');
  }
});

/** GET /api/knowledge/stretch */
knowledgeRoutes.get('/stretch', async (_req, res: Response) => {
  try {
    const stretchData = [
      { id: '1', name: '胸部拉伸', description: '站立位，双手扶墙，身体前倾，感受胸部牵拉', targetMuscle: '胸大肌', duration: '30秒/侧', image: '' },
      { id: '2', name: '肩部拉伸', description: '手臂交叉于胸前，另一手轻压，感受肩部牵拉', targetMuscle: '三角肌后束', duration: '30秒/侧', image: '' },
      { id: '3', name: '背阔肌拉伸', description: '单手抓住高处固定物，身体向对侧倾斜', targetMuscle: '背阔肌', duration: '30秒/侧', image: '' },
      { id: '4', name: '股四头肌拉伸', description: '站立位，单手抓住同侧脚踝，将脚跟拉向臀部', targetMuscle: '股四头肌', duration: '30秒/侧', image: '' },
      { id: '5', name: '腘绳肌拉伸', description: '坐位体前屈，双腿伸直，双手尽量触脚尖', targetMuscle: '腘绳肌', duration: '30秒', image: '' },
      { id: '6', name: '小腿拉伸', description: '面向墙壁，前脚掌踩墙，身体前倾', targetMuscle: '腓肠肌', duration: '30秒/侧', image: '' },
      { id: '7', name: '髋屈肌拉伸', description: '弓步姿势，后腿膝盖着地，骨盆前倾', targetMuscle: '髂腰肌', duration: '30秒/侧', image: '' },
      { id: '8', name: '臀部拉伸', description: '仰卧位，一侧脚踝放另一侧膝上，拉向胸前', targetMuscle: '臀大肌', duration: '30秒/侧', image: '' },
      { id: '9', name: '二头肌拉伸', description: '手臂伸直贴墙，身体旋转，感受二头肌牵拉', targetMuscle: '肱二头肌', duration: '30秒/侧', image: '' },
      { id: '10', name: '三头肌拉伸', description: '手臂上举弯曲，另一手轻压肘部向后', targetMuscle: '肱三头肌', duration: '30秒/侧', image: '' },
    ];
    res.json({ code: 200, data: stretchData, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取拉伸数据失败');
  }
});

/** GET /api/knowledge/anatomy */
knowledgeRoutes.get('/anatomy', async (_req, res: Response) => {
  try {
    const anatomyData = [
      { id: '1', name: '胸大肌', location: '胸前上部', function: '肩关节屈、内收、内旋', trainingExercises: '卧推、飞鸟、俯卧撑', image: '' },
      { id: '2', name: '背阔肌', location: '背部下方两侧', function: '肩关节伸、内收、内旋', trainingExercises: '引体向上、杠铃划船、高位下拉', image: '' },
      { id: '3', name: '三角肌', location: '肩部', function: '肩关节外展、屈、伸', trainingExercises: '推举、侧平举、前平举、反向飞鸟', image: '' },
      { id: '4', name: '肱二头肌', location: '上臂前侧', function: '肘关节屈、前臂旋后', trainingExercises: '杠铃弯举、哑铃弯举、锤式弯举', image: '' },
      { id: '5', name: '肱三头肌', location: '上臂后侧', function: '肘关节伸', trainingExercises: '窄距卧推、绳索下压、仰卧臂屈伸', image: '' },
      { id: '6', name: '腹直肌', location: '腹部前侧', function: '脊柱屈、骨盆后倾', trainingExercises: '卷腹、仰卧起坐、悬垂举腿', image: '' },
      { id: '7', name: '股四头肌', location: '大腿前侧', function: '膝关节伸、髋关节屈', trainingExercises: '深蹲、腿举、腿屈伸', image: '' },
      { id: '8', name: '腘绳肌', location: '大腿后侧', function: '膝关节屈、髋关节伸', trainingExercises: '罗马尼亚硬拉、腿弯举、臀桥', image: '' },
      { id: '9', name: '臀大肌', location: '臀部', function: '髋关节伸、外旋', trainingExercises: '深蹲、硬拉、臀推、保加利亚分腿蹲', image: '' },
      { id: '10', name: '小腿三头肌', location: '小腿后侧', function: '踝关节跖屈', trainingExercises: '站姿提踵、坐姿提踵', image: '' },
    ];
    res.json({ code: 200, data: anatomyData, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取解剖数据失败');
  }
});
