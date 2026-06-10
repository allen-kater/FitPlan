import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import PetWidget from './components/pet/PetWidget';
import { useAuth } from './hooks/useAuth';
import { useUIStore } from './stores/uiStore';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PlanCreatePage = lazy(() => import('./pages/PlanCreatePage'));
const PlanDetailPage = lazy(() => import('./pages/PlanDetailPage'));
const PlanHistoryPage = lazy(() => import('./pages/PlanHistoryPage'));
const TrainingPage = lazy(() => import('./pages/TrainingPage'));
const StrengthPage = lazy(() => import('./pages/StrengthPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const FoodPage = lazy(() => import('./pages/FoodPage'));
const QAFatLossPage = lazy(() => import('./pages/QAFatLossPage'));
const QAMusclePage = lazy(() => import('./pages/QAMusclePage'));
const StretchPage = lazy(() => import('./pages/StretchPage'));
const AnatomyPage = lazy(() => import('./pages/AnatomyPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const CommunityDetailPage = lazy(() => import('./pages/CommunityDetailPage'));
const QuotaPage = lazy(() => import('./pages/QuotaPage'));
const JointActivityPage = lazy(() => import('./pages/JointActivityPage'));
const TrainingLogPage = lazy(() => import('./pages/TrainingLogPage'));
const NutritionPage = lazy(() => import('./pages/NutritionPage'));
const AchievementPage = lazy(() => import('./pages/AchievementPage'));
const PetAdoptionPage = lazy(() => import('./pages/PetAdoptionPage'));
const PetPage = lazy(() => import('./pages/PetPage'));

const PageLoader = () => <LoadingSpinner message="加载页面..." />;

function App(): React.ReactElement {
  const { checkAuth } = useAuth();
  const { snackbar, hideSnackbar } = useUIStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/plan/create" element={<ProtectedRoute><PlanCreatePage /></ProtectedRoute>} />
            <Route path="/plan/:id" element={<ProtectedRoute><PlanDetailPage /></ProtectedRoute>} />
            <Route path="/plan/history" element={<ProtectedRoute><PlanHistoryPage /></ProtectedRoute>} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="/training/strength" element={<StrengthPage />} />
            <Route path="/training-log" element={<ProtectedRoute><TrainingLogPage /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><NutritionPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementPage /></ProtectedRoute>} />
            <Route path="/pet" element={<ProtectedRoute><PetPage /></ProtectedRoute>} />
            <Route path="/pet/adopt" element={<ProtectedRoute><PetAdoptionPage /></ProtectedRoute>} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/knowledge/food" element={<FoodPage />} />
            <Route path="/knowledge/qa-fat-loss" element={<QAFatLossPage />} />
            <Route path="/knowledge/qa-muscle" element={<QAMusclePage />} />
            <Route path="/knowledge/stretch" element={<StretchPage />} />
            <Route path="/knowledge/anatomy" element={<AnatomyPage />} />
            <Route path="/knowledge/quota" element={<QuotaPage />} />
            <Route path="/knowledge/joint-activity" element={<JointActivityPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/community/:id" element={<CommunityDetailPage />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>
        </Routes>
      </Suspense>

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 灵宠桌宠 */}
      <PetWidget />
    </ErrorBoundary>
  );
}

export default App;
