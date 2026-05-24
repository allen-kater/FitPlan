import React, { useEffect, useState } from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import * as trainingApi from '../api/training';
import type { TrainingPlanDTO, TrainingPlanType, ExerciseItem } from '../types';
import { TRAINING_PLAN_TYPE_LABELS } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const planTypes: TrainingPlanType[] = ['GYM_3SPLIT', 'GYM_4SHOULDER', 'GYM_4ARM', 'HOME_3SPLIT'];

const TrainingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState<Record<string, TrainingPlanDTO[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await trainingApi.getTrainingPlans();
        const grouped: Record<string, TrainingPlanDTO[]> = {};
        for (const plan of res.data) {
          if (!grouped[plan.type]) grouped[plan.type] = [];
          grouped[plan.type].push(plan);
        }
        setPlans(grouped);
      } catch (error) {
        console.error('Failed to fetch training plans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <LoadingSpinner message="加载训练计划..." />;

  const currentType = planTypes[activeTab];
  const currentPlans = plans[currentType] || [];

  return (
    <div>
      <Typography variant="h4" gutterBottom>训练计划</Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        className="mb-6"
      >
        {planTypes.map((type, idx) => (
          <Tab key={type} label={TRAINING_PLAN_TYPE_LABELS[type]} />
        ))}
      </Tabs>

      {currentPlans.length === 0 ? (
        <Typography color="text.secondary">暂无该类型的训练计划数据</Typography>
      ) : (
        <div className="space-y-6">
          {currentPlans.map((plan) => (
            <Card key={plan.id}>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Chip label={`Day ${plan.dayNumber}`} color="primary" />
                  <Typography variant="h6">{plan.groupName}</Typography>
                </div>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>动作</TableCell>
                        <TableCell align="center">组数</TableCell>
                        <TableCell align="center">次数</TableCell>
                        <TableCell align="center">组间休息</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(plan.exercises as ExerciseItem[]).map((ex, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{ex.name}</TableCell>
                          <TableCell align="center">{ex.sets}</TableCell>
                          <TableCell align="center">{ex.reps}</TableCell>
                          <TableCell align="center">{ex.rest}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
