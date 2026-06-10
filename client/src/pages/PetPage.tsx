import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, Box, Button, Chip, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getMyPet, feedPet, getFeedingLogs } from '../api/pet';
import { getLevel } from '../api/user';
import type { PetDTO, PetFeedingLogDTO, CultivationLevelDTO } from '../types';
import { PET_TYPE_LABELS, PET_TYPE_EMOJI, TIER_COLORS, TIER_ICONS } from '../types';

const TIER_NAMES = ['练气', '筑基', '金丹', '元婴', '化神'];
import LoadingSpinner from '../components/common/LoadingSpinner';

const STAGE_NAMES = ['幼崽', '少年', '成年', '成熟', '终极'];

const PetPage: React.FC = () => {
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetDTO | null>(null);
  const [level, setLevel] = useState<CultivationLevelDTO | null>(null);
  const [logs, setLogs] = useState<PetFeedingLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedMsg, setFeedMsg] = useState('');
  const [feeding, setFeeding] = useState(false);

  const fetchData = async () => {
    try {
      const [petRes, levelRes, logsRes] = await Promise.all([
        getMyPet(), getLevel(), getFeedingLogs().catch(() => ({ data: [] })),
      ]);
      setPet(petRes.data);
      setLevel(levelRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner message="加载宠物信息..." />;

  if (!pet) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>🐾</Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>你还没有灵宠</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          领养一只灵宠陪伴你的修行之旅吧
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate('/pet/adopt')}>
          去领养
        </Button>
      </div>
    );
  }

  const handleFeed = async () => {
    setFeeding(true);
    setFeedMsg('');
    try {
      const today = new Date().toISOString().slice(0, 10);
      await feedPet(today);
      setFeedMsg('喂食成功！');
      fetchData();
    } catch (err: any) {
      setFeedMsg(err?.response?.data?.message || '喂食失败');
    } finally {
      setFeeding(false);
    }
  };

  const tierIndex = level?.tierIndex || 0;
  const stageName = STAGE_NAMES[pet.stage - 1] || '幼崽';
  const tierColor = TIER_COLORS[tierIndex] || '#9E9E9E';

  // 宠物尺寸基于stage和bodyFat
  const petSize = 80 + pet.stage * 30 + (pet.bodyFat - 15) * 2;

  const FOOD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    OVERFED: { label: '过量', color: '#f44336' },
    HIGH_CARB: { label: '高碳', color: '#FF9800' },
    BALANCED: { label: '均衡', color: '#4CAF50' },
    LOW_CARB: { label: '低碳', color: '#2196F3' },
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>我的灵宠</Typography>

      <Grid container spacing={3}>
        {/* 宠物主卡片 */}
        <Grid item xs={12} md={5}>
          <Card sx={{ textAlign: 'center', p: 4, bgcolor: `${tierColor}15` }}>
            <div
              style={{
                fontSize: petSize,
                transition: 'all 0.5s',
                filter: `drop-shadow(0 0 ${pet.stage * 8}px ${tierColor})`,
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              {PET_TYPE_EMOJI[pet.type as keyof typeof PET_TYPE_EMOJI] || '🐱'}
            </div>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
              {pet.name}
            </Typography>
            <Chip
              label={`${PET_TYPE_LABELS[pet.type as keyof typeof PET_TYPE_LABELS]} · ${stageName}形态`}
              sx={{ bgcolor: tierColor, color: 'white', mt: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              修行阶段：{TIER_ICONS[tierIndex]} {TIER_NAMES[tierIndex]}期 · {STAGE_NAMES[pet.stage - 1]}
            </Typography>

            {/* 属性条 */}
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <Typography variant="body2">饱腹度</Typography>
              <LinearProgress
                variant="determinate"
                value={pet.hunger}
                sx={{ height: 10, borderRadius: 5, mb: 1 }}
                color={pet.hunger < 30 ? 'error' : 'success'}
              />
              <Typography variant="body2">快乐值</Typography>
              <LinearProgress
                variant="determinate"
                value={pet.happiness}
                sx={{ height: 10, borderRadius: 5 }}
                color="info"
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={handleFeed} disabled={feeding} sx={{ mr: 1 }}>
                {feeding ? '喂食中...' : '🍖 喂食'}
              </Button>
            </Box>
            {feedMsg && (
              <Alert severity={feedMsg.includes('成功') ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {feedMsg}
              </Alert>
            )}
          </Card>
        </Grid>

        {/* 宠物详情 */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>宠物详情</Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableRow><TableCell>昵称</TableCell><TableCell>{pet.name}</TableCell></TableRow>
                  <TableRow><TableCell>种类</TableCell><TableCell>{PET_TYPE_LABELS[pet.type as keyof typeof PET_TYPE_LABELS]}</TableCell></TableRow>
                  <TableRow><TableCell>成长阶段</TableCell><TableCell>{STAGE_NAMES[pet.stage - 1]} (第{pet.stage}阶段)</TableCell></TableRow>
                  <TableRow><TableCell>体重</TableCell><TableCell>{pet.weight?.toFixed(1)} kg</TableCell></TableRow>
                  <TableRow><TableCell>体脂率</TableCell><TableCell>{pet.bodyFat?.toFixed(0)}%</TableCell></TableRow>
                  <TableRow><TableCell>饱腹度</TableCell><TableCell>{pet.hunger?.toFixed(0)}%</TableCell></TableRow>
                  <TableRow><TableCell>快乐值</TableCell><TableCell>{pet.happiness?.toFixed(0)}%</TableCell></TableRow>
                  <TableRow><TableCell>领养日期</TableCell><TableCell>{new Date(pet.adoptedAt).toLocaleDateString('zh-CN')}</TableCell></TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* 喂食记录 */}
      <Card sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>喂食记录</Typography>
        {logs.length === 0 ? (
          <Typography color="text.secondary">还没有喂食记录</Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>日期</TableCell>
                  <TableCell>类型</TableCell>
                  <TableCell>碳水(g)</TableCell>
                  <TableCell>蛋白质(g)</TableCell>
                  <TableCell>脂肪(g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => {
                  const ft = FOOD_TYPE_LABELS[log.foodType] || { label: log.foodType, color: '#999' };
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>
                        <Chip label={ft.label} size="small" sx={{ bgcolor: ft.color, color: 'white' }} />
                      </TableCell>
                      <TableCell>{log.carbG}</TableCell>
                      <TableCell>{log.proteinG}</TableCell>
                      <TableCell>{log.fatG}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* 桌宠浮窗提示 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        灵宠小精灵会显示在页面右下角，陪伴你的每一次使用。点击它可以互动哦～
      </Alert>
    </div>
  );
};

export default PetPage;
