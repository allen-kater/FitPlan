import client from './client';
import type { ApiResponse, TrainingLogDTO } from '../types';

export async function createTrainingLog(data: Omit<TrainingLogDTO, 'id' | 'userId' | 'createdAt'>): Promise<ApiResponse<TrainingLogDTO>> {
  const res = await client.post('/training-logs', data);
  return res.data;
}

export async function getTrainingLogs(params?: { date?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<TrainingLogDTO[]>> {
  const res = await client.get('/training-logs', { params });
  return res.data;
}

export async function updateTrainingLog(id: string, data: Partial<TrainingLogDTO>): Promise<ApiResponse<TrainingLogDTO>> {
  const res = await client.put(`/training-logs/${id}`, data);
  return res.data;
}

export async function deleteTrainingLog(id: string): Promise<ApiResponse<null>> {
  const res = await client.delete(`/training-logs/${id}`);
  return res.data;
}
