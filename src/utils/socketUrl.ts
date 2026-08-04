/**
 * Helper to get the correct Socket.IO backend server URL.
 * Supports local dev, Vercel frontend pointing to Render backend, or environment variable overrides.
 */
export const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    
    // In local development
    if (import.meta.env.DEV || host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:8000`;
    }
    
    // If frontend is hosted on Vercel, point to the live Render backend server
    if (host.includes('vercel.app')) {
      return 'https://ludo-enterprise.onrender.com';
    }
    
    return window.location.origin;
  }
  
  return 'http://localhost:8000';
};
