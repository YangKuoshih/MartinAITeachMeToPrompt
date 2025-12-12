import React, { useState } from 'react';
import { API } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { FileUpload, UploadedFile } from './FileUpload';

interface ExamplePrompt {
  text: string;
  category: 'Basic' | 'Advanced' | 'Creative';
}

const examplePrompts: ExamplePrompt[] = [
  {
    text: 'Write a short poem about artificial intelligence',
    category: 'Basic'
  },
  {
    text: 'Explain quantum computing to a 10-year-old',
    category: 'Basic'
  },
  {
    text: 'Create a recipe for chocolate chip cookies',
    category: 'Basic'
  },
  {
    text: 'Generate a detailed system architecture for a real-time chat application',
    category: 'Advanced'
  },
  {
    text: 'Write a function that implements binary search in Python with detailed comments',
    category: 'Advanced'
  },
  {
    text: 'Create a storytelling prompt that combines cyberpunk and fairy tale elements',
    category: 'Creative'
  },
  {
    text: 'Design a unique alien species and their culture',
    category: 'Creative'
  }
];

const proTips = [
  'Be specific and clear',
  'Provide context when needed',
  'Use role-playing techniques',
  'Break complex tasks into steps'
];

const Playground: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'Basic' | 'Advanced' | 'Creative'>('Basic');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isListening, setIsListening] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    temperature: 0.7,
    top_k: 40,
    max_tokens: 1000
  });

  // Web Speech API
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setPrompt(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      // Get S3 keys from uploaded files
      const s3Keys = files
        .filter(f => f.status === 'uploaded' && f.s3Key)
        .map(f => f.s3Key!);

      const result = await API.post('/prompt', {
        prompt,
        s3Keys: s3Keys.length > 0 ? s3Keys : undefined,
        temperature: settings.temperature,
        top_k: settings.top_k,
        max_tokens: settings.max_tokens
      });
      setResponse(result.response || result.result || 'Response generated successfully!');
    } catch (error: any) {
      setResponse(
        'Service temporarily unavailable. The AI playground will be fully functional once the backend services are deployed.\n\n' +
        'Your prompt: "' + prompt + '"\n\n' +
        'This will connect to Amazon Bedrock for real AI responses in production.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6`}>
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Prompt Playground
        </h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Experiment with prompts and see instant AI responses powered by Amazon Bedrock
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Prompt Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Your Prompt
                </h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${showSettings
                    ? 'bg-purple-100 text-purple-700'
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Settings
                </button>
              </div>

              {showSettings && (
                <div className={`mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    LLM Parameters
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Temperature: {settings.temperature.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.temperature}
                        onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Higher = more creative, Lower = more focused
                      </p>
                    </div>
                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Top-K: {settings.top_k}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={settings.top_k}
                        onChange={(e) => setSettings({ ...settings, top_k: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Limits vocabulary selection
                      </p>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Max Response Length: {settings.max_tokens}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="4096"
                        step="100"
                        value={settings.max_tokens}
                        onChange={(e) => setSettings({ ...settings, max_tokens: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                        Maximum tokens in response
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={`w-full h-40 p-4 pr-14 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none ${isDarkMode
                        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                        : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    placeholder="Write your prompt here... Be creative and specific!"
                  />

                  {/* Microphone Button */}
                  <button
                    onClick={toggleListening}
                    className={`absolute right-3 top-3 p-2 rounded-lg transition-all ${isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : isDarkMode
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Listening Indicator */}
                  {isListening && (
                    <div className={`absolute left-3 top-3 flex items-center space-x-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                      <div className="flex space-x-1">
                        <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-4 bg-current animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs font-medium">Listening...</span>
                    </div>
                  )}
                </div>

                {/* File Upload Component */}
                <FileUpload
                  files={files}
                  onFilesChange={setFiles}
                />

                <button
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Generating Response...' : 'Generate Response'}</span>
                  {loading && (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {response && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
              <div className="p-6">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  AI Response
                </h3>
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-xl`}>
                  <pre className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {response}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Example Prompts */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <div className="p-6">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Example Prompts
              </h3>

              <div className="flex space-x-2 mb-4">
                {(['Basic', 'Advanced', 'Creative'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedCategory === category
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {examplePrompts
                  .filter((p) => p.category === selectedCategory)
                  .map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(prompt.text)}
                      className={`w-full text-left p-3 rounded-lg transition-colors text-sm ${isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                        }`}
                    >
                      {prompt.text}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}>
            <div className="p-6">
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Pro Tips
              </h3>
              <ul className="space-y-3">
                {proTips.map((tip, index) => (
                  <li
                    key={index}
                    className={`flex items-start space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <span className="text-purple-600">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;