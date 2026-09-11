import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ui/Toast';

// Layouts
import { AppLayout } from './components/layout/AppLayout';

// Public Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Authenticated Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { BusinessProfilePage } from './pages/dashboard/BusinessProfilePage';
import { ModulesRoadmapPage } from './pages/dashboard/ModulesRoadmapPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />

            {/* Protected App Routes (Multi-Tenant Workspace) */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="business" element={<BusinessProfilePage />} />
              <Route path="modules" element={<ModulesRoadmapPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Floating Toast Notifications */}
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
