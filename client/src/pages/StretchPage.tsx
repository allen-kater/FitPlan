import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import * as knowledgeApi from '../api/knowledge';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface StretchItem {
  id: string;
  name: string;
  description: string;
  targetMuscle: string;
  duration: string;
}

const StretchPage: React.FC = () => {
  const [data, setData] = useState<StretchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await knowledgeApi.getStretchData();
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch stretch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="加载拉伸数据..." />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>拉伸图谱</Typography>
      <Grid container spacing={3}>
        {data.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card className="h-full">
              <CardContent>
                <Typography variant="h6" gutterBottom>{item.name}</Typography>
                <Chip label={item.targetMuscle} color="primary" size="small" className="mb-2" />
                <Chip label={item.duration} variant="outlined" size="small" className="mb-3 ml-1" />
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default StretchPage;
