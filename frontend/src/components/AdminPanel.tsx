import React, { useState, useEffect } from 'react';
import { API } from '../utils/api';

interface AdminChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  points: number;
  tags: string[];
}

const AdminPanel: React.FC = () => {
  const [challenges, setChallenges] = useState<AdminChallenge[]>([
    {
      id: '1',
      title: 'Your First Prompt',
      description: 'Learn the basics of prompt writing by creating your first simple prompt',
      difficulty: 'beginner',
      category: 'basics',
      points: 100,
      tags: ['basics']
    }
  ]);

  const [selectedChallenge, setSelectedChallenge] = useState<AdminChallenge | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [llmConfig, setLlmConfig] = useState({
    playground: { temperature: 0.7, top_k: 40, top_p: 0.9, max_tokens: 1000 },
    generation: { temperature: 0.8, top_k: 50, top_p: 0.95, max_tokens: 2000 },
    evaluation: { temperature: 0.3, top_k: 20, top_p: 0.8, max_tokens: 500 }
  });
  const [activeTab, setActiveTab] = useState<'challenges' | 'llm'>('challenges');

  useEffect(() => {
    loadChallenges();
    loadLLMConfig();
  }, []);

  const loadChallenges = async () => {
    try {
      const response = await API.get('/admin/challenges');
      setChallenges(response);
    } catch (error) {
      // Error loading challenges
    }
  };

  const loadLLMConfig = async () => {
    try {
      const response = await API.get('/admin/llm-config');
      setLlmConfig(response);
    } catch (error) {
      // Error loading LLM config
    }
  };

  const saveLLMConfig = async () => {
    try {
      await API.put('/admin/llm-config', llmConfig);
      alert('LLM configuration saved successfully!');
    } catch (error) {
      alert('Failed to save LLM configuration');
    }
  };

  const handleSaveChallenge = async () => {
    if (!selectedChallenge) return;

    try {
      if (isEditing) {
        await API.put(`/admin/challenges/${selectedChallenge.id}`, selectedChallenge);
      } else {
        await API.post('/admin/challenges', selectedChallenge);
      }
      loadChallenges();
      setSelectedChallenge(null);
      setIsEditing(false);
    } catch (error) {
      // Error saving challenge
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      await API.delete(`/admin/challenges/${id}`);
      loadChallenges();
    } catch (error) {
      // Error deleting challenge
    }
  };

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
  const categories = ['basics', 'creativity', 'precision', 'system-design', 'role-playing', 'data-extraction', 'reasoning'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Panel ⚙️
              </h1>
              <p className="text-gray-600 mt-1">
                Manage challenges and AI configuration
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'challenges'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Challenges
              </button>
              <button
                onClick={() => setActiveTab('llm')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'llm'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                AI Config
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LLM Configuration */}
      {activeTab === 'llm' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              🤖 AI Model Configuration
            </h2>
            <div className="space-y-6">
              {/* Playground Settings */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Playground (Default for Users)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                    <input type="number" step="0.1" min="0" max="1" value={llmConfig.playground.temperature}
                      onChange={(e) => setLlmConfig({...llmConfig, playground: {...llmConfig.playground, temperature: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top-K</label>
                    <input type="number" min="1" max="100" value={llmConfig.playground.top_k}
                      onChange={(e) => setLlmConfig({...llmConfig, playground: {...llmConfig.playground, top_k: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top-P</label>
                    <input type="number" step="0.01" min="0" max="1" value={llmConfig.playground.top_p}
                      onChange={(e) => setLlmConfig({...llmConfig, playground: {...llmConfig.playground, top_p: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                    <input type="number" min="100" max="4096" value={llmConfig.playground.max_tokens}
                      onChange={(e) => setLlmConfig({...llmConfig, playground: {...llmConfig.playground, max_tokens: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Challenge Generation Settings */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Challenge Generation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                    <input type="number" step="0.1" min="0" max="1" value={llmConfig.generation.temperature}
                      onChange={(e) => setLlmConfig({...llmConfig, generation: {...llmConfig.generation, temperature: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top-K</label>
                    <input type="number" min="1" max="100" value={llmConfig.generation.top_k}
                      onChange={(e) => setLlmConfig({...llmConfig, generation: {...llmConfig.generation, top_k: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top-P</label>
                    <input type="number" step="0.01" min="0" max="1" value={llmConfig.generation.top_p}
                      onChange={(e) => setLlmConfig({...llmConfig, generation: {...llmConfig.generation, top_p: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                    <input type="number" min="100" max="4096" value={llmConfig.generation.max_tokens}
                      onChange={(e) => setLlmConfig({...llmConfig, generation: {...llmConfig.generation, max_tokens: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Evaluation Settings */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-4">Challenge Evaluation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                    <input type="number" step="0.1" min="0" max="1" value={llmConfig.evaluation.temperature}
                      onChange={(e) => setLlmConfig({...llmConfig, evaluation: {...llmConfig.evaluation, temperature: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top-K</label>
                    <input type="number" min="1" max="100" value={llmConfig.evaluation.top_k}
                      onChange={(e) => setLlmConfig({...llmConfig, evaluation: {...llmConfig.evaluation, top_k: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Top-P</label>
                    <input type="number" step="0.01" min="0" max="1" value={llmConfig.evaluation.top_p}
                      onChange={(e) => setLlmConfig({...llmConfig, evaluation: {...llmConfig.evaluation, top_p: parseFloat(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                    <input type="number" min="100" max="4096" value={llmConfig.evaluation.max_tokens}
                      onChange={(e) => setLlmConfig({...llmConfig, evaluation: {...llmConfig.evaluation, max_tokens: parseInt(e.target.value)}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <button
                onClick={saveLLMConfig}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save AI Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge List */}
      {activeTab === 'challenges' && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                📚 All Challenges
              </h2>
              <button
                onClick={() => {
                  setSelectedChallenge({
                    id: '',
                    title: '',
                    description: '',
                    difficulty: 'beginner',
                    category: 'basics',
                    points: 100,
                    tags: []
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + New Challenge
              </button>
            </div>
            <div className="space-y-4">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <h3 className="font-medium text-gray-900">
                    {challenge.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${challenge.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        challenge.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        challenge.difficulty === 'advanced' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'}`}
                    >
                      {challenge.difficulty}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {challenge.category}
                    </span>
                    <span className="text-yellow-600 text-sm">
                      ⭐ {challenge.points} pts
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedChallenge(challenge);
                      setIsEditing(true);
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteChallenge(challenge.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Edit Challenge' : 'New Challenge'}
                </h2>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={selectedChallenge.title}
                    onChange={(e) =>
                      setSelectedChallenge({
                        ...selectedChallenge,
                        title: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={selectedChallenge.description}
                    onChange={(e) =>
                      setSelectedChallenge({
                        ...selectedChallenge,
                        description: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-32"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={selectedChallenge.difficulty}
                      onChange={(e) =>
                        setSelectedChallenge({
                          ...selectedChallenge,
                          difficulty: e.target.value as AdminChallenge['difficulty']
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {difficulties.map((diff) => (
                        <option key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={selectedChallenge.category}
                      onChange={(e) =>
                        setSelectedChallenge({
                          ...selectedChallenge,
                          category: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={selectedChallenge.points}
                    onChange={(e) =>
                      setSelectedChallenge({
                        ...selectedChallenge,
                        points: parseInt(e.target.value)
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={selectedChallenge.tags.join(', ')}
                    onChange={(e) =>
                      setSelectedChallenge({
                        ...selectedChallenge,
                        tags: e.target.value.split(',').map((tag) => tag.trim())
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChallenge}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {isEditing ? 'Update Challenge' : 'Create Challenge'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;