export interface AppNotification { id: string; title: string; body: string; type: "INFO" | "SUCCESS" | "WARNING" | "DANGER"; read: boolean; }
