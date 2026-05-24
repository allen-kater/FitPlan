import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../stores/uiStore';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const showSnackbar = useUIStore((s) => s.showSnackbar);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      await register(username, email, password);
      showSnackbar('注册成功', 'success');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || '注册失败，请稍后重试';
      setError(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <Typography variant="h4" align="center" gutterBottom>
            注册 FitPlan
          </Typography>
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="用户名"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              inputProps={{ minLength: 2, maxLength: 20 }}
            />
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
              inputProps={{ minLength: 6 }}
            />
            <TextField
              label="确认密码"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              注册
            </Button>
          </form>
          <div className="text-center mt-4">
            <Typography variant="body2" color="text.secondary">
              已有账号？ <Link to="/login" className="text-blue-600 hover:underline">立即登录</Link>
            </Typography>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
