import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import Icon from './Icon';
import { getQuestIcon } from '../utils/iconMapper';

interface Quest {
  questId: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  totalLevels: number;
  currentLevel: number;
  completedLevels: number;
  pointsEarned: number;
  completed: boolean;
}

// Static quest definitions
const QUEST_DEFINITIONS = [
  {
    questId: 'galactic-spy',
    title: '🕵️ Galactic Spy Network',
    description: 'Master espionage and intelligence gathering through covert operations',
    icon: '🕵️',
    type: 'Espionage & Stealth',
    totalLevels: 10
  },
  {
    questId: 'ice-planet-escape',
    title: '❄️ Ice Planet Escape',
    description: 'Survive harsh conditions and escape from a frozen world',
    icon: '❄️',
    type: 'Survival & Strategy',
    totalLevels: 10
  },
  {
    questId: 'holocron-hunt',
    title: '🗺️ The Holocron Hunt',
    description: 'Decode ancient artifacts and uncover lost knowledge',
    icon: '🗺️',
    type: 'Archaeology & Puzzles',
    totalLevels: 10
  },
  {
    questId: 'expert-trials',
    title: '⚡ Expert Trials',
    description: 'Prove your mastery through challenging trials',
    icon: '⚡',
    type: 'Combat & Wisdom',
    totalLevels: 10
  },
  {
    questId: 'time-paradox',
    title: '⏰ The Time Paradox',
    description: 'Navigate temporal anomalies and prevent timeline collapse',
    icon: '⏰',
    type: 'Logic & Causality',
    totalLevels: 10
  }
];

const PromptQuest: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [questProgress, setQuestProgress] = useState<Record<string, { completedLevels: number; pointsEarned: number }>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestProgress();
  }, []);

  const fetchQuestProgress = async () => {
    try {
      const questData: Record<string, { completedLevels: number; pointsEarned: number }> = {};

      await Promise.all(
        QUEST_DEFINITIONS.map(async (quest) => {
          try {
            const response = await API.get(`/quests/${quest.questId}/progress`);
            questData[quest.questId] = {
              completedLevels: response.completedLevels?.length || 0,
              pointsEarned: response.pointsEarned || 0
            };
          } catch (error) {
            questData[quest.questId] = { completedLevels: 0, pointsEarned: 0 };
          }
        })
      );

      setQuestProgress(questData);
    } catch (error) {
      // Error fetching quest progress
    } finally {
      setLoading(false);
    }
  };

  // Merge static definitions with user progress
  const quests: Quest[] = QUEST_DEFINITIONS.map(def => {
    const progress = questProgress[def.questId] || { completedLevels: 0, pointsEarned: 0 };
    return {
      ...def,
      currentLevel: progress.completedLevels + 1,
      completedLevels: progress.completedLevels,
      pointsEarned: progress.pointsEarned,
      completed: progress.completedLevels >= def.totalLevels
    };
  });

  const handleStartQuest = (questId: string) => {
    navigate(`/prompt-quest/${questId}`);
  };

  // Show quests immediately with loading state for progress only
  const showLoading = loading && Object.keys(questProgress).length === 0;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        {showLoading && (
          <div className="text-center py-4">
            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading progress...</div>
          </div>
        )}
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Prompt Engineering Mission Quests
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Master prompt engineering through epic adventures
        </p>
      </div>

      {/* Quest Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {quests.map((quest) => (
          <div
            key={quest.questId}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Icon name={getQuestIcon(quest.questId)} size={48} className="mr-3" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {quest.title}
                    </h2>
                    {quest.completed && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`}>
                        ✓ Complete
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} font-medium mt-1`}>
                    {quest.type}
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-sm`}>
                    {quest.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className={`flex justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                <span>Progress: {quest.completedLevels}/{quest.totalLevels} Levels</span>
                <span className="flex items-center gap-1"><Icon name="jabba-the-hutt" size={16} /> {quest.pointsEarned} credits</span>
              </div>
              <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
                <div
                  className={`${isDarkMode ? 'bg-purple-500' : 'bg-purple-600'} h-2 rounded-full transition-all`}
                  style={{ width: `${(quest.completedLevels / quest.totalLevels) * 100}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => handleStartQuest(quest.questId)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {quest.completedLevels === 0 ? 'Start Mission' : quest.completed ? 'Replay Mission' : 'Continue Mission'}
            </button>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className={`${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border rounded-xl p-6`}>
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          How It Works
        </h3>
        <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li>• Each quest has 10 progressive levels</li>
          <li>• Complete a level to unlock the next one</li>
          <li>• Your AI response becomes a hint for the next level</li>
          <li>• Earn 15 points per level + 50 bonus for completing the quest</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptQuest;
