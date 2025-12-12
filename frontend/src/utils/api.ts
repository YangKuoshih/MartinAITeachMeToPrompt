import AuthService from '../services/AuthService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('API_URL configured:', API_URL);
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = AuthService.getAccessToken();
  console.log('API Request:', endpoint, 'Token present:', !!token, 'Token length:', token?.length);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  // Add timeout for long-running requests like challenge generation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Handle 401 - try to refresh token
    if (response.status === 401) {
      try {
        await AuthService.refreshAccessToken();
        // Retry request with new token
        const newToken = AuthService.getAccessToken();
        if (!newToken) {
          throw new Error('No token after refresh');
        }
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`
          }
        });
        if (!retryResponse.ok) {
          const retryError = await retryResponse.json().catch(() => ({ error: 'Request failed after token refresh' }));
          throw new Error(retryError.error || 'Request failed after token refresh');
        }
        return retryResponse.json();
      } catch (refreshError) {
        // Don't auto-logout, just throw error
        throw new Error('Authentication failed: ' + (refreshError instanceof Error ? refreshError.message : 'Unknown error'));
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server is taking longer than usual to respond. Please try again.');
      }
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

export const API = {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, body: any) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' })
};
