import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import VerifyEmail from './VerifyEmail';

type AuthView = 'login' | 'signup' | 'verify' | 'forgot-password';

export default function AuthContainer() {
  const [view, setView] = useState<AuthView>('login');
  const [signupEmail, setSignupEmail] = useState('');

  const handleSignupSuccess = (email: string) => {
    setSignupEmail(email);
    setView('verify');
  };

  const handleVerified = () => {
    setView('login');
  };

  return (
    <>
      {view === 'login' && (
        <Login
          onSwitchToSignup={() => setView('signup')}
          onSwitchToForgotPassword={() => setView('forgot-password')}
        />
      )}
      {view === 'signup' && (
        <Signup
          onSwitchToLogin={() => setView('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
      {view === 'verify' && (
        <VerifyEmail
          email={signupEmail}
          onVerified={handleVerified}
          onBack={() => setView('signup')}
        />
      )}
    </>
  );
}
