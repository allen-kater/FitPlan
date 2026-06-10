import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { createError } from '../middleware/errorHandler.js';
import { lookupQuota, getFullQuotaTable, getHeightBrackets } from '../services/quota.service.js';
import { stretchData } from '../data/stretchData.js';

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
    res.json({
      code: 200,
      data: stretchData,
      message: 'success',
    });
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

/** GET /api/knowledge/joint-activity - 关节活动图谱数据 */
knowledgeRoutes.get('/joint-activity', async (_req, res: Response) => {
  try {
    // A表：关节活动 → 参与肌肉
    const tableA = [
      { joint: '肩关节', movement: '屈', description: '大臂：后→前', example: '前平举', muscles: ['肩前束', '上胸', '肱二头肌'] },
      { joint: '肩关节', movement: '伸', description: '大臂：前→后', example: '直臂下压', muscles: ['背阔肌', '大圆肌', '肩后束', '肱三头肌长头', '下胸'] },
      { joint: '肩关节', movement: '外展', description: '大臂：内→外', example: '侧平举', muscles: ['肩中束', '冈上肌', '肱二头肌长头'] },
      { joint: '肩关节', movement: '内收', description: '大臂：外→内', example: '龙门架下夹胸', muscles: ['背阔肌', '大圆肌', '下胸中胸'] },
      { joint: '肩关节', movement: '水平外展', description: '大臂：在水平面，内→外', example: '蝴蝶机反向飞鸟', muscles: ['肩后束', '冈下肌'] },
      { joint: '肩关节', movement: '水平内收', description: '大臂：在水平面，外→内', example: '蝴蝶机夹胸', muscles: ['上胸中胸', '肩前束'] },
      { joint: '肘关节', movement: '屈', description: '肘关节：打直→折叠', example: '弯举', muscles: ['肱二头肌', '肱肌', '肱桡肌'] },
      { joint: '肘关节', movement: '伸', description: '肘关节：折叠→打直', example: '臂屈伸', muscles: ['肱三头肌'] },
      { joint: '髋关节', movement: '伸', description: '髋关节：折叠→打直', example: '龙门架绳索后踢', muscles: ['腘绳肌', '臀大肌'] },
      { joint: '膝关节', movement: '屈', description: '膝关节：打直→折叠', example: '器械腿弯举', muscles: ['腘绳肌', '腓肠肌'] },
      { joint: '膝关节', movement: '伸', description: '膝关节：折叠→打直', example: '器械腿屈伸', muscles: ['股四头肌'] },
      { joint: '踝关节', movement: '足跖屈', description: '足背与小腿：折叠→打直', example: '提踵', muscles: ['腓肠肌', '比目鱼肌'] },
      { joint: '肩胛骨', movement: '上提', description: '肩胛骨：耸肩', example: '哑铃耸肩', muscles: ['上斜方肌', '菱形肌', '肩胛提肌'] },
      { joint: '肩胛骨', movement: '下沉', description: '肩胛骨：沉肩', example: '高位下拉（离心）', muscles: ['下斜方肌', '背阔肌', '胸小肌'] },
      { joint: '肩胛骨', movement: '外展', description: '肩胛骨：前引', example: '', muscles: ['前锯肌', '胸小肌'] },
      { joint: '肩胛骨', movement: '内收', description: '肩胛骨：后缩', example: '后缩肩胛骨划船', muscles: ['中斜方肌', '下斜方肌', '菱形肌'] },
      { joint: '肩胛骨', movement: '上旋', description: '肩胛骨：抬手时向外旋', example: '', muscles: ['上斜方肌', '下斜方肌', '前锯肌'] },
      { joint: '肩胛骨', movement: '下旋', description: '肩胛骨：落手时向内旋', example: '', muscles: ['菱形肌', '肩胛提肌', '胸小肌'] },
    ];

    // B表：肌肉 → 关节活动 (按肌肉群分组，以肌肉+部位为主体)
    const tableB = [
      { muscleGroup: '胸', subGroup: '上胸', jointActivities: ['肩水平内收', '肩屈'] },
      { muscleGroup: '胸', subGroup: '中胸', jointActivities: ['肩水平内收'] },
      { muscleGroup: '胸', subGroup: '下胸', jointActivities: ['肩内收', '肩伸'] },
      { muscleGroup: '肩', subGroup: '肩前束', jointActivities: ['肩屈', '肩水平内收'] },
      { muscleGroup: '肩', subGroup: '肩中束', jointActivities: ['肩外展'] },
      { muscleGroup: '肩', subGroup: '肩后束', jointActivities: ['肩水平外展', '肩伸'] },
      { muscleGroup: '背', subGroup: '背阔肌', jointActivities: ['肩伸', '肩内收'] },
      { muscleGroup: '背', subGroup: '大圆肌', jointActivities: ['肩伸', '肩内收'] },
      { muscleGroup: '背', subGroup: '冈下肌', jointActivities: ['肩水平外展'] },
      { muscleGroup: '背', subGroup: '上斜方肌', jointActivities: ['肩胛骨上提'] },
      { muscleGroup: '背', subGroup: '中下斜方肌', jointActivities: ['肩胛骨后缩'] },
      { muscleGroup: '背', subGroup: '竖脊肌', jointActivities: ['脊柱伸'] },
      { muscleGroup: '臂', subGroup: '肱二头肌', jointActivities: ['肘屈', '肩屈'] },
      { muscleGroup: '臂', subGroup: '肱三头肌', jointActivities: ['肘伸'] },
      { muscleGroup: '臀', subGroup: '臀大肌', jointActivities: ['髋伸'] },
      { muscleGroup: '腿', subGroup: '股四头肌', jointActivities: ['膝伸'] },
      { muscleGroup: '腿', subGroup: '腘绳肌', jointActivities: ['髋伸', '膝屈'] },
      { muscleGroup: '腿', subGroup: '腓肠肌', jointActivities: ['足跖屈'] },
    ];

    // Images — 支持静态图和动图
    const jointMuscleImages = Array.from({ length: 13 }, (_, i) => ({
      id: `jm-${i + 1}`,
      image: `/images/joint/muscle-by-joint/joint_muscle_${String(i + 1).padStart(2, '0')}.png`,
      animatedImage: `/images/joint/animated/joint_muscle_${String(i + 1).padStart(2, '0')}.gif`,
      label: `关节活动的肌肉 图${i + 1}`,
    }));
    const muscleJointImages = Array.from({ length: 7 }, (_, i) => ({
      id: `mj-${i + 1}`,
      image: `/images/joint/joint-by-muscle/muscle_joint_${String(i + 1).padStart(2, '0')}.png`,
      animatedImage: `/images/joint/animated/muscle_joint_${String(i + 1).padStart(2, '0')}.gif`,
      label: `肌肉的关节活动 图${i + 1}`,
    }));

    res.json({
      code: 200,
      data: {
        tableA,
        tableB,
        images: { jointMuscle: jointMuscleImages, muscleJoint: muscleJointImages },
        videoUrl: 'https://www.bilibili.com/video/BV1mM6JY6Ei9',
        softwareInfo: '解剖软件：Complete Anatomy（Microsoft Store / Apple Store / 华为应用市场搜索下载）',
      },
      message: 'success',
    });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取关节活动数据失败');
  }
});

/** GET /api/knowledge/quota — 碳水化合物蛋白质配额查询 */
knowledgeRoutes.get('/quota', async (req, res: Response) => {
  try {
    const { gender, goal, height, weight } = req.query;

    // 如果是完整表查询
    if (!gender && !goal && !height && !weight) {
      const fullTable = getFullQuotaTable();
      const maleFatLossHeights = getHeightBrackets('MALE', 'FAT_LOSS');
      const maleMuscleHeights = getHeightBrackets('MALE', 'MUSCLE_GAIN');
      const femaleFatLossHeights = getHeightBrackets('FEMALE', 'FAT_LOSS');
      const femaleMuscleHeights = getHeightBrackets('FEMALE', 'MUSCLE_GAIN');
      
      // 整理为前端友好的格式
      const result: any = {};
      for (const g of ['MALE', 'FEMALE']) {
        result[g === 'MALE' ? 'male' : 'female'] = {};
        for (const gl of ['FAT_LOSS', 'MUSCLE_GAIN']) {
          const key = gl === 'FAT_LOSS' ? 'fatLoss' : 'muscleGain';
          const heights = g === 'MALE' 
            ? (gl === 'FAT_LOSS' ? maleFatLossHeights : maleMuscleHeights)
            : (gl === 'FAT_LOSS' ? femaleFatLossHeights : femaleMuscleHeights);
          
          const heightData: Record<number, Record<number, { trainingDayCarb: number; restDayCarb: number; protein: number } | null>> = {};
          for (const h of heights) {
            const weightMap = fullTable[g]?.[gl]?.[h] || {};
            heightData[h] = {};
            const weights = Object.keys(weightMap).map(Number).sort((a, b) => a - b);
            for (const w of weights) {
              heightData[h][w] = weightMap[w];
            }
          }
          result[g === 'MALE' ? 'male' : 'female'][key] = { heights, data: heightData };
        }
      }
      
      res.json({ code: 200, data: result, message: 'success' });
      return;
    }

    // 单个配额查询
    if (!gender || !goal || !height || !weight) {
      throw createError(400, '请提供 gender, goal, height, weight 参数');
    }

    const quota = lookupQuota(
      gender as string,
      goal as string,
      Number(height),
      Number(weight),
    );

    res.json({ code: 200, data: quota, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取配额数据失败');
  }
});
