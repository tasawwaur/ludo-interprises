export interface RollResult {
  value: number; // 1 to 6
  seedUsed: string;
  checksum: string; // server verification checksum
  consecutiveSixes: number;
}
