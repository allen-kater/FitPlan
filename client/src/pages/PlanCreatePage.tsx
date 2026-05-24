import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Card,
  CardContent,
  Alert,
  Slider,
  Switch,
  FormControlLabel as MuiFormControlLabel,
} from '@mui/material';
import { usePlans } from '../hooks/usePlans';
import { useUIStore } from '../stores/uiStore';
import type { BodyDataDTO, Gender, Goal, TrainingTime, TrainingLevel } from '../types';
import {
  GENDER_LABELS,
  GOAL_LABELS,
  TRAINING_TIME_LABELS,
  TRAINING_LEVEL_LABELS,
} from '../types';

const steps = ['基本信息', '训练配置', '确认生成'];

const PlanCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { generatePlan, loading } = usePlans();
  const showSnackbar = useUIStore((s) => s.showSnackbar);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<BodyDataDTO>({
    gender: 'MALE',
    height: 170,
    weight: 70,
    age: 25,
    goal: 'FAT_LOSS',
    trainingTime: 'AFTER_DINNER',
    trainingLevel: 'BEGINNER',
    hasCardio: false,
    cardioHeartRate: undefined,
    restingHeartRate: undefined,
    cardioDuration: undefined,
    proteinQuota: undefined,
  });

  const updateField = <K extends keyof BodyDataDTO>(key: K, value: BodyDataDTO[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleGenerate = async () => {
    try {
      const plan = await generatePlan(formData);
      showSnackbar('方案生成成功', 'success');
      navigate(`/plan/${plan.id}`);
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || '方案生成失败', 'error');
    }
  };

  const renderBasicDataStep = () => (
    <div className="space-y-4">
      <FormControl component="fieldset">
        <FormLabel>性别</FormLabel>
        <RadioGroup
          row
          value={formData.gender}
          onChange={(e) => updateField('gender', e.target.value as Gender)}
        >
          {Object.entries(GENDER_LABELS).map(([key, label]) => (
            <FormControlLabel key={key} value={key} control={<Radio />} label={label} />
          ))}
        </RadioGroup>
      </FormControl>

      <TextField
        label="身高 (cm)"
        type="number"
        fullWidth
        value={formData.height}
        onChange={(e) => updateField('height', Number(e.target.value))}
        inputProps={{ min: 100, max: 250 }}
      />

      <TextField
        label="体重 (kg)"
        type="number"
        fullWidth
        value={formData.weight}
        onChange={(e) => updateField('weight', Number(e.target.value))}
        inputProps={{ min: 30, max: 300, step: 0.1 }}
      />

      <TextField
        label="年龄"
        type="number"
        fullWidth
        value={formData.age}
        onChange={(e) => updateField('age', Number(e.target.value))}
        inputProps={{ min: 10, max: 100 }}
      />

      <FormControl component="fieldset">
        <FormLabel>目标</FormLabel>
        <RadioGroup
          row
          value={formData.goal}
          onChange={(e) => updateField('goal', e.target.value as Goal)}
        >
          {Object.entries(GOAL_LABELS).map(([key, label]) => (
            <FormControlLabel key={key} value={key} control={<Radio />} label={label} />
          ))}
        </RadioGroup>
      </FormControl>
    </div>
  );

  const renderTrainingConfigStep = () => (
    <div className="space-y-4">
      <FormControl fullWidth>
        <InputLabel>力训时段</InputLabel>
        <Select
          value={formData.trainingTime}
          label="力训时段"
          onChange={(e) => updateField('trainingTime', e.target.value as TrainingTime)}
        >
          {Object.entries(TRAINING_TIME_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>训练水平</InputLabel>
        <Select
          value={formData.trainingLevel}
          label="训练水平"
          onChange={(e) => updateField('trainingLevel', e.target.value as TrainingLevel)}
        >
          {Object.entries(TRAINING_LEVEL_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <FormLabel>蛋白质配额 (g/kg体重)</FormLabel>
        <Slider
          value={formData.proteinQuota ?? (formData.goal === 'FAT_LOSS' ? 1.8 : 2.0)}
          onChange={(_, v) => updateField('proteinQuota', v as number)}
          min={1.0}
          max={3.0}
          step={0.1}
          marks={[
            { value: 1.0, label: '1.0' },
            { value: 1.5, label: '1.5' },
            { value: 2.0, label: '2.0' },
            { value: 2.5, label: '2.5' },
            { value: 3.0, label: '3.0' },
          ]}
          valueLabelDisplay="auto"
        />
      </FormControl>

      <MuiFormControlLabel
        control={
          <Switch
            checked={formData.hasCardio}
            onChange={(e) => updateField('hasCardio', e.target.checked)}
          />
        }
        label="有有氧训练"
      />

      {formData.hasCardio && (
        <div className="space-y-3 pl-4 border-l-4 border-blue-200">
          <Alert severity="info" className="mb-2">
            有氧消耗仅当目标为减脂且体重低于80kg时才计入
          </Alert>
          <TextField
            label="运动心率 (bpm)"
            type="number"
            fullWidth
            value={formData.cardioHeartRate ?? ''}
            onChange={(e) => updateField('cardioHeartRate', Number(e.target.value) || undefined)}
          />
          <TextField
            label="静息心率 (bpm)"
            type="number"
            fullWidth
            value={formData.restingHeartRate ?? ''}
            onChange={(e) => updateField('restingHeartRate', Number(e.target.value) || undefined)}
          />
          <TextField
            label="有氧时长 (分钟)"
            type="number"
            fullWidth
            value={formData.cardioDuration ?? ''}
            onChange={(e) => updateField('cardioDuration', Number(e.target.value) || undefined)}
          />
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
          <p><strong>蛋白质配额：</strong>{formData.proteinQuota ?? (formData.goal === 'FAT_LOSS' ? 1.8 : 2.0)} g/kg</p>
          {formData.hasCardio && (
            <>
              <p><strong>有氧配置：</strong>运动心率{formData.cardioHeartRate}bpm / 静息心率{formData.restingHeartRate}bpm / {formData.cardioDuration}分钟</p>
            </>
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
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  上一步
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleGenerate}
                    disabled={loading}
                  >
                    {loading ? '生成中...' : '生成方案'}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    下一步
                  </Button>
                )}
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default PlanCreatePage;
