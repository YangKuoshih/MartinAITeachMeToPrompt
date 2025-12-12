import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { API } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';
import Icon from '../Icon';
import { getNavigationIcon, getDarkModeIcon, getRankIcon } from '../../utils/iconMapper';

interface MainLayoutProps {
  children: React.ReactNode;
  user: any;
  signOut?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, user, signOut }) => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userStats, setUserStats] = useState({
    challengesCompleted: 0,
    points: 100,
    level: 1
  });

  const isAdmin = user?.groups?.includes('admin');

  const navigationItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Prompt Challenges', path: '/challenges' },
    { name: 'Prompt Quest', path: '/prompt-quest' },
    { name: 'Playground', path: '/playground' },
    { name: 'Reference', path: '/reference' },
    { name: 'Badges & Rewards', path: '/gamification' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Help/FAQ', path: '/help-faq' },
    { name: 'Profile', path: '/profile' },
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/prompt-quest') {
      return location.pathname.startsWith('/prompt-quest');
    }
    return location.pathname === path;
  };

  useEffect(() => {
    loadUserStats();

    // Listen for challenge completion events to update stats
    const handleChallengeCompleted = () => {
      setTimeout(() => {
        loadUserStats();
      }, 1000);
    };

    window.addEventListener('challengeCompleted', handleChallengeCompleted);

    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted);
    };
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await API.get('/progress');
      if (response && response.length > 0) {
        const progress = response[0];
        setUserStats({
          challengesCompleted: progress.challengesCompleted || 0,
          points: progress.points || 100,
          level: progress.level || 1
        });
      }
    } catch (error) {
      // Keep default stats on error
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}>
        <div className="h-full flex flex-col">
          {/* Logo & Collapse Button */}
          <div className={`p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <Icon name="lightsaber-skywalker" size={isCollapsed ? 32 : 40} />
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold star-wars-font ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} style={{ letterSpacing: '0.15em' }}>
                      Prompt Trainer
                    </span>
                    <div className={`text-sm mt-1 italic ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Powered by MartinAI
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {isCollapsed ? '→' : '←'}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-2 rounded-lg transition-colors ${isActive(item.path)
                  ? isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'
                  : isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                title={isCollapsed ? item.name : ''}
              >
                <div className={isCollapsed ? 'flex items-center justify-center' : ''}>
                  <Icon name={getNavigationIcon(item.path)} size={24} />
                </div>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User Stats */}
          <div className={`p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t border-b`}>
            {!isCollapsed ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="red-five" size={20} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Missions</span>
                  </div>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.challengesCompleted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="jabba-the-hutt" size={20} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Credits</span>
                  </div>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.points}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name={getRankIcon(userStats.level)} size={20} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rank</span>
                  </div>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.level}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <Icon name="lightsaber-luke-rotj" size={20} />
                <Icon name="jabba-the-hutt" size={20} />
                <Icon name={getRankIcon(userStats.level)} size={20} />
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div className={`p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
            {!isCollapsed ? (
              <button
                onClick={toggleDarkMode}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
                <Icon name={getDarkModeIcon(isDarkMode)} size={20} />
              </button>
            ) : (
              <button
                onClick={toggleDarkMode}
                className={`w-full flex justify-center py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <Icon name={getDarkModeIcon(isDarkMode)} size={20} />
              </button>
            )}
          </div>

          {/* User Profile */}
          <div className={`p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center space-x-3">
                  <Icon name={getRankIcon(userStats.level)} size={40} />
                  <div className="flex-1">
                    <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user?.firstName} {user?.lastName}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className={`mt-3 w-full px-4 py-2 text-sm rounded-lg transition-colors ${isDarkMode
                    ? 'text-red-400 hover:bg-red-900/20 border border-red-800'
                    : 'text-red-600 hover:bg-red-50 border border-red-200'
                    }`}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Icon name={getRankIcon(userStats.level)} size={32} />
                <button
                  onClick={signOut}
                  className={`p-1 rounded transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
                    }`}
                  title="Logout"
                >
                  <Icon name="stormtrooper" size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Page Content */}
        <main className={`p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;