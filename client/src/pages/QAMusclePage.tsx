import React from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { qaMuscleGain } from '../data/qaData';

const QAMusclePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <Typography variant="h4" gutterBottom>增肌问答</Typography>
      <Typography color="text.secondary" className="mb-4">
        共 {qaMuscleGain.length} 个常见增肌问题解答（来源：B站好人松松健身Excel套表）
      </Typography>
      {qaMuscleGain.map((item, index) => (
        <Accordion key={index} className="mb-2">
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">
              {index + 1}. {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default QAMusclePage;
