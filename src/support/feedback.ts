export interface FeedbackPayload {
  rating: number;
  comments: string;
  category: 'gameplay' | 'ui' | 'ads' | 'bug' | 'other';
  timestamp: string;
}

const STORAGE_FEEDBACK_LOGS = 'ludo_support_feedback_v1';

export const submitFeedback = async (payload: Omit<FeedbackPayload, 'timestamp'>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (payload.rating < 1 || payload.rating > 5) {
        resolve(false);
        return;
      }

      if (typeof window !== 'undefined') {
        const existingLogs = localStorage.getItem(STORAGE_FEEDBACK_LOGS);
        const list: FeedbackPayload[] = existingLogs ? JSON.parse(existingLogs) : [];
        list.push({ ...payload, timestamp: new Date().toISOString() });
        localStorage.setItem(STORAGE_FEEDBACK_LOGS, JSON.stringify(list));
      }

      resolve(true);
    }, 200);
  });
};

export const getSubmittedFeedbackLogs = (): FeedbackPayload[] => {
  if (typeof window !== 'undefined') {
    const logs = localStorage.getItem(STORAGE_FEEDBACK_LOGS);
    return logs ? JSON.parse(logs) : [];
  }
  return [];
};
