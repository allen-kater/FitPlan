import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import * as trainingApi from '../api/training';
import type { StrengthPredictionResult } from '../types';
import { useUIStore } from '../stores/uiStore';

const StrengthPage: React.FC = () => {
  const [weight, setWeight] = useState<number>(60);
  const [reps, setReps] = useState<number>(5);
  const [results, setResults] = useState<StrengthPredictionResult[]>([]);
  const showSnackbar = useUIStore((s) => s.showSnackbar);

  const handlePredict = async () => {
    try {
      const res = await trainingApi.predictStrength(weight, reps);
      setResults(res.data);
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || '力量预测失败', 'error');
    }
  };

  const percentages = ['95%', '90%', '85%', '80%', '75%', '70%', '65%', '60%', '55%', '50%'];

  return (
    <div className="max-w-4xl mx-auto">
      <Typography variant="h4" gutterBottom>力量预测</Typography>
      <Typography color="text.secondary" className="mb-4">
        输入配重和力竭次数，使用9种公式预测1RM和百分比对照表
      </Typography>

      <Card className="mb-6">
        <CardContent>
          <div className="flex gap-4 items-end flex-wrap">
            <TextField
              label="配重 (kg)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              inputProps={{ min: 1 }}
              sx={{ width: 150 }}
            />
            <TextField
              label="力竭次数"
              type="number"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              inputProps={{ min: 1, max: 30 }}
              sx={{ width: 150 }}
            />
            <Button variant="contained" onClick={handlePredict} size="large">
              预测
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          {/* 1RM Results */}
          <Card className="mb-6">
            <CardContent>
              <Typography variant="h6" gutterBottom>1RM 预测结果</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>公式</TableCell>
                      <TableCell align="right">1RM (kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.formula}>
                        <TableCell>{r.formula}</TableCell>
                        <TableCell align="right" className="font-bold">{r.oneRM}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Percentage Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>百分比对照表 (kg)</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>公式</TableCell>
                      {percentages.map((pct) => (
                        <TableCell key={pct} align="right">{pct}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.formula}>
                        <TableCell>{r.formula}</TableCell>
                        {percentages.map((pct) => (
                          <TableCell key={pct} align="right">{r.percentages[pct]}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StrengthPage;
