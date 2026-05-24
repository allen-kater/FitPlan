/** Shared TypeScript types for Frontend */

export type Gender = 'MALE' | 'FEMALE';
export type Goal = 'MUSCLE_GAIN' | 'FAT_LOSS';
export type TrainingTime = 'EARLY_MORNING' | 'LATE_MORNING' | 'BEFORE_LUNCH' | 'AFTER_LUNCH' | 'BEFORE_DINNER' | 'AFTER_DINNER' | 'NIGHT';
export type TrainingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type FoodCategory = 'CARB' | 'PROTEIN' | 'FAT';
export type QAType = 'FAT_LOSS' | 'MUSCLE_GAIN';
export type TrainingPlanType = 'GYM_3SPLIT' | 'GYM_4SHOULDER' | 'GYM_4ARM' | 'HOME_3SPLIT';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BodyDataDTO {
  gender: Gender;
  height: number;
  weight: number;
  age: number;
  goal: Goal;
  trainingTime: TrainingTime;
  trainingLevel: TrainingLevel;
  hasCardio: boolean;
  cardioHeartRate?: number;
  restingHeartRate?: number;
  cardioDuration?: number;
  proteinQuota?: number;
}

export interface UserBodyData {
  id: string;
  userId: string;
  gender: Gender;
  height: number;
  weight: number;
  age: number;
  goal: Goal;
  trainingTime: TrainingTime;
  trainingLevel: TrainingLevel;
  hasCardio: boolean;
  cardioHeartRate?: number;
  restingHeartRate?: number;
  cardioDuration?: number;
  createdAt: string;
}

export interface MealItem {
  name: string;
  carbRatio: number;
  proteinRatio: number;
  fatRatio: number;
  carbG?: number;
  proteinG?: number;
  fatG?: number;
}

export interface FitnessPlanDTO {
  id: string;
  userId: string;
  bodyDataId: string;
  bmi: number;
  bmr: number;
  tdee: number;
  trainingCalorie: number;
  cardioCalorie: number;
  trainingDayMaintenance: number;
  restDayMaintenance: number;
  trainingDayTarget: number;
  restDayTarget: number;
  proteinG: number;
  fatG: number;
  trainingDayCarbG: number;
  restDayCarbG: number;
  planType: string;
  trainingDayMeals: MealItem[];
  restDayMeals: MealItem[];
  exerciseAdvice: string[];
  precautions: string[];
  createdAt: string;
  bodyData?: UserBodyData;
}

export interface WeightRecordDTO {
  id: string;
  userId: string;
  weight: number;
  recordedAt: string;
  createdAt: string;
}

export interface FoodDTO {
  id: string;
  name: string;
  category: FoodCategory;
  nutritionRate: number;
  giIndex?: number;
  description: string;
}

export interface QAArticleDTO {
  id: string;
  type: QAType;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface TrainingPlanDTO {
  id: string;
  type: TrainingPlanType;
  dayNumber: number;
  groupName: string;
  exercises: ExerciseItem[];
}

export interface StrengthPredictionResult {
  formula: string;
  oneRM: number;
  percentages: Record<string, number>;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  users: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Label mappings */
export const GENDER_LABELS: Record<Gender, string> = {
  MALE: '男',
  FEMALE: '女',
};

export const GOAL_LABELS: Record<Goal, string> = {
  FAT_LOSS: '减脂',
  MUSCLE_GAIN: '增肌',
};

export const TRAINING_TIME_LABELS: Record<TrainingTime, string> = {
  EARLY_MORNING: '早起后练(6:00-8:00)',
  LATE_MORNING: '上午练(8:00-11:00)',
  BEFORE_LUNCH: '午饭前练(11:00-12:00)',
  AFTER_LUNCH: '午饭后练(13:00-15:00)',
  BEFORE_DINNER: '晚饭前练(16:00-18:00)',
  AFTER_DINNER: '晚饭后练(18:00-20:00)',
  NIGHT: '夜间练(20:00-22:00)',
};

export const TRAINING_LEVEL_LABELS: Record<TrainingLevel, string> = {
  BEGINNER: '新手(0-6个月)',
  INTERMEDIATE: '中级(6个月-2年)',
  ADVANCED: '高级(2年以上)',
};

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  CARB: '碳水',
  PROTEIN: '蛋白质',
  FAT: '脂肪',
};

export const TRAINING_PLAN_TYPE_LABELS: Record<TrainingPlanType, string> = {
  GYM_3SPLIT: '健身房三分化(推/拉/腿)',
  GYM_4SHOULDER: '健身房四分化(肩专项)',
  GYM_4ARM: '健身房四分化(手臂专项)',
  HOME_3SPLIT: '居家三分化',
};
