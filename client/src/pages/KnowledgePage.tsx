import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import BodyIcon from '@mui/icons-material/Accessibility';

const modules = [
  {
    title: '食物营养率',
    description: '查看碳水、蛋白质、脂肪食物的营养率和GI值',
    icon: <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    path: '/knowledge/food',
  },
  {
    title: '减脂问答',
    description: '26个减脂常见问题解答',
    icon: <QuestionAnswerIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
    path: '/knowledge/qa-fat-loss',
  },
  {
    title: '增肌问答',
    description: '18个增肌常见问题解答',
    icon: <QuestionAnswerIcon sx={{ fontSize: 48, color: 'success.main' }} />,
    path: '/knowledge/qa-muscle',
  },
  {
    title: '拉伸图谱',
    description: '10种常见拉伸动作指南',
    icon: <AccessibilityNewIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
    path: '/knowledge/stretch',
  },
];

const KnowledgePage: React.FC = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>科普知识</Typography>
      <Grid container spacing={4}>
        {modules.map((mod) => (
          <Grid item xs={12} sm={6} md={3} key={mod.path}>
            <Card
              component={Link}
              to={mod.path}
              className="hover:shadow-lg transition-shadow h-full"
              sx={{ textDecoration: 'none' }}
            >
              <CardContent className="text-center p-6">
                {mod.icon}
                <Typography variant="h6" className="mt-3">
                  {mod.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mt-1">
                  {mod.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default KnowledgePage;
