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
    const upperStretch = [
      { id: 'us-1', name: '胸部拉伸 1', targetMuscle: '胸大肌', image: '/images/stretch/upper/upper_stretch_01.png', position: '上身' },
      { id: 'us-2', name: '胸部拉伸 2', targetMuscle: '胸大肌', image: '/images/stretch/upper/upper_stretch_02.png', position: '上身' },
      { id: 'us-3', name: '肩部拉伸 1', targetMuscle: '三角肌', image: '/images/stretch/upper/upper_stretch_03.png', position: '上身' },
      { id: 'us-4', name: '肩部拉伸 2', targetMuscle: '三角肌', image: '/images/stretch/upper/upper_stretch_04.png', position: '上身' },
      { id: 'us-5', name: '背阔肌拉伸 1', targetMuscle: '背阔肌', image: '/images/stretch/upper/upper_stretch_05.png', position: '上身' },
      { id: 'us-6', name: '背阔肌拉伸 2', targetMuscle: '背阔肌', image: '/images/stretch/upper/upper_stretch_06.png', position: '上身' },
      { id: 'us-7', name: '肱二头肌拉伸', targetMuscle: '肱二头肌', image: '/images/stretch/upper/upper_stretch_07.png', position: '上身' },
      { id: 'us-8', name: '肱三头肌拉伸', targetMuscle: '肱三头肌', image: '/images/stretch/upper/upper_stretch_08.png', position: '上身' },
      { id: 'us-9', name: '前臂拉伸', targetMuscle: '前臂肌群', image: '/images/stretch/upper/upper_stretch_09.png', position: '上身' },
      { id: 'us-10', name: '斜方肌拉伸', targetMuscle: '斜方肌', image: '/images/stretch/upper/upper_stretch_10.png', position: '上身' },
      { id: 'us-11', name: '肩胛骨周围拉伸', targetMuscle: '菱形肌/肩胛提肌', image: '/images/stretch/upper/upper_stretch_11.png', position: '上身' },
    ];
    const lowerStretch = [
      { id: 'ls-1', name: '股四头肌拉伸', targetMuscle: '股四头肌', image: '/images/stretch/lower/lower_stretch_01.png', position: '下身' },
      { id: 'ls-2', name: '腘绳肌拉伸', targetMuscle: '腘绳肌', image: '/images/stretch/lower/lower_stretch_02.png', position: '下身' },
      { id: 'ls-3', name: '臀部拉伸', targetMuscle: '臀大肌', image: '/images/stretch/lower/lower_stretch_03.png', position: '下身' },
      { id: 'ls-4', name: '小腿拉伸', targetMuscle: '腓肠肌/比目鱼肌', image: '/images/stretch/lower/lower_stretch_04.png', position: '下身' },
    ];
    res.json({
      code: 200,
      data: {
        upper: upperStretch,
        lower: lowerStretch,
        attribution: '拉伸图片由 Joe Muscolino 博士绘制，经授权用于公众教育',
      },
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

    // B表：肌肉 → 关节活动 (按肌肉群分组)
    const tableB = {
      chestShoulder: {
        label: '练胸肩：做肩关节活动',
        headers: ['关节活动', '通俗描述', '中胸', '上胸', '下胸', '肩前束', '肩中束', '肩后束'],
        rows: [
          { joint: '肩关节', movement: '屈', description: '大臂：后→前', muscles: { '上胸': '√ 前平举', '肩前束': '√ 前平举' } },
          { joint: '肩关节', movement: '伸', description: '大臂：前→后', muscles: { '下胸': '√ 仰卧直臂上拉', '肩后束': '√ 哑铃划船' } },
          { joint: '肩关节', movement: '外展', description: '大臂：内→外', muscles: { '肩中束': '√ 侧平举' } },
          { joint: '肩关节', movement: '内收', description: '大臂：外→内', muscles: { '下胸': '√ 龙门架下夹胸' } },
          { joint: '肩关节', movement: '水平外展', description: '大臂：在水平面，内→外', muscles: { '肩后束': '√ 蝴蝶机反向飞鸟' } },
          { joint: '肩关节', movement: '水平内收', description: '大臂：在水平面，外→内', muscles: { '中胸': '√ 蝴蝶机夹胸', '上胸': '√ 蝴蝶机夹胸', '肩前束': '√ 蝴蝶机夹胸' } },
        ],
      },
      back: {
        label: '练背：做肩关节活动',
        headers: ['关节活动', '通俗描述', '背阔肌', '大圆肌', '冈下肌', '斜方肌'],
        rows: [
          { joint: '肩关节', movement: '伸', description: '大臂：前→后', muscles: { '背阔肌': '√ 窄握引体下拉', '大圆肌': '√ 窄握引体/下拉' } },
          { joint: '肩关节', movement: '内收', description: '大臂：外→内', muscles: { '背阔肌': '√ 宽握引体下拉', '大圆肌': '√ 宽握引体/下拉' } },
          { joint: '肩关节', movement: '水平外展', description: '大臂：在水平面，内→外', muscles: { '冈下肌': '√ 蝴蝶机反向飞鸟' } },
        ],
      },
      arms: {
        label: '练手臂：做肘关节活动',
        headers: ['关节活动', '通俗描述', '肱二头肌', '肱肌', '肱桡肌', '肱三头肌'],
        rows: [
          { joint: '肘关节', movement: '屈', description: '肘关节：打直→折叠', muscles: { '肱二头肌': '√ 正手弯举', '肱肌': '√ 反手弯举', '肱桡肌': '√ 锤式弯举' } },
          { joint: '肘关节', movement: '伸', description: '肘关节：折叠→打直', muscles: { '肱三头肌': '√ 各种臂屈伸' } },
        ],
      },
      legs: {
        label: '练腿：做髋膝踝关节活动',
        headers: ['关节活动', '通俗描述', '股四头肌', '腘绳肌', '臀大肌', '腓肠肌', '比目鱼肌'],
        rows: [
          { joint: '髋关节', movement: '伸', description: '髋关节：折叠→打直', muscles: { '腘绳肌': '√ 硬拉', '臀大肌': '√ 臀冲' } },
          { joint: '膝关节', movement: '屈', description: '膝关节：打直→折叠', muscles: { '腘绳肌': '√ 器械腿弯举', '腓肠肌': '√ 器械腿弯举' } },
          { joint: '膝关节', movement: '伸', description: '膝关节：折叠→打直', muscles: { '股四头肌': '√ 器械腿屈伸' } },
          { joint: '踝关节', movement: '足跖屈', description: '足背与小腿：折叠→打直', muscles: { '腓肠肌': '√ 提踵', '比目鱼肌': '√ 提踵' } },
        ],
      },
    };

    // Images
    const jointMuscleImages = Array.from({ length: 13 }, (_, i) => ({
      id: `jm-${i + 1}`,
      image: `/images/joint/muscle-by-joint/joint_muscle_${String(i + 1).padStart(2, '0')}.png`,
      label: `关节活动的肌肉 图${i + 1}`,
    }));
    const muscleJointImages = Array.from({ length: 7 }, (_, i) => ({
      id: `mj-${i + 1}`,
      image: `/images/joint/joint-by-muscle/muscle_joint_${String(i + 1).padStart(2, '0')}.png`,
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
