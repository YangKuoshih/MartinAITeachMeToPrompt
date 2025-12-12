import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../utils/api';
import { useSearchParams } from 'react-router-dom';
import { TOPICS } from '../config/topics';
import { useTheme } from '../contexts/ThemeContext';


interface Challenge {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  scenario: string;
  objective: string;
  constraints: string[];
  hints: string[];
  points: number;
  estimatedTime: string;
}

interface DifficultyProgress {
  [key: string]: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  expert: number;
}

interface UserProgress {
  completedChallenges: number;
  totalScore: number;
  currentLevel: string;
  averageScore: number;
  topicProgress: {
    [topicId: string]: {
      completed: number;
      total: number;
      completedChallenges: string[];
      difficultyProgress?: DifficultyProgress;
    };
  };
}



const BASIC_CHALLENGES = [
  {
    id: 'basic-1',
    title: 'Clear Instructions',
    difficulty: 'beginner' as const,
    scenario: 'You need to ask an AI to write a professional email.',
    objective: 'Create a prompt that gives clear, specific instructions for email writing.',
    constraints: ['Must specify tone', 'Include purpose', 'Define audience'],
    hints: ['Be specific about what you want', 'Include context', 'Set expectations'],
    points: 100,
    estimatedTime: '10 minutes'
  },
  {
    id: 'basic-2',
    title: 'Context Setting',
    difficulty: 'beginner' as const,
    scenario: 'You want the AI to act as a financial advisor.',
    objective: 'Write a prompt that establishes proper context and role for the AI.',
    constraints: ['Define the role clearly', 'Set the scenario', 'Specify expertise level'],
    hints: ['Use "You are..." statements', 'Provide background', 'Set boundaries'],
    points: 100,
    estimatedTime: '10 minutes'
  },
  {
    id: 'basic-3',
    title: 'Output Formatting',
    difficulty: 'intermediate' as const,
    scenario: 'You need a structured analysis with specific sections.',
    objective: 'Create a prompt that specifies exact output format and structure.',
    constraints: ['Define sections', 'Specify format', 'Include examples'],
    hints: ['Use templates', 'Show desired structure', 'Be explicit about formatting'],
    points: 200,
    estimatedTime: '15 minutes'
  },
  {
    id: 'basic-4',
    title: 'Few-Shot Learning',
    difficulty: 'intermediate' as const,
    scenario: 'You want the AI to classify text in a specific way.',
    objective: 'Use examples to teach the AI your desired classification approach.',
    constraints: ['Provide 2-3 examples', 'Show input-output pairs', 'Explain pattern'],
    hints: ['Quality over quantity', 'Diverse examples', 'Clear patterns'],
    points: 200,
    estimatedTime: '15 minutes'
  },
  {
    id: 'basic-5',
    title: 'Chain of Thought',
    difficulty: 'advanced' as const,
    scenario: 'You need the AI to solve a complex problem step-by-step.',
    objective: 'Design a prompt that encourages systematic reasoning.',
    constraints: ['Request step-by-step thinking', 'Ask for reasoning', 'Include verification'],
    hints: ['Ask "think step by step"', 'Request explanations', 'Encourage checking'],
    points: 300,
    estimatedTime: '20 minutes'
  },
  {
    id: 'basic-6',
    title: 'Constraint Handling',
    difficulty: 'advanced' as const,
    scenario: 'You need output that meets strict requirements and limitations.',
    objective: 'Create a prompt with multiple constraints that must be satisfied.',
    constraints: ['Set word limits', 'Define forbidden content', 'Specify requirements'],
    hints: ['Be explicit about limits', 'Use "must not" statements', 'Prioritize constraints'],
    points: 300,
    estimatedTime: '20 minutes'
  },
  {
    id: 'basic-7',
    title: 'Multi-Step Reasoning',
    difficulty: 'expert' as const,
    scenario: 'You need the AI to perform complex analysis with multiple reasoning steps.',
    objective: 'Design a prompt for sophisticated multi-step problem solving.',
    constraints: ['Break down complex tasks', 'Sequence reasoning steps', 'Include validation'],
    hints: ['Use numbered steps', 'Build on previous steps', 'Include checkpoints'],
    points: 500,
    estimatedTime: '25 minutes'
  },
  {
    id: 'basic-8',
    title: 'Advanced Prompt Chaining',
    difficulty: 'expert' as const,
    scenario: 'You need to create a series of connected prompts for a complex workflow.',
    objective: 'Design a multi-prompt system that builds on previous outputs.',
    constraints: ['Connect multiple prompts', 'Maintain context', 'Handle dependencies'],
    hints: ['Plan the workflow', 'Pass context between prompts', 'Design for iteration'],
    points: 500,
    estimatedTime: '30 minutes'
  }
];

const DIFFICULTIES = [
  { level: 'beginner', name: 'Beginner', description: 'Basic concepts and simple scenarios', points: 100, unlocked: true, requiredChallenges: 0, challengesPerLevel: 2 },
  { level: 'intermediate', name: 'Intermediate', description: 'Multi-step analysis and reasoning', points: 200, unlocked: true, requiredChallenges: 2, challengesPerLevel: 2 },
  { level: 'advanced', name: 'Advanced', description: 'Complex policy scenarios', points: 300, unlocked: false, requiredChallenges: 4, challengesPerLevel: 2 },
  { level: 'expert', name: 'Expert', description: 'Crisis management and edge cases', points: 500, unlocked: false, requiredChallenges: 6, challengesPerLevel: 2 }
];

const Challenges: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedChallenges: 0,
    totalScore: 0,
    currentLevel: 'Beginner',
    averageScore: 0,
    topicProgress: {
      'basic-prompt-engineering': { completed: 0, total: 8, completedChallenges: [] },
      'monetary-policy': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'financial-stability': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'economic-research': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'payment-systems': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'consumer-protection': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'international-affairs': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'cyber-security': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'cloud': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
      'product-owners': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } }
    }
  });

  const loadUserProgress = useCallback(async () => {
    try {
      const response = await API.get('/progress');
      if (response && response.length > 0) {
        const progressData = response[0];
        
        // Calculate average score from scores array
        const scores = progressData.scores || [];
        const averageScore = scores.length > 0 
          ? Math.round(scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length)
          : 0;
        
        const defaultTopicProgress = {
          'basic-prompt-engineering': { completed: 0, total: 8, completedChallenges: [] },
          'monetary-policy': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'financial-stability': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'economic-research': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'payment-systems': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'consumer-protection': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'international-affairs': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'cyber-security': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'cloud': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } },
          'product-owners': { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } }
        };
        
        setUserProgress({
          completedChallenges: progressData.challengesCompleted || 0,
          totalScore: progressData.points || 0,
          currentLevel: `Level ${progressData.level || 1}`,
          averageScore: averageScore,
          topicProgress: progressData.topicProgress || defaultTopicProgress
        });
        
        // Sync completed challenges from progress
        const basicProgress = progressData.topicProgress?.['basic-prompt-engineering'];
        if (basicProgress?.completedChallenges) {
          const completedIndices = BASIC_CHALLENGES
            .map((c, idx) => basicProgress.completedChallenges.includes(c.id) ? idx : -1)
            .filter(idx => idx !== -1);
          setCompletedBasicChallenges(completedIndices);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading user progress:', error);
      }
    }
  }, []);
  
  useEffect(() => {
    loadUserProgress();
    loadAvailableChallenges();
    
    // Auto-select topic from URL parameter
    const topicParam = searchParams.get('topic');
    if (topicParam && TOPICS.find(t => t.id === topicParam)) {
      setSelectedTopic(topicParam);
    }
    
    const handleChallengeCompleted = (event: CustomEvent) => {
      setTimeout(() => {
        loadUserProgress();
      }, 1000);
    };
    
    window.addEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    
    return () => {
      window.removeEventListener('challengeCompleted', handleChallengeCompleted as EventListener);
    };
  }, [searchParams]);

  const loadAvailableChallenges = async () => {
    try {
      const response = await API.get('/challenges/recommended');
      if (response && response.length > 0) {
        setAvailableChallenges(response);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading challenges:', error);
      }
    }
  };
  const [completedBasicChallenges, setCompletedBasicChallenges] = useState<number[]>([]);
  const [, setAvailableChallenges] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    return localStorage.getItem('selectedTopic') || 'basic-prompt-engineering';
  });
  const [selectedBasicChallenge, setSelectedBasicChallenge] = useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(() => {
    return localStorage.getItem('selectedDifficulty') || 'beginner';
  });
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [previewEvaluation, setPreviewEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingNextChallenge, setLoadingNextChallenge] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'selection' | 'active' | 'completed'>('selection');

  const generateChallenge = async (challengeIndexOrEvent?: number | React.MouseEvent) => {
    if (!selectedTopic) return;
    
    setLoading(true);
    try {
      if (selectedTopic === 'basic-prompt-engineering') {
        const index = typeof challengeIndexOrEvent === 'number' ? challengeIndexOrEvent : selectedBasicChallenge;
        const basicChallenge = BASIC_CHALLENGES[index];
        const challenge: Challenge = {
          ...basicChallenge,
          topic: selectedTopic,
          description: `Challenge ${index + 1} of 8: ${basicChallenge.title}`
        };
        setCurrentChallenge(challenge);
        setUserPrompt('');
        setAiResponse('');
        setEvaluation(null);
        setViewMode('active');
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Generating challenge for topic:', selectedTopic, 'difficulty:', selectedDifficulty);
        }
        
        const response = await API.post('/challenges/generate', {
          topic: selectedTopic,
          difficulty: selectedDifficulty
        });
        
        setCurrentChallenge(response);
        setUserPrompt('');
        setAiResponse('');
        setEvaluation(null);
        setViewMode('active');
      }
    } catch (error: any) {
      console.error('Error generating challenge:', error);
      
      // More specific error messages
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        if (error.message.includes('timed out') || error.message.includes('timeout')) {
          errorMessage = 'The server is taking longer than usual to generate your challenge. This sometimes happens when the AI is busy. Please try again in a moment.';
        } else if (error.message.includes('Session expired')) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network connection error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`Error generating challenge: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const testPrompt = async () => {
    if (!userPrompt.trim() || !currentChallenge) return;
    
    setLoading(true);
    try {
      const response = await API.post('/prompt/test', {
        challengeId: currentChallenge.id,
        userPrompt,
        challengeObjective: currentChallenge.objective,
        challengeConstraints: currentChallenge.constraints,
        challengeScenario: currentChallenge.scenario
      });
      setPreviewEvaluation(response.evaluation);
    } catch (error) {
      setAiResponse('Error: Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateGlobalProgress = async (challengeData: any) => {
    try {
      await API.post('/progress/sync', {
        challengeId: challengeData.challengeId,
        topic: challengeData.topic,
        points: challengeData.points,
        difficulty: challengeData.difficulty,
        score: challengeData.score,
        timestamp: new Date().toISOString()
      });
      
      window.dispatchEvent(new CustomEvent('challengeCompleted', {
        detail: challengeData
      }));
    } catch (error) {
      // Error syncing progress
    }
  };

  const submitChallenge = async () => {
    if (!currentChallenge || !userPrompt) return;
    
    setLoading(true);
    try {
      const response = await API.post('/challenges/submit', {
        challengeId: currentChallenge.id,
        userPrompt,
        aiResponse: aiResponse || undefined,
        challengeObjective: currentChallenge.objective,
        challengeConstraints: currentChallenge.constraints,
        challengeScenario: currentChallenge.scenario,
        temperature: 0.7,
        top_k: 40,
        top_p: 0.9,
        max_tokens: 500
      });
      
      if (response.aiResponse && !aiResponse) {
        setAiResponse(response.aiResponse);
      }
      
      setEvaluation(response);
      setViewMode('completed');
      if (response.passed) {
        const currentTopicProgress = userProgress.topicProgress[selectedTopic] || { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } };
        
        // Check if this is a new completion
        let shouldAwardPoints = false;
        
        if (selectedTopic === 'basic-prompt-engineering') {
          // For Basic PE: Only award points if challenge not already completed
          shouldAwardPoints = !currentTopicProgress.completedChallenges.includes(currentChallenge.id);
        } else {
          // For Fed topics: Only award points if difficulty level has less than 2 completions
          const currentDifficultyProgress = currentTopicProgress?.difficultyProgress || { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
          shouldAwardPoints = (currentDifficultyProgress[currentChallenge.difficulty] || 0) < 2;
        }
        
        if (shouldAwardPoints) {
          const challengeData = {
            challengeId: currentChallenge.id,
            topic: selectedTopic,
            points: currentChallenge.points,
            difficulty: currentChallenge.difficulty,
            score: response.score
          };
          
          setUserProgress(prev => {
            const currentTopicProgress = prev.topicProgress[selectedTopic] || { completed: 0, total: 8, completedChallenges: [], difficultyProgress: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 } };
            const currentDifficultyProgress: DifficultyProgress = currentTopicProgress?.difficultyProgress || {
              beginner: 0,
              intermediate: 0,
              advanced: 0,
              expert: 0
            };
            
            const isNewChallenge = !currentTopicProgress.completedChallenges.includes(currentChallenge.id);
            const updatedDifficultyProgress: DifficultyProgress = {
              ...currentDifficultyProgress,
              [currentChallenge.difficulty]: (currentDifficultyProgress[currentChallenge.difficulty] || 0) + 1
            };
            
            return {
              ...prev,
              completedChallenges: prev.completedChallenges + 1,
              totalScore: prev.totalScore + currentChallenge.points,
              topicProgress: {
                ...prev.topicProgress,
                [selectedTopic]: {
                  ...currentTopicProgress,
                  completed: currentTopicProgress.completed + 1,
                  completedChallenges: isNewChallenge ? [...currentTopicProgress.completedChallenges, currentChallenge.id] : currentTopicProgress.completedChallenges,
                  difficultyProgress: updatedDifficultyProgress
                }
              }
            };
          });
          
          if (selectedTopic === 'basic-prompt-engineering') {
            setCompletedBasicChallenges(prev => {
              if (!prev.includes(selectedBasicChallenge)) {
                return [...prev, selectedBasicChallenge];
              }
              return prev;
            });
          }
          
          await updateGlobalProgress(challengeData);
        }
      }
    } catch (error) {
      const mockEval = {
        passed: false,
        score: 0,
        feedback: 'Unable to evaluate at this time. Please try again.',
        suggestions: ['Check your internet connection', 'Try submitting again'],
        breakdown: { 
          constraintAdherence: 0,
          constraintReasoning: 'Evaluation failed',
          scenarioRelevance: 0,
          scenarioReasoning: 'Evaluation failed',
          objectiveAlignment: 0,
          objectiveReasoning: 'Evaluation failed',
          techniqueApplication: 0,
          techniqueReasoning: 'Evaluation failed'
        }
      };
      setEvaluation(mockEval);
      setViewMode('completed');
    } finally {
      setLoading(false);
    }
  };

  const isChallengeUnlocked = (challengeIndex: number) => {
    if (challengeIndex === 0) return true;
    return completedBasicChallenges.includes(challengeIndex - 1);
  };

  const getChallengeStatus = (challengeIndex: number) => {
    if (completedBasicChallenges.includes(challengeIndex)) return 'completed';
    if (isChallengeUnlocked(challengeIndex)) return 'unlocked';
    return 'locked';
  };

  const getTopicIcon = (topicId: string) => {
    const topic = TOPICS.find(t => t.id === topicId);
    return topic?.icon || '🏛️';
  };

  const getDifficultyColor = (level: string) => {
    // Lightsaber colors: Green (beginner), Blue (intermediate), Purple (advanced), Red (expert)
    const colors = {
      beginner: isDarkMode ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-green-100 text-green-700 border-green-300',
      intermediate: isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300',
      advanced: isDarkMode ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-300',
      expert: isDarkMode ? 'bg-red-900/40 text-red-300 border-red-700' : 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[level as keyof typeof colors] || (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700');
  };

  const backToSelection = () => {
    setViewMode('selection');
    setCurrentChallenge(null);
    setUserPrompt('');
    setAiResponse('');
    setEvaluation(null);
    setPreviewEvaluation(null);
  };

  const getNextDifficulty = (): string => {
    const topicProgress = userProgress.topicProgress[selectedTopic];
    if (!topicProgress?.difficultyProgress) return 'beginner';
    
    const dp = topicProgress.difficultyProgress;
    
    // Check current difficulty first - if less than 2, stay on current
    if (dp[selectedDifficulty] < 2) {
      return selectedDifficulty;
    }
    
    // Otherwise, move to next difficulty level
    if (selectedDifficulty === 'beginner' && dp.beginner >= 2) return 'intermediate';
    if (selectedDifficulty === 'intermediate' && dp.intermediate >= 2) return 'advanced';
    if (selectedDifficulty === 'advanced' && dp.advanced >= 2) return 'expert';
    if (selectedDifficulty === 'expert' && dp.expert >= 2) return 'expert'; // Stay on expert
    
    return selectedDifficulty;
  };

  const nextChallenge = async () => {
    setLoadingNextChallenge(true);
    setPreviewEvaluation(null);
    try {
      if (selectedTopic === 'basic-prompt-engineering') {
        const nextIndex = selectedBasicChallenge + 1;
        if (nextIndex < BASIC_CHALLENGES.length) {
          setSelectedBasicChallenge(nextIndex);
          await generateChallenge(nextIndex);
        } else {
          backToSelection();
        }
      } else {
        // Determine next difficulty for Federal Reserve topics
        const nextDiff = getNextDifficulty();
        setSelectedDifficulty(nextDiff);
        localStorage.setItem('selectedDifficulty', nextDiff);
        await generateChallenge();
      }
    } finally {
      setLoadingNextChallenge(false);
    }
  };

  const tryAgain = () => {
    setUserPrompt('');
    setAiResponse('');
    setEvaluation(null);
    setPreviewEvaluation(null);
    setViewMode('active');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Prompt Engineering Challenges
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-1`}>
          Master prompt engineering through structured missions and real-world scenarios
        </p>
        
        <div className="mt-4 flex items-center space-x-6">
          <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} px-4 py-2 rounded-lg`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              Skill Level: {userProgress.currentLevel}
            </span>
          </div>
          <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} px-4 py-2 rounded-lg`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
              Missions: {userProgress.completedChallenges}
            </span>
          </div>
          <div className={`${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} px-4 py-2 rounded-lg`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              Credits: {userProgress.totalScore}
            </span>
          </div>
          <div className={`${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-50'} px-4 py-2 rounded-lg`}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
              Avg Score: {userProgress.averageScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Topic and Difficulty Selection */}
      {viewMode === 'selection' && (
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Select Challenge Parameters</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Topics */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              Challenge Topic
            </label>
            <div className="space-y-2">
              {TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTopic === topic.id
                      ? isDarkMode ? 'border-blue-400 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                      : isDarkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    localStorage.setItem('selectedTopic', topic.id);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{topic.icon}</span>
                    <div>
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{topic.name}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{topic.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulties */}
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
              {selectedTopic === 'basic-prompt-engineering' ? 'Challenge Info' : 'Difficulty Level'}
            </label>
            {selectedTopic === 'basic-prompt-engineering' ? (
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className={`p-3 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`flex justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                    <span>Topic Progress</span>
                    <span>{userProgress.topicProgress[selectedTopic]?.completed || 0}/{userProgress.topicProgress[selectedTopic]?.total || 8} completed</span>
                  </div>
                  <div className={`w-full rounded-full h-2 mb-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((userProgress.topicProgress[selectedTopic]?.completed || 0) / (userProgress.topicProgress[selectedTopic]?.total || 8)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Challenge List */}
                <div className="space-y-2">
                  {BASIC_CHALLENGES.map((challenge, index) => {
                    const status = getChallengeStatus(index);
                    const isUnlocked = isChallengeUnlocked(index);
                    const isSelected = selectedBasicChallenge === index;
                    
                    return (
                      <div
                        key={challenge.id}
                        onClick={() => isUnlocked && setSelectedBasicChallenge(index)}
                        className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                          isSelected && isUnlocked
                            ? isDarkMode ? 'border-blue-400 bg-blue-900/30' : 'border-blue-500 bg-blue-50'
                            : status === 'completed'
                            ? isDarkMode ? 'border-green-400 bg-green-900/30' : 'border-green-300 bg-green-50'
                            : status === 'locked'
                            ? isDarkMode ? 'border-gray-600 bg-gray-700 cursor-not-allowed opacity-60' : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            : isDarkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-700/50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              status === 'completed'
                                ? 'bg-green-500 text-white'
                                : status === 'locked'
                                ? isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                                : isSelected
                                ? 'bg-blue-500 text-white'
                                : isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : index + 1}
                            </div>
                            <div>
                              <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{challenge.title}</div>
                              <div className={`text-xs ${getDifficultyColor(challenge.difficulty)} px-2 py-0.5 rounded inline-block mt-1`}>
                                {challenge.difficulty}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {challenge.points} pts
                            </div>
                            {!isUnlocked && index > 0 && (
                              <div className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                Complete #{index} first
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className={`p-3 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
                  <div className={`flex justify-between text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Topic Progress</span>
                    <span>{userProgress.topicProgress[selectedTopic]?.completed || 0}/{userProgress.topicProgress[selectedTopic]?.total || 8} completed</span>
                  </div>
                  <div className={`w-full rounded-full h-2 mb-3 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((userProgress.topicProgress[selectedTopic]?.completed || 0) / (userProgress.topicProgress[selectedTopic]?.total || 10)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  {DIFFICULTIES.map((diff) => {
                    const topicDifficultyProgress = userProgress.topicProgress[selectedTopic]?.difficultyProgress?.[diff.level] || 0;
                    const totalChallengesInTopic = userProgress.topicProgress[selectedTopic]?.completed || 0;
                    const isUnlocked = totalChallengesInTopic >= diff.requiredChallenges;
                    const isCompleted = topicDifficultyProgress >= diff.challengesPerLevel;
                    
                    return (
                      <div
                        key={diff.level}
                        className={`p-3 border rounded-lg transition-colors ${
                          !isUnlocked
                            ? isDarkMode ? 'border-gray-600 bg-gray-700 cursor-not-allowed opacity-50' : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            : isCompleted
                            ? isDarkMode ? 'border-green-400 bg-green-900/30 cursor-pointer' : 'border-green-300 bg-green-50 cursor-pointer'
                            : selectedDifficulty === diff.level
                            ? isDarkMode ? 'border-blue-400 bg-blue-900/30 cursor-pointer' : 'border-blue-500 bg-blue-50 cursor-pointer'
                            : isDarkMode ? 'border-gray-600 hover:border-gray-500 cursor-pointer bg-gray-700/50' : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (isUnlocked) {
                            setSelectedDifficulty(diff.level);
                            localStorage.setItem('selectedDifficulty', diff.level);
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{diff.name}</div>
                              {isCompleted && <span className="text-green-500">✓</span>}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{diff.description}</div>
                            {isUnlocked && (
                              <div className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                Progress: {topicDifficultyProgress}/{diff.challengesPerLevel} challenges completed
                              </div>
                            )}
                            {!isUnlocked && (
                              <div className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                Complete {diff.requiredChallenges} challenges to unlock
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {diff.points} pts
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={generateChallenge}
          disabled={!selectedTopic || loading || (selectedTopic === 'basic-prompt-engineering' && !isChallengeUnlocked(selectedBasicChallenge))}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (selectedTopic === 'basic-prompt-engineering' ? 'Loading Challenge...' : 'Generating Challenge... (this may take 30+ seconds)') : selectedTopic === 'basic-prompt-engineering' ? 'Load Challenge' : 'Generate Challenge'}
        </button>
      </div>
      )}

      {/* Current Challenge */}
      {currentChallenge && viewMode === 'active' && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={backToSelection}
              className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <span className="mr-2">←</span> Back to Selection
            </button>
            <div className="flex items-center space-x-4">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                {getTopicIcon(currentChallenge.topic)} {TOPICS.find(t => t.id === currentChallenge.topic)?.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(currentChallenge.difficulty)}`}>
                {currentChallenge.difficulty}
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full text-sm text-green-700">
                {currentChallenge.points} pts
              </span>
            </div>
          </div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{currentChallenge.title}</h2>
        </div>
      )}

      {/* Challenge Instructions */}
      {currentChallenge && viewMode === 'active' && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          {/* Grading Rubric */}
          <details className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <summary className={`cursor-pointer font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} hover:text-blue-600`}>
              📊 How is this graded? (Click to expand)
            </summary>
            <div className={`mt-3 space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <p className="font-medium">Your submission will be evaluated on 4 criteria (25 points each):</p>
              <div className="space-y-3 ml-4">
                <div>
                  <span className="font-semibold text-green-600">1. Constraint Adherence (25 points)</span>
                  <p className="ml-4 text-xs mt-1">Did you follow ALL the specified requirements and constraints?</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-600">2. Scenario Relevance (25 points)</span>
                  <p className="ml-4 text-xs mt-1">How well does your prompt fit the given scenario?</p>
                </div>
                <div>
                  <span className="font-semibold text-purple-600">3. Objective Alignment (25 points)</span>
                  <p className="ml-4 text-xs mt-1">Will your prompt achieve the stated objective?</p>
                </div>
                <div>
                  <span className="font-semibold text-orange-600">4. {selectedTopic === 'basic-prompt-engineering' ? 'Technique Application' : 'Federal Reserve Relevance'} (25 points)</span>
                  {selectedTopic === 'basic-prompt-engineering' ? (
                    <p className="ml-4 text-xs mt-1">Proper use of prompt engineering techniques (e.g., role-play, examples, chain-of-thought)</p>
                  ) : (
                    <p className="ml-4 text-xs mt-1">Federal Reserve context and domain relevance</p>
                  )}
                </div>
              </div>
              <p className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className="font-semibold">Passing Score:</span> 70/100 points
              </p>
            </div>
          </details>

          <div className="space-y-4">
            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Scenario</h3>
              <p className={`${isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'} p-3 rounded`}>{currentChallenge.scenario}</p>
            </div>

            <div>
              <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Objective</h3>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{currentChallenge.objective}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Constraints</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                  {currentChallenge.constraints.map((constraint, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      {constraint}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Hints</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                  {currentChallenge.hints.map((hint, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      {hint}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Testing Area */}
      {currentChallenge && viewMode === 'active' && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Your Prompt</h3>
          <textarea
            value={userPrompt}
            onChange={(e) => {
              setUserPrompt(e.target.value);
              setPreviewEvaluation(null);
            }}
            placeholder="Write your prompt here..."
            className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
          <div className="mt-4 flex space-x-3">
            <button
              onClick={testPrompt}
              disabled={!userPrompt.trim() || loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Prompt'}
            </button>
            <button
              onClick={submitChallenge}
              disabled={!userPrompt.trim() || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Challenge
            </button>
          </div>
        </div>
      )}

      {/* AI Response - Only show on completed */}
      {aiResponse && viewMode === 'completed' && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>AI Response</h3>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
            <pre className={`whitespace-pre-wrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{aiResponse}</pre>
          </div>
        </div>
      )}

      {/* Preview Evaluation */}
      {previewEvaluation && viewMode === 'active' && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 border-2 ${isDarkMode ? 'border-yellow-700' : 'border-yellow-400'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'} flex items-center gap-2`}>
              📊 Preview Evaluation (Not Final)
            </h3>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Score: {previewEvaluation.score}/100</span>
          </div>
          
          <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            {/* Score Breakdown */}
            {previewEvaluation.breakdown && (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• Constraint Adherence:</span>
                    <span className="font-semibold text-green-600">{previewEvaluation.breakdown.constraintAdherence}/25 points</span>
                  </div>
                  {previewEvaluation.breakdown.constraintReasoning && (
                    <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{previewEvaluation.breakdown.constraintReasoning}</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• Scenario Relevance:</span>
                    <span className="font-semibold text-blue-600">{previewEvaluation.breakdown.scenarioRelevance}/25 points</span>
                  </div>
                  {previewEvaluation.breakdown.scenarioReasoning && (
                    <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{previewEvaluation.breakdown.scenarioReasoning}</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• Objective Alignment:</span>
                    <span className="font-semibold text-purple-600">{previewEvaluation.breakdown.objectiveAlignment}/25 points</span>
                  </div>
                  {previewEvaluation.breakdown.objectiveReasoning && (
                    <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{previewEvaluation.breakdown.objectiveReasoning}</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• {previewEvaluation.breakdown.techniqueApplication !== undefined ? 'Technique Application' : 'Fed Relevance'}:</span>
                    <span className="font-semibold text-orange-600">{previewEvaluation.breakdown.techniqueApplication !== undefined ? previewEvaluation.breakdown.techniqueApplication : previewEvaluation.breakdown.fedRelevance}/25 points</span>
                  </div>
                  {(previewEvaluation.breakdown.techniqueReasoning || previewEvaluation.breakdown.fedReasoning) && (
                    <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{previewEvaluation.breakdown.techniqueReasoning || previewEvaluation.breakdown.fedReasoning}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className={`mt-4 p-3 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{previewEvaluation.feedback}</p>
              {previewEvaluation.suggestions && previewEvaluation.suggestions.length > 0 && (
                <div>
                  <h4 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>💡 Suggestions:</h4>
                  <ul className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                    {previewEvaluation.suggestions.map((suggestion: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-2 mt-1.5"></span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={`mt-3 p-2 rounded text-center text-sm ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
              💡 Tip: This analyzes your prompt quality. Submit to see actual AI response.
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && viewMode === 'completed' && currentChallenge && (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Challenge Complete!</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                {getTopicIcon(currentChallenge.topic)} {TOPICS.find(t => t.id === currentChallenge.topic)?.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(currentChallenge.difficulty)}`}>
                {currentChallenge.difficulty}
              </span>
            </div>
          </div>
          <div className={`p-4 rounded-lg mb-4 ${evaluation.passed ? (isDarkMode ? 'bg-green-900/20' : 'bg-green-50') : (isDarkMode ? 'bg-red-900/20' : 'bg-red-50')}`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg ${evaluation.passed ? 'text-green-600' : 'text-red-600'}`}>
                {evaluation.passed ? '✅ Challenge Passed!' : '❌ Challenge Failed'}
              </span>
              <span className={`ml-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Score: {evaluation.score}/100</span>
            </div>
            
            {/* Score Breakdown */}
            {evaluation.breakdown && (
              <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                <p className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>📊 Score Breakdown:</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• Constraint Adherence:</span>
                      <span className="font-semibold text-green-600">{evaluation.breakdown.constraintAdherence}/25 points</span>
                    </div>
                    {evaluation.breakdown.constraintReasoning && (
                      <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{evaluation.breakdown.constraintReasoning}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• Scenario Relevance:</span>
                      <span className="font-semibold text-blue-600">{evaluation.breakdown.scenarioRelevance}/25 points</span>
                    </div>
                    {evaluation.breakdown.scenarioReasoning && (
                      <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{evaluation.breakdown.scenarioReasoning}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• Objective Alignment:</span>
                      <span className="font-semibold text-purple-600">{evaluation.breakdown.objectiveAlignment}/25 points</span>
                    </div>
                    {evaluation.breakdown.objectiveReasoning && (
                      <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{evaluation.breakdown.objectiveReasoning}</p>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>• {evaluation.breakdown.techniqueApplication !== undefined ? 'Technique Application' : 'Fed Relevance'}:</span>
                      <span className="font-semibold text-orange-600">{evaluation.breakdown.techniqueApplication !== undefined ? evaluation.breakdown.techniqueApplication : evaluation.breakdown.fedRelevance}/25 points</span>
                    </div>
                    {(evaluation.breakdown.techniqueReasoning || evaluation.breakdown.fedReasoning) && (
                      <p className={`ml-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>{evaluation.breakdown.techniqueReasoning || evaluation.breakdown.fedReasoning}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>{evaluation.feedback}</p>
            {evaluation.suggestions && (
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Suggestions for Improvement:</h4>
                <ul className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                  {evaluation.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={nextChallenge}
              disabled={loadingNextChallenge || !evaluation.passed}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingNextChallenge ? 'Loading Challenge...' : 'Next Challenge'}
            </button>
            <button
              onClick={tryAgain}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Try Again
            </button>
            <button
              onClick={backToSelection}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Back to Selection
            </button>
          </div>
        </div>
      )}

      {/* Original Evaluation Results (hidden) */}
      {false && evaluation && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Evaluation Results</h3>
          <div className={`p-4 rounded-lg ${evaluation.passed ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg ${evaluation.passed ? 'text-green-600' : 'text-red-600'}`}>
                {evaluation.passed ? '✅ Challenge Passed!' : '❌ Challenge Failed'}
              </span>
              <span className="ml-4 text-sm text-gray-600">Score: {evaluation.score}/100</span>
            </div>
            <p className="text-gray-700 mb-3">{evaluation.feedback}</p>
            {evaluation.suggestions && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Suggestions for Improvement:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {evaluation.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;