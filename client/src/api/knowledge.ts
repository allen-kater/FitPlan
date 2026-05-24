import client from './client';
import type { ApiResponse, FoodDTO, QAArticleDTO, FoodCategory, QAType } from '../types';

export async function getFoods(category?: FoodCategory): Promise<ApiResponse<FoodDTO[]>> {
  const params = category ? { category } : {};
  const res = await client.get('/knowledge/foods', { params });
  return res.data;
}

export async function getQA(type?: QAType): Promise<ApiResponse<QAArticleDTO[]>> {
  const params = type ? { type } : {};
  const res = await client.get('/knowledge/qa', { params });
  return res.data;
}

export async function getStretchData(): Promise<ApiResponse<any[]>> {
  const res = await client.get('/knowledge/stretch');
  return res.data;
}

export async function getAnatomyData(): Promise<ApiResponse<any[]>> {
  const res = await client.get('/knowledge/anatomy');
  return res.data;
}
