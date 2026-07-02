import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import HdrAutoIcon from '@mui/icons-material/HdrAuto';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ open, onClose }) => {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  // 路由变化时强制关闭（防止点过链接后抽屉不消失）
  React.useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="w-64">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="font-bold text-lg">FitPlan</span>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
        <List>
          <ListItem button onClick={() => handleNav('/plan/create')}>
            <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
            <ListItemText primary="制定方案" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/training')}>
            <ListItemIcon><FitnessCenterIcon /></ListItemIcon>
            <ListItemText primary="训练计划" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/training/strength')}>
            <ListItemIcon><TrendingUpIcon /></ListItemIcon>
            <ListItemText primary="力量预测" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/training-log')}>
            <ListItemIcon><EditNoteIcon /></ListItemIcon>
            <ListItemText primary="训练日志" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/nutrition')}>
            <ListItemIcon><TrackChangesIcon /></ListItemIcon>
            <ListItemText primary="饮食记录" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/achievements')}>
            <ListItemIcon><EmojiEventsIcon /></ListItemIcon>
            <ListItemText primary="成就" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/knowledge')}>
            <ListItemIcon><MenuBookIcon /></ListItemIcon>
            <ListItemText primary="科普知识" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/community')}>
            <ListItemIcon><GroupsIcon /></ListItemIcon>
            <ListItemText primary="社区" />
          </ListItem>
          <ListItem button onClick={() => handleNav('/knowledge/joint-activity')}>
            <ListItemIcon><HdrAutoIcon /></ListItemIcon>
            <ListItemText primary="关节活动" />
          </ListItem>
          <Divider />
          {isAuthenticated ? (
            <>
              <ListItem button onClick={() => handleNav('/profile')}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="个人中心" />
              </ListItem>
              <ListItem button onClick={() => handleNav('/plan/history')}>
                <ListItemIcon><HistoryIcon /></ListItemIcon>
                <ListItemText primary="我的方案" />
              </ListItem>
              {isAdmin && (
                <ListItem button onClick={() => handleNav('/admin')}>
                  <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                  <ListItemText primary="管理后台" />
                </ListItem>
              )}
              <ListItem button onClick={handleLogout}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="退出登录" />
              </ListItem>
            </>
          ) : (
            <>
              <ListItem button onClick={() => handleNav('/login')}>
                <ListItemIcon><LoginIcon /></ListItemIcon>
                <ListItemText primary="登录" />
              </ListItem>
              <ListItem button onClick={() => handleNav('/register')}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="注册" />
              </ListItem>
            </>
          )}
        </List>
      </div>
    </Drawer>
  );
};

export default MobileMenu;
