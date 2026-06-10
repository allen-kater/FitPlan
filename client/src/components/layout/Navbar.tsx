import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Chip,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PetsIcon from '@mui/icons-material/Pets';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../stores/themeStore';
import MobileMenu from './MobileMenu';
import InstallPWA from '../common/InstallPWA';
import { getLevel } from '../../api/user';
import { getMyPet } from '../../api/pet';
import type { CultivationLevelDTO, PetDTO } from '../../types';
import { TIER_COLORS, TIER_ICONS } from '../../types';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, setMode, effectiveMode } = useThemeStore();
  const [level, setLevel] = useState<CultivationLevelDTO | null>(null);
  const [pet, setPet] = useState<PetDTO | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getLevel().then(res => setLevel(res.data)).catch(() => {});
      getMyPet().then(res => { if (res.data) setPet(res.data); }).catch(() => {});
    }
  }, [isAuthenticated]);

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

  /** 切换暗色模式 */
  const toggleTheme = () => {
    if (effectiveMode === 'dark') {
      setMode('light');
    } else {
      setMode('dark');
    }
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
          <div className="hidden md:flex items-center flex-1 gap-0.5">
            <Button size="small" color="inherit" component={Link} to="/plan/create" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>制定方案</Button>
            <Button size="small" color="inherit" component={Link} to="/training" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>训练计划</Button>
            <Button size="small" color="inherit" component={Link} to="/training/strength" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>力量预测</Button>
            <Button size="small" color="inherit" component={Link} to="/training-log" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>训练日志</Button>
            <Button size="small" color="inherit" component={Link} to="/nutrition" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>营养追踪</Button>
            <Button size="small" color="inherit" component={Link} to="/achievements" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>成就</Button>
            <Button size="small" color="inherit" component={Link} to="/knowledge" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>科普知识</Button>
            <Button size="small" color="inherit" component={Link} to="/community" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>社区</Button>
            <Button size="small" color="inherit" component={Link} to="/knowledge/joint-activity" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>关节活动</Button>
            {isAdmin && (
              <Button size="small" color="inherit" component={Link} to="/admin" sx={{ fontSize: '0.8rem', minWidth: 'unset', px: 0.8, whiteSpace: 'nowrap' }}>管理后台</Button>
            )}
          </div>

          <div className="flex-1" />

          {/* PWA 安装按钮 */}
          <InstallPWA />

          {/* 暗色模式切换按钮 */}
          <Tooltip title={effectiveMode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}>
            <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
              {effectiveMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              {level && (
                <Chip
                  icon={<span>{TIER_ICONS[level.tierIndex] || ''}</span>}
                  label={level.displayName}
                  size="small"
                  sx={{
                    bgcolor: TIER_COLORS[level.tierIndex] || '#9E9E9E',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    mr: 0.5,
                  }}
                />
              )}
              {pet && (
                <Tooltip title={`${pet.name} 🐾`}>
                  <IconButton size="small" onClick={() => navigate('/pet')}>
                    <PetsIcon sx={{ color: '#FF9800' }} />
                  </IconButton>
                </Tooltip>
              )}
              {!pet && isAuthenticated && (
                <Tooltip title="领养灵宠">
                  <IconButton size="small" onClick={() => navigate('/pet/adopt')} sx={{ opacity: 0.5 }}>
                    <PetsIcon />
                  </IconButton>
                </Tooltip>
              )}
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
                <MenuItem onClick={() => { handleMenuClose(); navigate('/training-log'); }}>
                  训练日志
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/nutrition'); }}>
                  营养追踪
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/achievements'); }}>
                  成就
                </MenuItem>
                <MenuItem onClick={() => { handleMenuClose(); navigate('/pet'); }}>
                  {pet ? `${pet.name}` : '领养灵宠'}
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
