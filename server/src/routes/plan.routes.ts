import { Router, Response } from 'express';
import { prisma } from '../index.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generatePlanSchema } from '../validators/index.js';
import { generatePlanCalculation } from '../services/plan-generator.service.js';
import { distributeMeals } from '../services/meal-distributor.service.js';
import { createError } from '../middleware/errorHandler.js';

export const planRoutes = Router();

/** POST /api/plans/generate */
planRoutes.post('/generate', authMiddleware, validate(generatePlanSchema), async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const userId = req.user!.id;

    // Save or get body data
    const bodyData = await prisma.userBodyData.create({
      data: {
        userId,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        age: data.age,
        goal: data.goal,
        trainingTime: data.trainingTime,
        trainingLevel: data.trainingLevel,
        hasCardio: data.hasCardio ?? false,
        cardioHeartRate: data.cardioHeartRate ?? null,
        restingHeartRate: data.restingHeartRate ?? null,
        cardioDuration: data.cardioDuration ?? null,
      },
    });

    // Run the 8-step algorithm
    const calculation = generatePlanCalculation(data);

    // Distribute meals
    const { trainingDayMeals, restDayMeals } = distributeMeals(
      data.goal,
      data.trainingTime,
      calculation.trainingDayCarbG,
      calculation.restDayCarbG,
      calculation.proteinG,
      calculation.fatG,
    );

    // Generate exercise advice and precautions
    const exerciseAdvice = generateExerciseAdvice(data.goal, data.trainingLevel, data.trainingTime);
    const precautions = generatePrecautions(data.goal, data.gender);

    // Save plan
    const plan = await prisma.fitnessPlan.create({
      data: {
        userId,
        bodyDataId: bodyData.id,
        bmi: calculation.bmi,
        bmr: calculation.bmr,
        tdee: calculation.tdee,
        trainingCalorie: calculation.trainingCalorie,
        cardioCalorie: calculation.cardioCalorie,
        trainingDayMaintenance: calculation.trainingDayMaintenance,
        restDayMaintenance: calculation.restDayMaintenance,
        trainingDayTarget: calculation.trainingDayTarget,
        restDayTarget: calculation.restDayTarget,
        proteinG: calculation.proteinG,
        fatG: calculation.fatG,
        trainingDayCarbG: calculation.trainingDayCarbG,
        restDayCarbG: calculation.restDayCarbG,
        planType: calculation.planType,
        trainingDayMeals: JSON.stringify(trainingDayMeals),
        restDayMeals: JSON.stringify(restDayMeals),
        exerciseAdvice: JSON.stringify(exerciseAdvice),
        precautions: JSON.stringify(precautions),
      },
    });

    // Return with parsed JSON fields
    const result = {
      ...plan,
      trainingDayMeals: JSON.parse(plan.trainingDayMeals),
      restDayMeals: JSON.parse(plan.restDayMeals),
      exerciseAdvice: JSON.parse(plan.exerciseAdvice),
      precautions: JSON.parse(plan.precautions),
    };

    res.status(201).json({ code: 201, data: result, message: '方案生成成功' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    console.error('Plan generation error:', error);
    throw createError(500, '方案生成失败');
  }
});

/** GET /api/plans */
planRoutes.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plans = await prisma.fitnessPlan.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { bodyData: true },
    });
    const result = plans.map((plan) => ({
      ...plan,
      trainingDayMeals: JSON.parse(plan.trainingDayMeals),
      restDayMeals: JSON.parse(plan.restDayMeals),
      exerciseAdvice: JSON.parse(plan.exerciseAdvice),
      precautions: JSON.parse(plan.precautions),
    }));
    res.json({ code: 200, data: result, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取方案列表失败');
  }
});

/** GET /api/plans/:id */
planRoutes.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.fitnessPlan.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { bodyData: true },
    });
    if (!plan) {
      throw createError(404, '方案不存在');
    }
    const result = {
      ...plan,
      trainingDayMeals: JSON.parse(plan.trainingDayMeals),
      restDayMeals: JSON.parse(plan.restDayMeals),
      exerciseAdvice: JSON.parse(plan.exerciseAdvice),
      precautions: JSON.parse(plan.precautions),
    };
    res.json({ code: 200, data: result, message: 'success' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '获取方案详情失败');
  }
});

/** DELETE /api/plans/:id */
planRoutes.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.fitnessPlan.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });
    if (!plan) {
      throw createError(404, '方案不存在');
    }
    await prisma.fitnessPlan.delete({ where: { id: req.params.id } });
    res.json({ code: 200, data: null, message: '方案已删除' });
  } catch (error) {
    if ((error as any).statusCode) throw error;
    throw createError(500, '删除方案失败');
  }
});

/** Generate exercise advice based on goal and level */
function generateExerciseAdvice(goal: string, level: string, trainingTime: string): string[] {
  const advice: string[] = [];

  if (goal === 'FAT_LOSS') {
    advice.push('建议每周进行3-4次力量训练，配合2-3次有氧运动');
    advice.push('有氧运动建议选择快走、椭圆机等低冲击运动');
    if (level === 'BEGINNER') {
      advice.push('初学者建议从器械固定动作开始，掌握正确姿势');
      advice.push('每个动作做3组，每组10-12次');
    } else if (level === 'INTERMEDIATE') {
      advice.push('中级训练者可以加入超级组和递减组');
      advice.push('每个动作做4组，每组8-12次');
    } else {
      advice.push('高级训练者可以尝试力竭训练和休息-暂停法');
      advice.push('每个动作做4-5组，包括不同次数范围');
    }
  } else {
    advice.push('建议每周进行4-5次力量训练，以渐进超负荷为原则');
    advice.push('增肌期确保充足睡眠，每晚7-9小时');
    if (level === 'BEGINNER') {
      advice.push('初学者建议全身训练或上下肢分化');
      advice.push('每个动作做3组，每组8-12次');
    } else if (level === 'INTERMEDIATE') {
      advice.push('中级训练者建议使用推拉腿分化');
      advice.push('每个动作做4组，包括大重量和轻重量日');
    } else {
      advice.push('高级训练者可以使用双重分化或专项分化');
      advice.push('重视离心控制和顶峰收缩');
    }
  }

  const timeAdvice: Record<string, string> = {
    EARLY_MORNING: '晨练前确保充分热身，建议摄入少量碳水',
    LATE_MORNING: '上午训练精力充沛，适合安排大重量训练',
    BEFORE_LUNCH: '午餐前训练注意低血糖风险',
    AFTER_LUNCH: '午餐后1-2小时再训练，避免消化不良',
    BEFORE_DINNER: '下午训练是力量高峰期，适合大重量',
    AFTER_DINNER: '晚餐后训练注意不要过晚，影响睡眠',
    NIGHT: '夜间训练后注意拉伸放松，避免影响睡眠质量',
  };
  if (timeAdvice[trainingTime]) {
    advice.push(timeAdvice[trainingTime]);
  }

  return advice;
}

/** Generate precautions based on goal and gender */
function generatePrecautions(goal: string, gender: string): string[] {
  const precautions: string[] = [];

  precautions.push('训练前充分热身5-10分钟');
  precautions.push('训练后进行充分拉伸');

  if (goal === 'FAT_LOSS') {
    precautions.push('减脂期不要过度节食，确保基础代谢所需营养');
    precautions.push('体重下降速度建议控制在每周0.5-1kg');
    precautions.push('注意补充足够水分，每天至少2L');
    if (gender === 'FEMALE') {
      precautions.push('女性减脂期注意维持正常生理周期');
    }
  } else {
    precautions.push('增肌期确保热量盈余，但不要暴饮暴食');
    precautions.push('重视蛋白质摄入的时机，尤其是练后30分钟内');
    precautions.push('不要忽视脂肪摄入，适量健康脂肪有助于激素分泌');
    if (gender === 'MALE') {
      precautions.push('增肌期保证充足睡眠，促进睾酮分泌和肌肉恢复');
    }
  }

  return precautions;
}
