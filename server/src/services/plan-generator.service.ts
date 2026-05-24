import { BodyDataInput } from '../validators/index.js';

/** Gender-specific training calorie constants */
const TRAINING_CALORIE_MAP: Record<string, Record<string, number>> = {
  MALE: { BEGINNER: 150, INTERMEDIATE: 200, ADVANCED: 250 },
  FEMALE: { BEGINNER: 100, INTERMEDIATE: 150, ADVANCED: 200 },
};

/** Goal multiplier for target calories */
const GOAL_MULTIPLIER: Record<string, number> = {
  FAT_LOSS: 0.64,
  MUSCLE_GAIN: 0.84,
};

/** Default fat grams by gender and goal */
const DEFAULT_FAT_GRAMS: Record<string, Record<string, number>> = {
  MALE: { FAT_LOSS: 60, MUSCLE_GAIN: 80 },
  FEMALE: { FAT_LOSS: 50, MUSCLE_GAIN: 70 },
};

/** Default protein quotas by goal */
const DEFAULT_PROTEIN_QUOTAS: Record<string, { trainingDay: number; restDay: number }> = {
  FAT_LOSS: { trainingDay: 1.8, restDay: 1.6 },
  MUSCLE_GAIN: { trainingDay: 2.0, restDay: 1.8 },
};

export interface PlanCalculationResult {
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
}

/**
 * Step 1: Calculate BMI
 * BMI = weight / (height_m)^2
 */
export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

/**
 * Step 2: Calculate BMR using Mifflin-St Jeor equation
 * Male: weight × 9.99 + height × 6.25 - age × 4.92 + 5
 * Female: weight × 9.99 + height × 6.25 - age × 4.92 - 161
 */
export function calculateBMR(weight: number, heightCm: number, age: number, gender: string): number {
  const base = weight * 9.99 + heightCm * 6.25 - age * 4.92;
  return gender === 'MALE' ? base + 5 : base - 161;
}

/**
 * Step 3: Calculate TDEE (no exercise total expenditure)
 * TDEE = BMR / 0.7
 */
export function calculateTDEE(bmr: number): number {
  return bmr / 0.7;
}

/**
 * Step 4: Calculate training calorie burn
 * Based on gender and training level
 */
export function calculateTrainingCalorie(gender: string, trainingLevel: string): number {
  return TRAINING_CALORIE_MAP[gender]?.[trainingLevel] ?? 150;
}

/**
 * Step 5: Calculate cardio calorie burn
 * Formula: (exerciseHR / restingHR × 6.4 - 6.2) × weight × duration(min) / 7
 * Only calculated when goal is FAT_LOSS and weight < 80kg
 */
export function calculateCardioCalorie(
  exerciseHR: number | null | undefined,
  restingHR: number | null | undefined,
  duration: number | null | undefined,
  weight: number,
  goal: string,
  hasCardio: boolean,
): number {
  if (!hasCardio || goal !== 'FAT_LOSS' || weight >= 80) {
    return 0;
  }
  if (!exerciseHR || !restingHR || !duration) {
    return 0;
  }
  const factor = (exerciseHR / restingHR) * 6.4 - 6.2;
  return factor * weight * duration / 7;
}

/**
 * Step 6: Calculate maintenance calories
 * Training day: TDEE + trainingCalorie + cardioCalorie
 * Rest day: TDEE + cardioCalorie
 */
export function calculateMaintenanceCalories(
  tdee: number,
  trainingCalorie: number,
  cardioCalorie: number,
): { trainingDayMaintenance: number; restDayMaintenance: number } {
  return {
    trainingDayMaintenance: tdee + trainingCalorie + cardioCalorie,
    restDayMaintenance: tdee + cardioCalorie,
  };
}

/**
 * Step 7: Calculate target calories
 * FAT_LOSS: maintenance × 0.64
 * MUSCLE_GAIN: maintenance × 0.84
 */
export function calculateTargetCalories(
  trainingDayMaintenance: number,
  restDayMaintenance: number,
  goal: string,
): { trainingDayTarget: number; restDayTarget: number } {
  const multiplier = GOAL_MULTIPLIER[goal] ?? 0.64;
  return {
    trainingDayTarget: Math.round(trainingDayMaintenance * multiplier),
    restDayTarget: Math.round(restDayMaintenance * multiplier),
  };
}

/**
 * Step 8: Calculate macronutrients
 * Protein = weight × quota (user input or default)
 * Fat = gender+goal specific default
 * Carb = (remaining calories) / 4
 */
export function calculateMacronutrients(
  trainingDayTarget: number,
  restDayTarget: number,
  weight: number,
  gender: string,
  goal: string,
  proteinQuota?: number,
): { proteinG: number; fatG: number; trainingDayCarbG: number; restDayCarbG: number } {
  const quota = proteinQuota ?? DEFAULT_PROTEIN_QUOTAS[goal]?.trainingDay ?? 1.8;
  const proteinG = Math.round(weight * quota);
  const fatG = DEFAULT_FAT_GRAMS[gender]?.[goal] ?? 60;
  const proteinCalories = proteinG * 4;
  const fatCalories = fatG * 9;

  const trainingDayCarbG = Math.round((trainingDayTarget - proteinCalories - fatCalories) / 4);
  const restDayCarbG = Math.round((restDayTarget - proteinCalories - fatCalories) / 4);

  return { proteinG, fatG, trainingDayCarbG, restDayCarbG };
}

/**
 * Determine plan type code based on goal and training time
 * FAT_LOSS: F-01 ~ F-08
 * MUSCLE_GAIN: M-01 ~ M-07
 */
export function determinePlanType(goal: string, trainingTime: string, hasCardio: boolean): string {
  if (goal === 'FAT_LOSS') {
    const mapping: Record<string, string> = {
      EARLY_MORNING: hasCardio ? 'F-01' : 'F-02',
      LATE_MORNING: hasCardio ? 'F-03' : 'F-04',
      BEFORE_LUNCH: 'F-05',
      AFTER_LUNCH: 'F-06',
      BEFORE_DINNER: 'F-07',
      AFTER_DINNER: 'F-08',
      NIGHT: 'F-08',
    };
    return mapping[trainingTime] ?? 'F-01';
  } else {
    const mapping: Record<string, string> = {
      EARLY_MORNING: 'M-01',
      LATE_MORNING: 'M-02',
      BEFORE_LUNCH: 'M-03',
      AFTER_LUNCH: 'M-04',
      BEFORE_DINNER: 'M-05',
      AFTER_DINNER: 'M-06',
      NIGHT: 'M-07',
    };
    return mapping[trainingTime] ?? 'M-01';
  }
}

/**
 * Complete plan generation calculation
 */
export function generatePlanCalculation(data: BodyDataInput): PlanCalculationResult {
  const bmi = calculateBMI(data.weight, data.height);
  const bmr = calculateBMR(data.weight, data.height, data.age, data.gender);
  const tdee = calculateTDEE(bmr);
  const trainingCalorie = calculateTrainingCalorie(data.gender, data.trainingLevel);
  const cardioCalorie = calculateCardioCalorie(
    data.cardioHeartRate,
    data.restingHeartRate,
    data.cardioDuration,
    data.weight,
    data.goal,
    data.hasCardio,
  );
  const { trainingDayMaintenance, restDayMaintenance } = calculateMaintenanceCalories(
    tdee, trainingCalorie, cardioCalorie,
  );
  const { trainingDayTarget, restDayTarget } = calculateTargetCalories(
    trainingDayMaintenance, restDayMaintenance, data.goal,
  );
  const { proteinG, fatG, trainingDayCarbG, restDayCarbG } = calculateMacronutrients(
    trainingDayTarget, restDayTarget, data.weight, data.gender, data.goal, data.proteinQuota,
  );
  const planType = determinePlanType(data.goal, data.trainingTime, data.hasCardio);

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    trainingCalorie: Math.round(trainingCalorie),
    cardioCalorie: Math.round(cardioCalorie),
    trainingDayMaintenance: Math.round(trainingDayMaintenance),
    restDayMaintenance: Math.round(restDayMaintenance),
    trainingDayTarget,
    restDayTarget,
    proteinG,
    fatG,
    trainingDayCarbG: Math.max(0, trainingDayCarbG),
    restDayCarbG: Math.max(0, restDayCarbG),
    planType,
  };
}
