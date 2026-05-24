import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import * as knowledgeApi from '../api/knowledge';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface AnatomyItem {
  id: string;
  name: string;
  location: string;
  function: string;
  trainingExercises: string;
}

const AnatomyPage: React.FC = () => {
  const [data, setData] = useState<AnatomyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await knowledgeApi.getAnatomyData();
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch anatomy data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="加载解剖数据..." />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>解剖知识</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>肌肉名称</TableCell>
              <TableCell>位置</TableCell>
              <TableCell>功能</TableCell>
              <TableCell>训练动作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>{item.function}</TableCell>
                <TableCell>{item.trainingExercises}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AnatomyPage;
