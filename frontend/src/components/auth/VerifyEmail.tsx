import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AuthService from '../../services/AuthService';
import Icon from '../Icon';

interface VerifyEmailProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export default function VerifyEmail({ email, onVerified, onBack }: VerifyEmailProps) {
  const { isDarkMode } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await AuthService.verifyEmail(email, code);
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await AuthService.resendCode(email);
      alert('Verification code sent!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4`}>
      <div className={`max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-8 border ${isDarkMode ? 'border-purple-800' : 'border-purple-200'}`}>
        <div className="text-center mb-8">
          <Icon name="lightsaber-skywalker" size={60} />
          <h1 className={`text-3xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Verify Your Email
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            We sent a 6-digit code to
          </p>
          <p className={`font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {email}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className={`w-full px-4 py-3 text-center text-2xl tracking-widest rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={handleResend}
            disabled={resending}
            className={`text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} disabled:opacity-50`}
          >
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
          <div>
            <button
              onClick={onBack}
              className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
