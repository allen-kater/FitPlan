import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import * as planApi from '../api/plan';
import type { FitnessPlanDTO, MealItem } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

  const renderMealTable = (title: string, meals: MealItem[], targetCal: number) => (
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
                <TableCell align="right">碳水 (g)</TableCell>
                <TableCell align="right">蛋白质 (g)</TableCell>
                <TableCell align="right">脂肪 (g)</TableCell>
                <TableCell align="right">热量 (kcal)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meals.map((meal, idx) => {
                const cal = (meal.carbG ?? 0) * 4 + (meal.proteinG ?? 0) * 4 + (meal.fatG ?? 0) * 9;
                return (
                  <TableRow key={idx}>
                    <TableCell>{meal.name}</TableCell>
                    <TableCell align="right">{meal.carbG ?? 0}</TableCell>
                    <TableCell align="right">{meal.proteinG ?? 0}</TableCell>
                    <TableCell align="right">{meal.fatG ?? 0}</TableCell>
                    <TableCell align="right">{Math.round(cal)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
        返回
      </Button>

      <Typography variant="h4" gutterBottom>
        健身方案详情
        <Chip label={plan.planType} color="primary" className="ml-2" />
      </Typography>

      {/* Key Metrics */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>核心指标</Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'BMI', value: plan.bmi },
              { label: 'BMR', value: `${plan.bmr} kcal` },
              { label: 'TDEE', value: `${plan.tdee} kcal` },
              { label: '力训消耗', value: `${plan.trainingCalorie} kcal` },
              { label: '有氧消耗', value: `${plan.cardioCalorie} kcal` },
              { label: '力训日平衡', value: `${plan.trainingDayMaintenance} kcal` },
              { label: '休息日平衡', value: `${plan.restDayMaintenance} kcal` },
              { label: '力训日目标', value: `${plan.trainingDayTarget} kcal` },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-blue-50 rounded">
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                <Typography variant="body1" fontWeight="bold">{item.value}</Typography>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Macronutrient Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>宏量营养素</Typography>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 rounded">
              <Typography variant="caption" color="text.secondary">蛋白质</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.proteinG}g</Typography>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <Typography variant="caption" color="text.secondary">脂肪</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.fatG}g</Typography>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <Typography variant="caption" color="text.secondary">力训日碳水</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.trainingDayCarbG}g</Typography>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <Typography variant="caption" color="text.secondary">休息日碳水</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.restDayCarbG}g</Typography>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <Typography variant="caption" color="text.secondary">休息日目标</Typography>
              <Typography variant="body1" fontWeight="bold">{plan.restDayTarget} kcal</Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Tables */}
      {renderMealTable('力训日饮食', plan.trainingDayMeals, plan.trainingDayTarget)}
      {renderMealTable('休息日饮食', plan.restDayMeals, plan.restDayTarget)}

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
