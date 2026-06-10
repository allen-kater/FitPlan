import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper,
  Tabs, Tab, Box, Alert, CircularProgress,
} from '@mui/material';
import client from '../api/client';

interface QuotaEntry {
  trainingDayCarb: number;
  restDayCarb: number;
  protein: number;
}

interface QuotaData {
  male: {
    fatLoss: { heights: number[]; data: Record<number, Record<number, QuotaEntry>> };
    muscleGain: { heights: number[]; data: Record<number, Record<number, QuotaEntry>> };
  };
  female: {
    fatLoss: { heights: number[]; data: Record<number, Record<number, QuotaEntry>> };
    muscleGain: { heights: number[]; data: Record<number, Record<number, QuotaEntry>> };
  };
}

const QuotaPage: React.FC = () => {
  const [data, setData] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [genderTab, setGenderTab] = useState(0);  // 0=male, 1=female
  const [goalTab, setGoalTab] = useState(0);       // 0=fatLoss, 1=muscleGain

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await client.get('/knowledge/quota');
        if (res.data?.code === 200) setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch quota data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" py={6}>
      <CircularProgress />
    </Box>
  );

  if (!data) return <Typography>加载配额数据失败</Typography>;

  const genderKey = genderTab === 0 ? 'male' : 'female';
  const goalKey = goalTab === 0 ? 'fatLoss' : 'muscleGain';
  const section = data[genderKey][goalKey];
  const heights = section.heights;

  // 收集所有体重档位
  const weightSet = new Set<number>();
  for (const h of heights) {
    Object.keys(section.data[h] || {}).forEach(w => weightSet.add(Number(w)));
  }
  const weights = Array.from(weightSet).sort((a, b) => a - b);

  return (
    <div className="max-w-full mx-auto">
      <Typography variant="h4" gutterBottom>碳水化合物蛋白质配额表</Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>说明：</strong>表中格式为"<strong>训练日碳水 / 休息日碳水 / 每日蛋白质</strong>"（单位：g/kg体重）。
        休息日碳水较少（没有练前/练后大碳水），碳水和蛋白质可以等量互换。
        本表按无氧计算，如有有氧需增加饮食热量。
      </Alert>

      {/* 性别Tab */}
      <Tabs value={genderTab} onChange={(_, v) => { setGenderTab(v); setGoalTab(0); }} sx={{ mb: 1 }}>
        <Tab label="健身男性" />
        <Tab label="健身女性" />
      </Tabs>

      {/* 目标Tab */}
      <Tabs value={goalTab} onChange={(_, v) => setGoalTab(v)} sx={{ mb: 2 }}>
        <Tab label="减脂" />
        <Tab label="增肌" />
      </Tabs>

      <Card>
        <CardContent sx={{ overflowX: 'auto' }}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" className="min-w-full">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>体重</TableCell>
                  {heights.map(h => (
                    <TableCell key={h} align="center" sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>
                      {h}cm
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {weights.map(w => (
                  <TableRow key={w}>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'action.hover' }}>{w}kg</TableCell>
                    {heights.map(h => {
                      const entry = section.data[h]?.[w];
                      return (
                        <TableCell key={h} align="center" sx={{
                          fontSize: '0.78rem', lineHeight: 1.3,
                          color: entry ? 'text.primary' : 'text.disabled',
                        }}>
                          {entry
                            ? `${entry.trainingDayCarb} / ${entry.restDayCarb} / ${entry.protein}`
                            : '—'}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotaPage;
