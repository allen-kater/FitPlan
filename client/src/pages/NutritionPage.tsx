import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Box,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import * as nutritionApi from '../api/nutrition';
import type { DailyNutritionDTO } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

/** 环形图颜色 */
const PIE_COLORS = ['#FF9800', '#2196F3', '#4CAF50'];

const NutritionPage: React.FC = () => {
  const [todayData, setTodayData] = useState<DailyNutritionDTO | null>(null);
  const [rangeData, setRangeData] = useState<DailyNutritionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // 表单数据
  const [formData, setFormData] = useState({
    carbG: 0,
    proteinG: 0,
    fatG: 0,
  });

  /** 自动计算总热量 = 碳水×4 + 蛋白质×4 + 脂肪×9 */
  const autoCalories = formData.carbG * 4 + formData.proteinG * 4 + formData.fatG * 9;

  // 消息提示
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  /** 获取当日营养素数据 */
  const fetchTodayData = useCallback(async () => {
    try {
      const res = await nutritionApi.getNutritionByDate(selectedDate);
      const data = res.data;
      setTodayData(data);
      if (data) {
        setFormData({
          carbG: data.carbG,
          proteinG: data.proteinG,
          fatG: data.fatG,
        });
      } else {
        setFormData({ carbG: 0, proteinG: 0, fatG: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch nutrition:', error);
    }
  }, [selectedDate]);

  /** 获取近7天范围数据 */
  const fetchRangeData = useCallback(async () => {
    try {
      const end = dayjs().format('YYYY-MM-DD');
      const start = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
      const res = await nutritionApi.getNutritionRange(start, end);
      setRangeData(res.data);
    } catch (error) {
      console.error('Failed to fetch nutrition range:', error);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchTodayData(), fetchRangeData()]);
      setLoading(false);
    };
    load();
  }, [fetchTodayData, fetchRangeData]);

  /** 保存营养素记录 */
  const handleSave = async () => {
    try {
      await nutritionApi.saveNutrition({
        date: selectedDate,
        carbG: formData.carbG,
        proteinG: formData.proteinG,
        fatG: formData.fatG,
        calories: autoCalories,
      });
      setSnackbar({ open: true, message: '营养素记录保存成功', severity: 'success' });
      fetchTodayData();
      fetchRangeData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || '保存失败';
      setSnackbar({ open: true, message: `保存失败：${msg}`, severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="加载营养素数据..." />;

  // 环形图数据
  const pieData = [
    { name: '碳水', value: formData.carbG * 4, grams: formData.carbG },
    { name: '蛋白质', value: formData.proteinG * 4, grams: formData.proteinG },
    { name: '脂肪', value: formData.fatG * 9, grams: formData.fatG },
  ].filter((d) => d.value > 0 || d.grams > 0);

  // 进度条数据（假设目标：碳水300g, 蛋白质150g, 脂肪70g）
  const targets = { carb: 300, protein: 150, fat: 70 };

  // 近7天柱状图数据
  const barData = [];
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    const found = rangeData.find((d) => d.date === date);
    barData.push({
      date: date.slice(5), // MM-DD
      碳水: found?.carbG ?? 0,
      蛋白质: found?.proteinG ?? 0,
      脂肪: found?.fatG ?? 0,
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Typography variant="h4" gutterBottom>营养追踪</Typography>

      <Grid container spacing={3}>
        {/* 输入区 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>记录营养素</Typography>
              <TextField
                label="日期"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ mb: 2 }}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="碳水 (g)"
                  type="number"
                  value={formData.carbG}
                  onChange={(e) => setFormData({ ...formData, carbG: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 1 }}
                />
                <TextField
                  label="蛋白质 (g)"
                  type="number"
                  value={formData.proteinG}
                  onChange={(e) => setFormData({ ...formData, proteinG: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 1 }}
                />
                <TextField
                  label="脂肪 (g)"
                  type="number"
                  value={formData.fatG}
                  onChange={(e) => setFormData({ ...formData, fatG: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 1 }}
                />
                <TextField
                  label="总热量 (kcal)"
                  type="number"
                  value={autoCalories}
                  InputProps={{ readOnly: true }}
                  helperText="自动计算 = 碳水×4 + 蛋白质×4 + 脂肪×9"
                />
              </div>
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave}>
                保存记录
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 环形图 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>今日营养素分布</Typography>
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
                      {pieData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} kcal`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height={250}>
                  <Typography color="text.secondary">暂无数据</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 进度条 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>宏量营养素进度（目标参考）</Typography>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <Typography variant="body2">碳水</Typography>
                <Typography variant="body2">{formData.carbG}g / {targets.carb}g</Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (formData.carbG / targets.carb) * 100)}
                sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { backgroundColor: '#FF9800' } }}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Typography variant="body2">蛋白质</Typography>
                <Typography variant="body2">{formData.proteinG}g / {targets.protein}g</Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (formData.proteinG / targets.protein) * 100)}
                sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { backgroundColor: '#2196F3' } }}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Typography variant="body2">脂肪</Typography>
                <Typography variant="body2">{formData.fatG}g / {targets.fat}g</Typography>
              </div>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (formData.fatG / targets.fat) * 100)}
                sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { backgroundColor: '#4CAF50' } }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 近7天柱状图 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>近7天营养素趋势</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="碳水" fill="#FF9800" />
              <Bar dataKey="蛋白质" fill="#2196F3" />
              <Bar dataKey="脂肪" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 消息提示 */}
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
