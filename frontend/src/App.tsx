import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Auth Guards
import { AuthGuard } from './components/auth/AuthGuard';
import { RoleGuard } from './components/auth/RoleGuard';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { JoinHackathonPage } from './pages/auth/JoinHackathonPage';

// Judge Portal (Phase 3 Legacy)
import { Dashboard as JudgeDashboard } from './pages/Dashboard'; // Pre-existing Judge Copilot

// Team Portal
import { TeamDashboard } from './pages/team/TeamDashboard';
import { SubmissionPage } from './pages/team/SubmissionPage';
import { ResultsPage } from './pages/team/ResultsPage';

// Organizer Portal
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { HackathonSetupPage } from './pages/organizer/HackathonSetupPage';
import { TeamsManagePage } from './pages/organizer/TeamsManagePage';
import { AnalyticsPage } from './pages/organizer/AnalyticsPage';
import { InviteManagePage } from './pages/organizer/InviteManagePage';

// Create a client
const queryClient = new QueryClient();

function App() {
  // The useAuth hook already syncs initial state from zustand but we'll extract hydrateUserFromToken
  const { hydrateUserFromToken } = useAuth();
  
  useEffect(() => {
     const token = window.sessionStorage.getItem('equiscore-auth');
     if (token) {
        try {
           const parsed = JSON.parse(token);
           if (parsed?.state?.accessToken) {
              hydrateUserFromToken(parsed.state.accessToken);
           }
        } catch (e) {}
     }
  }, [hydrateUserFromToken]);

  return (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <Routes>
                {/* Public / Auth Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/join" element={<JoinHackathonPage />} />
                
                {/* Team Portal Routes */}
                <Route path="/team/*" element={
                    <AuthGuard>
                        <RoleGuard allowedRoles={['team_member', 'organizer']}>
                            <Routes>
                                <Route path="dashboard" element={<TeamDashboard />} />
                                <Route path="submit" element={<SubmissionPage />} />
                                <Route path="results" element={<ResultsPage />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </RoleGuard>
                    </AuthGuard>
                } />

                {/* Organizer Portal Routes */}
                <Route path="/organizer/*" element={
                    <AuthGuard>
                        <RoleGuard allowedRoles={['organizer']}>
                            <Routes>
                                <Route path="dashboard" element={<OrganizerDashboard />} />
                                <Route path="teams" element={<TeamsManagePage />} />
                                <Route path="analytics" element={<AnalyticsPage />} />
                                <Route path="setup" element={<HackathonSetupPage />} />
                                <Route path="invites" element={<InviteManagePage />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </RoleGuard>
                    </AuthGuard>
                } />

                {/* Judge Portal Routes */}
                <Route path="/judge/*" element={
                    <AuthGuard>
                        <RoleGuard allowedRoles={['judge', 'organizer']}>
                            <Routes>
                                <Route path="dashboard" element={<JudgeDashboard />} />
                                <Route path="*" element={<Navigate to="dashboard" replace />} />
                            </Routes>
                        </RoleGuard>
                    </AuthGuard>
                } />

            </Routes>
        </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
