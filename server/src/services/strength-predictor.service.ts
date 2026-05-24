/**
 * Strength prediction using 9 different 1RM formulas
 */

export interface StrengthPredictionResult {
  formula: string;
  oneRM: number;
  percentages: Record<string, number>;
}

const PERCENTAGES = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

function calculatePercentages(oneRM: number): Record<string, number> {
  const result: Record<string, number> = {};
  for (const pct of PERCENTAGES) {
    result[`${pct}%`] = Math.round(oneRM * pct / 100 * 10) / 10;
  }
  return result;
}

/**
 * Adams: 1RM = weight / (1 - 0.02 × reps)
 */
function adams(weight: number, reps: number): number {
  return weight / (1 - 0.02 * reps);
}

/**
 * Brown: 1RM = (reps × 0.0328 + 0.9849) × weight
 */
function brown(weight: number, reps: number): number {
  return (reps * 0.0328 + 0.9849) * weight;
}

/**
 * Brzycki: 1RM = weight / (1.0278 - 0.0278 × reps)
 */
function brzycki(weight: number, reps: number): number {
  return weight / (1.0278 - 0.0278 * reps);
}

/**
 * Lander: 1RM = weight / (1.013 - 0.0267123 × reps)
 */
function lander(weight: number, reps: number): number {
  return weight / (1.013 - 0.0267123 * reps);
}

/**
 * Lombardi: 1RM = reps^0.1 × weight
 */
function lombardi(weight: number, reps: number): number {
  return Math.pow(reps, 0.1) * weight;
}

/**
 * Mayhew: 1RM = weight / (0.522 + 0.419 × e^(-0.055 × reps))
 */
function mayhew(weight: number, reps: number): number {
  return weight / (0.522 + 0.419 * Math.exp(-0.055 * reps));
}

/**
 * O'Connor: 1RM = 0.025 × (weight × reps) + weight
 */
function oconnor(weight: number, reps: number): number {
  return 0.025 * (weight * reps) + weight;
}

/**
 * Wathen: 1RM = weight / (0.488 + 0.538 × e^(-0.075 × reps))
 */
function wathen(weight: number, reps: number): number {
  return weight / (0.488 + 0.538 * Math.exp(-0.075 * reps));
}

/**
 * Welday: 1RM = (reps × 0.0333) × weight + weight
 */
function welday(weight: number, reps: number): number {
  return (reps * 0.0333) * weight + weight;
}

interface FormulaEntry {
  name: string;
  calculate: (weight: number, reps: number) => number;
}

const FORMULAS: FormulaEntry[] = [
  { name: 'Adams', calculate: adams },
  { name: 'Brown', calculate: brown },
  { name: 'Brzycki', calculate: brzycki },
  { name: 'Lander', calculate: lander },
  { name: 'Lombardi', calculate: lombardi },
  { name: 'Mayhew', calculate: mayhew },
  { name: "O'Connor", calculate: oconnor },
  { name: 'Wathen', calculate: wathen },
  { name: 'Welday', calculate: welday },
];

/**
 * Predict 1RM using all 9 formulas
 */
export function predictStrength(weight: number, reps: number): StrengthPredictionResult[] {
  return FORMULAS.map((formula) => {
    const oneRM = Math.round(formula.calculate(weight, reps) * 10) / 10;
    const percentages = calculatePercentages(oneRM);
    return {
      formula: formula.name,
      oneRM,
      percentages,
    };
  });
}
