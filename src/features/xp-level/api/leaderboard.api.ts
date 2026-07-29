export interface XPLeaderboardRank {
  rank: number;
  username: string;
  level: number;
  xp: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export const fetchXPLeaderboard = async (period: 'weekly' | 'alltime' = 'weekly'): Promise<XPLeaderboardRank[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { rank: 1, username: 'Govind', level: 50, xp: 85200 },
        { rank: 2, username: 'Roxana', level: 48, xp: 79800 },
        { rank: 3, username: 'Aman', level: 46, xp: 73500 },
        { rank: 4, username: 'Imran', level: 47, xp: 71200 },
        { rank: 5, username: 'Tasavvur', level: 45, xp: 68400, isCurrentUser: true },
        { rank: 6, username: 'Syed', level: 44, xp: 64900 },
        { rank: 7, username: 'Priya', level: 43, xp: 61200 },
      ]);
    }, 400);
  });
};
