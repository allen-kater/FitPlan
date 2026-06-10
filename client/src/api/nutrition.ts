import client from './client';
import type { ApiResponse, DailyNutritionDTO } from '../types';

/** 记录/更新当日营养素 */
export async function saveNutrition(data: {
  date: string;
  carbG: number;
  proteinG: number;
  fatG: number;
  calories: number;
}): Promise<ApiResponse<DailyNutritionDTO>> {
  const res = await client.post('/nutrition', data);
  return res.data;
}

/** 查询当日营养素 */
export async function getNutritionByDate(date: string): Promise<ApiResponse<DailyNutritionDTO | null>> {
  const res = await client.get('/nutrition', { params: { date } });
  return res.data;
}

/** 查询日期范围营养素 */
export async function getNutritionRange(start: string, end: string): Promise<ApiResponse<DailyNutritionDTO[]>> {
  const res = await client.get('/nutrition', { params: { startDate: start, endDate: end } });
  return res.data;
}
