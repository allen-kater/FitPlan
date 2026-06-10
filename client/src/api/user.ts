import client from './client';
import type { ApiResponse, BodyDataDTO, UserBodyData, WeightRecordDTO, CultivationLevelDTO, ExpLogDTO, ExpRuleDTO } from '../types';

export async function getProfile(): Promise<ApiResponse<{
  id: string;
  username: string;
  email: string;
  role: string;
  exp: number;
  createdAt: string;
  bodyData: UserBodyData[];
}>> {
  const res = await client.get('/users/profile');
  return res.data;
}

export async function updateBodyData(data: BodyDataDTO): Promise<ApiResponse<UserBodyData>> {
  const res = await client.put('/users/body-data', data);
  return res.data;
}

export async function addWeightRecord(weight: number, recordedAt: string): Promise<ApiResponse<WeightRecordDTO>> {
  const res = await client.post('/users/weight', { weight, recordedAt });
  return res.data;
}

export async function getWeightRecords(): Promise<ApiResponse<WeightRecordDTO[]>> {
  const res = await client.get('/users/weight-records');
  return res.data;
}

/** 修仙等级 */
export async function getLevel(): Promise<ApiResponse<CultivationLevelDTO>> {
  const res = await client.get('/users/level');
  return res.data;
}

/** 经验历史 */
export async function getExpLog(limit = 20): Promise<ApiResponse<ExpLogDTO[]>> {
  const res = await client.get('/users/exp/log', { params: { limit } });
  return res.data;
}

/** 经验规则 */
export async function getExpRules(): Promise<ApiResponse<ExpRuleDTO[]>> {
  const res = await client.get('/users/exp/rules');
  return res.data;
}
