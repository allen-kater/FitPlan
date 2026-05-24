import client from './client';
import type { ApiResponse, TrainingPlanDTO, TrainingPlanType, StrengthPredictionResult } from '../types';

export async function getTrainingPlans(): Promise<ApiResponse<TrainingPlanDTO[]>> {
  const res = await client.get('/training/plans');
  return res.data;
}

export async function getTrainingPlanByType(type: TrainingPlanType): Promise<ApiResponse<TrainingPlanDTO[]>> {
  const res = await client.get(`/training/plans/${type}`);
  return res.data;
}

export async function predictStrength(weight: number, reps: number): Promise<ApiResponse<StrengthPredictionResult[]>> {
  const res = await client.post('/training/strength-predict', { weight, reps });
  return res.data;
}
