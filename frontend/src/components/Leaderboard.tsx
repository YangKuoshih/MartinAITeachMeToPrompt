import React, { useState, useEffect } from 'react';
import { API } from '../utils/api';

import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import { getLeaderboardIcon } from '../utils/iconMapper';


interface LeaderboardUser {
  id: string;
  username: string;
  email?: string;
  points: number;
  level: number;
  rank: number;
  streak: number;
  challenges: number;
  quests?: number;
  badges: (string | { name?: string; icon?: string })[];
  weeklyPoints?: number;
}

const Leaderboard: React.FC = () => {

  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [timeFrame, setTimeFrame] = useState<'all' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, [timeFrame]);
  
  useEffect(() => {
    // Listen for challenge completion events
    const handleChallengeCompleted = (event: CustomEvent) => {
      // Reload leaderboard data
      setTimeout(() => {
        loadLeaderboard();
      }, 1500);
    };
    
    window.addEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    
    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await API.get('/leaderboard');
      if (response && response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      // Error loading leaderboard
    }
  };


  
  // Expose reload function for testing
  window.refreshLeaderboard = loadLeaderboard;

  const getBadgeEmoji = (badge: string | { name?: string; icon?: string }) => {
    // Handle badge objects with icon property
    if (typeof badge === 'object' && badge.icon) {
      return badge.icon;
    }
    
    // Handle badge name strings
    const badgeName = typeof badge === 'string' ? badge : badge.name || '';
    
    // Map badge names to icons
    const badgeIcons: { [key: string]: string } = {
      'Rebel Recruit': '⭐',
      'Newcomer': '🌟',
      'First Mission': '🎯',
      'First Success': '🎯',
      'X-Wing Pilot': '✈️',
      'TIE Fighter Ace': '🛸',
      'Death Star Commander': '🌑',
      'Galactic Emperor': '👑',
      'Force Sensitive': '⚡',
      'Millennium Falcon': '🚀',
      'Star Destroyer': '🛡️',
      'Eternal Force': '🌟',
      'Kyber Crystal': '💎',
      'Holocron Keeper': '📜',
      'Archive Master': '📚',
      'Chosen One': '🌌',
      'Level 3 Graduate': '🎓',
      'Grand Master': '🏆',
      'Challenge Master': '🏆',
      'Getting Consistent': '🔥',
      'Streak Master': '🔥',
      'Point Collector': '⭐',
      'Point Hunter': '💎'
    };
    
    return badgeIcons[badgeName] || '⭐';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Leaderboard
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Compete with fellow learners across the galaxy and climb the ranks
        </p>
      </div>

      {/* Top 3 Podium */}
      {users.length >= 3 ? (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Top Performers
            </h2>
            <div className="flex items-end justify-center space-x-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-20 h-16 bg-gray-300 rounded-t-lg flex items-end justify-center pb-2">
                  <span className="text-2xl">🥈</span>
                </div>
                <div className="mt-3">
                  <Icon name={getLeaderboardIcon(2)} size={48} className="mx-auto" />
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{users[1].username}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{users[1].points} pts</div>
                </div>
              </div>
              
              {/* 1st Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
                  <span className="text-3xl">🥇</span>
                </div>
                <div className="mt-3">
                  <Icon name={getLeaderboardIcon(1)} size={56} className="mx-auto" />
                  <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{users[0].username}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{users[0].points} pts</div>
                </div>
              </div>
              
              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-20 h-12 bg-orange-400 rounded-t-lg flex items-end justify-center pb-2">
                  <span className="text-2xl">🥉</span>
                </div>
                <div className="mt-3">
                  <Icon name={getLeaderboardIcon(3)} size={48} className="mx-auto" />
                  <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-2`}>{users[2].username}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{users[2].points} pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Full Rankings */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Full Rankings</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Complete leaderboard with detailed stats</p>
            </div>
            <div className="flex space-x-2">
              {(['weekly', 'monthly', 'all'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFrame(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeFrame === period
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {users.length > 0 ? (
              users.map((leaderboardUser) => (
                <div
                  key={leaderboardUser.id}
                  className={`p-4 rounded-lg border transition-all ${
                    leaderboardUser.id === 'current-user'
                      ? isDarkMode ? 'bg-purple-900/20 border-purple-700 ring-2 ring-purple-800' : 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                      : isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`text-xl font-bold min-w-[3rem] ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        {getRankIcon(leaderboardUser.rank)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {leaderboardUser.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboardUser.username}</span>
                            {leaderboardUser.badges.map((badge, idx) => {
                              const badgeName = typeof badge === 'string' ? badge : (badge as any).name || 'Badge';
                              return (
                                <span key={idx} title={badgeName}>
                                  {getBadgeEmoji(badge)}
                                </span>
                              );
                            })}
                          </div>
                          {leaderboardUser.email && (
                            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              {leaderboardUser.email}
                            </div>
                          )}
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Level {leaderboardUser.level} • {leaderboardUser.badges.length} badges
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboardUser.points}</div>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Total</div>
                      </div>
                      {timeFrame === 'weekly' && (
                        <div className="text-center">
                          <div className={`font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{leaderboardUser.weeklyPoints}</div>
                          <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>This Week</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{leaderboardUser.challenges}</div>
                        <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Challenges</div>
                      </div>
                      {leaderboardUser.quests !== undefined && (
                        <div className="text-center">
                          <div className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{leaderboardUser.quests}/5</div>
                          <div className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Quests</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Yet</h3>
                <p className="text-gray-600">Complete challenges to appear on the leaderboard!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;