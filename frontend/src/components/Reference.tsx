import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ReferenceItem {
  id: string;
  title: string;
  content: string;
  examples?: string[];
}

interface ReferenceCategory {
  id: string;
  title: string;
  icon: string;
  items: ReferenceItem[];
}

const referenceData: ReferenceCategory[] = [
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    icon: '🎯',
    items: [
      {
        id: 'what-is-prompt-engineering',
        title: 'What is Prompt Engineering?',
        content: 'Prompt engineering is the practice of designing and refining inputs (prompts) to get desired outputs from AI language models. It involves crafting clear instructions, providing context, and structuring queries to maximize the quality and relevance of AI responses.',
      },
      {
        id: 'tokens',
        title: 'Tokens & Token Limits',
        content: 'Tokens are pieces of text that the AI processes - roughly 4 characters or 0.75 words per token. Models have token limits (e.g., 4096, 8192 tokens) that include both your prompt and the response. Longer prompts leave less room for responses.',
      },
      {
        id: 'temperature',
        title: 'Temperature',
        content: 'Temperature controls randomness in responses. Lower values (0.0-0.3) make output more focused and deterministic. Higher values (0.7-1.0) make output more creative and varied. Use low temperature for factual tasks, high for creative tasks.',
      },
      {
        id: 'top-k-top-p',
        title: 'Top-K & Top-P Sampling',
        content: 'Top-K limits the model to choosing from the K most likely next tokens. Top-P (nucleus sampling) chooses from the smallest set of tokens whose cumulative probability exceeds P. These control output diversity and quality.',
      },
      {
        id: 'context-window',
        title: 'Context Window',
        content: 'The context window is the maximum amount of text (in tokens) the model can consider at once. This includes your prompt, conversation history, and the response. Managing context is crucial for long conversations.',
      },
    ],
  },
  {
    id: 'techniques',
    title: 'Prompt Techniques',
    icon: '🛠️',
    items: [
      {
        id: 'zero-shot',
        title: 'Zero-Shot Prompting',
        content: 'Asking the model to perform a task without providing examples. Works well for common tasks the model has seen during training.',
        examples: ['Translate this to French: Hello, how are you?', 'Summarize this article in 3 sentences.'],
      },
      {
        id: 'few-shot',
        title: 'Few-Shot Learning',
        content: 'Providing 2-5 examples of the desired input-output pattern before asking the model to perform the task. This teaches the model your specific format and style.',
        examples: [
          'Example 1: Input: "Great product!" → Sentiment: Positive',
          'Example 2: Input: "Terrible service" → Sentiment: Negative',
          'Now classify: "Amazing experience!"',
        ],
      },
      {
        id: 'chain-of-thought',
        title: 'Chain-of-Thought (CoT)',
        content: 'Encouraging the model to show its reasoning process step-by-step. Add phrases like "Let\'s think step by step" or "Show your work" to improve accuracy on complex problems.',
        examples: ['Solve this problem step by step:', 'Let\'s break this down:', 'Think through this carefully:'],
      },
      {
        id: 'role-prompting',
        title: 'Role Prompting',
        content: 'Assigning a specific role or persona to the AI to shape its responses. This sets expectations for tone, expertise level, and perspective.',
        examples: [
          'You are a financial analyst with 10 years of experience...',
          'Act as a Python expert who explains concepts simply...',
          'You are a helpful customer service representative...',
        ],
      },
      {
        id: 'prompt-chaining',
        title: 'Prompt Chaining',
        content: 'Breaking complex tasks into multiple sequential prompts, where each prompt builds on the previous response. This improves accuracy for multi-step workflows.',
      },
      {
        id: 'self-consistency',
        title: 'Self-Consistency',
        content: 'Generating multiple responses to the same prompt and selecting the most consistent or common answer. Useful for improving reliability on reasoning tasks.',
      },
    ],
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    icon: '✨',
    items: [
      {
        id: 'be-specific',
        title: 'Be Specific and Clear',
        content: 'Vague prompts lead to vague responses. Specify exactly what you want: format, length, tone, audience, and constraints. The more precise your instructions, the better the output.',
      },
      {
        id: 'provide-context',
        title: 'Provide Context',
        content: 'Give the model relevant background information. Explain the scenario, audience, purpose, and any constraints. Context helps the model understand what kind of response is appropriate.',
      },
      {
        id: 'use-delimiters',
        title: 'Use Delimiters',
        content: 'Separate different parts of your prompt with clear markers like triple quotes ("""), dashes (---), or hashtags (###). This helps the model distinguish instructions from content.',
        examples: ['"""', '---', '###', '```'],
      },
      {
        id: 'specify-format',
        title: 'Specify Output Format',
        content: 'Tell the model exactly how to structure the response: bullet points, numbered lists, JSON, tables, paragraphs, etc. Include examples of the desired format.',
      },
      {
        id: 'break-down-tasks',
        title: 'Break Down Complex Tasks',
        content: 'Divide complicated requests into smaller, manageable steps. Either use multiple prompts or explicitly list the steps you want the model to follow.',
      },
      {
        id: 'iterate-refine',
        title: 'Iterate and Refine',
        content: 'Prompt engineering is iterative. Test your prompts, analyze the results, and refine based on what works. Small changes can significantly improve output quality.',
      },
    ],
  },
  {
    id: 'patterns',
    title: 'Common Patterns',
    icon: '📋',
    items: [
      {
        id: 'analysis-template',
        title: 'Analysis Template',
        content: 'Structure: Context → Question → Requirements → Output Format',
        examples: [
          'Context: [Provide background]',
          'Analyze: [Specific question]',
          'Consider: [Key factors]',
          'Format: [Desired structure]',
        ],
      },
      {
        id: 'summarization-template',
        title: 'Summarization Template',
        content: 'Specify length, key points to include, and audience level.',
        examples: [
          'Summarize the following in 3 bullet points:',
          'Create an executive summary (200 words):',
          'Extract the main takeaways:',
        ],
      },
      {
        id: 'classification-template',
        title: 'Classification Template',
        content: 'Define categories, provide examples, and specify output format.',
        examples: [
          'Classify into: [Category A, Category B, Category C]',
          'Based on these examples: [examples]',
          'Output format: Category name only',
        ],
      },
      {
        id: 'creative-template',
        title: 'Creative Writing Template',
        content: 'Set tone, style, constraints, and target audience.',
        examples: [
          'Write in a [tone] style',
          'Target audience: [audience]',
          'Length: [word count]',
          'Include: [specific elements]',
        ],
      },
    ],
  },

  {
    id: 'fed-specific',
    title: 'Federal Reserve Context',
    icon: '🏛️',
    items: [
      {
        id: 'monetary-policy',
        title: 'Monetary Policy',
        content: 'Actions by the Federal Reserve to influence money supply and interest rates. Key tools include the federal funds rate, open market operations, and reserve requirements. Prompts should consider economic indicators and policy objectives.',
      },
      {
        id: 'financial-stability',
        title: 'Financial Stability',
        content: 'The Fed\'s role in maintaining a stable financial system through supervision, regulation, and crisis management. Prompts may involve risk assessment, stress testing, and regulatory compliance.',
      },
      {
        id: 'payment-systems',
        title: 'Payment Systems',
        content: 'Infrastructure for transferring money between banks and financial institutions. Includes FedWire, ACH, and emerging technologies. Prompts should address security, efficiency, and innovation.',
      },
      {
        id: 'economic-research',
        title: 'Economic Research',
        content: 'Analysis of economic data, trends, and forecasting. Involves statistical methods, econometric models, and policy analysis. Prompts should be data-driven and analytically rigorous.',
      },
    ],
  },
];

const Reference: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['core-concepts']);
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

  const filteredData = referenceData
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
          Reference
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
          Your guide to prompt engineering concepts, techniques, and best practices
        </p>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for topics, techniques, or terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Reference Categories */}
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
              className={`w-full p-6 flex items-center justify-between hover:bg-opacity-80 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {category.title}
                </h2>
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
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
                    className={`${
                      index !== category.items.length - 1
                        ? `border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`
                        : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-full p-4 px-6 flex items-center justify-between text-left hover:bg-opacity-80 transition-colors ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <h3
                        className={`font-medium ${
                          isDarkMode ? 'text-purple-400' : 'text-purple-600'
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
                        <p className="mb-3">{item.content}</p>
                        {item.examples && item.examples.length > 0 && (
                          <div
                            className={`mt-3 p-3 rounded-lg ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                            }`}
                          >
                            <p
                              className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              } mb-2`}
                            >
                              Examples:
                            </p>
                            <ul className="space-y-1">
                              {item.examples.map((example, idx) => (
                                <li
                                  key={idx}
                                  className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  } flex items-start`}
                                >
                                  <span className="text-purple-500 mr-2">•</span>
                                  <code
                                    className={`${
                                      isDarkMode ? 'text-purple-300' : 'text-purple-700'
                                    }`}
                                  >
                                    {example}
                                  </code>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Quick Tips */}
      <div
        className={`${
          isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
        } border rounded-xl p-6`}
      >
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
          Quick Tips
        </h3>
        <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          <li>• Start with clear, specific instructions</li>
          <li>• Provide examples when possible (few-shot learning)</li>
          <li>• Use lower temperature for factual tasks, higher for creative tasks</li>
          <li>• Break complex tasks into smaller steps</li>
          <li>• Iterate and refine based on results</li>
        </ul>
      </div>
    </div>
  );
};

export default Reference;
