/**
 * ✅ SINGLE SOURCE OF TRUTH — Render backend server URL
 * Both Vercel (frontend) and Render (frontend+backend) must point here.
 * Change this once and it updates everywhere.
 */
const RENDER_BACKEND_URL = 'https://ludo-interprises.onrender.com';

/**
 * Returns the correct Socket.IO backend URL based on environment.
 * - Local dev (localhost / LAN IP): connects to local port 8000
 * - Everywhere else (Vercel, Render, any domain): → same Render backend
 *
 * This guarantees that a PC on Render URL and a Mobile on Vercel URL
 * BOTH connect to the same socket server and can match each other.
 */
export const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // Local development — use explicit 127.0.0.1 for localhost to avoid Windows IPv6 ::1 refusal
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }

    // LAN IP development (Mobile testing over Wi-Fi)
    const isLanIP = /^(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\./.test(host);
    if (isLanIP) {
      return `http://${host}:8000`;
    }

    if (import.meta.env.DEV) {
      return 'http://127.0.0.1:8000';
    }

    return RENDER_BACKEND_URL;
  }

  return 'http://127.0.0.1:8000';
};
