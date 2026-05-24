import client from './client';
import type { ApiResponse, BodyDataDTO, FitnessPlanDTO } from '../types';

export async function generatePlan(data: BodyDataDTO): Promise<ApiResponse<FitnessPlanDTO>> {
  const res = await client.post('/plans/generate', data);
  return res.data;
}

export async function getPlans(): Promise<ApiResponse<FitnessPlanDTO[]>> {
  const res = await client.get('/plans');
  return res.data;
}

export async function getPlanById(id: string): Promise<ApiResponse<FitnessPlanDTO>> {
  const res = await client.get(`/plans/${id}`);
  return res.data;
}

export async function deletePlan(id: string): Promise<ApiResponse<null>> {
  const res = await client.delete(`/plans/${id}`);
  return res.data;
}
