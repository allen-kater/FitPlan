import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import * as trainingLogApi from '../api/trainingLog';
import type { TrainingLogDTO } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TrainingLogPage: React.FC = () => {
  const [logs, setLogs] = useState<TrainingLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  // 新建/编辑对话框状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TrainingLogDTO | null>(null);
  const [formData, setFormData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    exerciseName: '',
    sets: 3,
    reps: 10,
    weight: 0,
    notes: '',
  });

  // 消息提示
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  /** 获取训练日志 */
  const fetchLogs = useCallback(async () => {
    try {
      const res = await trainingLogApi.getTrainingLogs({ date: selectedDate });
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch training logs:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /** 打开新建对话框 */
  const handleOpenCreate = () => {
    setEditingLog(null);
    setFormData({
      date: selectedDate,
      exerciseName: '',
      sets: 3,
      reps: 10,
      weight: 0,
      notes: '',
    });
    setDialogOpen(true);
  };

  /** 打开编辑对话框 */
  const handleOpenEdit = (log: TrainingLogDTO) => {
    setEditingLog(log);
    setFormData({
      date: log.date,
      exerciseName: log.exerciseName,
      sets: log.sets,
      reps: log.reps,
      weight: log.weight,
      notes: log.notes ?? '',
    });
    setDialogOpen(true);
  };

  /** 提交表单（创建或更新） */
  const handleSubmit = async () => {
    try {
      if (editingLog) {
        // 更新
        await trainingLogApi.updateTrainingLog(editingLog.id, {
          ...formData,
          notes: formData.notes || undefined,
        });
        setSnackbar({ open: true, message: '训练日志更新成功', severity: 'success' });
      } else {
        // 创建
        await trainingLogApi.createTrainingLog({
          ...formData,
          notes: formData.notes || undefined,
        });
        setSnackbar({ open: true, message: '训练日志创建成功', severity: 'success' });
      }
      setDialogOpen(false);
      fetchLogs();
    } catch (error) {
      setSnackbar({ open: true, message: '操作失败', severity: 'error' });
    }
  };

  /** 删除训练日志 */
  const handleDelete = async (id: string) => {
    if (!window.confirm('确定删除这条训练日志吗？')) return;
    try {
      await trainingLogApi.deleteTrainingLog(id);
      setSnackbar({ open: true, message: '训练日志已删除', severity: 'success' });
      fetchLogs();
    } catch (error) {
      setSnackbar({ open: true, message: '删除失败', severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="加载训练日志..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Typography variant="h4" gutterBottom>训练日志</Typography>

      {/* 日期选择 + 新建按钮 */}
      <Card>
        <CardContent>
          <div className="flex gap-3 items-end flex-wrap">
            <TextField
              label="日期"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 180 }}
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              添加日志
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 训练日志列表 */}
      {logs.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {selectedDate} 的训练记录
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>动作名称</TableCell>
                    <TableCell align="right">组数</TableCell>
                    <TableCell align="right">每组次数</TableCell>
                    <TableCell align="right">重量 (kg)</TableCell>
                    <TableCell align="right">备注</TableCell>
                    <TableCell align="center">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.exerciseName}</TableCell>
                      <TableCell align="right">{log.sets}</TableCell>
                      <TableCell align="right">{log.reps}</TableCell>
                      <TableCell align="right">{log.weight}</TableCell>
                      <TableCell align="right">{log.notes ?? '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenEdit(log)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(log.id)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary" textAlign="center" py={4}>
              当日暂无训练记录，点击"添加日志"开始记录
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 新建/编辑对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLog ? '编辑训练日志' : '添加训练日志'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="日期"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="动作名称"
              value={formData.exerciseName}
              onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
              placeholder="例如：杠铃深蹲"
              fullWidth
            />
            <div className="flex gap-3">
              <TextField
                label="组数"
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: Number(e.target.value) })}
                inputProps={{ min: 1, max: 50 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="每组次数"
                type="number"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: Number(e.target.value) })}
                inputProps={{ min: 1, max: 100 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="重量 (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                inputProps={{ min: 0, step: 0.5 }}
                sx={{ flex: 1 }}
              />
            </div>
            <TextField
              label="备注"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="可选"
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.exerciseName || formData.sets <= 0 || formData.reps <= 0}
          >
            {editingLog ? '保存' : '添加'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default TrainingLogPage;
