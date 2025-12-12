import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface HelpItem {
  id: string;
  title: string;
  content: string;
}

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  items: HelpItem[];
}

const helpData: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '📚',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        content: 'The Dashboard allows you to quickly review your progress at various goals and continue any training you may have started previously.',
      },
      {
        id: 'prompt-challenges',
        title: 'Prompt Challenges',
        content: 'Prompt Challenges are the primary training component and give you the scenario on which to try writing an effective prompt. We recommend beginners start with the Basic Prompt Training before proceeding to specific topics. Higher difficulty challenges can be unlocked.',
      },
      {
        id: 'prompt-quest',
        title: 'Prompt Quest',
        content: 'Try a fun role-playing quest to test your prompting skills! Proceed through a story based on your responses and prompt your way through progressively harder circumstances.',
      },
      {
        id: 'playground',
        title: 'Playground',
        content: 'A simple space to test any prompt, including some example prompts. More advanced settings options allow the user to vary the underlying model parameters and test AI concepts.',
      },
      {
        id: 'reference',
        title: 'Reference',
        content: 'We recommend new users start here. You can review common terminology and read about various prompting techniques to help you get started on the challenges or improve your scores!',
      },
      {
        id: 'badges-rewards',
        title: 'Badges & Rewards',
        content: 'Earn fun icons as you strengthen your AI skills and check your progress on various achievements.',
      },
      {
        id: 'leaderboard',
        title: 'Leaderboard',
        content: 'Compete with other users for the top spot!',
      },
      {
        id: 'profile',
        title: 'Profile',
        content: 'View your training progress, skills, and mission history.',
      },
    ],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    icon: '❓',
    items: [
      {
        id: 'purpose',
        title: 'What is the purpose of this application?',
        content: 'This application provides an opportunity to learn how to write effective and efficient prompts in a fun and engaging way. The "gamification" of prompt engineering leads to: Increased engagement and confidence using AI technologies, a shorter learning curve, and better results from AI models.',
      },
      {
        id: 'who-for',
        title: 'Who is this application for?',
        content: 'Anyone! AI tools can be used by anyone in any role for a vast number of use cases, so our training tool takes a similar approach. Learn to write effective prompts and apply your learning to a variety of use cases. Gamification concepts like badges and streaks motivate users to keep exploring.',
      },
      {
        id: 'how-built',
        title: 'How was this application built?',
        content: 'Teach me Prompting is a gamified prompt engineering learning platform built with a modern LAPP stack. The platform features a React/TypeScript frontend, PHP 7.4 backend API, PostgreSQL 15 database, and AI feedback through LiteLLM (supporting OpenAI, Anthropic, and other providers). The architecture includes JWT-based authentication, secure password hashing, and comprehensive input validation. Deployment is automated through Terraform Infrastructure as Code, making it easy to deploy on any cloud provider or VPS. Powered by MartinAI.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    items: [
      {
        id: 'inconsistent-output',
        title: 'Why is my output inconsistent?',
        content: 'High temperature settings cause variability. Lower the temperature (0.0-0.3) for more consistent results. Also ensure your prompt is specific and unambiguous.',
      },
      {
        id: 'reduce-hallucinations',
        title: 'How to reduce hallucinations?',
        content: 'Hallucinations (made-up information) can be reduced by: (1) Being very specific in your prompt, (2) Asking the model to cite sources or admit uncertainty, (3) Using lower temperature, (4) Providing relevant context.',
      },
      {
        id: 'long-documents',
        title: 'How to handle long documents?',
        content: 'For documents exceeding the context window: (1) Summarize sections first, (2) Use prompt chaining to process chunks, (3) Extract key information before analysis, (4) Use retrieval-augmented generation (RAG) techniques.',
      },
      {
        id: 'improve-quality',
        title: 'How to improve response quality?',
        content: 'Key strategies: (1) Add more context and examples, (2) Use chain-of-thought prompting, (3) Specify output format clearly, (4) Iterate and refine your prompt, (5) Break complex tasks into steps.',
      },
      {
        id: 'temperature-guide',
        title: 'When to use higher/lower temperature?',
        content: 'Low (0.0-0.3): Factual tasks, data extraction, classification, code generation. Medium (0.4-0.7): General conversation, explanations, balanced creativity. High (0.8-1.0): Creative writing, brainstorming, diverse ideas.',
      },
    ],
  },
];

const HelpFAQ: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['getting-started']);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const filteredData = helpData
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Help & FAQ
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Learn how to use the platform and find answers to common questions
        </p>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for help topics, questions, or troubleshooting..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              : 'border-gray-300 bg-white text-gray-900'
              }`}
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Help Categories */}
      {filteredData.length === 0 ? (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-12 text-center`}>
          <div className="text-4xl mb-4">🔍</div>
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            No results found
          </h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Try searching for different terms
          </p>
        </div>
      ) : (
        filteredData.map((category) => (
          <div key={category.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className={`w-full p-6 flex items-center justify-between hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category.title}
                </h2>
                <span
                  className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    } bg-opacity-20 px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                >
                  {category.items.length} items
                </span>
              </div>
              <span className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {expandedCategories.includes(category.id) ? '−' : '+'}
              </span>
            </button>

            {/* Category Items */}
            {expandedCategories.includes(category.id) && (
              <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {category.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`${index !== category.items.length - 1
                      ? `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`
                      : ''
                      }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-full p-4 px-6 flex items-center justify-between text-left hover:bg-opacity-80 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                    >
                      <h3
                        className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          } hover:underline`}
                      >
                        {item.title}
                      </h3>
                      <span className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {expandedItems.includes(item.id) ? '−' : '+'}
                      </span>
                    </button>

                    {expandedItems.includes(item.id) && (
                      <div className={`px-6 pb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <p>{item.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default HelpFAQ;
