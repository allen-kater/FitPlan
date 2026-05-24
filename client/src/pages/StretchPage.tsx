import React, { useEffect, useState } from 'react';
import {
  Typography, Tabs, Tab, Card, CardContent, CardMedia, Box, Chip, Alert,
} from '@mui/material';
import * as knowledgeApi from '../api/knowledge';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface StretchItem {
  id: string;
  name: string;
  targetMuscle: string;
  image: string;
  position: string;
}

interface StretchData {
  upper: StretchItem[];
  lower: StretchItem[];
  attribution: string;
}

const StretchPage: React.FC = () => {
  const [data, setData] = useState<StretchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await knowledgeApi.getStretchData();
        setData(res.data as unknown as StretchData);
      } catch (error) {
        console.error('Failed to fetch stretch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="加载拉伸数据..." />;
  if (!data) return <Typography>加载失败</Typography>;

  const items = tab === 0 ? data.upper : data.lower;

  return (
    <div>
      <Typography variant="h4" gutterBottom>拉伸图谱</Typography>

      <Alert severity="info" className="mb-4">
        {data.attribution}
      </Alert>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="mb-6">
        <Tab label={`上身拉伸 (${data.upper.length}张)`} />
        <Tab label={`下身拉伸 (${data.lower.length}张)`} />
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <Card key={item.id}>
            <CardMedia
              component="img"
              image={item.image}
              alt={item.name}
              sx={{ maxHeight: 400, objectFit: 'contain', bgcolor: '#fafafa' }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>{item.name}</Typography>
              <Chip label={item.targetMuscle} color="primary" size="small" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StretchPage;
