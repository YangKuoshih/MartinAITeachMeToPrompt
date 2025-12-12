import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Challenges from './components/Challenges';
import PromptQuest from './components/PromptQuest';
import QuestLevel from './components/QuestLevel';
import Playground from './components/Playground';
import Reference from './components/Reference';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import GamificationHub from './components/GamificationHub';
import HelpFAQ from './components/HelpFAQ';
import MainLayout from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import StarWarsIcon from './components/StarWarsIcon';
import UsernameBasedAuth from './components/UsernameBasedAuth';

// Custom auth - no Amplify configuration needed

function AuthenticatedApp() {
  const { user, signOut } = useAuth();

  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (user && !hasRedirected.current && location.pathname === '/') {
      hasRedirected.current = true;
    }
  }, [user, location.pathname]);

  return (
    <MainLayout user={user} signOut={signOut}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/prompt-quest" element={<PromptQuest />} />
        <Route path="/prompt-quest/:questId" element={<QuestLevel />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/reference" element={<Reference />} />
        <Route path="/gamification" element={<GamificationHub />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/help-faq" element={<HelpFAQ />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Icon name="lightsaber-skywalker" size={80} />
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <UsernameBasedAuth />;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthenticatedApp />
    </Router>
  );
}

export default App;