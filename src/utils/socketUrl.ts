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
  // 1. Env variable override (highest priority — set in Vercel/Render dashboard)
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // 2. Local development — localhost or any LAN IP (WiFi mobile testing)
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const isLanIP = /^(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\./.test(host);
    if (import.meta.env.DEV || isLocalhost || isLanIP) {
      return `http://${host}:8000`;
    }

    // 3. ANY deployed environment (Vercel, Render, custom domain) → single Render backend
    return RENDER_BACKEND_URL;
  }

  return 'http://localhost:8000';
};
