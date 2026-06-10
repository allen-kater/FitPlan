import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Button, Divider, List, ListItem, ListItemIcon,
  ListItemText, Accordion, AccordionSummary, AccordionDetails,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import InfoIcon from '@mui/icons-material/Info';
import * as planApi from '../api/plan';
import type { FitnessPlanDTO, MealItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

// 食物推荐数据
const FOOD_RECOMMENDATIONS: Record<string, { carb: string; protein: string; fat: string }> = {
  '早餐': { carb: '燕麦片/全麦面包', protein: '鸡蛋/牛奶', fat: '牛油果/坚果' },
  '加餐': { carb: '香蕉/苹果', protein: '希腊酸奶/坚果', fat: '坚果' },
  '午餐': { carb: '糙米饭/意面', protein: '鸡胸肉/鱼肉', fat: '橄榄油' },
  '练前餐': { carb: '红薯/香蕉', protein: '乳清蛋白', fat: '' },
  '练后餐': { carb: '白米饭/面包', protein: '鸡胸肉/蛋白粉', fat: '' },
  '晚餐': { carb: '杂粮饭/紫薯', protein: '瘦牛肉/虾仁', fat: '橄榄油/亚麻籽油' },
  '睡前餐': { carb: '', protein: '酪蛋白/牛奶', fat: '坚果' },
};

// 核心指标说明
const METRIC_INFO: Record<string, { name: string; formula: string; desc: string }> = {
  'BMI': {
    name: '身体质量指数',
    formula: 'BMI = 体重(kg) ÷ 身高(m)²',
    desc: '衡量体重与身高比例的指标',
  },
  'BMR': {
    name: '基础代谢率',
    formula: '男: 体重×9.99 + 身高×6.25 - 年龄×4.92 + 5\n女: 体重×9.99 + 身高×6.25 - 年龄×4.92 - 161',
    desc: '身体在静息状态下维持生命所需的最低热量',
  },
  'TDEE': {
    name: '每日总消耗',
    formula: 'TDEE = BMR ÷ 0.7',
    desc: '包含日常活动在内每天的总热量消耗',
  },
  '力训消耗': {
    name: '力量训练消耗',
    formula: '根据性别和训练等级确定（新手150-200/中级200-250/高级250-300）',
    desc: '每次力量训练大约消耗的热量',
  },
  '有氧消耗': {
    name: '有氧运动消耗',
    formula: '(运动心率÷静息心率×6.4-6.2)×体重×时长÷7',
    desc: '有氧运动消耗的热量，仅减脂且体重<80kg时计算',
  },
  '力训日平衡': {
    name: '力训日维持热量',
    formula: '力训日平衡 = TDEE + 力训消耗 + 有氧消耗',
    desc: '力训日保持体重不变所需的热量',
  },
  '休息日平衡': {
    name: '休息日维持热量',
    formula: '休息日平衡 = TDEE + 有氧消耗',
    desc: '休息日保持体重不变所需的热量',
  },
  '力训日目标': {
    name: '力训日目标热量',
    formula: '减脂: 力训日平衡 × 0.64 | 增肌: 力训日平衡 × 0.84',
    desc: '力训日的实际摄入目标，减脂时低于平衡值，增肌时略低',
  },
};

/** BMI分级 */
function getBMICategory(bmi: number): { label: string; color: string; desc: string } {
  if (bmi < 18.5) return { label: '偏瘦', color: '#2196F3', desc: 'BMI < 18.5，体重偏低，建议增肌' };
  if (bmi < 24) return { label: '标准', color: '#4CAF50', desc: '18.5 ≤ BMI < 24，体重正常，保持即可' };
  if (bmi < 28) return { label: '超重', color: '#FF9800', desc: '24 ≤ BMI < 28，体重超标，建议减脂' };
  return { label: '肥胖', color: '#f44336', desc: 'BMI ≥ 28，体重肥胖，需积极减脂' };
}

const PlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<FitnessPlanDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPlan = async () => {
      try {
        const res = await planApi.getPlanById(id);
        setPlan(res.data);
      } catch (error) {
        console.error('Failed to fetch plan:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  if (loading) return <LoadingSpinner message="加载方案中..." />;
  if (!plan) return <Typography>方案不存在</Typography>;

  const renderMealTable = (title: string, meals: MealItem[], targetCal: number, isTrainingDay: boolean) => {
    const totalCarb = meals.reduce((s, m) => s + (m.carbG ?? 0), 0);
    const totalProtein = meals.reduce((s, m) => s + (m.proteinG ?? 0), 0);
    const totalFat = meals.reduce((s, m) => s + (m.fatG ?? 0), 0);

    return (
      <Card className="mb-6">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
            <Chip label={`目标热量 ${targetCal} kcal`} color="primary" size="small" className="ml-2" />
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>餐次</TableCell>
                  <TableCell align="right">碳水(g)</TableCell>
                  <TableCell align="right">碳水占比</TableCell>
                  <TableCell align="right">蛋白质(g)</TableCell>
                  <TableCell align="right">蛋白占比</TableCell>
                  <TableCell align="right">脂肪(g)</TableCell>
                  <TableCell align="right">脂肪占比</TableCell>
                  <TableCell align="right">热量(kcal)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map((meal, idx) => {
                  const cal = (meal.carbG ?? 0) * 4 + (meal.proteinG ?? 0) * 4 + (meal.fatG ?? 0) * 9;
                  const carbPct = totalCarb > 0 ? ((meal.carbG ?? 0) / totalCarb * 100).toFixed(1) : '0';
                  const proteinPct = totalProtein > 0 ? ((meal.proteinG ?? 0) / totalProtein * 100).toFixed(1) : '0';
                  const fatPct = totalFat > 0 ? ((meal.fatG ?? 0) / totalFat * 100).toFixed(1) : '0';

                  // 匹配食物推荐
                  const mealName = meal.name.replace(/[\d+]/g, '').trim();
                  let foodRec = FOOD_RECOMMENDATIONS[mealName];
                  if (!foodRec) {
                    // 模糊匹配
                    const key = Object.keys(FOOD_RECOMMENDATIONS).find(k => mealName.includes(k));
                    if (key) foodRec = FOOD_RECOMMENDATIONS[key];
                  }

                  return (
                    <React.Fragment key={idx}>
                      <TableRow>
                        <TableCell>{meal.name}</TableCell>
                        <TableCell align="right">{meal.carbG ?? 0}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${carbPct}%`} size="small" variant="outlined" color="warning" />
                        </TableCell>
                        <TableCell align="right">{meal.proteinG ?? 0}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${proteinPct}%`} size="small" variant="outlined" color="success" />
                        </TableCell>
                        <TableCell align="right">{meal.fatG ?? 0}</TableCell>
                        <TableCell align="right">
                          <Chip label={`${fatPct}%`} size="small" variant="outlined" color="error" />
                        </TableCell>
                        <TableCell align="right">{Math.round(cal)}</TableCell>
                      </TableRow>
                      {foodRec && (
                        <TableRow>
                          <TableCell colSpan={8} sx={{ py: 0.5, bgcolor: 'action.hover' }}>
                            <Typography variant="caption" color="text.secondary">
                              🍽️ 推荐：{foodRec.carb && `碳水→${foodRec.carb}`}
                              {foodRec.carb && foodRec.protein && ' | '}
                              {foodRec.protein && `蛋白质→${foodRec.protein}`}
                              {foodRec.protein && foodRec.fat && ' | '}
                              {foodRec.fat && `脂肪→${foodRec.fat}`}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
                {/* 合计行 */}
                <TableRow sx={{ bgcolor: 'action.selected' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>合计</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalCarb}</TableCell>
                  <TableCell align="right">100%</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalProtein}</TableCell>
                  <TableCell align="right">100%</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{totalFat}</TableCell>
                  <TableCell align="right">100%</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {totalCarb * 4 + totalProtein * 4 + totalFat * 9}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        返回
      </Button>

      <Typography variant="h4" gutterBottom>
        健身方案详情
        <Chip label={plan.planType} color="primary" className="ml-2" />
      </Typography>

      {/* 核心指标注释说明 */}
      <Card sx={{ borderLeft: '4px solid #1976d2' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <InfoIcon className="mr-1 align-middle" color="primary" />
            核心指标说明
          </Typography>
          <div className="space-y-3">
            {Object.entries(METRIC_INFO).map(([key, info]) => (
              <div key={key} className="pl-2 border-l-2 border-blue-200">
                <Typography variant="subtitle2" fontWeight="bold" color="primary">
                  {key} - {info.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  公式: {info.formula}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  含义: {info.desc}
                </Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 基本信息 + BMI分级 */}
      {plan.bodyData && (
        <Card sx={{ borderLeft: '4px solid #4CAF50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>基本信息</Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <Typography variant="caption" color="text.secondary">身高</Typography>
                <Typography variant="body1" fontWeight="bold">{plan.bodyData.height} cm</Typography>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <Typography variant="caption" color="text.secondary">体重</Typography>
                <Typography variant="body1" fontWeight="bold">{plan.bodyData.weight} kg</Typography>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <Typography variant="caption" color="text.secondary">年龄</Typography>
                <Typography variant="body1" fontWeight="bold">{plan.bodyData.age} 岁</Typography>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                <Typography variant="caption" color="text.secondary">目标</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {plan.bodyData.goal === 'MUSCLE_GAIN' ? '增肌' : '减脂'}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 核心指标数据（BMI带分级） */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>核心指标</Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* BMI 带分级 */}
            {(() => {
              const bmiCat = getBMICategory(plan.bmi);
              return (
                <div key="BMI" className="text-center p-3 rounded" style={{ backgroundColor: `${bmiCat.color}15`, border: `1px solid ${bmiCat.color}40` }}>
                  <Typography variant="caption" color="text.secondary">BMI</Typography>
                  <Typography variant="body1" fontWeight="bold">{plan.bmi}</Typography>
                  <Chip label={bmiCat.label} size="small" sx={{ mt: 0.5, bgcolor: bmiCat.color, color: '#fff', fontSize: '0.7rem' }} />
                  <Typography variant="caption" color="text.secondary" className="block mt-1">{bmiCat.desc}</Typography>
                </div>
              );
            })()}
            {[
              { label: 'BMR', value: `${plan.bmr} kcal` },
              { label: 'TDEE', value: `${plan.tdee} kcal` },
              { label: '力训消耗', value: `${plan.trainingCalorie} kcal` },
              { label: '有氧消耗', value: `${plan.cardioCalorie} kcal` },
              { label: '力训日平衡', value: `${plan.trainingDayMaintenance} kcal` },
              { label: '休息日平衡', value: `${plan.restDayMaintenance} kcal` },
              { label: '力训日目标', value: `${plan.trainingDayTarget} kcal` },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                <Typography variant="body1" fontWeight="bold">{item.value}</Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 碳水蛋白质配额 */}
      <Card sx={{ borderLeft: '4px solid #FF9800' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>碳水化合物蛋白质配额</Typography>
          <Typography variant="body2" color="text.secondary" className="mb-3">
            根据您的性别、身高、体重和目标，推荐的每日营养素配额如下（单位：g/kg体重）：
          </Typography>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
              <Typography variant="caption" color="text.secondary">力训日碳水</Typography>
              <Typography variant="h5" fontWeight="bold" color="orange">{plan.trainingDayCarbQuota}</Typography>
              <Typography variant="caption" color="text.secondary">g/kg</Typography>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded">
              <Typography variant="caption" color="text.secondary">休息日碳水</Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.dark">{plan.restDayCarbQuota}</Typography>
              <Typography variant="caption" color="text.secondary">g/kg</Typography>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <Typography variant="caption" color="text.secondary">每日蛋白质</Typography>
              <Typography variant="h5" fontWeight="bold" color="green">{plan.proteinQuota}</Typography>
              <Typography variant="caption" color="text.secondary">g/kg</Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 宏量营养素 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>宏量营养素</Typography>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <Typography variant="caption" color="text.secondary">蛋白质</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.proteinG}g</Typography>
            </div>
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <Typography variant="caption" color="text.secondary">脂肪</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.fatG}g</Typography>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
              <Typography variant="caption" color="text.secondary">力训日碳水</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.trainingDayCarbG}g</Typography>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
              <Typography variant="caption" color="text.secondary">休息日碳水</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.restDayCarbG}g</Typography>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <Typography variant="caption" color="text.secondary">休息日目标</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.restDayTarget} kcal</Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Tables */}
      {renderMealTable('力训日饮食', plan.trainingDayMeals, plan.trainingDayTarget, true)}
      {renderMealTable('休息日饮食', plan.restDayMeals, plan.restDayTarget, false)}

      {/* Exercise Advice */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FitnessCenterIcon className="mr-1 align-middle" />
            运动建议
          </Typography>
          <List>
            {(plan.exerciseAdvice as string[] || []).map((advice, idx) => (
              <ListItem key={idx}>
                <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                <ListItemText primary={advice} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Precautions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <WarningIcon color="warning" className="mr-1 align-middle" />
            注意事项
          </Typography>
          <List>
            {(plan.precautions as string[] || []).map((item, idx) => (
              <ListItem key={idx}>
                <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanDetailPage;
