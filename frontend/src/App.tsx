import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { SubmissionPage } from './pages/team/SubmissionPage';
import { TeamResultsPage } from './pages/team/TeamResultsPage';
import { ScoreRevealPage } from './pages/team/ScoreRevealPage';

// Organizer Portal
import { OrganizerDashboard } from './pages/organizer/OrganizerDashboard';
import { HackathonSetupPage } from './pages/organizer/HackathonSetupPage';
import { TeamsManagePage } from './pages/organizer/TeamsManagePage';
import { AnalyticsPage } from './pages/organizer/AnalyticsPage';
import { InviteManagePage } from './pages/organizer/InviteManagePage';
import { OrganizerSidebar } from './components/organizer/OrganizerSidebar/OrganizerSidebar';

const OrganizerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeId = location.pathname.split('/').pop() || 'dashboard';
    
    return (
        <div className="flex w-full min-h-[100dvh] bg-[var(--bg-void)]">
            <OrganizerSidebar activeId={activeId as any} onNavigate={(id) => navigate(`/organizer/${id}`)} />
            <div className="flex-1 w-full overflow-x-hidden">
                {children}
            </div>
        </div>
    );
};

// Create a client
const queryClient = new QueryClient();

function AppContent() {
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
                                <Route path="submit" element={<SubmissionPage />} />
                                <Route path="reveal" element={<ScoreRevealPage score={98.5} rank={12} totalTeams={420} advanced={true} onContinue={() => {}} />} />
                                <Route path="results" element={<TeamResultsPage />} />
                                <Route path="*" element={<Navigate to="submit" replace />} />
                            </Routes>
                        </RoleGuard>
                    </AuthGuard>
                } />

                {/* Organizer Portal Routes */}
                <Route path="/organizer/*" element={
                    <AuthGuard>
                        <RoleGuard allowedRoles={['organizer']}>
                            <OrganizerLayout>
                                <Routes>
                                    <Route path="dashboard" element={<OrganizerDashboard />} />
                                    <Route path="teams" element={<TeamsManagePage />} />
                                    <Route path="analytics" element={<AnalyticsPage />} />
                                    <Route path="setup" element={<HackathonSetupPage />} />
                                    <Route path="invites" element={<InviteManagePage />} />
                                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                                </Routes>
                            </OrganizerLayout>
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
