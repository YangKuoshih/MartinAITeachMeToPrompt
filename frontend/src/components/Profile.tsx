import React, { useState, useEffect } from 'react';
import { API } from '../utils/api';

import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import { getRankIcon } from '../utils/iconMapper';


interface SkillProgress {
  level: number;
  progress: number;
  totalChallenges: number;
  completedChallenges: number;
}

interface UserProfile {
  username: string;
  email: string;
  level: number;
  points: number;
  nextLevelPoints: number;
  streak: number;
  challengesCompleted: number;
  questsCompleted: number;
  questLevelsCompleted: number;
  averageScore: number;
  isAdmin: boolean;
  skills: {
    [key: string]: SkillProgress;
  };
  badges: {
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedAt?: string;
  }[];
}

interface Activity {
  id: string;
  type: 'challenge_complete' | 'level_up' | 'badge_earned';
  title: string;
  description: string;
  points?: number;
  timestamp: string;
  success?: boolean;
}

const Profile: React.FC = () => {

  const { isDarkMode } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile>({
    username: 'User',
    email: 'user@example.com',
    level: 1,
    points: 0,
    nextLevelPoints: 1000,
    streak: 0,
    challengesCompleted: 0,
    questsCompleted: 0,
    questLevelsCompleted: 0,
    averageScore: 0,
    isAdmin: false,
    skills: {},
    badges: []
  });

  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadProfile();
    loadActivities();
    
    // Listen for challenge completion events
    const handleChallengeCompleted = (event: CustomEvent) => {
      const challengeData = event.detail;
      
      // Update profile stats immediately
      setProfile(prev => ({
        ...prev,
        points: prev.points + challengeData.points,
        challengesCompleted: prev.challengesCompleted + 1
      }));
      
      // Add new activity
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'challenge_complete',
        title: 'Challenge Completed',
        description: `Completed "${challengeData.challengeId}" challenge`,
        points: challengeData.points,
        timestamp: new Date().toLocaleDateString(),
        success: true
      };
      
      setActivities(prev => [newActivity, ...prev]);
      
      // Reload full data from server
      setTimeout(() => {
        loadProfile();
        loadActivities();
      }, 2000);
    };
    
    window.addEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    
    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    };
  }, []);

  const loadProfile = async () => {
    try {
      const response = await API.get('/profile');
      if (response) {
        const profileData = {
          ...response,
          username: response.username || 'User',
          email: response.email || 'user@example.com',
          isAdmin: response.isAdmin || false,
          skills: response.skills || {}
        };
        setProfile(profileData);
      }
    } catch (error) {
      // Error loading profile
    }
  };
  
  // Expose reload function for testing
  window.refreshProfile = () => {
    loadProfile();
    loadActivities();
  };

  const loadActivities = async () => {
    try {
      const response = await API.get('/profile/activities');
      if (response && response.activities) {
        setActivities(response.activities);
      }
    } catch (error) {
      // Error loading activities
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'challenge_complete':
        return '✅';
      case 'level_up':
        return '🗡️';
      case 'badge_earned':
        return '✨';
      default:
        return '📜';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Profile
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          View your training progress, skills, and mission history
        </p>
      </div>

      {/* Profile Details */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Icon name={getRankIcon(profile.level)} size={64} />
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {profile.username}
                </h1>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{profile.email}</p>

                {profile.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-2">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Progress to Level {profile.level + 1}
              </span>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {profile.points}/{profile.nextLevelPoints} XP
              </span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <div
                className="bg-purple-600 rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${(profile.points / profile.nextLevelPoints) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-100'}`}>
              <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                Credits
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.points}
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'}`}>
              <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>
                Missions Completed
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.challengesCompleted}
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                Avg Challenge Score
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.averageScore}/100
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-100'}`}>
              <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`}>
                Quests Completed
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.questsCompleted}/5
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${isDarkMode ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-100'}`}>
              <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-800'}`}>
                Quest Levels
              </div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.questLevelsCompleted}/50
              </div>
            </div>
          </div>

          {/* Skill Progress */}
          <div className="mt-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Force Abilities
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(profile.skills).length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Complete challenges to unlock skill progress!
                </div>
              ) : (
                Object.entries(profile.skills)
                  .filter(([_, skill]) => skill.completedChallenges > 0)
                  .map(([skillName, skill]) => {
                    const topicNames: { [key: string]: string } = {
                      'basic-prompt-engineering': 'Basic Prompt Engineering',
                      'monetary-policy': 'Monetary Policy',
                      'financial-stability': 'Financial Stability',
                      'economic-research': 'Economic Research',
                      'payment-systems': 'Payment Systems',
                      'consumer-protection': 'Consumer Protection',
                      'international-affairs': 'International Affairs'
                    };
                    return (
                      <div key={`skill-${skillName}`} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {topicNames[skillName] || skillName}
                            </span>
                            <span className="text-sm text-purple-600 font-medium">
                              Level {skill.level}
                            </span>
                          </div>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {skill.completedChallenges}/{skill.totalChallenges} Challenges
                          </span>
                        </div>
                        <div className="relative">
                          <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                            <div
                              className="absolute top-0 left-0 h-2 bg-purple-600 rounded-full transition-all duration-500"
                              style={{ width: `${skill.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
        <div className="p-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Mission Log
          </h2>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No recent activities. Complete challenges to see your progress!
              </div>
            ) : (
              activities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
              >
                <span className="text-2xl">
                  {getActivityIcon(activity.type)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {activity.title}
                    </h3>
                    {activity.points && (
                      <span className="text-sm font-medium text-purple-600">
                        +{activity.points} pts
                      </span>
                    )}
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1`}>
                    {activity.description}
                  </p>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mt-2 block`}>
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>

      {/* Achievements & Badges */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
        <div className="p-6">
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
            Honors & Badges
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(() => {
              const earnedBadgeNames = profile.badges.map(b => typeof b === 'string' ? b : b.name);
              const allBadges = [
                { id: 'newcomer', name: 'Rebel Recruit', description: 'Welcome to the Rebellion!', icon: '⭐', rarity: 'common', earned: true },
                { id: 'first-success', name: 'First Mission', description: 'Completed first challenge', icon: '🎯', rarity: 'common', earned: earnedBadgeNames.includes('First Mission') || earnedBadgeNames.includes('First Success') || profile.challengesCompleted >= 1 },
                { id: 'first-quest', name: 'Quest Initiate', description: 'Complete your first quest', icon: '🗺️', rarity: 'rare', earned: earnedBadgeNames.includes('Quest Initiate') || profile.questsCompleted >= 1 },
                { id: 'quest-master', name: 'Quest Master', description: 'Complete 3 quests', icon: '🏅', rarity: 'epic', earned: earnedBadgeNames.includes('Quest Master') || profile.questsCompleted >= 3 },
                { id: 'galactic-hero', name: 'Galactic Hero', description: 'Complete all 5 quests', icon: '🌟', rarity: 'legendary', earned: earnedBadgeNames.includes('Galactic Hero') || profile.questsCompleted >= 5 },
                { id: 'challenge-5', name: 'X-Wing Pilot', description: 'Complete 5 challenges', icon: '✈️', rarity: 'common', earned: earnedBadgeNames.includes('X-Wing Pilot') || profile.challengesCompleted >= 5 },
                { id: 'challenge-15', name: 'TIE Fighter Ace', description: 'Complete 15 challenges', icon: '🛸', rarity: 'rare', earned: earnedBadgeNames.includes('TIE Fighter Ace') || profile.challengesCompleted >= 15 },
                { id: 'challenge-30', name: 'Death Star Commander', description: 'Complete 30 challenges', icon: '🌑', rarity: 'epic', earned: earnedBadgeNames.includes('Death Star Commander') || profile.challengesCompleted >= 30 },
                { id: 'challenge-50', name: 'Galactic Emperor', description: 'Complete 50 challenges', icon: '👑', rarity: 'legendary', earned: earnedBadgeNames.includes('Galactic Emperor') || profile.challengesCompleted >= 50 },
                { id: 'streak-3', name: 'Force Sensitive', description: 'Maintain a 3-day streak', icon: '⚡', rarity: 'common', earned: earnedBadgeNames.includes('Force Sensitive') || profile.streak >= 3 },
                { id: 'streak-7', name: 'Millennium Falcon', description: 'Maintain a 7-day streak', icon: '🚀', rarity: 'rare', earned: earnedBadgeNames.includes('Millennium Falcon') || profile.streak >= 7 },
                { id: 'streak-14', name: 'Star Destroyer', description: 'Maintain a 14-day streak', icon: '🛡️', rarity: 'epic', earned: earnedBadgeNames.includes('Star Destroyer') || profile.streak >= 14 },
                { id: 'streak-30', name: 'Eternal Force', description: 'Maintain a 30-day streak', icon: '🌟', rarity: 'legendary', earned: earnedBadgeNames.includes('Eternal Force') || profile.streak >= 30 },
                { id: 'points-500', name: 'Kyber Crystal', description: 'Earn 500 credits', icon: '💎', rarity: 'common', earned: earnedBadgeNames.includes('Kyber Crystal') || profile.points >= 500 },
                { id: 'points-1000', name: 'Holocron Keeper', description: 'Earn 1,000 credits', icon: '📜', rarity: 'rare', earned: earnedBadgeNames.includes('Holocron Keeper') || profile.points >= 1000 },
                { id: 'points-2500', name: 'Archive Master', description: 'Earn 2,500 credits', icon: '📚', rarity: 'epic', earned: earnedBadgeNames.includes('Archive Master') || profile.points >= 2500 },
                { id: 'points-5000', name: 'Chosen One', description: 'Earn 5,000 credits', icon: '🌌', rarity: 'legendary', earned: earnedBadgeNames.includes('Chosen One') || profile.points >= 5000 },
                { id: 'level-3', name: 'Level 3 Graduate', description: 'Reach Level 3', icon: '🎓', rarity: 'rare', earned: earnedBadgeNames.includes('Level 3 Graduate') || profile.level >= 3 },
                { id: 'level-5', name: 'Grand Master', description: 'Reach Level 5', icon: '🏆', rarity: 'legendary', earned: earnedBadgeNames.includes('Grand Master') || profile.level >= 5 }
              ];
              
              const getRarityColor = (rarity: string) => {
                switch (rarity) {
                  case 'common': return isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
                  case 'rare': return isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300';
                  case 'epic': return isDarkMode ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-300';
                  case 'legendary': return isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300';
                  default: return isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
                }
              };
              
              return allBadges.filter(b => b.earned).map((badge) => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${getRarityColor(badge.rarity)}`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium text-sm mb-1">{badge.name}</h3>
                  <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{badge.description}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;