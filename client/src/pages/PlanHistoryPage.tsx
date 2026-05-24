import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Grid,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import * as planApi from '../api/plan';
import type { FitnessPlanDTO } from '../types';
import { GOAL_LABELS } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useUIStore } from '../stores/uiStore';

const PlanHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<FitnessPlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const showSnackbar = useUIStore((s) => s.showSnackbar);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await planApi.getPlans();
      setPlans(res.data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await planApi.deletePlan(deleteId);
      setPlans((prev) => prev.filter((p) => p.id !== deleteId));
      showSnackbar('方案已删除', 'success');
    } catch (error) {
      showSnackbar('删除失败', 'error');
    }
    setDeleteId(null);
  };

  if (loading) return <LoadingSpinner message="加载方案列表..." />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>我的方案</Typography>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Typography color="text.secondary">还没有方案，去制定一个吧！</Typography>
            <Button variant="contained" className="mt-4" onClick={() => navigate('/plan/create')}>
              制定方案
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <Chip label={plan.planType} color="primary" size="small" />
                    <Chip
                      label={plan.bodyData?.goal ? GOAL_LABELS[plan.bodyData.goal as keyof typeof GOAL_LABELS] : ''}
                      color={plan.bodyData?.goal === 'FAT_LOSS' ? 'warning' : 'success'}
                      size="small"
                    />
                  </div>
                  <Typography variant="body2" color="text.secondary" className="mb-1">
                    BMI: {plan.bmi} | BMR: {plan.bmr} kcal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    力训日: {plan.trainingDayTarget} kcal | 休息日: {plan.restDayTarget} kcal
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="mt-2 block">
                    {new Date(plan.createdAt).toLocaleString('zh-CN')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/plan/${plan.id}`)}
                  >
                    查看
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteId(plan.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="删除方案"
        message="确定要删除这个方案吗？删除后无法恢复。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default PlanHistoryPage;
