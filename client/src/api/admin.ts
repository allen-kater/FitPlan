import client from './client';
import type { ApiResponse, User, PaginatedResponse } from '../types';

export async function getUsers(page: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedResponse<User & { _count: { plans: number; weightRecords: number } }>>> {
  const res = await client.get('/admin/users', { params: { page, pageSize } });
  return res.data;
}

export async function getUserDetail(id: string): Promise<ApiResponse<any>> {
  const res = await client.get(`/admin/users/${id}`);
  return res.data;
}

export async function getStats(): Promise<ApiResponse<{ userCount: number; planCount: number; todayLogins: number }>> {
  const res = await client.get('/admin/stats');
  return res.data;
}
