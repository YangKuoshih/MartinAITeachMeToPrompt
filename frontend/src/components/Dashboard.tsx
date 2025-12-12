import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API } from '../utils/api';

import Icon from './Icon';
import { getRankIcon, getRankName } from '../utils/iconMapper';



interface UserProgress {
  level: number;
  points: number;
  streak: number;
  badges: string[];
  username: string;
  nextLevelPoints: number;
  challengesCompleted: number;
  questsCompleted?: number;
  questLevelsCompleted?: number;
  topicProgress: {
    [topicId: string]: {
      completed: number;
      total: number;
      completedChallenges: string[];
    };
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  points: number;
  estimatedTime?: string;
  scenario?: string;
  objective?: string;
}

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  

  const [progress, setProgress] = useState<UserProgress>({
    level: 1,
    points: 100,
    streak: 1,
    badges: [],
    username: user?.firstName || 'User',
    nextLevelPoints: 900,
    challengesCompleted: 1,
    questsCompleted: 0,
    questLevelsCompleted: 0,
    topicProgress: {
      'basic-prompt-engineering': { completed: 0, total: 8, completedChallenges: [] },
      'advanced-techniques': { completed: 0, total: 10, completedChallenges: [] },
      'creative-writing': { completed: 0, total: 8, completedChallenges: [] }
    }
  });

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [recommendedTopics, setRecommendedTopics] = useState<any[]>([]);

  const loadProgress = useCallback(async () => {
    try {
      const response = await API.get('/progress');
      if (response && response.length > 0) {
        const progressData = response[0];
        progressData.username = user?.firstName || progressData.username || 'User';
        setProgress(progressData);
      }
    } catch (error) {
      // Don't override username on API error
    }
  }, [user?.firstName]);

  const loadRecommendedContent = useCallback(async (currentProgress?: UserProgress) => {
    const progressData = currentProgress || progress;
    
    try {
      // Fetch challenges from API with retry
      let response;
      try {
        response = await API.get('/challenges/recommended');
      } catch (err) {
        response = [];
      }
      const allChallenges = response || [];
      
      // Get all completed challenges across all topics
      const completedChallenges = Object.values(progressData.topicProgress || {})
        .flatMap(topic => topic.completedChallenges || []);
      
      // Filter to show only uncompleted challenges, limit to 3
      const nextChallenges = allChallenges
        .filter((c: Challenge) => !completedChallenges.includes(c.id))
        .slice(0, 3);
      
      setChallenges(nextChallenges);
    } catch (error) {
      setChallenges([]);
    }

    // Set Fed topic cards - all available topics
    const allFedTopics = [
      { id: 'monetary-policy', name: 'Monetary Policy', icon: '💰', description: 'Interest rates, inflation targeting', progress: progressData.topicProgress?.['monetary-policy'] || { completed: 0, total: 8 } },
      { id: 'economic-research', name: 'Economic Research', icon: '📊', description: 'Data analysis, forecasting models', progress: progressData.topicProgress?.['economic-research'] || { completed: 0, total: 8 } },
      { id: 'financial-stability', name: 'Financial Stability', icon: '🏦', description: 'Banking supervision, risk assessment', progress: progressData.topicProgress?.['financial-stability'] || { completed: 0, total: 8 } },
      { id: 'payment-systems', name: 'Payment Systems', icon: '💳', description: 'Digital payments, settlement systems', progress: progressData.topicProgress?.['payment-systems'] || { completed: 0, total: 8 } },
      { id: 'consumer-protection', name: 'Consumer Protection', icon: '🛡️', description: 'Fair lending, consumer rights', progress: progressData.topicProgress?.['consumer-protection'] || { completed: 0, total: 8 } },
      { id: 'international-affairs', name: 'International Affairs', icon: '🌍', description: 'Global economics, trade policy', progress: progressData.topicProgress?.['international-affairs'] || { completed: 0, total: 8 } },
    ];
    
    // Filter to show only incomplete topics, take first 3
    const incompleteFedTopics = allFedTopics.filter(topic => topic.progress.completed < topic.progress.total);
    setRecommendedTopics(incompleteFedTopics.slice(0, 3));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await API.get('/progress');
        if (response && response.length > 0) {
          const progressData = response[0];
          progressData.username = user?.firstName || progressData.username || 'User';
          setProgress(progressData);
          loadRecommendedContent(progressData);
        } else {
          loadRecommendedContent();
        }
      } catch (error) {
        loadRecommendedContent();
      }
    };
    
    loadData();
    
    // Listen for challenge completion events
    const handleChallengeCompleted = (event: CustomEvent) => {
      const challengeData = event.detail;
      
      // Update progress immediately
      setProgress(prev => ({
        ...prev,
        points: prev.points + challengeData.points,
        challengesCompleted: prev.challengesCompleted + 1
      }));
      
      // Reload full data from server
      setTimeout(() => {
        loadData();
      }, 1000);
    };
    
    window.addEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    
    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    };
  }, [user?.firstName, loadRecommendedContent]);

  useEffect(() => {
    // Update username when user data becomes available
    if (user?.firstName) {
      setProgress(prev => ({
        ...prev,
        username: user.firstName || 'User'
      }));
    }
  }, [user]);

  // Expose reload function for manual refresh
  const refreshData = async () => {
    try {
      const response = await API.get('/progress');
      if (response && response.length > 0) {
        const progressData = response[0];
        progressData.username = user?.firstName || progressData.username || 'User';
        setProgress(progressData);
        loadRecommendedContent(progressData);
      } else {
        loadRecommendedContent();
      }
    } catch (error) {
      loadRecommendedContent();
    }
  };
  
  // Add refresh button for testing
  window.refreshDashboard = refreshData;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {progress.username}!
            </h1>
            <p className={`mt-1 text-lg font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Prompt Engineering Training Academy
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
              Ready to level up your prompt engineering skills?
            </p>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
          <div className={`${isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-100'} rounded-xl p-4 border`}>
            <div className="flex justify-between items-center">
              <Icon name="jabba-the-hutt" size={32} />
              <span className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm font-medium`}>Credits</span>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{progress.points}</span>
              <p className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm mt-1`}>{progress.nextLevelPoints} to next rank</p>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} rounded-xl p-4 border`}>
            <div className="flex justify-between items-center">
              <Icon name={getRankIcon(progress.level)} size={32} />
              <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-sm font-medium`}>Rank</span>
            </div>
            <div className="mt-2">
              <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getRankName(progress.level)}</span>
              <p className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-xs mt-1`}>Level {progress.level}</p>
              <div className={`w-full ${isDarkMode ? 'bg-blue-800' : 'bg-blue-100'} rounded-full h-2 mt-2`}>
                <div 
                  className={`${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded-full h-2`}
                  style={{ width: `${(progress.points / (progress.points + progress.nextLevelPoints)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'} rounded-xl p-4 border`}>
            <div className="flex justify-between items-center">
              <Icon name="red-five" size={32} />
              <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} text-sm font-medium`}>Missions</span>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{progress.challengesCompleted}</span>
              <p className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} text-sm mt-1`}>Completed</p>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'} rounded-xl p-4 border`}>
            <div className="flex justify-between items-center">
              <Icon name="qui-gon-jinn" size={32} />
              <span className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} text-sm font-medium`}>Quests</span>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{progress.questsCompleted || 0}/5</span>
              <p className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} text-sm mt-1`}>Completed</p>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'} rounded-xl p-4 border`}>
            <div className="flex justify-between items-center">
              <Icon name="lightsaber-darth-vader" size={32} />
              <span className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} text-sm font-medium`}>Trials</span>
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{progress.questLevelsCompleted || 0}/50</span>
              <p className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} text-sm mt-1`}>Mastered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Continue Training</h2>
          <Link to="/challenges" className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} text-sm font-medium`}>
            View All
          </Link>
        </div>

        {/* Recommended Challenges */}
        {challenges.length > 0 && (
          <div className="mb-6">
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Recommended Missions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((challenge) => (
                <Link 
                  key={challenge.id}
                  to="/challenges?topic=basic-prompt-engineering"
                  className={`group block ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-300'} rounded-xl border hover:shadow-md transition-all p-4`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className={`flex items-center text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                      <span className="mr-1">⭐</span>
                      {challenge.points} pts
                    </span>
                  </div>
                  <h3 className={`font-medium ${isDarkMode ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'} transition-colors mb-2`}>
                    {challenge.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3`}>
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ⏱️ {challenge.estimatedTime}
                    </p>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Start →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Explore Topics */}
        {recommendedTopics.length > 0 && (
          <div>
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>Explore Sectors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedTopics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/challenges?topic=${topic.id}`}
                  className={`group block ${isDarkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-blue-500' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:border-blue-400'} rounded-xl border hover:shadow-md transition-all p-4`}
                >
                  <div className="flex items-center mb-3">
                    <span className="text-3xl mr-3">{topic.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{topic.name}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{topic.description}</p>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white/50'}`}>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {topic.progress.completed}/{topic.progress.total} completed
                    </span>
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Generate →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {challenges.length === 0 && recommendedTopics.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>All caught up!</h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>You've completed all available challenges.</p>
            <Link 
              to="/challenges" 
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Explore More Challenges
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Command Center</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/playground"
            className={`group flex items-center p-4 ${isDarkMode ? 'bg-purple-900/20 border-purple-800 hover:bg-purple-900/30' : 'bg-purple-50 border-purple-100 hover:bg-purple-100'} rounded-xl border transition-colors`}
          >
            <Icon name="c3p0" size={40} className="mr-3" />
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Playground</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Experiment freely</p>
            </div>
          </Link>

          <Link
            to="/prompt-quest"
            className={`group flex items-center p-4 ${isDarkMode ? 'bg-blue-900/20 border-blue-800 hover:bg-blue-900/30' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'} rounded-xl border transition-colors`}
          >
            <Icon name="han-solo" size={40} className="mr-3" />
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Prompt Quests</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Galactic missions</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className={`group flex items-center p-4 ${isDarkMode ? 'bg-green-900/20 border-green-800 hover:bg-green-900/30' : 'bg-green-50 border-green-100 hover:bg-green-100'} rounded-xl border transition-colors`}
          >
            <Icon name="princess-leia" size={40} className="mr-3" />
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>View progress</p>
            </div>
          </Link>

          <Link
            to="/gamification"
            className={`group flex items-center p-4 ${isDarkMode ? 'bg-yellow-900/20 border-yellow-800 hover:bg-yellow-900/30' : 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100'} rounded-xl border transition-colors`}
          >
            <Icon name="admiral-ackbar" size={40} className="mr-3" />
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Badges</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>View achievements</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;