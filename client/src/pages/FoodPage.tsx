import React, { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableSortLabel,
} from '@mui/material';
import * as knowledgeApi from '../api/knowledge';
import type { FoodDTO, FoodCategory } from '../types';
import { FOOD_CATEGORY_LABELS } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const FoodPage: React.FC = () => {
  const [foods, setFoods] = useState<FoodDTO[]>([]);
  const [category, setCategory] = useState<FoodCategory | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const res = await knowledgeApi.getFoods(category || undefined);
        setFoods(res.data);
      } catch (error) {
        console.error('Failed to fetch foods:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [category]);

  if (loading) return <LoadingSpinner message="加载食物数据..." />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>食物营养率</Typography>

      <FormControl className="mb-4" sx={{ minWidth: 150 }}>
        <InputLabel>分类筛选</InputLabel>
        <Select
          value={category}
          label="分类筛选"
          onChange={(e) => setCategory(e.target.value as FoodCategory | '')}
        >
          <MenuItem value="">全部</MenuItem>
          {Object.entries(FOOD_CATEGORY_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>食物名称</TableCell>
              <TableCell>分类</TableCell>
              <TableCell align="right">营养率</TableCell>
              <TableCell align="right">GI值</TableCell>
              <TableCell>说明</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {foods.map((food) => (
              <TableRow key={food.id}>
                <TableCell>{food.name}</TableCell>
                <TableCell>
                  <Chip
                    label={FOOD_CATEGORY_LABELS[food.category]}
                    color={food.category === 'CARB' ? 'warning' : food.category === 'PROTEIN' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{(food.nutritionRate * 100).toFixed(0)}%</TableCell>
                <TableCell align="right">
                  {food.giIndex != null ? (
                    <Chip
                      label={food.giIndex}
                      size="small"
                      color={food.giIndex >= 70 ? 'error' : food.giIndex >= 55 ? 'warning' : 'success'}
                      variant="outlined"
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>{food.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default FoodPage;
