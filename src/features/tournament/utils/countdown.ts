export const getRemainingTimeLabel = (endTimeStr: string): string => {
  const diffMs = new Date(endTimeStr).getTime() - Date.now();
  if (diffMs <= 0) return 'Ended';

  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h Left`;
  }

  return `${hours}h ${minutes}m Left`;
};
