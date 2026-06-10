/** Shared TypeScript types for Frontend */

export type Gender = 'MALE' | 'FEMALE';
export type Goal = 'MUSCLE_GAIN' | 'FAT_LOSS';
export type TrainingTime = 'EARLY_MORNING' | 'LATE_MORNING' | 'BEFORE_LUNCH' | 'AFTER_LUNCH' | 'BEFORE_DINNER' | 'AFTER_DINNER' | 'NIGHT';
export type TrainingLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type FoodCategory = 'CARB' | 'PROTEIN' | 'FAT';
export type QAType = 'FAT_LOSS' | 'MUSCLE_GAIN';
export type TrainingPlanType = 'GYM_3SPLIT' | 'GYM_4SHOULDER' | 'GYM_4ARM' | 'HOME_3SPLIT';
export type PostCategory = 'CHECK_IN' | 'TRAINING' | 'DIET' | 'QUESTION' | 'EXPERIENCE';

export interface PostDTO {
  id: string;
  authorId: string;
  authorName: string;
  category: PostCategory;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostDetailDTO extends PostDTO {
  comments: CommentDTO[];
}

export interface CommentDTO {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface RankingUserDTO {
  userId: string;
  username: string;
  checkInCount: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  exp: number;
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
  trainingDayCarbQuota: number;  // 力训日碳水配额 g/kg
  restDayCarbQuota: number;      // 休息日碳水配额 g/kg
  proteinQuota: number;          // 蛋白质配额 g/kg
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

/** 关节活动 A 表：关节活动的肌肉（以关节+活动为主体） */
export interface JointActivityAItem {
  joint: string;
  movement: string;
  description: string;
  example: string;
  muscles: string[];
}

/** 关节活动 B 表：肌肉的关节活动（以肌肉+部位为主体） */
export interface JointActivityBItem {
  muscleGroup: string;
  subGroup: string;
  jointActivities: string[];
}

/** 关节活动图谱整体数据 */
export interface JointActivityData {
  tableA: JointActivityAItem[];
  tableB: JointActivityBItem[];
  images: { jointMuscle: { id: string; image: string; label: string }[]; muscleJoint: { id: string; image: string; label: string }[] };
  videoUrl: string;
  softwareInfo: string;
}

/** 训练日志 */
export interface TrainingLogDTO {
  id: string;
  userId: string;
  date: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
  createdAt: string;
}

/** 每日营养记录 */
export interface DailyNutritionDTO {
  id: string;
  userId: string;
  date: string;
  carbG: number;
  proteinG: number;
  fatG: number;
  calories: number;
  createdAt: string;
  updatedAt: string;
}

/** 成就 */
export interface AchievementDTO {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

/** 我的成就数据 */
export interface MyAchievementsDTO {
  achievements: AchievementDTO[];
  level: number;
  unlockedCount: number;
  expForNextLevel: number;
  totalAchievements: number;
}

/** 用户成就数据（包含等级信息） */
export interface UserAchievementData {
  achievements: AchievementDTO[];
  unlockedCount: number;
  level: number;
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

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  CHECK_IN: '健身打卡',
  TRAINING: '训练心得',
  DIET: '饮食分享',
  QUESTION: '问题求助',
  EXPERIENCE: '经验交流',
};

// ==================== 修仙等级 ====================

/** 修仙等级信息 */
export interface CultivationLevelDTO {
  totalLevel: number;
  tierIndex: number;
  tierName: string;
  subLevel: number;
  displayName: string;
  progress: number;
  currentLevelXP: number;
  nextLevelXP: number;
  currentXP: number;
  xpToNext: number;
  exp: number;
}

/** 经验规则 */
export interface ExpRuleDTO {
  source: string;
  label: string;
  baseXP: number;
  dailyCap: number;
  note: string;
}

/** 经验日志 */
export interface ExpLogDTO {
  id: string;
  userId: string;
  amount: number;
  source: string;
  note: string;
  createdAt: string;
}

/** 经验获取结果 */
export interface ExpResult {
  newExp: number;
  leveledUp: boolean;
  oldLevel: string;
  newLevel: string;
}

/** 境界颜色映射 */
export const TIER_COLORS: Record<number, string> = {
  0: '#9E9E9E',
  1: '#4CAF50',
  2: '#FFC107',
  3: '#9C27B0',
  4: '#F44336',
};

/** 境界图标 */
export const TIER_ICONS: Record<number, string> = {
  0: '🌱',
  1: '🏗️',
  2: '💛',
  3: '💜',
  4: '🔥',
};

// ==================== 灵宠 ====================

export type PetType = 'cat' | 'dog' | 'dragon' | 'fox';

export interface PetDTO {
  id: string;
  userId: string;
  name: string;
  type: PetType;
  adoptedAt: string;
  stage: number;
  hunger: number;
  happiness: number;
  bodyFat: number;
  weight: number;
  lastFedAt: string | null;
}

export interface PetFeedingLogDTO {
  id: string;
  petId: string;
  date: string;
  foodType: string;
  carbG: number;
  proteinG: number;
  fatG: number;
  createdAt: string;
}

export const PET_TYPE_LABELS: Record<PetType, string> = {
  cat: '灵猫',
  dog: '灵犬',
  dragon: '灵龙',
  fox: '灵狐',
};

export const PET_TYPE_EMOJI: Record<PetType, string> = {
  cat: '🐱',
  dog: '🐕',
  dragon: '🐉',
  fox: '🦊',
};
