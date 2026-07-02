import React, { useState } from 'react';
import {
  Typography, Card, CardContent, CardActions, Button, TextField,
  Box, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { adoptPet } from '../api/pet';
import { PET_TYPE_LABELS, PET_TYPE_EMOJI, PetType } from '../types';
import { usePetStore } from '../stores/petStore';

const PET_OPTIONS: { type: PetType; desc: string; color: string }[] = [
  { type: 'cat', desc: '灵猫轻盈优雅，善解人意，适合追求灵活的修行者', color: '#FF9800' },
  { type: 'dog', desc: '灵犬忠诚可靠，勇猛无畏，适合注重纪律的修行者', color: '#2196F3' },
  { type: 'dragon', desc: '灵龙气吞山河，威震八方，适合胸怀大志的修行者', color: '#F44336' },
  { type: 'fox', desc: '灵狐聪慧狡黠，变幻莫测，适合机敏过人的修行者', color: '#9C27B0' },
];

const PetAdoptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchPet } = usePetStore();
  const [selectedType, setSelectedType] = useState<PetType | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const handleAdopt = async () => {
    if (!selectedType || !name.trim()) {
      setError('请选择宠物类型并取个名字');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await adoptPet(name.trim(), selectedType);
      // 领养成功后刷新全局 pet 状态，导航栏立即显示宠物图标
      await fetchPet();
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || '领养失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>领养灵宠</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        选择一只灵宠陪伴你的修仙之旅。灵宠会随你的修行等级成长，
        身材也会因你的身体数据和喂食习惯而变化。
        <strong>注意：每位修行者只能领养一只灵宠，不可更换。</strong>
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {PET_OPTIONS.map((opt) => (
          <Grid item xs={12} sm={6} md={3} key={opt.type}>
            <Card
              sx={{
                cursor: 'pointer',
                border: selectedType === opt.type ? `3px solid ${opt.color}` : '1px solid #ddd',
                transition: '0.2s',
                '&:hover': { transform: 'scale(1.02)', boxShadow: 3 },
              }}
              onClick={() => setSelectedType(opt.type)}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h1">{PET_TYPE_EMOJI[opt.type]}</Typography>
                <Typography variant="h6" sx={{ color: opt.color }}>{PET_TYPE_LABELS[opt.type]}</Typography>
                <Typography variant="body2" color="text.secondary">{opt.desc}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="给你的灵宠取个名字"
          value={name}
          onChange={e => setName(e.target.value)}
          sx={{ minWidth: 250 }}
          inputProps={{ maxLength: 10 }}
          helperText="最多10个字符"
        />
        <Button
          variant="contained"
          size="large"
          onClick={handleAdopt}
          disabled={!selectedType || !name.trim() || loading}
          sx={{ height: 56 }}
        >
          {loading ? '领养中...' : '确认领养'}
        </Button>
      </Box>

      {/* 领养成功弹窗 */}
      <Dialog open={successOpen} onClose={() => navigate('/pet')}>
        <DialogTitle>🎉 领养成功！</DialogTitle>
        <DialogContent>
          <Typography variant="h4" textAlign="center" sx={{ mb: 2 }}>
            {selectedType ? PET_TYPE_EMOJI[selectedType] : ''}
          </Typography>
          <Typography variant="h6" textAlign="center">
            你的灵宠 <strong>{name}</strong> 已经诞生！
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 1 }}>
            它会陪伴你修行成长，记得每天喂它哦~
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/pet')} variant="contained">
            去看看我的灵宠
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PetAdoptionPage;
