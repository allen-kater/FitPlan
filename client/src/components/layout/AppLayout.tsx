import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

const AppLayout: React.FC = () => {
  const theme = useTheme();
  const bgColor = theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: bgColor }}>
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
