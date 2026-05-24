import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../hooks/useAuth';
import MobileMenu from './MobileMenu';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 0,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
              mr: 4,
            }}
          >
            FitPlan
          </Typography>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 gap-1">
            <Button color="inherit" component={Link} to="/plan/create">
              制定方案
            </Button>
            <Button color="inherit" component={Link} to="/training">
              训练计划
            </Button>
            <Button color="inherit" component={Link} to="/training/strength">
              力量预测
            </Button>
            <Button color="inherit" component={Link} to="/knowledge">
              科普知识
            </Button>
            <Button color="inherit" component={Link} to="/community">
              社区
            </Button>
            <Button color="inherit" component={Link} to="/knowledge/joint-activity">
              关节活动
            </Button>
            {isAdmin && (
              <Button color="inherit" component={Link} to="/admin">
                管理后台
              </Button>
            )}
          </div>

          <div className="flex-1" />

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                  个人中心
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/plan/history'); }}>
                  我的方案
                </MenuItem>
                <MenuItem onClick={handleLogout}>退出登录</MenuItem>
              </Menu>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button color="inherit" component={Link} to="/login">
                登录
              </Button>
              <Button variant="outlined" color="inherit" component={Link} to="/register">
                注册
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <IconButton
            color="inherit"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};

export default Navbar;
