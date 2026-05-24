import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean up existing seed data for idempotency
  console.log('🧹 Cleaning up existing seed data...');
  await prisma.trainingPlan.deleteMany({});
  await prisma.qAArticle.deleteMany({});
  await prisma.food.deleteMany({});
  console.log('✅ Cleanup completed');

  // 1. Create default admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fitplan.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@fitplan.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Seed Foods
  const foods = [
    // 碳水食物 (CARB)
    { name: '米饭(一般)', category: 'CARB', nutritionRate: 0.30, giIndex: 83, description: '外食一般米饭' },
    { name: '米饭(偏硬)', category: 'CARB', nutritionRate: 0.35, giIndex: 83, description: '水分较少的硬米饭' },
    { name: '馒头/花卷', category: 'CARB', nutritionRate: 0.50, giIndex: 88, description: '精制面食，碳水率较高' },
    { name: '切片面包', category: 'CARB', nutritionRate: 0.50, giIndex: 88, description: '白面包，GI较高' },
    { name: '意面(熟)', category: 'CARB', nutritionRate: 0.30, giIndex: 49, description: '低GI碳水来源' },
    { name: '细面(熟)', category: 'CARB', nutritionRate: 0.23, giIndex: 82, description: '精制面条，GI较高' },
    { name: '粗面(熟)', category: 'CARB', nutritionRate: 0.30, giIndex: 80, description: '粗粮面条' },
    { name: '红薯(蒸煮)', category: 'CARB', nutritionRate: 0.18, giIndex: 77, description: '优质碳水，含膳食纤维' },
    { name: '土豆(蒸煮)', category: 'CARB', nutritionRate: 0.18, giIndex: 65, description: '中GI碳水来源' },
    { name: '甜玉米', category: 'CARB', nutritionRate: 0.20, giIndex: 55, description: '中GI，含膳食纤维' },
    { name: '糯玉米', category: 'CARB', nutritionRate: 0.35, giIndex: 85, description: '高GI，碳水率较高' },
    { name: '燕麦片(生)', category: 'CARB', nutritionRate: 0.60, giIndex: 79, description: '高碳水率，适合早餐' },
    { name: '香蕉', category: 'CARB', nutritionRate: 0.22, giIndex: 52, description: '中GI，练后补充首选' },
    { name: '苹果', category: 'CARB', nutritionRate: 0.13, giIndex: 38, description: '低GI水果' },
    { name: '橙子', category: 'CARB', nutritionRate: 0.11, giIndex: 40, description: '低GI水果，富含维C' },
    { name: '西瓜', category: 'CARB', nutritionRate: 0.07, giIndex: 80, description: '高GI但碳水率低' },
    { name: '紫薯', category: 'CARB', nutritionRate: 0.16, giIndex: 55, description: '低GI，富含花青素' },
    { name: '山药', category: 'CARB', nutritionRate: 0.12, giIndex: 51, description: '低GI，养胃食材' },
    { name: '南瓜', category: 'CARB', nutritionRate: 0.08, giIndex: 75, description: '高GI但碳水率低' },
    { name: '藜麦(熟)', category: 'CARB', nutritionRate: 0.21, giIndex: 35, description: '低GI超级食物' },
    { name: '糙米(熟)', category: 'CARB', nutritionRate: 0.24, giIndex: 56, description: '中GI，比白米更优' },
    { name: '全麦面包', category: 'CARB', nutritionRate: 0.42, giIndex: 53, description: '中GI全谷物' },
    { name: '荞麦面(熟)', category: 'CARB', nutritionRate: 0.22, giIndex: 59, description: '中GI，适合替代精面' },
    { name: '芋头', category: 'CARB', nutritionRate: 0.13, giIndex: 48, description: '低GI根茎类' },

    // 蛋白质食物 (PROTEIN) - nutritionRate代表蛋白质率
    { name: '瘦肉(鱼虾生肉)', category: 'PROTEIN', nutritionRate: 0.15, giIndex: null, description: '主要蛋白质来源，低脂' },
    { name: '瘦肉(家禽家畜生肉)', category: 'PROTEIN', nutritionRate: 0.20, giIndex: null, description: '主要蛋白质来源' },
    { name: '瘦肉(一般熟肉)', category: 'PROTEIN', nutritionRate: 0.25, giIndex: null, description: '主要蛋白质来源，烹饪后' },
    { name: '瘦肉(柴感熟肉)', category: 'PROTEIN', nutritionRate: 0.30, giIndex: null, description: '干柴口感的熟肉，蛋白质率更高' },
    { name: '瘦肉干', category: 'PROTEIN', nutritionRate: 0.40, giIndex: null, description: '高蛋白质率零食' },
    { name: '蛋白粉', category: 'PROTEIN', nutritionRate: 0.75, giIndex: null, description: '浓缩蛋白质补充剂' },
    { name: '鸡蛋', category: 'PROTEIN', nutritionRate: 0.13, giIndex: null, description: '6g蛋白质/个，优质蛋白' },
    { name: '牛奶', category: 'PROTEIN', nutritionRate: 0.03, giIndex: null, description: '10g蛋白质/250ml' },
    { name: '鸡胸肉(生)', category: 'PROTEIN', nutritionRate: 0.23, giIndex: null, description: '健身首选蛋白质来源' },
    { name: '牛肉(瘦生)', category: 'PROTEIN', nutritionRate: 0.20, giIndex: null, description: '高蛋白含肌酸' },
    { name: '虾仁(生)', category: 'PROTEIN', nutritionRate: 0.20, giIndex: null, description: '低脂高蛋白' },
    { name: '三文鱼(生)', category: 'PROTEIN', nutritionRate: 0.20, giIndex: null, description: '含优质脂肪EPA/DHA' },
    { name: '豆腐', category: 'PROTEIN', nutritionRate: 0.08, giIndex: null, description: '植物蛋白来源' },
    { name: '希腊酸奶', category: 'PROTEIN', nutritionRate: 0.10, giIndex: null, description: '高蛋白酸奶' },
    { name: '豆浆', category: 'PROTEIN', nutritionRate: 0.03, giIndex: null, description: '植物蛋白饮品' },

    // 脂肪食物 (FAT) - nutritionRate代表脂肪率
    { name: '橄榄油', category: 'FAT', nutritionRate: 1.0, giIndex: null, description: '单不饱和脂肪酸，烹饪用油' },
    { name: '花生酱', category: 'FAT', nutritionRate: 0.50, giIndex: null, description: '高脂高热量，适量食用' },
    { name: '坚果混合', category: 'FAT', nutritionRate: 0.50, giIndex: null, description: '杏仁核桃等混合坚果' },
    { name: '牛油果', category: 'FAT', nutritionRate: 0.15, giIndex: null, description: '健康脂肪来源' },
    { name: '黄油', category: 'FAT', nutritionRate: 0.82, giIndex: null, description: '饱和脂肪为主，适量使用' },
    { name: '椰子油', category: 'FAT', nutritionRate: 1.0, giIndex: null, description: '中链脂肪酸' },
    { name: '亚麻籽油', category: 'FAT', nutritionRate: 1.0, giIndex: null, description: '富含Omega-3，凉拌用' },
    { name: '芝士', category: 'FAT', nutritionRate: 0.33, giIndex: null, description: '含蛋白质和脂肪' },
    { name: '蛋黄', category: 'FAT', nutritionRate: 0.30, giIndex: null, description: '每个蛋黄约5g脂肪' },
    { name: '黑巧克力(85%)', category: 'FAT', nutritionRate: 0.45, giIndex: null, description: '高可可含量，适量食用' },
  ];

  for (const food of foods) {
    await prisma.food.create({
      data: food,
    });
  }
  console.log(`✅ ${foods.length} foods seeded`);

  // 3. Seed Q&A Articles
  const fatLossQA = [
    { question: '减脂一定要做有氧吗？', answer: '不是必须的。力量训练本身也能消耗热量，并通过增加肌肉量提高基础代谢。但有氧运动可以帮助增加热量消耗，加速减脂进程。建议力量训练为主，有氧为辅。', sortOrder: 1 },
    { question: '减脂期每天应该摄入多少热量？', answer: '一般建议在平衡热量基础上减少20%-36%。具体来说，减脂期建议摄入平衡热量的64%左右。不要过度节食，否则会导致基础代谢下降和肌肉流失。', sortOrder: 2 },
    { question: '减脂期可以吃碳水吗？', answer: '必须吃！碳水是力量训练的主要能量来源。减脂期应控制碳水总量，但不是完全不吃。训练日碳水可以适当增加，休息日适当减少。选择低GI碳水如燕麦、红薯、糙米等。', sortOrder: 3 },
    { question: '为什么减脂期体重不降反升？', answer: '可能的原因：1)力量训练初期肌肉增长；2)运动后肌肉储水；3)饮食控制不够严格；4)压力激素导致水钠潴留。建议关注体脂率和围度变化，而不是单纯看体重。', sortOrder: 4 },
    { question: '减脂期蛋白质摄入多少合适？', answer: '建议每公斤体重摄入1.6-2.0g蛋白质。例如70kg的人每天需要112-140g蛋白质。充足的蛋白质可以防止肌肉流失，并增加食物热效应。', sortOrder: 5 },
    { question: '空腹有氧效果更好吗？', answer: '研究表明空腹有氧和非空腹有氧的减脂效果差异不大。空腹有氧可能导致肌肉分解增加，特别是对于肌肉量较少的人。建议练前摄入少量蛋白质和碳水。', sortOrder: 6 },
    { question: '减脂期要避免哪些食物？', answer: '主要避免：1)高糖饮料和甜食；2)油炸食品；3)精加工零食；4)高热量酱料。不是完全禁止，而是控制摄入量和频率。', sortOrder: 7 },
    { question: '减脂遇到平台期怎么办？', answer: '突破平台期的方法：1)重新计算热量需求(体重下降后TDEE也会降低)；2)增加运动量或强度；3)调整饮食结构；4)安排一顿"欺骗餐"提高代谢；5)确保充足睡眠。', sortOrder: 8 },
    { question: '减脂期可以喝酒吗？', answer: '酒精会优先被身体代谢，导致脂肪氧化减少。此外酒精热量较高(7kcal/g)且营养价值低。建议减脂期尽量避免饮酒，偶尔少量饮酒也要计入每日热量。', sortOrder: 9 },
    { question: '减脂期多久称一次体重？', answer: '建议每周称1-2次，在相同条件下(如每周一早晨空腹如厕后)。每天称重波动太大，容易影响心态。更应关注周平均趋势和月度变化。', sortOrder: 10 },
    { question: '局部减脂可能吗？', answer: '局部减脂基本不可能。脂肪的消耗是全身性的，由基因决定哪些部位先减。但可以通过针对特定部位的训练增加肌肉，改善该部位的线条和紧致度。', sortOrder: 11 },
    { question: '减脂期睡眠很重要吗？', answer: '非常重要！睡眠不足会导致：1)饥饿素增加，食欲控制困难；2)皮质醇升高，促进脂肪储存；3)生长激素分泌减少，影响恢复和脂肪燃烧。建议每晚7-9小时睡眠。', sortOrder: 12 },
    { question: 'HIIT和LISS哪个更适合减脂？', answer: '各有优势。HIIT(高强度间歇)时间效率高，有"后燃效应"；LISS(低强度恒速)恢复要求低，可频繁进行。初学者建议从LISS开始，逐渐加入HIIT。两者结合效果最佳。', sortOrder: 13 },
    { question: '减脂期如何防止肌肉流失？', answer: '关键措施：1)保持足够蛋白质摄入(1.6-2.0g/kg)；2)坚持力量训练且保持训练强度；3)控制热量缺口不要太大(36%以内)；4)确保充足睡眠和恢复。', sortOrder: 14 },
    { question: '女生减脂会变壮吗？', answer: '不会。女性睾酮水平远低于男性，很难长出大块肌肉。力量训练会让身体更紧致、线条更好。很多女性看起来"壮"是因为体脂率高，肌肉被脂肪覆盖。', sortOrder: 15 },
    { question: '减脂期便秘怎么办？', answer: '可能原因：1)饮食量减少；2)脂肪摄入过少；3)饮水不足；4)膳食纤维不足。建议：多喝水、增加蔬菜摄入、适量健康脂肪、适当活动，必要时补充膳食纤维。', sortOrder: 16 },
    { question: '为什么肚子上的脂肪最难减？', answer: '腹部脂肪(特别是内脏脂肪)受皮质醇影响大，且腹部通常是身体最后减脂的部位之一。需要持续的热量缺口和耐心，不能期望局部减脂。', sortOrder: 17 },
    { question: '减脂期需要补剂吗？', answer: '基础补剂建议：1)蛋白粉(方便补充蛋白质)；2)鱼油(Omega-3抗炎)；3)维生素D(大多数人缺乏)。其他如左旋肉碱、CLA等效果有限，不是必需的。', sortOrder: 18 },
    { question: '减脂期可以吃水果吗？', answer: '可以适量吃。水果含有维生素、矿物质和膳食纤维，但果糖也提供热量。建议每天1-2份水果，选择低GI水果如苹果、橙子、蓝莓等，避免大量高糖水果。', sortOrder: 19 },
    { question: '减脂期应该怎么安排欺骗餐？', answer: '建议每1-2周安排一次欺骗餐，而不是欺骗日。欺骗餐应该：1)仍然有蛋白质；2)不要暴饮暴食；3)安排在训练日；4)享受食物但不要有负罪感。欺骗餐有助于心理放松和代谢恢复。', sortOrder: 20 },
    { question: '出汗多等于减脂多吗？', answer: '不是。出汗只是身体散热的方式，和脂肪燃烧没有直接关系。蒸桑拿或穿暴汗服后体重下降只是水分流失，补充水分后就会恢复。减脂的关键是热量缺口。', sortOrder: 21 },
    { question: '减脂期可以吃夜宵吗？', answer: '总热量才是关键，不是进食时间。但晚上容易选择不健康的食物，且可能影响睡眠。如果确实饿了，可以选择蛋白质为主的小食如蛋白粉、鸡蛋白、希腊酸奶等。', sortOrder: 22 },
    { question: '减脂期为什么容易情绪低落？', answer: '可能原因：1)碳水化合物摄入减少影响血清素合成；2)热量不足导致能量水平低；3)长期克制饮食心理压力大。建议不要过度节食，适当安排欺骗餐，保证社交活动。', sortOrder: 23 },
    { question: '如何判断减脂方案是否有效？', answer: '综合判断：1)体重周平均趋势下降；2)腰围等关键围度减小；3)力量训练表现维持或提升；4)精力水平和睡眠质量良好；5)体脂率测试下降。不要只看单一指标。', sortOrder: 24 },
    { question: '减脂成功后如何维持？', answer: '维持期关键：1)逐步增加热量至平衡水平(反向饮食)；2)继续力量训练维持肌肉量；3)保持健康的饮食习惯；4)定期监控体重和体脂；5)建立可持续的生活方式而非短期节食。', sortOrder: 25 },
    { question: '大体重人群减脂有什么特别注意？', answer: '大体重人群注意：1)避免高冲击运动保护关节，首选游泳、椭圆机、骑车；2)热量缺口不要过大；3)关注血压和血糖；4)建议先咨询医生；5)体重下降初期可能较快，不要因此降低蛋白质摄入。', sortOrder: 26 },
  ];

  for (const qa of fatLossQA) {
    await prisma.qAArticle.create({
      data: { type: 'FAT_LOSS', question: qa.question, answer: qa.answer, sortOrder: qa.sortOrder },
    });
  }
  console.log(`✅ ${fatLossQA.length} fat loss Q&A seeded`);

  const muscleGainQA = [
    { question: '增肌期每天需要多少热量盈余？', answer: '建议在平衡热量基础上增加16%左右的热量摄入。过多的热量盈余只会导致脂肪堆积。一般每天多摄入300-500kcal即可，新手和体重较轻的人可以适当增加。', sortOrder: 1 },
    { question: '增肌期蛋白质吃越多越好吗？', answer: '不是。研究表明每公斤体重2.0-2.2g蛋白质已经接近最大合成速率。过多蛋白质不会额外增加肌肉合成，反而增加肾脏负担和热量摄入。', sortOrder: 2 },
    { question: '增肌一定要用补剂吗？', answer: '不是必须的。基础饮食是关键，补剂只是辅助。但蛋白粉方便补充蛋白质，肌酸有充分的科学证据支持增肌效果。其他大多数补剂效果有限。', sortOrder: 3 },
    { question: '增肌期如何安排训练分化？', answer: '根据训练水平选择：1)初学者：全身训练，每周3次；2)中级：上下肢分化或推拉腿，每周4次；3)高级：双重分化或专项分化，每周5-6次。关键是每个肌群每周训练2次左右。', sortOrder: 4 },
    { question: '增肌期要做有氧吗？', answer: '建议适度有氧。每周2-3次低强度有氧(20-30分钟)有助于：1)心血管健康；2)恢复能力；3)控制体脂率。但过多有氧可能影响力量训练恢复和肌肉增长。', sortOrder: 5 },
    { question: '增肌期体重增长多少算正常？', answer: '新手期每月增重1-2kg，其中约一半可能是肌肉。中级训练者每月0.5-1kg。如果体重增长过快，说明脂肪增加过多，需要调整饮食。', sortOrder: 6 },
    { question: '什么是渐进超负荷？', answer: '渐进超负荷是增肌的核心原则。指逐渐增加训练刺激(重量、组数、次数等)，使肌肉不断适应和增长。具体方式：增加重量、增加组数、增加次数、缩短组间休息、增加动作难度。', sortOrder: 7 },
    { question: '增肌期为什么手臂不长？', answer: '可能原因：1)训练量不足——手臂肌群较小，需要更高频率；2)只做孤立动作不练复合动作；3)体脂过高手臂显粗但实际肌肉不多；4)营养不够；5)基因因素——有些人手臂就是较难增长。', sortOrder: 8 },
    { question: '增肌期可以喝酒吗？', answer: '酒精会严重影响增肌：1)抑制蛋白质合成；2)影响睾酮水平；3)干扰恢复和睡眠；4)空热量导致脂肪堆积。建议增肌期尽量避免饮酒，偶尔少量也要控制。', sortOrder: 9 },
    { question: '增肌训练每组做多少次最好？', answer: '研究表明6-12次/组是增肌的最佳范围，但实际上5-20次都可以增肌。关键是：1)接近力竭(保留1-3次余力)；2)逐渐增加训练量；3)不同次数范围结合训练。', sortOrder: 10 },
    { question: '增肌期需要多少睡眠？', answer: '建议每晚7-9小时。睡眠期间：1)生长激素分泌达到高峰；2)肌肉修复和生长主要在睡眠时进行；3)睾酮水平与睡眠质量直接相关。睡眠不足会严重影响增肌效果。', sortOrder: 11 },
    { question: '肌酸怎么吃？', answer: '推荐用法：1)每天3-5g，无需加载期；2)随餐或练后服用吸收更好；3)多喝水；4)长期使用安全；5)停用后肌肉中肌酸水平会在4-6周回到基线。肌酸是目前证据最充分的增肌补剂。', sortOrder: 12 },
    { question: '增肌期如何控制体脂？', answer: '控制体脂策略：1)热量盈余不要太大(16%左右)；2)保证蛋白质摄入充足；3)坚持力量训练且逐渐增加强度；4)每周2-3次低强度有氧；5)监控体重和体脂变化趋势。', sortOrder: 13 },
    { question: '增肌期关节疼痛怎么办？', answer: '关节疼痛处理：1)立即停止引起疼痛的动作；2)检查动作姿势是否正确；3)减少重量增加次数；4)加强关节周围肌肉；5)补充鱼油和胶原蛋白；6)持续疼痛应就医。', sortOrder: 14 },
    { question: '瘦子增肌为什么那么难？', answer: '瘦子增肌难的原因：1)天生基础代谢高，热量需求大；2)食欲差吃不够；3)可能存在胰岛素敏感性低。建议：1)循序渐进增加热量；2)喝液体热量(奶昔等)；3)减少非训练活动消耗。', sortOrder: 15 },
    { question: '增肌期什么时候吃碳水？', answer: '碳水摄入时机：1)训练前1-2小时——提供训练能量；2)训练后30分钟内——恢复肌糖原；3)早餐——补充一夜消耗的糖原。训练日碳水总量应高于休息日。', sortOrder: 16 },
    { question: '增肌遇到平台期怎么办？', answer: '突破增肌平台期：1)改变训练计划(动作、分化方式、次数范围)；2)增加训练量或频率；3)重新评估饮食——可能需要增加热量；4)安排减载周降低训练量促进恢复；5)确保充足睡眠。', sortOrder: 17 },
    { question: '自然增肌的极限是多少？', answer: '自然训练者的肌肉增长有上限。根据Lyle McDonald模型：新手第一年可增肌约9-11kg，第二年4.5-5.5kg，之后逐年递减。多数自然训练者在3-5年内接近基因极限。', sortOrder: 18 },
  ];

  for (const qa of muscleGainQA) {
    await prisma.qAArticle.create({
      data: { type: 'MUSCLE_GAIN', question: qa.question, answer: qa.answer, sortOrder: qa.sortOrder },
    });
  }
  console.log(`✅ ${muscleGainQA.length} muscle gain Q&A seeded`);

  // 4. Seed Training Plans
  const trainingPlans = [
    // GYM_3SPLIT - 健身房三分化(推/拉/腿)
    {
      type: 'GYM_3SPLIT',
      dayNumber: 1,
      groupName: '推(Push)',
      exercises: JSON.stringify([
        { name: '杠铃卧推', sets: 4, reps: '8-12', rest: '90秒' },
        { name: '哑铃肩推', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '上斜哑铃卧推', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '侧平举', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '绳索下压(三头)', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '仰卧臂屈伸', sets: 3, reps: '10-12', rest: '60秒' },
      ]),
    },
    {
      type: 'GYM_3SPLIT',
      dayNumber: 2,
      groupName: '拉(Pull)',
      exercises: JSON.stringify([
        { name: '引体向上/高位下拉', sets: 4, reps: '8-12', rest: '90秒' },
        { name: '杠铃划船', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '坐姿划船', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '面拉', sets: 3, reps: '15-20', rest: '45秒' },
        { name: '杠铃弯举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '锤式弯举', sets: 3, reps: '10-12', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_3SPLIT',
      dayNumber: 3,
      groupName: '腿(Legs)',
      exercises: JSON.stringify([
        { name: '杠铃深蹲', sets: 4, reps: '6-10', rest: '120秒' },
        { name: '罗马尼亚硬拉', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '腿举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '腿弯举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '站姿提踵', sets: 4, reps: '15-20', rest: '45秒' },
        { name: '悬垂举腿', sets: 3, reps: '12-15', rest: '45秒' },
      ]),
    },

    // GYM_4SHOULDER - 健身房四分化(肩专项)
    {
      type: 'GYM_4SHOULDER',
      dayNumber: 1,
      groupName: '胸+三头',
      exercises: JSON.stringify([
        { name: '杠铃卧推', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '上斜哑铃卧推', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '龙门架夹胸', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '窄距卧推', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '绳索下压', sets: 3, reps: '12-15', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_4SHOULDER',
      dayNumber: 2,
      groupName: '背+二头',
      exercises: JSON.stringify([
        { name: '引体向上/高位下拉', sets: 4, reps: '8-12', rest: '90秒' },
        { name: '杠铃划船', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '单臂哑铃划船', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '杠铃弯举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '集中弯举', sets: 3, reps: '10-12', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_4SHOULDER',
      dayNumber: 3,
      groupName: '肩专项',
      exercises: JSON.stringify([
        { name: '哑铃肩推', sets: 4, reps: '8-12', rest: '90秒' },
        { name: '侧平举', sets: 4, reps: '12-15', rest: '45秒' },
        { name: '前平举', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '反向飞鸟', sets: 4, reps: '12-15', rest: '45秒' },
        { name: '面拉', sets: 3, reps: '15-20', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_4SHOULDER',
      dayNumber: 4,
      groupName: '腿+腹',
      exercises: JSON.stringify([
        { name: '杠铃深蹲', sets: 4, reps: '6-10', rest: '120秒' },
        { name: '罗马尼亚硬拉', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '保加利亚分腿蹲', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '腿弯举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '站姿提踵', sets: 4, reps: '15-20', rest: '45秒' },
        { name: '卷腹', sets: 3, reps: '15-20', rest: '30秒' },
      ]),
    },

    // GYM_4ARM - 健身房四分化(手臂专项)
    {
      type: 'GYM_4ARM',
      dayNumber: 1,
      groupName: '胸+肩',
      exercises: JSON.stringify([
        { name: '杠铃卧推', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '上斜哑铃卧推', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '哑铃肩推', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '侧平举', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '龙门架夹胸', sets: 3, reps: '12-15', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_4ARM',
      dayNumber: 2,
      groupName: '背',
      exercises: JSON.stringify([
        { name: '引体向上/高位下拉', sets: 4, reps: '8-12', rest: '90秒' },
        { name: '杠铃划船', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '坐姿划船', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '单臂哑铃划船', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '面拉', sets: 3, reps: '15-20', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_4ARM',
      dayNumber: 3,
      groupName: '手臂专项',
      exercises: JSON.stringify([
        { name: '杠铃弯举', sets: 4, reps: '10-12', rest: '60秒' },
        { name: '窄距卧推', sets: 4, reps: '10-12', rest: '60秒' },
        { name: '锤式弯举', sets: 3, reps: '10-12', rest: '45秒' },
        { name: '绳索下压', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '集中弯举', sets: 3, reps: '10-12', rest: '45秒' },
        { name: '仰卧臂屈伸', sets: 3, reps: '10-12', rest: '45秒' },
      ]),
    },
    {
      type: 'GYM_4ARM',
      dayNumber: 4,
      groupName: '腿+腹',
      exercises: JSON.stringify([
        { name: '杠铃深蹲', sets: 4, reps: '6-10', rest: '120秒' },
        { name: '罗马尼亚硬拉', sets: 4, reps: '8-10', rest: '90秒' },
        { name: '腿举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '腿弯举', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '提踵', sets: 4, reps: '15-20', rest: '45秒' },
        { name: '悬垂举腿', sets: 3, reps: '12-15', rest: '45秒' },
      ]),
    },

    // HOME_3SPLIT - 居家三分化
    {
      type: 'HOME_3SPLIT',
      dayNumber: 1,
      groupName: '推(胸肩三头)',
      exercises: JSON.stringify([
        { name: '俯卧撑(标准)', sets: 4, reps: '10-15', rest: '60秒' },
        { name: '上斜俯卧撑', sets: 3, reps: '12-15', rest: '45秒' },
        { name: '钻石俯卧撑', sets: 3, reps: '8-12', rest: '60秒' },
        { name: '哑铃肩推(如有哑铃)', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '凳上臂屈伸', sets: 3, reps: '12-15', rest: '45秒' },
      ]),
    },
    {
      type: 'HOME_3SPLIT',
      dayNumber: 2,
      groupName: '拉(背二头)',
      exercises: JSON.stringify([
        { name: '引体向上(如有单杠)', sets: 4, reps: '6-12', rest: '90秒' },
        { name: '哑铃划船(如有哑铃)', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '反向划船(桌底)', sets: 3, reps: '10-12', rest: '60秒' },
        { name: '哑铃弯举(如有哑铃)', sets: 3, reps: '10-12', rest: '45秒' },
        { name: '弹力带弯举(如有弹力带)', sets: 3, reps: '12-15', rest: '45秒' },
      ]),
    },
    {
      type: 'HOME_3SPLIT',
      dayNumber: 3,
      groupName: '腿+腹',
      exercises: JSON.stringify([
        { name: '保加利亚分腿蹲', sets: 3, reps: '10-12/侧', rest: '60秒' },
        { name: '徒手深蹲', sets: 4, reps: '15-20', rest: '60秒' },
        { name: '臀桥', sets: 3, reps: '15-20', rest: '45秒' },
        { name: '弓步蹲', sets: 3, reps: '10-12/侧', rest: '60秒' },
        { name: '卷腹', sets: 3, reps: '15-20', rest: '30秒' },
        { name: '平板支撑', sets: 3, reps: '30-60秒', rest: '45秒' },
      ]),
    },
  ];

  for (const plan of trainingPlans) {
    await prisma.trainingPlan.create({ data: plan });
  }
  console.log(`✅ ${trainingPlans.length} training plans seeded`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
