import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import { getRankIcon, getRankName } from '../utils/iconMapper';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
}

const GamificationHub: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    level: 1,
    streak: 0,
    challengesCompleted: 0,
    badgesEarned: 0,
    questsCompleted: 0,
    questLevelsCompleted: 0,
    completedQuests: [] as string[]
  });

  const loadGamificationData = useCallback(async () => {
    try {
      // Try to load from API first
      const [, , statsResponse] = await Promise.allSettled([
        API.get('/achievements'),
        API.get('/badges'),
        API.get('/progress')
      ]);
      
      let loadedStats = {
        totalPoints: 0,
        level: 1,
        streak: 0,
        challengesCompleted: 0,
        badgesEarned: 0
      };
      
      // Load user stats from progress API
      let earnedBadgeNames: string[] = [];
      if (statsResponse.status === 'fulfilled' && statsResponse.value && statsResponse.value.length > 0) {
        const progress = statsResponse.value[0];
        earnedBadgeNames = progress.badges || [];
        const newStats = {
          totalPoints: progress.points || 0,
          level: progress.level || 1,
          streak: progress.streak || 0,
          challengesCompleted: progress.challengesCompleted || 0,
          badgesEarned: earnedBadgeNames.length,
          questsCompleted: progress.questsCompleted || 0,
          questLevelsCompleted: progress.questLevelsCompleted || 0,
          completedQuests: progress.completedQuests || []
        };
        setUserStats(newStats as any);
        loadedStats = newStats;
      } else {
        setUserStats(loadedStats as any);
      }
      
      // Generate achievements based on user progress
      const generatedAchievements = generateAchievements(loadedStats);
      setAchievements(generatedAchievements);
      
      // Generate badges based on user progress and earned badges from DB
      const generatedBadges = generateBadges(loadedStats, earnedBadgeNames);
      setBadges(generatedBadges);
      
    } catch (error) {
      // Generate default achievements and badges for demo
      const defaultStats = {
        totalPoints: 100,
        level: 1,
        streak: 1,
        challengesCompleted: 1,
        badgesEarned: 0,
        questsCompleted: 0,
        questLevelsCompleted: 0,
        completedQuests: []
      };
      setUserStats(defaultStats);
      setAchievements(generateAchievements(defaultStats));
      setBadges(generateBadges(defaultStats));
    }
  }, []);

  useEffect(() => {
    loadGamificationData();
    
    // Listen for challenge completion events
    const handleChallengeCompleted = (event: CustomEvent) => {
      // Reload data after challenge completion
      setTimeout(() => {
        loadGamificationData();
      }, 1000);
    };
    
    window.addEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    
    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    };
  }, [loadGamificationData]);

  const generateAchievements = (stats: any): Achievement[] => {
    const achievements: Achievement[] = [
      {
        id: 'first-challenge',
        name: 'Beginner',
        description: 'Complete your first challenge',
        icon: '👶',
        unlocked: stats.challengesCompleted >= 1,
        unlockedAt: stats.challengesCompleted >= 1 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.challengesCompleted, 1),
        maxProgress: 1
      },
      {
        id: 'challenges-5',
        name: 'Novice',
        description: 'Complete 5 challenges',
        icon: '🎓',
        unlocked: stats.challengesCompleted >= 5,
        unlockedAt: stats.challengesCompleted >= 5 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.challengesCompleted, 5),
        maxProgress: 5
      },
      {
        id: 'challenges-10',
        name: 'Expert',
        description: 'Complete 10 challenges',
        icon: '🗡️',
        unlocked: stats.challengesCompleted >= 10,
        unlockedAt: stats.challengesCompleted >= 10 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.challengesCompleted, 10),
        maxProgress: 10
      },
      {
        id: 'challenges-25',
        name: 'Master',
        description: 'Complete 25 challenges',
        icon: '🧙',
        unlocked: stats.challengesCompleted >= 25,
        unlockedAt: stats.challengesCompleted >= 25 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.challengesCompleted, 25),
        maxProgress: 25
      },
      {
        id: 'challenges-50',
        name: 'Elite',
        description: 'Complete 50 challenges',
        icon: '👑',
        unlocked: stats.challengesCompleted >= 50,
        unlockedAt: stats.challengesCompleted >= 50 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.challengesCompleted, 50),
        maxProgress: 50
      },
      {
        id: 'streak-3',
        name: 'Force Awakens',
        description: 'Maintain a 3-day training streak',
        icon: '⚡',
        unlocked: stats.streak >= 3,
        unlockedAt: stats.streak >= 3 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.streak, 3),
        maxProgress: 3
      },
      {
        id: 'streak-7',
        name: 'Force Adept',
        description: 'Maintain a 7-day training streak',
        icon: '🔥',
        unlocked: stats.streak >= 7,
        unlockedAt: stats.streak >= 7 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.streak, 7),
        maxProgress: 7
      },
      {
        id: 'streak-14',
        name: 'Force Master',
        description: 'Maintain a 14-day training streak',
        icon: '💫',
        unlocked: stats.streak >= 14,
        unlockedAt: stats.streak >= 14 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.streak, 14),
        maxProgress: 14
      },
      {
        id: 'streak-30',
        name: 'One with the Force',
        description: 'Maintain a 30-day training streak',
        icon: '🌟',
        unlocked: stats.streak >= 30,
        unlockedAt: stats.streak >= 30 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.streak, 30),
        maxProgress: 30
      },
      {
        id: 'points-500',
        name: 'Credit Collector',
        description: 'Earn 500 total credits',
        icon: '💰',
        unlocked: stats.totalPoints >= 500,
        unlockedAt: stats.totalPoints >= 500 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.totalPoints, 500),
        maxProgress: 500
      },
      {
        id: 'points-1000',
        name: 'Credit Hoarder',
        description: 'Earn 1,000 total credits',
        icon: '💎',
        unlocked: stats.totalPoints >= 1000,
        unlockedAt: stats.totalPoints >= 1000 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.totalPoints, 1000),
        maxProgress: 1000
      },
      {
        id: 'points-2500',
        name: 'Republic Treasurer',
        description: 'Earn 2,500 total credits',
        icon: '🏦',
        unlocked: stats.totalPoints >= 2500,
        unlockedAt: stats.totalPoints >= 2500 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.totalPoints, 2500),
        maxProgress: 2500
      },
      {
        id: 'points-5000',
        name: 'Galactic Banker',
        description: 'Earn 5,000 total credits',
        icon: '🌌',
        unlocked: stats.totalPoints >= 5000,
        unlockedAt: stats.totalPoints >= 5000 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.totalPoints, 5000),
        maxProgress: 5000
      },
      {
        id: 'level-2',
        name: 'Rising Learner',
        description: 'Reach Level 2',
        icon: '📈',
        unlocked: stats.level >= 2,
        unlockedAt: stats.level >= 2 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.level, 2),
        maxProgress: 2
      },
      {
        id: 'level-3',
        name: 'Skilled Apprentice',
        description: 'Reach Level 3',
        icon: '⬆️',
        unlocked: stats.level >= 3,
        unlockedAt: stats.level >= 3 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.level, 3),
        maxProgress: 3
      },
      {
        id: 'level-4',
        name: 'Elite Warrior',
        description: 'Reach Level 4',
        icon: '🚀',
        unlocked: stats.level >= 4,
        unlockedAt: stats.level >= 4 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.level, 4),
        maxProgress: 4
      },
      {
        id: 'level-5',
        name: 'Legendary Master',
        description: 'Reach Level 5',
        icon: '🏆',
        unlocked: stats.level >= 5,
        unlockedAt: stats.level >= 5 ? new Date().toISOString() : undefined,
        progress: Math.min(stats.level, 5),
        maxProgress: 5
      },
      {
        id: 'quest-1',
        name: 'Quest Beginner',
        description: 'Complete your first Prompt Quest',
        icon: '⚔️',
        unlocked: (stats as any).questsCompleted >= 1,
        unlockedAt: (stats as any).questsCompleted >= 1 ? new Date().toISOString() : undefined,
        progress: Math.min((stats as any).questsCompleted || 0, 1),
        maxProgress: 1
      },
      {
        id: 'quest-3',
        name: 'Quest Adventurer',
        description: 'Complete 3 Prompt Quests',
        icon: '🗺️',
        unlocked: (stats as any).questsCompleted >= 3,
        unlockedAt: (stats as any).questsCompleted >= 3 ? new Date().toISOString() : undefined,
        progress: Math.min((stats as any).questsCompleted || 0, 3),
        maxProgress: 3
      },
      {
        id: 'quest-5',
        name: 'Quest Master',
        description: 'Complete all 5 Prompt Quests',
        icon: '👑',
        unlocked: (stats as any).questsCompleted >= 5,
        unlockedAt: (stats as any).questsCompleted >= 5 ? new Date().toISOString() : undefined,
        progress: Math.min((stats as any).questsCompleted || 0, 5),
        maxProgress: 5
      },
      {
        id: 'quest-levels-10',
        name: 'Level Explorer',
        description: 'Complete 10 quest levels',
        icon: '🎯',
        unlocked: (stats as any).questLevelsCompleted >= 10,
        unlockedAt: (stats as any).questLevelsCompleted >= 10 ? new Date().toISOString() : undefined,
        progress: Math.min((stats as any).questLevelsCompleted || 0, 10),
        maxProgress: 10
      },
      {
        id: 'quest-levels-25',
        name: 'Level Veteran',
        description: 'Complete 25 quest levels',
        icon: '🌟',
        unlocked: (stats as any).questLevelsCompleted >= 25,
        unlockedAt: (stats as any).questLevelsCompleted >= 25 ? new Date().toISOString() : undefined,
        progress: Math.min((stats as any).questLevelsCompleted || 0, 25),
        maxProgress: 25
      },
      {
        id: 'quest-levels-50',
        name: 'Level Champion',
        description: 'Complete all 50 quest levels',
        icon: '💫',
        unlocked: (stats as any).questLevelsCompleted >= 50,
        unlockedAt: (stats as any).questLevelsCompleted >= 50 ? new Date().toISOString() : undefined,
        progress: Math.min((stats as any).questLevelsCompleted || 0, 50),
        maxProgress: 50
      }
    ];
    
    return achievements;
  };

  const generateBadges = (stats: any, earnedBadgeNames: string[] = []): Badge[] => {
    const allBadges: Badge[] = [
      {
        id: 'newcomer',
        name: 'Rebel Recruit',
        description: 'Welcome to the Rebellion!',
        icon: '⭐',
        rarity: 'common',
        earned: earnedBadgeNames.includes('Rebel Recruit') || earnedBadgeNames.includes('Newcomer') || true,
        earnedAt: new Date().toISOString()
      },
      {
        id: 'first-success',
        name: 'First Mission',
        description: 'Completed first challenge',
        icon: '🎯',
        rarity: 'common',
        earned: earnedBadgeNames.includes('First Mission') || earnedBadgeNames.includes('First Success') || stats.challengesCompleted >= 1,
        earnedAt: earnedBadgeNames.includes('First Mission') || earnedBadgeNames.includes('First Success') ? new Date().toISOString() : undefined
      },
      {
        id: 'challenge-5',
        name: 'X-Wing Pilot',
        description: 'Complete 5 challenges',
        icon: '✈️',
        rarity: 'common',
        earned: earnedBadgeNames.includes('X-Wing Pilot') || stats.challengesCompleted >= 5,
        earnedAt: earnedBadgeNames.includes('X-Wing Pilot') ? new Date().toISOString() : undefined
      },
      {
        id: 'challenge-15',
        name: 'TIE Fighter Ace',
        description: 'Complete 15 challenges',
        icon: '🛸',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('TIE Fighter Ace') || stats.challengesCompleted >= 15,
        earnedAt: earnedBadgeNames.includes('TIE Fighter Ace') ? new Date().toISOString() : undefined
      },
      {
        id: 'challenge-30',
        name: 'Death Star Commander',
        description: 'Complete 30 challenges',
        icon: '🌑',
        rarity: 'epic',
        earned: earnedBadgeNames.includes('Death Star Commander') || stats.challengesCompleted >= 30,
        earnedAt: earnedBadgeNames.includes('Death Star Commander') ? new Date().toISOString() : undefined
      },
      {
        id: 'challenge-50',
        name: 'Galactic Emperor',
        description: 'Complete 50 challenges',
        icon: '👑',
        rarity: 'legendary',
        earned: earnedBadgeNames.includes('Galactic Emperor') || stats.challengesCompleted >= 50,
        earnedAt: earnedBadgeNames.includes('Galactic Emperor') ? new Date().toISOString() : undefined
      },
      {
        id: 'streak-3',
        name: 'Force Sensitive',
        description: 'Maintain a 3-day streak',
        icon: '⚡',
        rarity: 'common',
        earned: earnedBadgeNames.includes('Force Sensitive') || stats.streak >= 3,
        earnedAt: earnedBadgeNames.includes('Force Sensitive') ? new Date().toISOString() : undefined
      },
      {
        id: 'streak-7',
        name: 'Millennium Falcon',
        description: 'Maintain a 7-day streak',
        icon: '🚀',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('Millennium Falcon') || stats.streak >= 7,
        earnedAt: earnedBadgeNames.includes('Millennium Falcon') ? new Date().toISOString() : undefined
      },
      {
        id: 'streak-14',
        name: 'Star Destroyer',
        description: 'Maintain a 14-day streak',
        icon: '🛡️',
        rarity: 'epic',
        earned: earnedBadgeNames.includes('Star Destroyer') || stats.streak >= 14,
        earnedAt: earnedBadgeNames.includes('Star Destroyer') ? new Date().toISOString() : undefined
      },
      {
        id: 'streak-30',
        name: 'Eternal Force',
        description: 'Maintain a 30-day streak',
        icon: '🌟',
        rarity: 'legendary',
        earned: earnedBadgeNames.includes('Eternal Force') || stats.streak >= 30,
        earnedAt: earnedBadgeNames.includes('Eternal Force') ? new Date().toISOString() : undefined
      },
      {
        id: 'points-500',
        name: 'Kyber Crystal',
        description: 'Earn 500 credits',
        icon: '💎',
        rarity: 'common',
        earned: earnedBadgeNames.includes('Kyber Crystal') || stats.totalPoints >= 500,
        earnedAt: earnedBadgeNames.includes('Kyber Crystal') ? new Date().toISOString() : undefined
      },
      {
        id: 'points-1000',
        name: 'Holocron Keeper',
        description: 'Earn 1,000 credits',
        icon: '📜',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('Holocron Keeper') || stats.totalPoints >= 1000,
        earnedAt: earnedBadgeNames.includes('Holocron Keeper') ? new Date().toISOString() : undefined
      },
      {
        id: 'points-2500',
        name: 'Archive Master',
        description: 'Earn 2,500 credits',
        icon: '📚',
        rarity: 'epic',
        earned: earnedBadgeNames.includes('Archive Master') || stats.totalPoints >= 2500,
        earnedAt: earnedBadgeNames.includes('Archive Master') ? new Date().toISOString() : undefined
      },
      {
        id: 'points-5000',
        name: 'Chosen One',
        description: 'Earn 5,000 credits',
        icon: '🌌',
        rarity: 'legendary',
        earned: earnedBadgeNames.includes('Chosen One') || stats.totalPoints >= 5000,
        earnedAt: earnedBadgeNames.includes('Chosen One') ? new Date().toISOString() : undefined
      },
      {
        id: 'level-3',
        name: 'Level 3 Graduate',
        description: 'Reach Level 3',
        icon: '🎓',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('Level 3 Graduate') || stats.level >= 3,
        earnedAt: earnedBadgeNames.includes('Level 3 Graduate') ? new Date().toISOString() : undefined
      },
      {
        id: 'level-5',
        name: 'Grand Master',
        description: 'Reach Level 5',
        icon: '🏆',
        rarity: 'legendary',
        earned: earnedBadgeNames.includes('Grand Master') || stats.level >= 5,
        earnedAt: earnedBadgeNames.includes('Grand Master') ? new Date().toISOString() : undefined
      },
      {
        id: 'quest-spy',
        name: 'Master Spy',
        description: 'Complete Galactic Spy Network',
        icon: '🕵️',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('Master Spy') || (stats as any).completedQuests?.includes('galactic-spy'),
        earnedAt: earnedBadgeNames.includes('Master Spy') ? new Date().toISOString() : undefined
      },
      {
        id: 'quest-escape',
        name: 'Ice Survivor',
        description: 'Complete Ice Planet Escape',
        icon: '🚀',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('Ice Survivor') || (stats as any).completedQuests?.includes('ice-planet-escape'),
        earnedAt: earnedBadgeNames.includes('Ice Survivor') ? new Date().toISOString() : undefined
      },
      {
        id: 'quest-holocron',
        name: 'Artifact Hunter',
        description: 'Complete The Holocron Hunt',
        icon: '🗺️',
        rarity: 'rare',
        earned: earnedBadgeNames.includes('Artifact Hunter') || (stats as any).completedQuests?.includes('holocron-hunt'),
        earnedAt: earnedBadgeNames.includes('Artifact Hunter') ? new Date().toISOString() : undefined
      },
      {
        id: 'quest-jedi',
        name: 'Expert',
        description: 'Complete Expert Trials',
        icon: '⚡',
        rarity: 'epic',
        earned: earnedBadgeNames.includes('Expert') || (stats as any).completedQuests?.includes('expert-trials'),
        earnedAt: earnedBadgeNames.includes('Expert') ? new Date().toISOString() : undefined
      },
      {
        id: 'quest-time',
        name: 'Time Lord',
        description: 'Complete The Time Paradox',
        icon: '⏰',
        rarity: 'epic',
        earned: earnedBadgeNames.includes('Time Lord') || (stats as any).completedQuests?.includes('time-paradox'),
        earnedAt: earnedBadgeNames.includes('Time Lord') ? new Date().toISOString() : undefined
      },
      {
        id: 'quest-all',
        name: 'Quest Legend',
        description: 'Complete all 5 Prompt Quests',
        icon: '🌟',
        rarity: 'legendary',
        earned: earnedBadgeNames.includes('Quest Legend') || (stats as any).questsCompleted >= 5,
        earnedAt: earnedBadgeNames.includes('Quest Legend') ? new Date().toISOString() : undefined
      }
    ];
    
    return allBadges;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return isDarkMode ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return isDarkMode ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };





  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Badges & Rewards
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Track your achievements, badges, and progress through the skill levels
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
          <div className="flex items-center">
            <Icon name="jabba-the-hutt" size={40} className="mr-3" />
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.totalPoints}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Credits</div>
            </div>
          </div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
          <div className="flex items-center">
            <Icon name={getRankIcon(userStats.level)} size={40} className="mr-3" />
            <div>
              <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getRankName(userStats.level)}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level {userStats.level}</div>
            </div>
          </div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
          <div className="flex items-center">
            <Icon name="red-five" size={40} className="mr-3" />
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.challengesCompleted}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Missions</div>
            </div>
          </div>
        </div>
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
          <div className="flex items-center">
            <Icon name="admiral-ackbar" size={40} className="mr-3" />
            <div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{userStats.badgesEarned}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Honors</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Achievements
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? isDarkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                        : isDarkMode ? 'bg-gray-700 border-gray-600 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{achievement.name}</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{achievement.description}</p>
                          {achievement.unlockedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {achievement.unlocked ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        achievement.progress !== undefined && (
                          <div className="text-right">
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {achievement.progress}/{achievement.maxProgress}
                            </div>
                            <div className={`w-20 rounded-full h-2 mt-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${(achievement.progress! / achievement.maxProgress!) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Achievements Yet</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Complete challenges to unlock achievements!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Honor Collection
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {badges.filter(badge => badge.earned).length > 0 ? (
                badges.filter(badge => badge.earned).map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 text-center transition-all ${getRarityColor(badge.rarity)}`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h3 className="font-medium text-sm mb-1">{badge.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                    {badge.earnedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <div className="text-4xl mb-3">🏅</div>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>No Badges Earned Yet</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Complete more challenges to earn your first badge!</p>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Available badges: {badges.length}</p>
                    <p>Earned: {badges.filter(b => b.earned).length}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationHub;