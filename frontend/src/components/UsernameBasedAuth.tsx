import React, { useState } from 'react';

import Icon from './Icon';

const API_URL = process.env.REACT_APP_API_URL || 'https://c98xyr0mzf.execute-api.us-east-1.amazonaws.com/dev';

type AuthView = 'login' | 'signup' | 'migrate-password';

const TestAuthNew: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [migrationData, setMigrationData] = useState<{ username: string, firstName: string, lastName: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const apiRequest = async (endpoint: string, body: any) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        setError(data.error || 'An error occurred');
        return null;
      }
    } catch (error: any) {
      setError(error.message || 'Request failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await apiRequest('/auth/login', {
      username: formData.username,
      password: formData.password
    });

    if (result?.requiresPasswordReset) {
      setMigrationData({
        username: result.username,
        firstName: result.firstName,
        lastName: result.lastName
      });
      setView('migrate-password');
      setSuccess('');
      setError('');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } else if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      setSuccess('✅ Login successful! Redirecting...');
      window.location.href = '/';
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const result = await apiRequest('/auth/signup', {
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName
    });
    if (result?.accessToken) {
      setSuccess('✅ Signup successful! Logging you in...');
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '/';
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: '#475569'
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#9333ea';
    e.target.style.boxShadow = '0 0 0 1px #9333ea, 0 0 20px rgba(147, 51, 234, 0.3)';
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#475569';
    e.target.style.boxShadow = 'none';
  };

  const handleMigratePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!migrationData) {
      setError('Migration data not found');
      return;
    }
    const result = await apiRequest('/auth/migrate-password', {
      username: migrationData.username,
      newPassword: formData.password,
      confirmPassword: formData.confirmPassword
    });
    if (result?.accessToken) {
      setSuccess('✅ Password set successfully! Logging you in...');
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" style={{
      background: 'linear-gradient(to bottom, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)'
    }}>
      <div className="absolute inset-0 w-px h-px" style={{
        background: 'transparent',
        boxShadow: '88vw 5vh 0px 1px white, 39vw 13vh 0px 1px white, 70vw 64vh 0px 1px white, 67vw 26vh 0px 1px white, 22vw 10vh 0px 1px white, 86vw 52vh 0px 1px white, 55vw 51vh 0px 1px white, 87vw 88vh 0px 1px white, 31vw 52vh 0px 1px white, 51vw 91vh 0px 1px white, 93vw 93vh 0px 1px white, 4vw 3vh 0px 1px white, 37vw 74vh 0px 1px white, 46vw 91vh 0px 1px white, 10vw 78vh 0px 1px white, 57vw 61vh 0px 1px white, 51vw 36vh 0px 1px white, 29vw 18vh 0px 1px white, 44vw 79vh 0px 1px white, 92vw 1vh 0px 1px white, 75vw 71vh 0px 1px white, 27vw 1vh 0px 1px white, 3vw 10vh 0px 1px white, 80vw 8vh 0px 1px white, 66vw 5vh 0px 1px white, 85vw 20vh 0px 1px white, 13vw 58vh 0px 1px white, 37vw 82vh 0px 1px white, 6vw 54vh 0px 1px white, 32vw 87vh 0px 1px white',
        animation: 'twinkle 100s linear infinite'
      }} />

      <div className="absolute inset-0 w-0.5 h-0.5" style={{
        background: 'transparent',
        boxShadow: '8vw 44vh 0px 2px white, 27vw 70vh 0px 2px white, 40vw 96vh 0px 2px white, 72vw 33vh 1px 2px white, 61vw 90vh 1px 2px white, 52vw 21vh 0px 2px white, 99vw 45vh 1px 2px white, 83vw 33vh 1px 2px white, 55vw 80vh 0px 2px white, 70vw 18vh 0px 2px white, 54vw 80vh 1px 2px white, 49vw 98vh 1px 2px white, 49vw 54vh 1px 2px white, 80vw 99vh 1px 2px white, 85vw 57vh 1px 2px white',
        animation: 'twinkle 150s linear infinite'
      }} />

      <div className="absolute inset-0 w-1 h-1" style={{
        background: 'transparent',
        boxShadow: '75vw 7vh 1px 3px white, 7vw 69vh 0px 3px white, 1vw 73vh 0px 3px white, 19vw 45vh 1px 3px white, 98vw 34vh 1px 3px white, 56vw 70vh 0px 3px white, 26vw 50vh 0px 3px white, 3vw 50vh 0px 3px white, 66vw 79vh 1px 3px white, 69vw 57vh 0px 3px white',
        animation: 'twinkle 200s ease-in-out infinite',
        zIndex: -1
      }} />

      <div className="max-w-md w-full rounded-2xl p-8 border-2 relative z-10" style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(147, 51, 234, 0.5)',
        boxShadow: '0 0 40px rgba(147, 51, 234, 0.3), 0 0 80px rgba(147, 51, 234, 0.1)'
      }}>
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Icon name="lightsaber-skywalker" size={60} />
          </div>
          <h1 className="text-3xl font-bold mt-4 star-wars-font" style={{
            color: '#fbbf24',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
          }}>
            Teach me Prompting
          </h1>
          <p className="mt-2 text-purple-400">
            {view === 'login' && 'Powered by MartinAI'}
            {view === 'signup' && 'Powered by MartinAI'}
            {view === 'verify' && 'Verify Your Email'}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {view === 'migrate-password' && migrationData && (
          <form onSubmit={handleMigratePassword} className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-purple-300 text-lg">Welcome back, {migrationData.firstName}!</p>
              <p className="text-gray-400 text-sm mt-2">Please set a new password for your account</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <p className="text-xs mt-1 text-gray-400">
                8+ characters, uppercase, lowercase, number, symbol
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
              }}
            >
              {loading ? 'Setting Password...' : 'Set New Password'}
            </button>
          </form>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="username or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(147, 51, 234, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(147, 51, 234, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-gray-400">
                New user?{' '}
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="font-medium text-purple-400 hover:text-purple-300"
                >
                  Sign Up
                </button>
              </div>
              <div className="text-xs pt-4 border-t border-gray-700 text-gray-500">
                🔒 Secure Authentication
              </div>
            </div>
          </form>
        )}

        {view === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="username or email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <p className="text-xs mt-1 text-gray-400">
                8+ characters, uppercase, lowercase, number, symbol
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border text-white focus:outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
              }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="font-medium text-purple-400 hover:text-purple-300"
                >
                  Sign In
                </button>
              </div>
              <div className="text-xs pt-4 border-t border-gray-700 text-gray-500">
                🔒 Secure Authentication
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestAuthNew;
