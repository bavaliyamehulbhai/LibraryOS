const apiUrl = import.meta.env.VITE_API_URL || '/api';

export const getApiUrl = () => apiUrl;

export const getApiOrigin = () => {
  if (typeof apiUrl === 'string' && apiUrl.startsWith('http')) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      // Fall through to browser origin.
    }
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const getSocketUrl = () => import.meta.env.VITE_SOCKET_URL || getApiOrigin();
