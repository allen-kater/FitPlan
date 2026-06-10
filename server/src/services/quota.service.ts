/**
 * 碳水蛋白质配额表服务
 * 数据来源：碳水和蛋白质配额表.md
 * 格式：训练日碳水 / 休息日碳水 / 每日蛋白质（单位：g/kg体重）
 */

export interface QuotaEntry {
  trainingDayCarb: number;
  restDayCarb: number;
  protein: number;
}

/**
 * 配额表存储结构：gender → goal → height → weight → QuotaEntry
 * null 表示该组合无数据（—），查找时向上/向下取最近有效值
 */
type QuotaTable = Record<string, Record<string, Record<number, Record<number, QuotaEntry>>>>;

const QUOTA_TABLE: QuotaTable = {};

// ==================== 男性 减脂 ====================
QUOTA_TABLE['MALE'] = { FAT_LOSS: {}, MUSCLE_GAIN: {} };

QUOTA_TABLE['MALE']['FAT_LOSS'] = {
  160: {
    60: { trainingDayCarb: 2.6, restDayCarb: 2.0, protein: 1.4 },
    65: { trainingDayCarb: 2.6, restDayCarb: 1.9, protein: 1.4 },
    70: { trainingDayCarb: 2.5, restDayCarb: 1.9, protein: 1.3 },
    75: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    80: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    85: { trainingDayCarb: 2.3, restDayCarb: 1.8, protein: 1.2 },
    90: { trainingDayCarb: 2.3, restDayCarb: 1.8, protein: 1.2 },
    95: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    100: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    105: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.2 },
    110: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    115: { trainingDayCarb: 2.1, restDayCarb: 1.7, protein: 1.1 },
    120: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
    125: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
    130: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
  },
  165: {
    65: { trainingDayCarb: 2.6, restDayCarb: 2.0, protein: 1.4 },
    70: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.4 },
    75: { trainingDayCarb: 2.5, restDayCarb: 1.9, protein: 1.3 },
    80: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    85: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    90: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    95: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    100: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    105: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    110: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    115: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    120: { trainingDayCarb: 2.0, restDayCarb: 1.6, protein: 1.1 },
    125: { trainingDayCarb: 2.0, restDayCarb: 1.6, protein: 1.1 },
    130: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
  },
  170: {
    70: { trainingDayCarb: 2.6, restDayCarb: 2.0, protein: 1.4 },
    75: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.4 },
    80: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.3 },
    85: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    90: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    95: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    100: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    105: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    110: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    115: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    120: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    125: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    130: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
  },
  175: {
    70: { trainingDayCarb: 2.7, restDayCarb: 2.1, protein: 1.4 },
    75: { trainingDayCarb: 2.6, restDayCarb: 2.1, protein: 1.4 },
    80: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.4 },
    85: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.3 },
    90: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    95: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    100: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    105: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    110: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    115: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    120: { trainingDayCarb: 2.1, restDayCarb: 1.7, protein: 1.1 },
    125: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    130: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
  },
  180: {
    75: { trainingDayCarb: 2.7, restDayCarb: 2.1, protein: 1.4 },
    80: { trainingDayCarb: 2.6, restDayCarb: 2.1, protein: 1.4 },
    85: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.4 },
    90: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.3 },
    95: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    100: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    105: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    110: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    115: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    120: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    125: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    130: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
  },
  185: {
    80: { trainingDayCarb: 2.6, restDayCarb: 2.1, protein: 1.4 },
    85: { trainingDayCarb: 2.6, restDayCarb: 2.1, protein: 1.4 },
    90: { trainingDayCarb: 2.5, restDayCarb: 2.1, protein: 1.4 },
    95: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.3 },
    100: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    105: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    110: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.3 },
    115: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    120: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    125: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    130: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
  },
  190: {
    85: { trainingDayCarb: 2.6, restDayCarb: 2.2, protein: 1.4 },
    90: { trainingDayCarb: 2.6, restDayCarb: 2.1, protein: 1.4 },
    95: { trainingDayCarb: 2.5, restDayCarb: 2.1, protein: 1.3 },
    100: { trainingDayCarb: 2.5, restDayCarb: 2.1, protein: 1.3 },
    105: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    110: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    115: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.3 },
    120: { trainingDayCarb: 2.2, restDayCarb: 2.1, protein: 1.2 },
    125: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.2 },
    130: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
  },
};

// ==================== 男性 增肌 ====================
QUOTA_TABLE['MALE']['MUSCLE_GAIN'] = {
  160: {
    50: { trainingDayCarb: 4.0, restDayCarb: 3.0, protein: 1.7 },
    55: { trainingDayCarb: 3.8, restDayCarb: 2.9, protein: 1.6 },
    60: { trainingDayCarb: 3.7, restDayCarb: 2.8, protein: 1.6 },
    65: { trainingDayCarb: 3.6, restDayCarb: 2.8, protein: 1.5 },
    70: { trainingDayCarb: 3.5, restDayCarb: 2.7, protein: 1.5 },
  },
  165: {
    50: { trainingDayCarb: 4.1, restDayCarb: 3.1, protein: 1.8 },
    55: { trainingDayCarb: 4.0, restDayCarb: 3.0, protein: 1.7 },
    60: { trainingDayCarb: 3.8, restDayCarb: 2.9, protein: 1.6 },
    65: { trainingDayCarb: 3.7, restDayCarb: 2.9, protein: 1.6 },
    70: { trainingDayCarb: 3.6, restDayCarb: 2.8, protein: 1.5 },
  },
  170: {
    50: { trainingDayCarb: 4.3, restDayCarb: 3.2, protein: 1.8 },
    55: { trainingDayCarb: 4.1, restDayCarb: 3.1, protein: 1.7 },
    60: { trainingDayCarb: 3.9, restDayCarb: 3.0, protein: 1.7 },
    65: { trainingDayCarb: 3.8, restDayCarb: 3.0, protein: 1.6 },
    70: { trainingDayCarb: 3.7, restDayCarb: 2.9, protein: 1.6 },
    75: { trainingDayCarb: 3.6, restDayCarb: 2.9, protein: 1.5 },
  },
  175: {
    50: { trainingDayCarb: 4.4, restDayCarb: 3.4, protein: 1.9 },
    55: { trainingDayCarb: 4.2, restDayCarb: 3.2, protein: 1.8 },
    60: { trainingDayCarb: 4.0, restDayCarb: 3.2, protein: 1.7 },
    65: { trainingDayCarb: 3.9, restDayCarb: 3.1, protein: 1.7 },
    70: { trainingDayCarb: 3.8, restDayCarb: 3.0, protein: 1.6 },
    75: { trainingDayCarb: 3.6, restDayCarb: 2.9, protein: 1.6 },
    80: { trainingDayCarb: 3.5, restDayCarb: 2.9, protein: 1.5 },
  },
  180: {
    50: { trainingDayCarb: 4.5, restDayCarb: 3.5, protein: 1.9 },
    55: { trainingDayCarb: 4.3, restDayCarb: 3.4, protein: 1.9 },
    60: { trainingDayCarb: 4.1, restDayCarb: 3.3, protein: 1.8 },
    65: { trainingDayCarb: 4.0, restDayCarb: 3.2, protein: 1.7 },
    70: { trainingDayCarb: 3.8, restDayCarb: 3.1, protein: 1.6 },
    75: { trainingDayCarb: 3.7, restDayCarb: 3.0, protein: 1.6 },
    80: { trainingDayCarb: 3.6, restDayCarb: 3.0, protein: 1.6 },
    85: { trainingDayCarb: 3.5, restDayCarb: 2.9, protein: 1.5 },
  },
  185: {
    50: { trainingDayCarb: 4.7, restDayCarb: 3.6, protein: 2.0 },
    55: { trainingDayCarb: 4.4, restDayCarb: 3.5, protein: 1.9 },
    60: { trainingDayCarb: 4.2, restDayCarb: 3.4, protein: 1.8 },
    65: { trainingDayCarb: 4.1, restDayCarb: 3.3, protein: 1.7 },
    70: { trainingDayCarb: 3.9, restDayCarb: 3.2, protein: 1.7 },
    75: { trainingDayCarb: 3.8, restDayCarb: 3.1, protein: 1.6 },
    80: { trainingDayCarb: 3.7, restDayCarb: 3.1, protein: 1.6 },
    85: { trainingDayCarb: 3.6, restDayCarb: 3.0, protein: 1.5 },
    90: { trainingDayCarb: 3.5, restDayCarb: 2.9, protein: 1.5 },
  },
  190: {
    50: { trainingDayCarb: 4.8, restDayCarb: 3.8, protein: 2.1 },
    55: { trainingDayCarb: 4.6, restDayCarb: 3.6, protein: 2.0 },
    60: { trainingDayCarb: 4.4, restDayCarb: 3.5, protein: 1.9 },
    65: { trainingDayCarb: 4.2, restDayCarb: 3.4, protein: 1.8 },
    70: { trainingDayCarb: 4.0, restDayCarb: 3.3, protein: 1.7 },
    75: { trainingDayCarb: 3.9, restDayCarb: 3.2, protein: 1.7 },
    80: { trainingDayCarb: 3.8, restDayCarb: 3.1, protein: 1.6 },
    85: { trainingDayCarb: 3.7, restDayCarb: 3.1, protein: 1.6 },
    90: { trainingDayCarb: 3.6, restDayCarb: 3.0, protein: 1.5 },
  },
};

// ==================== 女性 减脂 ====================
QUOTA_TABLE['FEMALE'] = { FAT_LOSS: {}, MUSCLE_GAIN: {} };

QUOTA_TABLE['FEMALE']['FAT_LOSS'] = {
  150: {
    45: { trainingDayCarb: 2.4, restDayCarb: 1.8, protein: 1.3 },
    50: { trainingDayCarb: 2.3, restDayCarb: 1.8, protein: 1.2 },
    55: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    60: { trainingDayCarb: 2.1, restDayCarb: 1.7, protein: 1.2 },
    65: { trainingDayCarb: 2.1, restDayCarb: 1.7, protein: 1.1 },
    70: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    75: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    80: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    85: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    90: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    95: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
    100: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
    105: { trainingDayCarb: 1.9, restDayCarb: 1.6, protein: 1.0 },
    110: { trainingDayCarb: 1.8, restDayCarb: 1.6, protein: 1.0 },
    115: { trainingDayCarb: 1.8, restDayCarb: 1.6, protein: 1.0 },
    120: { trainingDayCarb: 1.8, restDayCarb: 1.6, protein: 1.0 },
  },
  155: {
    50: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    55: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    60: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    65: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    70: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    75: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    80: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    85: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    90: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    95: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    100: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    105: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    110: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    115: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    120: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
  },
  160: {
    50: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.3 },
    55: { trainingDayCarb: 2.4, restDayCarb: 1.9, protein: 1.3 },
    60: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    65: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    70: { trainingDayCarb: 2.2, restDayCarb: 1.8, protein: 1.2 },
    75: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    80: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    85: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    90: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    95: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    100: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.1 },
    105: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    110: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    115: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
    120: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
  },
  165: {
    55: { trainingDayCarb: 2.5, restDayCarb: 2.0, protein: 1.3 },
    60: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    65: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    70: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    75: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    80: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    85: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    90: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    95: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    100: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    105: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    110: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    115: { trainingDayCarb: 2.0, restDayCarb: 1.7, protein: 1.0 },
    120: { trainingDayCarb: 1.9, restDayCarb: 1.7, protein: 1.0 },
  },
  170: {
    60: { trainingDayCarb: 2.5, restDayCarb: 2.1, protein: 1.3 },
    65: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    70: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.2 },
    75: { trainingDayCarb: 2.3, restDayCarb: 1.9, protein: 1.2 },
    80: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    85: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    90: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.1 },
    95: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    100: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    105: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    110: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    115: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    120: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
  },
  175: {
    60: { trainingDayCarb: 2.5, restDayCarb: 2.1, protein: 1.4 },
    65: { trainingDayCarb: 2.5, restDayCarb: 2.1, protein: 1.3 },
    70: { trainingDayCarb: 2.4, restDayCarb: 2.0, protein: 1.3 },
    75: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.2 },
    80: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.2 },
    85: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    90: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    95: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.2 },
    100: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.1 },
    105: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.1 },
    110: { trainingDayCarb: 2.1, restDayCarb: 1.8, protein: 1.1 },
    115: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
    120: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
  },
  180: {
    65: { trainingDayCarb: 2.5, restDayCarb: 2.2, protein: 1.4 },
    70: { trainingDayCarb: 2.4, restDayCarb: 2.1, protein: 1.3 },
    75: { trainingDayCarb: 2.4, restDayCarb: 2.1, protein: 1.3 },
    80: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.3 },
    85: { trainingDayCarb: 2.3, restDayCarb: 2.0, protein: 1.2 },
    90: { trainingDayCarb: 2.2, restDayCarb: 2.0, protein: 1.2 },
    95: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    100: { trainingDayCarb: 2.2, restDayCarb: 1.9, protein: 1.2 },
    105: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.1 },
    110: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.1 },
    115: { trainingDayCarb: 2.1, restDayCarb: 1.9, protein: 1.1 },
    120: { trainingDayCarb: 2.0, restDayCarb: 1.8, protein: 1.1 },
  },
};

// ==================== 女性 增肌 ====================
QUOTA_TABLE['FEMALE']['MUSCLE_GAIN'] = {
  150: {
    40: { trainingDayCarb: 3.3, restDayCarb: 2.5, protein: 1.4 },
    45: { trainingDayCarb: 3.2, restDayCarb: 2.5, protein: 1.4 },
    50: { trainingDayCarb: 3.1, restDayCarb: 2.4, protein: 1.3 },
    55: { trainingDayCarb: 3.0, restDayCarb: 2.4, protein: 1.3 },
  },
  155: {
    40: { trainingDayCarb: 3.5, restDayCarb: 2.7, protein: 1.5 },
    45: { trainingDayCarb: 3.3, restDayCarb: 2.6, protein: 1.4 },
    50: { trainingDayCarb: 3.2, restDayCarb: 2.6, protein: 1.4 },
    55: { trainingDayCarb: 3.1, restDayCarb: 2.5, protein: 1.3 },
  },
  160: {
    40: { trainingDayCarb: 3.7, restDayCarb: 2.9, protein: 1.6 },
    45: { trainingDayCarb: 3.5, restDayCarb: 2.8, protein: 1.5 },
    50: { trainingDayCarb: 3.3, restDayCarb: 2.7, protein: 1.4 },
    55: { trainingDayCarb: 3.2, restDayCarb: 2.7, protein: 1.4 },
    60: { trainingDayCarb: 3.1, restDayCarb: 2.6, protein: 1.3 },
  },
  165: {
    40: { trainingDayCarb: 3.8, restDayCarb: 3.0, protein: 1.6 },
    45: { trainingDayCarb: 3.6, restDayCarb: 2.9, protein: 1.6 },
    50: { trainingDayCarb: 3.5, restDayCarb: 2.8, protein: 1.5 },
    55: { trainingDayCarb: 3.3, restDayCarb: 2.8, protein: 1.4 },
    60: { trainingDayCarb: 3.2, restDayCarb: 2.7, protein: 1.4 },
    65: { trainingDayCarb: 3.2, restDayCarb: 2.7, protein: 1.4 },
  },
  170: {
    40: { trainingDayCarb: 4.0, restDayCarb: 3.2, protein: 1.7 },
    45: { trainingDayCarb: 3.8, restDayCarb: 3.1, protein: 1.6 },
    50: { trainingDayCarb: 3.6, restDayCarb: 3.0, protein: 1.5 },
    55: { trainingDayCarb: 3.5, restDayCarb: 2.9, protein: 1.5 },
    60: { trainingDayCarb: 3.4, restDayCarb: 2.8, protein: 1.4 },
    65: { trainingDayCarb: 3.3, restDayCarb: 2.8, protein: 1.4 },
    70: { trainingDayCarb: 3.2, restDayCarb: 2.7, protein: 1.4 },
  },
  175: {
    40: { trainingDayCarb: 4.1, restDayCarb: 3.4, protein: 1.8 },
    45: { trainingDayCarb: 3.9, restDayCarb: 3.2, protein: 1.7 },
    50: { trainingDayCarb: 3.7, restDayCarb: 3.1, protein: 1.6 },
    55: { trainingDayCarb: 3.6, restDayCarb: 3.0, protein: 1.5 },
    60: { trainingDayCarb: 3.5, restDayCarb: 2.9, protein: 1.5 },
    65: { trainingDayCarb: 3.4, restDayCarb: 2.9, protein: 1.4 },
    70: { trainingDayCarb: 3.3, restDayCarb: 2.8, protein: 1.4 },
    75: { trainingDayCarb: 3.2, restDayCarb: 2.8, protein: 1.4 },
  },
  180: {
    40: { trainingDayCarb: 4.3, restDayCarb: 3.5, protein: 1.8 },
    45: { trainingDayCarb: 4.1, restDayCarb: 3.4, protein: 1.7 },
    50: { trainingDayCarb: 3.9, restDayCarb: 3.2, protein: 1.7 },
    55: { trainingDayCarb: 3.7, restDayCarb: 3.1, protein: 1.6 },
    60: { trainingDayCarb: 3.6, restDayCarb: 3.0, protein: 1.5 },
    65: { trainingDayCarb: 3.5, restDayCarb: 3.0, protein: 1.5 },
    70: { trainingDayCarb: 3.4, restDayCarb: 2.9, protein: 1.4 },
    75: { trainingDayCarb: 3.3, restDayCarb: 2.9, protein: 1.4 },
  },
};

/** 各性别/目标对应的身高列表 */
const HEIGHT_BRACKETS: Record<string, Record<string, number[]>> = {
  MALE: {
    FAT_LOSS: [160, 165, 170, 175, 180, 185, 190],
    MUSCLE_GAIN: [160, 165, 170, 175, 180, 185, 190],
  },
  FEMALE: {
    FAT_LOSS: [150, 155, 160, 165, 170, 175, 180],
    MUSCLE_GAIN: [150, 155, 160, 165, 170, 175, 180],
  },
};

/**
 * 查找最接近的身高key
 * 二分查找，取最近的身高列（≤目标身高的最大列）
 */
function findClosestHeight(heights: number[], target: number): number {
  let best = heights[0];
  let minDiff = Math.abs(target - best);
  for (const h of heights) {
    const diff = Math.abs(target - h);
    if (diff < minDiff) {
      minDiff = diff;
      best = h;
    }
  }
  // 优先取≤目标的最大的
  let closest = heights[0];
  for (const h of heights) {
    if (h <= target) closest = h;
  }
  return closest;
}

/**
 * 查找最接近的体重key
 */
function findClosestWeight(weights: number[], target: number): number {
  let closest = weights[0];
  for (const w of weights) {
    if (w <= target) closest = w;
  }
  return closest;
}

/**
 * 查找碳水蛋白质配额
 * @param gender 'MALE' | 'FEMALE'
 * @param goal 'FAT_LOSS' | 'MUSCLE_GAIN'
 * @param heightCm 身高(cm)
 * @param weightKg 体重(kg)
 * @returns { trainingDayCarb, restDayCarb, protein } 单位: g/kg
 */
export function lookupQuota(
  gender: string,
  goal: string,
  heightCm: number,
  weightKg: number,
): QuotaEntry {
  const goalTable = QUOTA_TABLE[gender]?.[goal];
  if (!goalTable) {
    // 兜底默认值
    return { trainingDayCarb: 2.6, restDayCarb: 2.0, protein: 1.4 };
  }

  const heights = HEIGHT_BRACKETS[gender]?.[goal] || [];
  const heightKey = findClosestHeight(heights, heightCm);
  const weightTable = goalTable[heightKey];

  if (!weightTable) {
    return { trainingDayCarb: 2.6, restDayCarb: 2.0, protein: 1.4 };
  }

  const weights = Object.keys(weightTable).map(Number).sort((a, b) => a - b);
  const weightKey = findClosestWeight(weights, weightKg);
  const entry = weightTable[weightKey];

  if (entry) return entry;

  // 如果精确匹配不到，返回最近的体重档位
  return weightTable[weights[weights.length - 1]] || { trainingDayCarb: 2.6, restDayCarb: 2.0, protein: 1.4 };
}

/**
 * 获取完整配额表（用于科普展示）
 */
export function getFullQuotaTable(): Record<string, any> {
  return QUOTA_TABLE;
}

/**
 * 获取某性别某目标的所有身高列
 */
export function getHeightBrackets(gender: string, goal: string): number[] {
  return HEIGHT_BRACKETS[gender]?.[goal] || [];
}
