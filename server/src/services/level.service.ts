/**
 * 修仙等级系统服务
 * 
 * 5个大境界：练气 → 筑基 → 金丹 → 元婴 → 化神
 * 每个境界9个小段位（一 ~ 九）
 * 
 * 累计XP公式: cumulativeXP = 50 * tierCoeff * tierCoeff * subLevel * subLevel
 *   tierCoeff = 1(练气), 2(筑基), 3(金丹), 4(元婴), 5(化神)
 * 
 * 每个小段位所需经验(不是累积):
 *   nextLevelXP = 50 * tierCoeff² * (2*subLevel - 1)
 */

export interface CultivationLevel {
  /** 总等级 (1-45) */
  totalLevel: number;
  /** 境界序号 (0=练气, 1=筑基, 2=金丹, 3=元婴, 4=化神) */
  tierIndex: number;
  /** 境界名称 */
  tierName: string;
  /** 段位序号 (1-9) */
  subLevel: number;
  /** 完整显示名，如 "练气三段"、"元婴六段" */
  displayName: string;
  /** 当前境界进度 (0-100) */
  progress: number;
  /** 当前段位所需累计XP */
  currentLevelXP: number;
  /** 下一段位所需累计XP */
  nextLevelXP: number;
  /** 已获得的XP */
  currentXP: number;
  /** 离下一段位还差多少XP */
  xpToNext: number;
}

/** 境界名称映射 */
const TIER_NAMES = ['练气', '筑基', '金丹', '元婴', '化神'];

/** 段位中文数字 */
const SUB_LEVEL_CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/** 境界颜色 */
export const TIER_COLORS: Record<number, string> = {
  0: '#9E9E9E', // 练气 - 灰色
  1: '#4CAF50', // 筑基 - 绿色
  2: '#FFC107', // 金丹 - 金色
  3: '#9C27B0', // 元婴 - 紫色
  4: '#F44336', // 化神 - 红色
};

/** 境界图标 */
export const TIER_ICONS: Record<number, string> = {
  0: '🌱', // 练气
  1: '🏗️', // 筑基
  2: '💛', // 金丹
  3: '💜', // 元婴
  4: '🔥', // 化神
};

/**
 * 计算到达某个总等级(1-45)所需的累计XP
 * totalLevel = (tierIndex * 9) + subLevel
 */
function cumulativeXPForLevel(totalLevel: number): number {
  if (totalLevel <= 1) return 0;
  const tierIndex = Math.floor((totalLevel - 1) / 9);
  const subLevel = ((totalLevel - 1) % 9) + 1;
  const tierCoeff = tierIndex + 1;
  return 50 * tierCoeff * tierCoeff * subLevel * subLevel;
}

/**
 * 根据经验值计算修仙等级
 */
export function getCultivationLevel(exp: number): CultivationLevel {
  // 遍历所有等级找到当前等级
  let tierIndex = 0;
  let subLevel = 1;

  for (let t = 0; t < 5; t++) {
    for (let s = 1; s <= 9; s++) {
      const totalLv = t * 9 + s;
      const requiredXP = cumulativeXPForLevel(totalLv + 1);
      if (exp < requiredXP || (t === 4 && s === 9)) {
        tierIndex = t;
        subLevel = s;
        break;
      }
    }
    if (tierIndex === t && subLevel > 0) break;
  }

  // 边界情况：满级(化神九)
  const totalLevel = tierIndex * 9 + subLevel;
  const currentLevelXP = cumulativeXPForLevel(totalLevel);
  const nextLevelXP = totalLevel >= 45 ? currentLevelXP : cumulativeXPForLevel(totalLevel + 1);

  const xpInLevel = exp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;

  return {
    totalLevel,
    tierIndex,
    tierName: TIER_NAMES[tierIndex],
    subLevel,
    displayName: `${TIER_NAMES[tierIndex]}${SUB_LEVEL_CN[subLevel]}段`,
    progress,
    currentLevelXP,
    nextLevelXP,
    currentXP: exp,
    xpToNext: nextLevelXP - exp,
  };
}

/**
 * 经验获取规则
 */
export interface ExpRule {
  source: string;
  label: string;
  baseXP: number;
  dailyCap: number;
  note: string;
}

export const EXP_RULES: ExpRule[] = [
  { source: 'PLAN', label: '制定健身方案', baseXP: 100, dailyCap: 500, note: '每次制定方案获得' },
  { source: 'TRAINING_LOG_FIRST', label: '每日首次训练日志', baseXP: 80, dailyCap: -1, note: '每日首次记录训练日志（不占日上限）' },
  { source: 'TRAINING_LOG', label: '记录训练日志', baseXP: 20, dailyCap: 200, note: '非首次记录训练日志' },
  { source: 'NUTRITION', label: '营养追踪', baseXP: 50, dailyCap: 50, note: '每日记录营养素' },
  { source: 'POST', label: '发布社区帖子', baseXP: 60, dailyCap: 300, note: '发布社区帖子' },
  { source: 'COMMENT', label: '回复社区帖子', baseXP: 15, dailyCap: 150, note: '回复社区帖子' },
  { source: 'STREAK_7_TRAINING', label: '连续7天训练', baseXP: 200, dailyCap: -1, note: '连续7天记录训练日志额外奖励' },
  { source: 'STREAK_7_NUTRITION', label: '连续7天营养', baseXP: 150, dailyCap: -1, note: '连续7天记录营养额外奖励' },
];

/**
 * 获取某个经验来源的每日上限
 */
export function getDailyCap(source: string): number {
  const rule = EXP_RULES.find(r => r.source === source);
  return rule?.dailyCap ?? 0;
}
