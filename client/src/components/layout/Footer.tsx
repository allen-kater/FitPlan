import React from 'react';
import { Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Typography variant="body2" color="inherit">
          © {new Date().getFullYear()} FitPlan - 个性化增肌减脂方案制定系统
        </Typography>
        <Typography variant="body2" color="inherit" sx={{ mt: 1 }}>
          <Link href="https://github.com" color="inherit" underline="hover">
            GitHub
          </Link>
          {' | '}
          <Link href="/knowledge" color="inherit" underline="hover">
            科普知识
          </Link>
        </Typography>
      </div>
    </footer>
  );
};

export default Footer;
