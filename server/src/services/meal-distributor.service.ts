import fatLossTemplates from '../../data/meal-templates/fat-loss.json' with { type: 'json' };
import muscleGainTemplates from '../../data/meal-templates/muscle-gain.json' with { type: 'json' };

export interface MealItem {
  name: string;
  carbRatio: number;
  proteinRatio: number;
  fatRatio: number;
  carbG?: number;
  proteinG?: number;
  fatG?: number;
}

export interface DayMeals {
  meals: MealItem[];
}

/**
 * Load meal template for a given goal and training time
 */
function loadTemplate(goal: string, trainingTime: string): {
  trainingDay: DayMeals;
  restDay: DayMeals;
} {
  const templates = goal === 'FAT_LOSS' ? fatLossTemplates : muscleGainTemplates;
  const goalKey = goal;
  const timeKey = trainingTime;
  const template = (templates as Record<string, Record<string, { trainingDay: DayMeals; restDay: DayMeals }>>)[goalKey]?.[timeKey];

  if (!template) {
    // Fallback to EARLY_MORNING template
    const fallback = (templates as Record<string, Record<string, { trainingDay: DayMeals; restDay: DayMeals }>>)[goalKey]?.['EARLY_MORNING'];
    if (!fallback) {
      throw new Error(`No meal template found for goal=${goal}, trainingTime=${trainingTime}`);
    }
    return fallback;
  }

  return template;
}

/**
 * Distribute macronutrients across meals based on template ratios
 */
export function distributeMeals(
  goal: string,
  trainingTime: string,
  trainingDayCarbG: number,
  restDayCarbG: number,
  proteinG: number,
  fatG: number,
): {
  trainingDayMeals: MealItem[];
  restDayMeals: MealItem[];
} {
  const template = loadTemplate(goal, trainingTime);

  // Calculate training day meals
  const trainingDayMeals = template.trainingDay.meals.map((meal) => ({
    name: meal.name,
    carbRatio: meal.carbRatio,
    proteinRatio: meal.proteinRatio,
    fatRatio: meal.fatRatio,
    carbG: Math.round(trainingDayCarbG * meal.carbRatio),
    proteinG: Math.round(proteinG * meal.proteinRatio),
    fatG: Math.round(fatG * meal.fatRatio),
  }));

  // Calculate rest day meals
  const restDayMeals = template.restDay.meals.map((meal) => ({
    name: meal.name,
    carbRatio: meal.carbRatio,
    proteinRatio: meal.proteinRatio,
    fatRatio: meal.fatRatio,
    carbG: Math.round(restDayCarbG * meal.carbRatio),
    proteinG: Math.round(proteinG * meal.proteinRatio),
    fatG: Math.round(fatG * meal.fatRatio),
  }));

  return { trainingDayMeals, restDayMeals };
}
