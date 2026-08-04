const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const SOCKET_CONFIG = { url: `http://${host}:8000`, autoConnect: true };
