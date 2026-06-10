import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(20, '用户名最多20个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符').max(50, '密码最多50个字符'),
});

export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
});

export const bodyDataSchema = z.object({
  gender: z.enum(['MALE', 'FEMALE']),
  height: z.number().min(100, '身高不能小于100cm').max(250, '身高不能超过250cm'),
  weight: z.number().min(30, '体重不能小于30kg').max(300, '体重不能超过300kg'),
  age: z.number().min(10, '年龄不能小于10岁').max(100, '年龄不能超过100岁'),
  goal: z.enum(['MUSCLE_GAIN', 'FAT_LOSS']),
  trainingTime: z.enum([
    'EARLY_MORNING', 'LATE_MORNING', 'BEFORE_LUNCH',
    'AFTER_LUNCH', 'BEFORE_DINNER', 'AFTER_DINNER', 'NIGHT',
  ]),
  trainingLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  hasCardio: z.boolean().default(false),
  cardioHeartRate: z.number().optional(),
  restingHeartRate: z.number().optional(),
  cardioDuration: z.number().optional(),
  proteinQuota: z.number().min(1.0).max(3.0).optional(),
});

export const weightRecordSchema = z.object({
  weight: z.number().min(30, '体重不能小于30kg').max(300, '体重不能超过300kg'),
  recordedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
});

export const strengthPredictSchema = z.object({
  weight: z.number().positive('配重必须为正数'),
  reps: z.number().int().min(1, '次数至少为1').max(30, '次数最多为30'),
});

export const trainingLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  exerciseName: z.string().min(1, '请输入动作名称').max(100),
  sets: z.number().int().min(1, '组数至少1组').max(20, '组数最多20组'),
  reps: z.number().int().min(1, '次数至少1次').max(100),
  weight: z.number().min(0, '重量不能为负数').max(500, '重量不能超过500kg'),
  notes: z.string().max(500).optional(),
});

export const dailyNutritionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  carbG: z.number().min(0, '碳水不能为负数'),
  proteinG: z.number().min(0, '蛋白质不能为负数'),
  fatG: z.number().min(0, '脂肪不能为负数'),
  calories: z.number().min(0, '热量不能为负数').optional().default(0),
});

export const generatePlanSchema = bodyDataSchema;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BodyDataInput = z.infer<typeof bodyDataSchema>;
export type WeightRecordInput = z.infer<typeof weightRecordSchema>;
export type StrengthPredictInput = z.infer<typeof strengthPredictSchema>;
export type TrainingLogInput = z.infer<typeof trainingLogSchema>;
export type DailyNutritionInput = z.infer<typeof dailyNutritionSchema>;
