import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';

interface Level {
  questId: string;
  levelNumber: number;
  title: string;
  story: string;
  objective: string;
  difficulty: string;
  hints: string[];
  points: number;
}

const QuestLevel: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { questId } = useParams<{ questId: string }>();
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [, setPreviousHint] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadQuestProgress = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/quests/${questId}/progress`);
      setCurrentLevel(response.currentLevel || 1);
    } catch (error) {
      setCurrentLevel(1);
    } finally {
      setLoading(false);
    }
  }, [questId]);

  const fetchLevel = useCallback(async (levelNum: number) => {
    setLoading(true);
    try {
      const response = await API.get(`/quests/${questId}/level/${levelNum}`);
      setLevel(response.level);
      setPreviousHint(response.previousHint);
      setAiResponse('');
      setValidation(null);
      setUserPrompt('');
    } catch (error) {
      // Error fetching level
    } finally {
      setLoading(false);
    }
  }, [questId]);

  useEffect(() => {
    loadQuestProgress();
  }, [questId, loadQuestProgress]);

  useEffect(() => {
    if (currentLevel !== null) {
      fetchLevel(currentLevel);
    }
  }, [currentLevel, questId, fetchLevel]);

  const handleSubmit = async () => {
    if (!userPrompt.trim()) return;

    setSubmitting(true);
    try {
      const response = await API.post(`/quests/${questId}/level/${currentLevel}`, {
        userPrompt
      });
      setAiResponse(response.aiResponse);
      setValidation(response.validation);
    } catch (error) {
      // Error submitting prompt
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextLevel = () => {
    if (level && currentLevel !== null && currentLevel < 10) {
      setCurrentLevel(currentLevel + 1);
    } else {
      navigate('/prompt-quest');
    }
  };

  if (loading || currentLevel === null || !level) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading level...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/prompt-quest')}
        className={`${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} flex items-center`}
      >
        ← Back to Prompt Quest
      </button>

      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Level {currentLevel}/10
          </h1>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Difficulty: <span className="capitalize font-medium">{level.difficulty}</span>
          </span>
        </div>
        
        {/* Progress Dots */}
        <div className="flex gap-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < currentLevel
                  ? isDarkMode ? 'bg-purple-500' : 'bg-purple-600'
                  : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Level Content */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          📍 {level.title}
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              📖 Story:
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
              {level.story}
            </p>
          </div>

          <div>
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              🎯 Your Objective:
            </h3>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{level.objective}</p>
          </div>

          <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
              💡 Hints:
            </h3>
            <ul className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} text-sm space-y-1`}>
              {level.hints?.map((hint, idx) => (
                <li key={idx}>• {hint}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Prompt Input */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
          Your Prompt:
        </label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className={`w-full h-32 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900'
          }`}
          placeholder="Write your prompt here..."
          disabled={submitting || (validation && validation.passed)}
        />
        <button
          onClick={handleSubmit}
          disabled={!userPrompt.trim() || submitting || (validation && validation.passed)}
          className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit Prompt'}
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
            🤖 AI Response:
          </h3>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-xl`}>
            <pre className={`whitespace-pre-wrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {aiResponse}
            </pre>
          </div>
        </div>
      )}

      {/* Validation Result */}
      {validation && (
        <div
          className={`rounded-xl shadow-sm p-6 ${
            validation.passed
              ? isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
              : isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
          }`}
        >
          <h3
            className={`text-lg font-bold mb-4 ${
              validation.passed
                ? isDarkMode ? 'text-green-300' : 'text-green-800'
                : isDarkMode ? 'text-red-300' : 'text-red-800'
            }`}
          >
            {validation.passed ? '✅ Level Complete!' : '❌ Try Again'}
          </h3>
          <p
            className={`mb-4 ${
              validation.passed
                ? isDarkMode ? 'text-green-400' : 'text-green-700'
                : isDarkMode ? 'text-red-400' : 'text-red-700'
            }`}
          >
            {validation.feedback}
          </p>
          {validation.passed && (
            <button
              onClick={handleNextLevel}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {currentLevel < 10 ? 'Next Level →' : 'Complete Quest 🎉'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestLevel;
