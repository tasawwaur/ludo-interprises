const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const ENV = { VITE_API_URL: `http://${host}:8000`, API_URL: `http://${host}:8000`, WS_URL: `ws://${host}:8000` };
