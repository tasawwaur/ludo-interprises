export interface BugReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  deviceInfo: string;
  timestamp: string;
  status: 'open' | 'investigating' | 'resolved';
}

const STORAGE_BUG_REPORTS = 'ludo_bug_reports_logs_v1';

export const reportBug = async (
  title: string,
  description: string,
  severity: BugReport['severity']
): Promise<BugReport> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReport: BugReport = {
        id: `bug_${Math.random().toString(36).substring(2, 9)}`,
        title,
        description,
        severity,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        timestamp: new Date().toISOString(),
        status: 'open',
      };

      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem(STORAGE_BUG_REPORTS);
        const list: BugReport[] = existing ? JSON.parse(existing) : [];
        list.push(newReport);
        localStorage.setItem(STORAGE_BUG_REPORTS, JSON.stringify(list));
      }

      resolve(newReport);
    }, 300);
  });
};

export const getBugReports = (): BugReport[] => {
  if (typeof window !== 'undefined') {
    const logs = localStorage.getItem(STORAGE_BUG_REPORTS);
    return logs ? JSON.parse(logs) : [];
  }
  return [];
};
