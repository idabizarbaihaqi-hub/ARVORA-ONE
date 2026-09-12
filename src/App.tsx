import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ui/Toast';

// Layouts
import { AppLayout } from './components/layout/AppLayout';

// Public & Auth Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { AcceptInvitationPage } from './pages/auth/AcceptInvitationPage';

// Onboarding Flow
import { OnboardingWizardPage } from './pages/onboarding/OnboardingWizardPage';

// Super Admin Console
import { SuperAdminDashboardPage } from './pages/admin/SuperAdminDashboardPage';
import { SuperAdminGuard } from './components/auth/SuperAdminGuard';

// Authenticated Tenant Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { BusinessProfilePage } from './pages/dashboard/BusinessProfilePage';
import { TeamManagementPage } from './pages/dashboard/TeamManagementPage';
import { MembersPage } from './pages/members/MembersPage';
import { InviteMemberPage } from './pages/members/InviteMemberPage';
import { OrganizationPage } from './pages/organization/OrganizationPage';
import { RolesManagementPage } from './pages/settings/RolesManagementPage';
import { AuditLogPage } from './pages/dashboard/AuditLogPage';
import { BillingTrialPage } from './pages/dashboard/BillingTrialPage';
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

            {/* Tenant Invitation Acceptance */}
            <Route path="/invite/:invitationId" element={<AcceptInvitationPage />} />
            <Route path="/invite" element={<Navigate to="/auth/login" replace />} />

            {/* Company Onboarding Flow */}
            <Route path="/onboarding" element={<OnboardingWizardPage />} />

            {/* Super Admin Platform Console */}
            <Route
              path="/admin/super"
              element={
                <SuperAdminGuard>
                  <SuperAdminDashboardPage />
                </SuperAdminGuard>
              }
            />
            <Route
              path="/super-admin"
              element={
                <SuperAdminGuard>
                  <SuperAdminDashboardPage />
                </SuperAdminGuard>
              }
            />

            {/* Protected App Routes (Multi-Tenant Workspace) */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverviewPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="members/invite" element={<InviteMemberPage />} />
              <Route path="team" element={<Navigate to="/app/members" replace />} />
              <Route path="organization" element={<OrganizationPage />} />
              <Route path="settings/roles" element={<RolesManagementPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="billing" element={<BillingTrialPage />} />
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
