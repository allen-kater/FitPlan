import React, { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import StarIcon from '@mui/icons-material/Star';
import * as achievementApi from '../api/achievement';
import type { AchievementDTO, UserAchievementData } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

/** 成就分类中文标签 */
const CATEGORY_LABELS: Record<string, string> = {
  PLAN: '方案',
  TRAINING: '训练',
  NUTRITION: '营养',
  COMMUNITY: '社区',
};

const AchievementPage: React.FC = () => {
  const [achievementData, setAchievementData] = useState<UserAchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'error' }>({
    open: false, message: '', severity: 'info',
  });

  /** 获取我的成就数据 */
  const fetchAchievements = useCallback(async () => {
    try {
      const res = await achievementApi.getMyAchievements();
      setAchievementData(res.data);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  /** 检查并解锁新成就 */
  const handleCheckAchievements = async () => {
    try {
      const res = await achievementApi.checkAchievements();
      const newlyUnlocked = res.data.newlyUnlocked;
      if (newlyUnlocked.length > 0) {
        setSnackbar({
          open: true,
          message: `恭喜解锁${newlyUnlocked.length}个新成就！`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: '暂无新成就，继续加油！',
          severity: 'info',
        });
      }
      fetchAchievements();
    } catch (error) {
      setSnackbar({ open: true, message: '检查成就失败', severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="加载成就数据..." />;
  if (!achievementData) return <Typography>加载失败</Typography>;

  const { achievements, unlockedCount, level } = achievementData;

  // 按分类分组
  const groupedAchievements = achievements.reduce<Record<string, AchievementDTO[]>>((acc, a) => {
    const cat = a.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  // 等级进度：下一级需要的成就数
  const nextLevelCount = level * level;
  const currentLevelBase = (level - 1) * (level - 1);
  const progressInLevel = unlockedCount - currentLevelBase;
  const neededForNext = nextLevelCount - currentLevelBase;
  const levelProgress = neededForNext > 0 ? Math.min(100, (progressInLevel / neededForNext) * 100) : 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Typography variant="h4" gutterBottom>成就与等级</Typography>
        <Button variant="contained" startIcon={<EmojiEventsIcon />} onClick={handleCheckAchievements}>
          检查新成就
        </Button>
      </div>

      {/* 等级信息卡片 */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {level}
            </Box>
            <div className="flex-1 min-w-[200px]">
              <Typography variant="h5">等级 {level}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                已解锁 {unlockedCount} / {achievements.length} 个成就
              </Typography>
              <Box sx={{ mt: 1, position: 'relative' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.300',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'primary.main',
                    width: `${levelProgress}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                距离下一级还需 {Math.max(0, nextLevelCount - unlockedCount)} 个成就
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 按分类展示成就 */}
      {Object.entries(groupedAchievements).map(([category, items]) => (
        <Card key={category}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <StarIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'gold' }} />
              {CATEGORY_LABELS[category] || category}
            </Typography>
            <Grid container spacing={2}>
              {items.map((achievement) => (
                <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      opacity: achievement.unlocked ? 1 : 0.6,
                      borderColor: achievement.unlocked ? 'primary.main' : 'grey.300',
                      backgroundColor: achievement.unlocked ? 'action.hover' : 'background.paper',
                      transition: 'all 0.3s',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>
                        {achievement.icon}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {achievement.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {achievement.description}
                      </Typography>
                      {achievement.unlocked ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="已解锁"
                          color="success"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      ) : (
                        <Chip
                          icon={<LockIcon />}
                          label="未解锁"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

export default AchievementPage;
