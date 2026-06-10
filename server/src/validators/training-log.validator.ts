import { z } from 'zod';

/** 创建训练日志验证器 */
export const createTrainingLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  exerciseName: z.string().min(1, '动作名称不能为空').max(100, '动作名称最多100个字符'),
  sets: z.number().int().min(1, '组数至少为1').max(50, '组数最多50'),
  reps: z.number().int().min(1, '每组次数至少为1').max(100, '每组次数最多100'),
  weight: z.number().min(0, '重量不能为负数').max(1000, '重量不能超过1000kg'),
  notes: z.string().max(500, '备注最多500个字符').optional(),
});

/** 更新训练日志验证器 */
export const updateTrainingLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD').optional(),
  exerciseName: z.string().min(1, '动作名称不能为空').max(100, '动作名称最多100个字符').optional(),
  sets: z.number().int().min(1, '组数至少为1').max(50, '组数最多50').optional(),
  reps: z.number().int().min(1, '每组次数至少为1').max(100, '每组次数最多100').optional(),
  weight: z.number().min(0, '重量不能为负数').max(1000, '重量不能超过1000kg').optional(),
  notes: z.string().max(500, '备注最多500个字符').optional().nullable(),
});

export type CreateTrainingLogInput = z.infer<typeof createTrainingLogSchema>;
export type UpdateTrainingLogInput = z.infer<typeof updateTrainingLogSchema>;
