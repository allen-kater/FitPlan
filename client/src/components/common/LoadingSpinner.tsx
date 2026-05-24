import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullPage = false, message }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className={fullPage ? 'min-h-screen' : 'py-12'}
    >
      <CircularProgress size={48} />
      {message && (
        <p className="mt-3 text-gray-500 text-sm">{message}</p>
      )}
    </Box>
  );
};

export default LoadingSpinner;
