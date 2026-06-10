/**
 * 灵宠服务
 */
import { prisma } from '../index.js';
import { getCultivationLevel } from './level.service.js';

/** 宠物基础属性映射 */
const PET_BASE_STATS: Record<string, { weight: number; height: number; bodyFat: number }> = {
  cat: { weight: 4, height: 25, bodyFat: 15 },
  dog: { weight: 8, height: 40, bodyFat: 15 },
  dragon: { weight: 15, height: 60, bodyFat: 12 },
  fox: { weight: 5, height: 30, bodyFat: 14 },
};

/**
 * 根据用户身体数据计算宠物当前属性
 */
export async function syncPetBody(userId: string) {
  const pet = await prisma.pet.findUnique({ where: { userId } });
  if (!pet) return null;

  const bodyData = await prisma.userBodyData.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const baseStats = PET_BASE_STATS[pet.type] || PET_BASE_STATS.cat;

  // 基于用户数据映射
  let newWeight = baseStats.weight;
  let newBodyFat = baseStats.bodyFat;

  if (bodyData) {
    // 标准值：男性175cm/70kg/15%体脂，女性162cm/55kg/22%体脂
    const stdHeight = bodyData.gender === 'MALE' ? 175 : 162;
    const stdWeight = bodyData.gender === 'MALE' ? 70 : 55;

    const heightRatio = bodyData.height / stdHeight;
    const weightRatio = bodyData.weight / stdWeight;

    newWeight = baseStats.weight * weightRatio * heightRatio;
    newBodyFat = baseStats.bodyFat * (weightRatio / heightRatio);
  }

  // 应用喂养影响（±20%）
  const recentLogs = await prisma.petFeedingLog.findMany({
    where: { petId: pet.id },
    orderBy: { createdAt: 'desc' },
    take: 7,
  });

  let overfedDays = 0;
  let underfedDays = 0;
  for (const log of recentLogs) {
    if (log.foodType === 'OVERFED' || log.foodType === 'HIGH_CARB') overfedDays++;
    if (log.foodType === 'LOW_CARB') underfedDays++;
  }

  const feedMultiplier = 1 + (overfedDays - underfedDays) * 0.03;
  newWeight = Math.max(1, Math.round(newWeight * feedMultiplier * 10) / 10);
  newBodyFat = Math.max(5, Math.min(40, Math.round(newBodyFat * feedMultiplier)));

  // 更新宠物属性
  const updated = await prisma.pet.update({
    where: { id: pet.id },
    data: { weight: newWeight, bodyFat: newBodyFat },
  });

  return updated;
}

/**
 * 检查并更新宠物成长阶段（基于用户修炼等级）
 */
export async function syncPetStage(userId: string) {
  const pet = await prisma.pet.findUnique({ where: { userId } });
  if (!pet) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { exp: true },
  });

  const level = getCultivationLevel(user?.exp || 0);
  const expectedStage = level.tierIndex + 1;

  if (pet.stage !== expectedStage) {
    return prisma.pet.update({
      where: { id: pet.id },
      data: { stage: expectedStage },
    });
  }

  return pet;
}

/**
 * 喂食处理
 */
export async function feedPet(
  petId: string,
  date: string,
  carbG: number,
  proteinG: number,
  fatG: number,
) {
  // 判断喂食类型
  let foodType = 'BALANCED';
  const total = carbG * 4 + proteinG * 4 + fatG * 9;
  
  if (carbG > 300) {
    foodType = 'OVERFED';
  } else if (carbG > 200) {
    foodType = 'HIGH_CARB';
  } else if (carbG < 80) {
    foodType = 'LOW_CARB';
  }

  // 创建喂食日志
  await prisma.petFeedingLog.create({
    data: { petId, date, foodType, carbG, proteinG, fatG },
  });

  // 更新饥饿度和幸福感
  const pet = await prisma.pet.findUnique({ where: { id: petId } });
  if (!pet) return null;

  // 饥饿度：根据食物类型调整
  let hungerChange = 30;
  if (foodType === 'LOW_CARB') hungerChange = 10;
  if (foodType === 'OVERFED') hungerChange = 40;
  const newHunger = Math.min(100, Math.max(0, (pet.hunger || 100) + (hungerChange * 0.3)));

  let happinessChange = 10;
  if (foodType === 'BALANCED') happinessChange = 15;
  if (foodType === 'LOW_CARB') happinessChange = 5;
  const newHappiness = Math.min(100, Math.max(0, (pet.happiness || 100) + (happinessChange * 0.3)));

  const updated = await prisma.pet.update({
    where: { id: petId },
    data: {
      hunger: newHunger,
      happiness: newHappiness,
      lastFedAt: new Date(),
    },
  });

  // 同步身材
  await syncPetBody(pet.userId);

  return updated;
}
