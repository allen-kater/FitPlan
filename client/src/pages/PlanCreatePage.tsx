import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stepper, Step, StepLabel, StepContent, Button,
  TextField, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, Select, MenuItem,
  InputLabel, Typography, Card, CardContent,
  Alert, Switch, Dialog, DialogContent,
  CircularProgress, Box,
} from '@mui/material';
import { usePlans } from '../hooks/usePlans';
import { useUIStore } from '../stores/uiStore';
import client from '../api/client';
import type { BodyDataDTO, Gender, Goal, TrainingTime, TrainingLevel } from '../types';
import {
  GENDER_LABELS, GOAL_LABELS, TRAINING_TIME_LABELS, TRAINING_LEVEL_LABELS,
} from '../types';

const steps = ['基本信息', '训练配置', '确认生成'];

interface QuotaPreview {
  trainingDayCarb: number;
  restDayCarb: number;
  protein: number;
}

const PlanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { generatePlan, loading } = usePlans();
  const showSnackbar = useUIStore((s) => s.showSnackbar);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BodyDataDTO>({
    gender: 'MALE', height: 170, weight: 70, age: 25,
    goal: 'FAT_LOSS', trainingTime: 'AFTER_DINNER',
    trainingLevel: 'BEGINNER', hasCardio: false,
  });

  // 配额预览
  const [quota, setQuota] = useState<QuotaPreview | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  // 生成loading动画
  const [generating, setGenerating] = useState(false);
  const [genStepText, setGenStepText] = useState('');

  const updateField = <K extends keyof BodyDataDTO>(key: K, value: BodyDataDTO[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  /** 查询配额预览 */
  useEffect(() => {
    const fetchQuota = async () => {
      const h = formData.height;
      const w = formData.weight;
      if (!h || !w || !formData.gender || !formData.goal) return;
      setQuotaLoading(true);
      try {
        const res = await client.get('/knowledge/quota', {
          params: { gender: formData.gender, goal: formData.goal, height: h, weight: w },
        });
        if (res.data?.code === 200) setQuota(res.data.data);
      } catch {
        setQuota(null);
      } finally {
        setQuotaLoading(false);
      }
    };
    fetchQuota();
  }, [formData.gender, formData.goal, formData.height, formData.weight]);

  const handleGenerate = async () => {
    setGenerating(true);
    // 逐步显示动画文本
    const texts = [
      '正在分析您的身体数据...',
      '正在计算基础代谢...',
      '正在查找营养素配额...',
      '正在分配餐食比例...',
      '正在生成运动建议...',
    ];
    let i = 0;
    setGenStepText(texts[i]);
    const interval = setInterval(() => {
      i++;
      if (i < texts.length) setGenStepText(texts[i]);
    }, 900);

    try {
      const plan = await generatePlan(formData);
      clearInterval(interval);
      showSnackbar('方案生成成功', 'success');
      navigate(`/plan/${plan.id}`);
    } catch (err: any) {
      clearInterval(interval);
      setGenerating(false);
      showSnackbar(err.response?.data?.message || '方案生成失败', 'error');
    }
  };

  const renderBasicDataStep = () => (
    <div className="space-y-4">
      <FormControl component="fieldset">
        <FormLabel>性别</FormLabel>
        <RadioGroup row value={formData.gender}
          onChange={(e) => updateField('gender', e.target.value as Gender)}>
          {Object.entries(GENDER_LABELS).map(([key, label]) => (
            <FormControlLabel key={key} value={key} control={<Radio />} label={label} />
          ))}
        </RadioGroup>
      </FormControl>

      <TextField label="身高 (cm)" type="number" fullWidth
        value={formData.height}
        onChange={(e) => updateField('height', Number(e.target.value))}
        inputProps={{ min: 100, max: 250 }} />

      <TextField label="体重 (kg)" type="number" fullWidth
        value={formData.weight}
        onChange={(e) => updateField('weight', Number(e.target.value))}
        inputProps={{ min: 30, max: 300, step: 0.1 }} />

      <TextField label="年龄" type="number" fullWidth
        value={formData.age}
        onChange={(e) => updateField('age', Number(e.target.value))}
        inputProps={{ min: 10, max: 100 }} />

      <FormControl component="fieldset">
        <FormLabel>目标</FormLabel>
        <RadioGroup row value={formData.goal}
          onChange={(e) => updateField('goal', e.target.value as Goal)}>
          {Object.entries(GOAL_LABELS).map(([key, label]) => (
            <FormControlLabel key={key} value={key} control={<Radio />} label={label} />
          ))}
        </RadioGroup>
      </FormControl>

      {/* 配额预览 */}
      <Card variant="outlined" sx={{ bgcolor: 'action.hover' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Typography variant="subtitle2" gutterBottom>
            碳水化合物蛋白质配额 (g/kg体重)
            {quotaLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
          </Typography>
          {quota ? (
            <div className="flex gap-4 text-sm">
              <span>🍚 力训日碳水: <strong>{quota.trainingDayCarb}</strong></span>
              <span>🍚 休息日碳水: <strong>{quota.restDayCarb}</strong></span>
              <span>🥩 蛋白质: <strong>{quota.protein}</strong></span>
            </div>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {quotaLoading ? '查询中...' : '输入身高体重后自动显示'}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTrainingConfigStep = () => (
    <div className="space-y-4">
      <FormControl fullWidth>
        <InputLabel>力训时段</InputLabel>
        <Select value={formData.trainingTime} label="力训时段"
          onChange={(e) => updateField('trainingTime', e.target.value as TrainingTime)}>
          {Object.entries(TRAINING_TIME_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>训练水平</InputLabel>
        <Select value={formData.trainingLevel} label="训练水平"
          onChange={(e) => updateField('trainingLevel', e.target.value as TrainingLevel)}>
          {Object.entries(TRAINING_LEVEL_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControlLabel
        control={<Switch checked={formData.hasCardio}
          onChange={(e) => updateField('hasCardio', e.target.checked)} />}
        label="有有氧训练" />

      {formData.hasCardio && (
        <div className="space-y-3 pl-4 border-l-4 border-blue-200">
          <Alert severity="info" className="mb-2">
            有氧消耗仅当目标为减脂且体重低于80kg时才计入
          </Alert>
          <TextField label="运动心率 (bpm)" type="number" fullWidth
            value={formData.cardioHeartRate ?? ''}
            onChange={(e) => updateField('cardioHeartRate', Number(e.target.value) || undefined)} />
          <TextField label="静息心率 (bpm)" type="number" fullWidth
            value={formData.restingHeartRate ?? ''}
            onChange={(e) => updateField('restingHeartRate', Number(e.target.value) || undefined)} />
          <TextField label="有氧时长 (分钟)" type="number" fullWidth
            value={formData.cardioDuration ?? ''}
            onChange={(e) => updateField('cardioDuration', Number(e.target.value) || undefined)} />
        </div>
      )}
    </div>
  );

  const renderConfirmStep = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom>确认信息</Typography>
        <div className="space-y-2 text-sm">
          <p><strong>性别：</strong>{GENDER_LABELS[formData.gender]}</p>
          <p><strong>身高：</strong>{formData.height} cm</p>
          <p><strong>体重：</strong>{formData.weight} kg</p>
          <p><strong>年龄：</strong>{formData.age} 岁</p>
          <p><strong>目标：</strong>{GOAL_LABELS[formData.goal]}</p>
          <p><strong>力训时段：</strong>{TRAINING_TIME_LABELS[formData.trainingTime]}</p>
          <p><strong>训练水平：</strong>{TRAINING_LEVEL_LABELS[formData.trainingLevel]}</p>
          {quota && (
            <p><strong>配额：</strong>力训碳水 {quota.trainingDayCarb} / 休息碳水 {quota.restDayCarb} / 蛋白质 {quota.protein} g/kg</p>
          )}
          {formData.hasCardio && (
            <p><strong>有氧：</strong>心率{formData.cardioHeartRate}bpm / 静息{formData.restingHeartRate}bpm / {formData.cardioDuration}分钟</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Typography variant="h4" gutterBottom>制定健身方案</Typography>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {index === 0 && renderBasicDataStep()}
              {index === 1 && renderTrainingConfigStep()}
              {index === 2 && renderConfirmStep()}
              <div className="flex gap-2 mt-4">
                <Button disabled={activeStep === 0} onClick={handleBack}>上一步</Button>
                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" onClick={handleGenerate}
                    disabled={loading || generating}>
                    {loading || generating ? '生成中...' : '生成方案'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>下一步</Button>
                )}
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* 生成loading动画 */}
      <Dialog open={generating} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>正在生成健身方案</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 24 }}>
            {genStepText}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4].map((d) => (
                <Box key={d} sx={{
                  width: 12, height: 12, borderRadius: '50%',
                  bgcolor: d <= (genStepText ? ['正在分析', '正在计算', '正在查找', '正在分配', '正在生成'].findIndex(t => genStepText.includes(t)) : -1) ? 'primary.main' : 'grey.300',
                  transition: 'background-color 0.3s',
                }} />
              ))}
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanCreatePage;
