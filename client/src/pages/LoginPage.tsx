import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../stores/uiStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const showSnackbar = useUIStore((s) => s.showSnackbar);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      showSnackbar('登录成功', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || '登录失败，请检查邮箱和密码';
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <Typography variant="h4" align="center" gutterBottom>
            登录 FitPlan
          </Typography>
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="密码"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              登录
            </Button>
          </form>
          <Box className="text-center mt-4">
            <Typography variant="body2" color="text.secondary">
              还没有账号？ <Link to="/register" className="text-blue-600 hover:underline">立即注册</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
