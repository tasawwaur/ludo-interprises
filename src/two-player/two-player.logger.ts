export const TwoPlayerLogger = {
  info: (msg: string, details?: any) => {
    console.log(`[TwoPlayerEngine:INFO] ${msg}`, details || '');
  },
  warn: (msg: string, details?: any) => {
    console.warn(`[TwoPlayerEngine:WARN] ${msg}`, details || '');
  },
  error: (msg: string, details?: any) => {
    console.error(`[TwoPlayerEngine:ERROR] ${msg}`, details || '');
  },
};
export default TwoPlayerLogger;
