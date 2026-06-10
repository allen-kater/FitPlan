import client from './client';
import type { ApiResponse, PetDTO, PetFeedingLogDTO } from '../types';

export async function getMyPet(): Promise<ApiResponse<PetDTO | null>> {
  const res = await client.get('/pet');
  return res.data;
}

export async function adoptPet(name: string, type: string): Promise<ApiResponse<PetDTO>> {
  const res = await client.post('/pet/adopt', { name, type });
  return res.data;
}

export async function feedPet(date: string): Promise<ApiResponse<PetDTO>> {
  const res = await client.post('/pet/feed', { date });
  return res.data;
}

export async function getFeedingLogs(): Promise<ApiResponse<PetFeedingLogDTO[]>> {
  const res = await client.get('/pet/feeding-logs');
  return res.data;
}
