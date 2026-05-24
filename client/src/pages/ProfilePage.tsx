import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import * as userApi from '../api/user';
import type { UserBodyData, WeightRecordDTO, BodyDataDTO } from '../types';
import { GENDER_LABELS, GOAL_LABELS, TRAINING_TIME_LABELS, TRAINING_LEVEL_LABELS } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const [bodyDataList, setBodyDataList] = useState<UserBodyData[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, weightRes] = await Promise.all([
        userApi.getProfile(),
        userApi.getWeightRecords(),
      ]);
      setBodyDataList(profileRes.data.bodyData || []);
      setWeightRecords(weightRes.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async () => {
    if (!newWeight || !newDate) return;
    try {
      await userApi.addWeightRecord(Number(newWeight), newDate);
      setSnackbar({ open: true, message: '体重记录保存成功', severity: 'success' });
      setNewWeight('');
      fetchProfile();
    } catch (err: any) {
      setSnackbar({ open: true, message: '保存失败', severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="加载个人信息..." />;

  const latestBody = bodyDataList[0];
  const chartData = weightRecords.map((r) => ({
    date: r.recordedAt,
    weight: r.weight,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Typography variant="h4" gutterBottom>个人中心</Typography>

      {/* Body Data Card */}
      {latestBody && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>最新身体数据</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">性别</Typography>
                <Typography>{GENDER_LABELS[latestBody.gender]}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">身高</Typography>
                <Typography>{latestBody.height} cm</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">体重</Typography>
                <Typography>{latestBody.weight} kg</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">年龄</Typography>
                <Typography>{latestBody.age} 岁</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">目标</Typography>
                <Typography>{GOAL_LABELS[latestBody.goal]}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">力训时段</Typography>
                <Typography>{TRAINING_TIME_LABELS[latestBody.trainingTime]}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">训练水平</Typography>
                <Typography>{TRAINING_LEVEL_LABELS[latestBody.trainingLevel]}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Weight Record Input */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>体重记录</Typography>
          <div className="flex gap-3 items-end flex-wrap">
            <TextField
              label="日期"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 180 }}
            />
            <TextField
              label="体重 (kg)"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              inputProps={{ min: 30, max: 300, step: 0.1 }}
              sx={{ width: 150 }}
            />
            <Button variant="contained" onClick={handleAddWeight}>
              记录
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>体重趋势</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
