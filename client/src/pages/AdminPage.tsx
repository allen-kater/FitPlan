import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TodayIcon from '@mui/icons-material/Today';
import * as adminApi from '../api/admin';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState({ userCount: 0, planCount: 0, todayLogins: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.getUsers(page + 1, rowsPerPage);
        setUsers(res.data.users);
        setTotal(res.data.total);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, rowsPerPage]);

  if (loading) return <LoadingSpinner message="加载管理后台..." />;

  return (
    <div className="space-y-6">
      <Typography variant="h4" gutterBottom>管理后台</Typography>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent className="flex items-center gap-3">
              <PeopleIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              <div>
                <Typography variant="caption" color="text.secondary">用户总数</Typography>
                <Typography variant="h4">{stats.userCount}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent className="flex items-center gap-3">
              <AssignmentIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
              <div>
                <Typography variant="caption" color="text.secondary">方案总数</Typography>
                <Typography variant="h4">{stats.planCount}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent className="flex items-center gap-3">
              <TodayIcon sx={{ fontSize: 48, color: 'warning.main' }} />
              <div>
                <Typography variant="caption" color="text.secondary">今日活跃</Typography>
                <Typography variant="h4">{stats.todayLogins}</Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>用户列表</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>用户名</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell align="right">方案数</TableCell>
                  <TableCell>注册时间</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'ADMIN' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{user._count?.plans ?? 0}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleString('zh-CN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="每页行数"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
