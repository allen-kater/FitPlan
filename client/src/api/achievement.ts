import client from './client';
import type { ApiResponse, AchievementDTO, MyAchievementsDTO } from '../types';

export async function getAllAchievements(): Promise<ApiResponse<AchievementDTO[]>> {
  const res = await client.get('/achievements');
  return res.data;
}

export async function getMyAchievements(): Promise<ApiResponse<MyAchievementsDTO>> {
  const res = await client.get('/achievements/my');
  return res.data;
}

export async function checkAchievements(): Promise<ApiResponse<{ newlyUnlocked: string[]; count: number }>> {
  const res = await client.post('/achievements/check');
  return res.data;
}
