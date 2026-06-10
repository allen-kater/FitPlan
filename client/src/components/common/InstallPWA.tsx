import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

/** PWA 安装按钮组件 */
const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    // 监听 beforeinstallprompt 事件
    const handler = (e: Event) => {
      // 阻止默认的安装提示
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 监听应用安装成功事件
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowInstall(false);
      setSnackbar({ open: true, message: 'FitPlan 已安装到桌面！', severity: 'success' });
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  /** 触发安装提示 */
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setSnackbar({ open: true, message: '感谢安装 FitPlan！', severity: 'success' });
    }

    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <>
      <Tooltip title="安装到桌面">
        <IconButton color="inherit" onClick={handleInstall} sx={{ mr: 1 }}>
          <InstallMobileIcon />
        </IconButton>
      </Tooltip>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default InstallPWA;
