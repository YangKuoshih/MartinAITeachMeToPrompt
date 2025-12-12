const API_URL = process.env.REACT_APP_API_URL || 'https://c98xyr0mzf.execute-api.us-east-1.amazonaws.com/dev';

export interface SignupData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    groups: string[];
  };
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async signup(data: SignupData) {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    return response.json();
  }

  async verifyEmail(email: string, code: string) {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Verification failed');
    }
    return response.json();
  }

  async resendCode(email: string) {
    const response = await fetch(`${API_URL}/auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Resend failed');
    }
    return response.json();
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    const result = await response.json();
    this.accessToken = result.accessToken;
    this.refreshToken = result.refreshToken;
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    return result;
  }

  async refreshAccessToken() {
    const refreshToken = this.refreshToken || localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Token refresh failed' }));
        throw new Error(error.error || `Token refresh failed with status ${response.status}`);
      }
      
      const result = await response.json();
      this.accessToken = result.accessToken;
      localStorage.setItem('accessToken', result.accessToken);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Token refreshed successfully');
      }
      
      return result.accessToken;
    } catch (error) {
      // Clear invalid tokens
      this.logout();
      throw error;
    }
  }

  async forgotPassword(email: string) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Reset failed');
    }
    return response.json();
  }

  getAccessToken() {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) {
      console.log('No token found');
      return false;
    }
    
    // Basic token format validation
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid token format');
        return false;
      }
      
      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      // Check if token is actually expired (not just expiring soon)
      if (payload.exp && payload.exp < now) {
        console.log('Token expired at', new Date(payload.exp * 1000));
        return false;
      }
      
      console.log('Token valid, expires at', new Date(payload.exp * 1000));
      return true;
    } catch (e) {
      console.log('Token validation error:', e);
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;
