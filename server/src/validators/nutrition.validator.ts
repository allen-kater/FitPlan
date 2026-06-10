import { z } from 'zod';

/** 记录/更新每日营养素验证器 */
export const upsertNutritionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD'),
  carbG: z.number().min(0, '碳水不能为负数').max(2000, '碳水不能超过2000g'),
  proteinG: z.number().min(0, '蛋白质不能为负数').max(1000, '蛋白质不能超过1000g'),
  fatG: z.number().min(0, '脂肪不能为负数').max(500, '脂肪不能超过500g'),
  calories: z.number().min(0, '热量不能为负数').max(15000, '热量不能超过15000kcal'),
});

/** 日期范围查询验证器 */
export const nutritionRangeQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '开始日期格式应为 YYYY-MM-DD'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '结束日期格式应为 YYYY-MM-DD'),
});

export type UpsertNutritionInput = z.infer<typeof upsertNutritionSchema>;
export type NutritionRangeQueryInput = z.infer<typeof nutritionRangeQuerySchema>;
