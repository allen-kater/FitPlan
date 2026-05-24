import client from './client';
import type { ApiResponse, AuthResponse } from '../types';

export async function register(username: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const res = await client.post('/auth/register', { username, email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
  const res = await client.post('/auth/login', { email, password });
  return res.data;
}

export async function getMe(): Promise<ApiResponse<{ id: string; username: string; email: string; role: string }>> {
  const res = await client.get('/auth/me');
  return res.data;
}
