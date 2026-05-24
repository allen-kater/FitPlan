import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Typography, Card, CardContent, CardActions } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useAuth } from '../hooks/useAuth';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white">
        <Typography variant="h2" className="font-bold mb-4" sx={{ color: 'white' }}>
          FitPlan
        </Typography>
        <Typography variant="h5" className="mb-8 text-blue-100">
          输入身体数据，生成个性化增肌减脂方案
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          onClick={() => navigate(isAuthenticated ? '/plan/create' : '/register')}
        >
          开始制定方案
        </Button>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="text-center p-8">
            <FitnessCenterIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              方案生成
            </Typography>
            <Typography color="text.secondary">
              基于科学算法，输入身体数据即可生成个性化饮食和训练方案。支持减脂和增肌两种目标。
            </Typography>
          </CardContent>
          <CardActions className="justify-center pb-4">
            <Button component={Link} to="/plan/create" size="small">
              开始使用
            </Button>
          </CardActions>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="text-center p-8">
            <RestaurantIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              训练计划
            </Typography>
            <Typography color="text.secondary">
              提供4种分化训练方案和9种力量预测公式，帮助你科学安排训练和追踪进步。
            </Typography>
          </CardContent>
          <CardActions className="justify-center pb-4">
            <Button component={Link} to="/training" size="small">
              查看计划
            </Button>
          </CardActions>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="text-center p-8">
            <MenuBookIcon sx={{ fontSize: 64, color: 'warning.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              科普知识
            </Typography>
            <Typography color="text.secondary">
              包含食物营养率数据、增肌减脂问答、拉伸指南和解剖知识，助你全面了解健身。
            </Typography>
          </CardContent>
          <CardActions className="justify-center pb-4">
            <Button component={Link} to="/knowledge" size="small">
              学习更多
            </Button>
          </CardActions>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
