import React, { useEffect, useState } from 'react';
import {
  Typography, Tabs, Tab, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Box, Chip, Accordion,
  AccordionSummary, AccordionDetails, Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as trainingApi from '../api/training';
import type { TrainingPlanType } from '../types';
import { TRAINING_PLAN_TYPE_LABELS } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const planTypes: TrainingPlanType[] = ['GYM_3SPLIT', 'GYM_4SHOULDER', 'GYM_4ARM', 'HOME_3SPLIT'];

interface EnhancedExercise {
  name: string;
  grip: string;
  jointActivities: string[];
  sets: string;
  reps: string;
  rest: string;
}

interface ExerciseGroup {
  bodyPart: string;
  subGroup: string;
  setAdvice: string;
  exercises: EnhancedExercise[];
}

interface EnhancedPlan {
  dayTitle: string;
  dayExplanation: string;
  jointHeaders: string[];
  groups: ExerciseGroup[];
}

interface TrainingPlanEnhanced {
  id: string;
  type: TrainingPlanType;
  dayNumber: number;
  groupName: string;
  exercises: EnhancedPlan;
  tips: any;
}

const TrainingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [plans, setPlans] = useState<Record<string, TrainingPlanEnhanced[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await trainingApi.getTrainingPlans();
        const grouped: Record<string, TrainingPlanEnhanced[]> = {};
        for (const plan of res.data) {
          const parsedPlan = {
            ...plan,
            exercises: typeof plan.exercises === 'string' ? JSON.parse(plan.exercises) : plan.exercises,
            tips: typeof (plan as any).tips === 'string' ? JSON.parse((plan as any).tips || '{}') : (plan as any).tips || {},
          };
          if (!grouped[parsedPlan.type]) grouped[parsedPlan.type] = [];
          grouped[parsedPlan.type].push(parsedPlan as any);
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
  const planTips = currentPlans[0]?.tips;

  return (
    <div>
      <Typography variant="h4" gutterBottom>训练计划</Typography>

      {/* Training Tips */}
      {planTips && (
        <Accordion className="mb-4" defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">📖 训练须知 — {planTips.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="space-y-2">
              {planTips.knowledge && (
                <Alert severity="info">
                  <strong>知识准备：</strong>{planTips.knowledge}
                </Alert>
              )}
              <Paper variant="outlined" className="p-3">
                {planTips.frequency && <Typography variant="body2"><strong>训练频率：</strong>{planTips.frequency}</Typography>}
                {planTips.sets && <Typography variant="body2"><strong>训练组数：</strong>{planTips.sets}</Typography>}
                {planTips.rest && <Typography variant="body2"><strong>组间休息：</strong>{planTips.rest}</Typography>}
                {planTips.weight && <Typography variant="body2"><strong>配重选择：</strong>{planTips.weight}</Typography>}
                {planTips.failure && <Typography variant="body2"><strong>是否力竭：</strong>{planTips.failure}</Typography>}
                {planTips.female && <Typography variant="body2" color="secondary"><strong>女性注意：</strong>{planTips.female}</Typography>}
                {planTips.equipment && <Typography variant="body2"><strong>设备准备：</strong>{planTips.equipment}</Typography>}
              </Paper>
            </div>
          </AccordionDetails>
        </Accordion>
      )}

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
          {currentPlans.map((plan) => {
            const ex = plan.exercises;
            return (
              <Card key={plan.id}>
                <CardContent>
                  <Box className="flex items-center gap-2 mb-2">
                    <Chip label={`Day ${plan.dayNumber}`} color="primary" />
                    <Typography variant="h6">{ex.dayTitle || plan.groupName}</Typography>
                  </Box>

                  {ex.dayExplanation && (
                    <Alert severity="info" className="mb-4" icon="💡">
                      {ex.dayExplanation}
                    </Alert>
                  )}

                  {ex.groups?.map((group, gIdx) => (
                    <Box key={gIdx} className="mb-4">
                      <Box className="flex items-center gap-2 mb-2">
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          ▸ {group.bodyPart}{group.subGroup ? ` — ${group.subGroup}` : ''}
                        </Typography>
                        <Chip
                          label={group.setAdvice}
                          variant="outlined"
                          size="small"
                          color="default"
                        />
                      </Box>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>动作</TableCell>
                              <TableCell>握法/变式</TableCell>
                              {ex.jointHeaders?.map((h: string, i: number) => (
                                <TableCell key={i}>{h}</TableCell>
                              ))}
                              <TableCell align="center">组数</TableCell>
                              <TableCell align="center">次数</TableCell>
                              <TableCell align="center">休息</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.exercises.map((exercise, eIdx) => (
                              <TableRow key={eIdx}>
                                <TableCell>
                                  <strong>{exercise.name}</strong>
                                </TableCell>
                                <TableCell>
                                  {exercise.grip && (
                                    <Chip label={exercise.grip} size="small" variant="outlined" />
                                  )}
                                </TableCell>
                                {ex.jointHeaders?.map((_: string, i: number) => (
                                  <TableCell key={i}>
                                    {exercise.jointActivities?.[i] ? (
                                      <Typography variant="body2" color="primary.main">
                                        {exercise.jointActivities[i]}
                                      </Typography>
                                    ) : (
                                      <Typography variant="body2" color="text.disabled">—</Typography>
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell align="center">{exercise.sets || '—'}</TableCell>
                                <TableCell align="center">{exercise.reps || '—'}</TableCell>
                                <TableCell align="center">{exercise.rest || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}

                  {/* Fallback: if groups structure doesn't exist, show old format */}
                  {!ex.groups && Array.isArray(plan.exercises as unknown as any[]) && (
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
                          {(plan.exercises as unknown as any[]).map((ex: any, idx: number) => (
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
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainingPage;
