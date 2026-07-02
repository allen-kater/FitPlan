import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Typography, Card, CardContent, TextField, Button, Grid, Box,
  LinearProgress, Snackbar, Alert, Autocomplete, Chip, Divider,
  IconButton, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HotelIcon from '@mui/icons-material/Hotel';
import dayjs from 'dayjs';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import * as nutritionApi from '../api/nutrition';
import * as knowledgeApi from '../api/knowledge';
import * as planApi from '../api/plan';
import type { DailyNutritionDTO, FoodDTO, FoodCategory, FitnessPlanDTO } from '../types';
import { FOOD_CATEGORY_LABELS } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const PIE_COLORS = ['#FF9800', '#2196F3', '#4CAF50'];

/** 饮食记录中的一条食物 */
interface FoodEntry {
  id: string;          // 前端临时 id
  foodId: string;
  foodName: string;
  category: FoodCategory;
  /** 摄入克数（用户输入的量） */
  grams: number;
  /** 营养率（按食物类别区分含义：碳水/蛋白/脂肪率） */
  nutritionRate: number;
  /** 由 grams × nutritionRate 计算 */
  carbG: number;
  proteinG: number;
  fatG: number;
  calories: number;
}

const NutritionPage: React.FC = () => {
  // ============= 状态 =============
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [isTrainingDay, setIsTrainingDay] = useState<boolean>(true);
  const [foods, setFoods] = useState<FoodDTO[]>([]);
  const [latestPlan, setLatestPlan] = useState<FitnessPlanDTO | null>(null);
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [existingRecord, setExistingRecord] = useState<DailyNutritionDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // 选食物
  const [selectedFood, setSelectedFood] = useState<FoodDTO | null>(null);
  const [gramsInput, setGramsInput] = useState<string>('100');

  // 目标值（碳蛋脂 g）
  const targets = useMemo(() => {
    if (!latestPlan) {
      // 默认目标：碳水 300g / 蛋白 150g / 脂肪 70g
      return { carb: 300, protein: 150, fat: 70 };
    }
    return {
      carb: isTrainingDay ? latestPlan.trainingDayCarbG : latestPlan.restDayCarbG,
      protein: latestPlan.proteinG,
      fat: latestPlan.fatG,
    };
  }, [latestPlan, isTrainingDay]);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  // ============= 数据加载 =============
  const fetchFoods = useCallback(async () => {
    try {
      const res = await knowledgeApi.getFoods();
      setFoods(res.data);
    } catch (e) {
      console.error('Failed to fetch foods', e);
    }
  }, []);

  const fetchPlan = useCallback(async () => {
    try {
      const res = await planApi.getPlans();
      if (res.data && res.data.length > 0) {
        // 取最近一个方案
        const sorted = [...res.data].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLatestPlan(sorted[0]);
      }
    } catch (e) {
      console.error('Failed to fetch plans', e);
    }
  }, []);

  const fetchRecord = useCallback(async () => {
    try {
      const res = await nutritionApi.getNutritionByDate(selectedDate);
      const data = res.data;
      setExistingRecord(data);
      if (data && (data as any).entries) {
        // 后端未来可能存 entries 数组（兼容旧逻辑）
        setEntries((data as any).entries);
      } else {
        setEntries([]);
      }
    } catch (e) {
      console.error('Failed to fetch record', e);
    }
  }, [selectedDate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchFoods(), fetchPlan(), fetchRecord()]);
      setLoading(false);
    };
    load();
  }, [fetchFoods, fetchPlan, fetchRecord]);

  // ============= 食物反推碳蛋脂 =============
  /**
   * 核心算法：根据用户输入的"食物名称 + 克数"反算碳蛋脂
   * 规则：
   *   - CARB 类食物：nutritionRate 表示"碳水率" → grams * rate = 碳水克数
   *   - PROTEIN 类食物：nutritionRate 表示"蛋白率" → grams * rate = 蛋白克数
   *   - FAT 类食物：nutritionRate 表示"脂肪率" → grams * rate = 脂肪克数
   * 热量 = 碳水×4 + 蛋白×4 + 脂肪×9
   */
  const calcMacros = (food: FoodDTO, grams: number) => {
    const r = food.nutritionRate;
    let carb = 0, protein = 0, fat = 0;
    if (food.category === 'CARB') {
      carb = grams * r;
    } else if (food.category === 'PROTEIN') {
      protein = grams * r;
    } else if (food.category === 'FAT') {
      fat = grams * r;
    }
    return {
      carb: +carb.toFixed(1),
      protein: +protein.toFixed(1),
      fat: +fat.toFixed(1),
      calories: +((carb + protein) * 4 + fat * 9).toFixed(0),
    };
  };

  // ============= 累加器 =============
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => ({
        carb: acc.carb + e.carbG,
        protein: acc.protein + e.proteinG,
        fat: acc.fat + e.fatG,
        calories: acc.calories + e.calories,
      }),
      { carb: 0, protein: 0, fat: 0, calories: 0 }
    );
  }, [entries]);

  // ============= 操作 =============
  const handleAddFood = () => {
    if (!selectedFood) {
      setSnackbar({ open: true, message: '请先选择食物', severity: 'error' });
      return;
    }
    const grams = Number(gramsInput);
    if (!grams || grams <= 0) {
      setSnackbar({ open: true, message: '克数必须大于 0', severity: 'error' });
      return;
    }
    const m = calcMacros(selectedFood, grams);
    const entry: FoodEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      category: selectedFood.category,
      grams,
      nutritionRate: selectedFood.nutritionRate,
      carbG: m.carb,
      proteinG: m.protein,
      fatG: m.fat,
      calories: m.calories,
    };
    setEntries((prev) => [...prev, entry]);
    setSelectedFood(null);
    setGramsInput('100');
  };

  const handleRemoveEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = async () => {
    try {
      // 后端接口目前只接受 carbG/proteinG/fatG/calories，所以把 entries 累加后保存
      await nutritionApi.saveNutrition({
        date: selectedDate,
        carbG: +totals.carb.toFixed(1),
        proteinG: +totals.protein.toFixed(1),
        fatG: +totals.fat.toFixed(1),
        calories: Math.round(totals.calories),
      });
      setSnackbar({ open: true, message: '饮食记录保存成功', severity: 'success' });
      fetchRecord();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '保存失败';
      setSnackbar({ open: true, message: `保存失败：${msg}`, severity: 'error' });
    }
  };

  // ============= 图表数据 =============
  const pieData = [
    { name: '碳水', value: totals.carb * 4, grams: +totals.carb.toFixed(1) },
    { name: '蛋白质', value: totals.protein * 4, grams: +totals.protein.toFixed(1) },
    { name: '脂肪', value: totals.fat * 9, grams: +totals.fat.toFixed(1) },
  ].filter((d) => d.value > 0);

  if (loading) return <LoadingSpinner message="加载食物与方案数据..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Typography variant="h4" gutterBottom>饮食记录</Typography>
      <Typography color="text.secondary" className="mb-2">
        选择食物并输入克数，系统自动反算碳蛋脂摄入量。
      </Typography>

      {/* 日期 + 力训/休息日切换 + 方案目标 */}
      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                label="日期"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Tabs
                value={isTrainingDay ? 0 : 1}
                onChange={(_, v) => setIsTrainingDay(v === 0)}
                variant="fullWidth"
              >
                <Tab icon={<FitnessCenterIcon />} label="力训日" />
                <Tab icon={<HotelIcon />} label="休息日" />
              </Tabs>
            </Grid>
            <Grid item xs={12} md={5}>
              {latestPlan ? (
                <Box className="text-right">
                  <Typography variant="caption" color="text.secondary">
                    最近方案（{dayjs(latestPlan.createdAt).format('YYYY-MM-DD')}）目标：
                  </Typography>
                  <Box className="flex gap-1 justify-end mt-1">
                    <Chip size="small" label={`碳水 ${targets.carb}g`} color="warning" />
                    <Chip size="small" label={`蛋白 ${targets.protein}g`} color="success" />
                    <Chip size="small" label={`脂肪 ${targets.fat}g`} color="default" />
                  </Box>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary" className="block text-right">
                  未找到方案，使用默认目标（300/150/70g）
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 食物输入区 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>添加食物</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={foods}
                getOptionLabel={(o) => `${o.name}（${FOOD_CATEGORY_LABELS[o.category]} ${(o.nutritionRate * 100).toFixed(0)}%）`}
                value={selectedFood}
                onChange={(_, v) => setSelectedFood(v)}
                renderInput={(params) => (
                  <TextField {...params} label="选择食物" placeholder="搜索食物名（如：米饭、鸡蛋、牛奶）" />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box className="flex items-center gap-2 w-full">
                      <Chip
                        label={FOOD_CATEGORY_LABELS[option.category]}
                        size="small"
                        color={option.category === 'CARB' ? 'warning' : option.category === 'PROTEIN' ? 'success' : 'default'}
                      />
                      <span className="flex-1">{option.name}</span>
                      <Typography variant="caption" color="text.secondary">
                        {(option.nutritionRate * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                label="克数 (g)"
                type="number"
                value={gramsInput}
                onChange={(e) => setGramsInput(e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} md={2}>
              {selectedFood && gramsInput && Number(gramsInput) > 0 && (
                <Box className="text-xs text-gray-600 leading-tight">
                  {(() => {
                    const m = calcMacros(selectedFood, Number(gramsInput));
                    return (
                      <>
                        {selectedFood.category === 'CARB' && <div>碳水: <b>{m.carb}g</b></div>}
                        {selectedFood.category === 'PROTEIN' && <div>蛋白质: <b>{m.protein}g</b></div>}
                        {selectedFood.category === 'FAT' && <div>脂肪: <b>{m.fat}g</b></div>}
                        <div>热量: <b>{m.calories} kcal</b></div>
                      </>
                    );
                  })()}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" startIcon={<AddIcon />} fullWidth onClick={handleAddFood}>
                添加
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 食物记录列表 */}
      {entries.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>今日饮食列表</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>食物</TableCell>
                    <TableCell>分类</TableCell>
                    <TableCell align="right">克数</TableCell>
                    <TableCell align="right">营养率</TableCell>
                    <TableCell align="right">碳蛋脂 (g)</TableCell>
                    <TableCell align="right">热量</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.foodName}</TableCell>
                      <TableCell>
                        <Chip
                          label={FOOD_CATEGORY_LABELS[e.category]}
                          size="small"
                          color={e.category === 'CARB' ? 'warning' : e.category === 'PROTEIN' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">{e.grams}g</TableCell>
                      <TableCell align="right">{(e.nutritionRate * 100).toFixed(0)}%</TableCell>
                      <TableCell align="right">
                        {e.carbG > 0 && <span className="text-orange-600">碳{e.carbG} </span>}
                        {e.proteinG > 0 && <span className="text-blue-600">蛋{e.proteinG} </span>}
                        {e.fatG > 0 && <span className="text-green-600">脂{e.fatG}</span>}
                      </TableCell>
                      <TableCell align="right">{e.calories} kcal</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleRemoveEntry(e.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.selected' }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>合计</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      碳{totals.carb.toFixed(1)} 蛋{totals.protein.toFixed(1)} 脂{totals.fat.toFixed(1)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{Math.round(totals.calories)} kcal</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* 进度条 + 环形图 */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>宏量营养素进度</Typography>
              <div className="space-y-3">
                {(() => {
                  const rows = [
                    { label: '碳水', value: totals.carb, target: targets.carb, color: '#FF9800' },
                    { label: '蛋白质', value: totals.protein, target: targets.protein, color: '#2196F3' },
                    { label: '脂肪', value: totals.fat, target: targets.fat, color: '#4CAF50' },
                  ];
                  return rows.map((r) => {
                    const pct = r.target > 0 ? Math.min(100, (r.value / r.target) * 100) : 0;
                    return (
                      <div key={r.label}>
                        <div className="flex justify-between mb-1">
                          <Typography variant="body2">{r.label}</Typography>
                          <Typography variant="body2">
                            <b>{r.value.toFixed(1)}g</b> / {r.target}g ({pct.toFixed(0)}%)
                          </Typography>
                        </div>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': { backgroundColor: r.color },
                          }}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
              <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSave}>
                保存今日记录
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>营养素分布</Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, grams }) => `${name}: ${grams}g`}
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RTooltip formatter={(v: number) => `${v} kcal`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box className="h-64 flex items-center justify-center text-gray-500">
                  还没有添加食物
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NutritionPage;
