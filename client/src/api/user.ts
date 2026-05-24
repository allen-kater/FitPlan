import client from './client';
import type { ApiResponse, BodyDataDTO, UserBodyData, WeightRecordDTO } from '../types';

export async function getProfile(): Promise<ApiResponse<{
  id: string;
  username: string;
  email: string;
  role: string;
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
