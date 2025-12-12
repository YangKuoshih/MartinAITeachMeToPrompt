import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Challenges from './components/Challenges';
import Playground from './components/Playground';
import Leaderboard from './components/Leaderboard';
import GamificationHub from './components/GamificationHub';
import Profile from './components/Profile';

// Mock UI testing without authentication
function AppMock() {
  const mockUser = { username: 'testuser' };
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-gray-900">
                  Prompt Engineering Academy
                </h1>
                <div className="flex space-x-4">
                  <Link to="/" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
                  <Link to="/challenges" className="text-gray-700 hover:text-gray-900">Challenges</Link>
                  <Link to="/playground" className="text-gray-700 hover:text-gray-900">Playground</Link>
                  <Link to="/gamification" className="text-gray-700 hover:text-gray-900">Badges & Rewards</Link>
                  <Link to="/leaderboard" className="text-gray-700 hover:text-gray-900">Leaderboard</Link>
                  <Link to="/profile" className="text-gray-700 hover:text-gray-900">Profile</Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {mockUser.username}
                </span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/gamification" element={<GamificationHub />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default AppMock;