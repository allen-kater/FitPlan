import React, { useEffect, useState } from 'react';
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as knowledgeApi from '../api/knowledge';
import type { QAArticleDTO } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const QAFatLossPage: React.FC = () => {
  const [articles, setArticles] = useState<QAArticleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQA = async () => {
      try {
        const res = await knowledgeApi.getQA('FAT_LOSS');
        setArticles(res.data);
      } catch (error) {
        console.error('Failed to fetch QA:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQA();
  }, []);

  if (loading) return <LoadingSpinner message="加载问答..." />;

  return (
    <div className="max-w-3xl mx-auto">
      <Typography variant="h4" gutterBottom>减脂问答</Typography>
      <Typography color="text.secondary" className="mb-4">
        {articles.length} 个常见减脂问题解答
      </Typography>
      {articles.map((article) => (
        <Accordion key={article.id} className="mb-2">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">
              {article.sortOrder}. {article.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{article.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default QAFatLossPage;
