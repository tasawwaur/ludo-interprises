import { IntegrityCheck } from './IntegrityCheck';
import { AntiCheat } from './AntiCheat';
import { MoveValidation, MoveRequestPayload } from './MoveValidation';

export interface SecurityEventLog {
  timestamp: string;
  eventType: string;
  payload: string;
  isViolation: boolean;
}

export class ValidationEngine {
  private static auditLogs: SecurityEventLog[] = [];
  private static systemBanned = false;

  /**
   * Run absolute security check sequence.
   * Evaluates environment integrity, speed indicators, memory edits, and returns report.
   */
  public static performFullSecurityCheck(playerId: string): { isSafe: boolean; bansRequired: boolean; alerts: string[] } {
    // Local development bypass (allows debugging, devtools, and emulators during local testing)
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return { isSafe: true, bansRequired: false, alerts: [] };
    }

    if (this.systemBanned) {
      return { isSafe: false, bansRequired: true, alerts: ["ACCOUNT_PERMANENTLY_SUSPENDED"] };
    }

    const alerts: string[] = [];
    
    // 1. Device and Environment Audit
    const envReport = IntegrityCheck.auditEnvironment();
    if (!envReport.isSafe) {
      alerts.push(...envReport.violatingSignals);
    }

    // 2. Clock speed audits
    const speedHack = AntiCheat.detectSpeedHack();
    if (speedHack) {
      alerts.push("CLOCK_SPEED_HACK_DETECTED");
    }

    // 3. Binary file integrity checks
    const integrityValid = IntegrityCheck.verifyBinaryIntegrity();
    if (!integrityValid) {
      alerts.push("APK_BINARY_TAMPER_DETECTED");
    }

    const isViolation = alerts.length > 0;
    if (isViolation) {
      this.logSecurityEvent("SECURITY_VIOLATION_DETECTION", JSON.stringify(alerts), true);
    }

    // Auto-enforcement trigger: Banish immediately if injection or binary tampering is detected
    const bansRequired = alerts.some(alert => 
      alert.includes("EMULATOR") || 
      alert.includes("HOOK") || 
      alert.includes("TAMPER")
    );

    if (bansRequired) {
      this.systemBanned = true;
      console.error("Anti-Cheat Enforced: Account has been temporarily restricted due to client integrity failure.");
    }

    return {
      isSafe: !isViolation,
      bansRequired,
      alerts
    };
  }

  /**
   * Validate gameplay movements.
   */
  public static validateMovement(payload: MoveRequestPayload): boolean {
    if (this.systemBanned) return false;

    // Validate path deltas
    const moveValid = MoveValidation.validateProposedMove(payload);
    if (!moveValid) {
      this.logSecurityEvent("MOVE_INTEGRITY_FAILED", JSON.stringify(payload), true);
      return false;
    }

    // Double check clock tick frequency delta
    const speedHack = AntiCheat.detectSpeedHack();
    if (speedHack) {
      this.logSecurityEvent("SPEED_HACK_DURING_MOVE", payload.playerId, true);
      return false;
    }

    return true;
  }

  /**
   * Heuristics audit of suspicious player statistics to block speed farmers, macros and bots.
   */
  public static auditPlayerStatsHeuristics(stats: {
    matchesWon: number;
    matchesPlayed: number;
    level: number;
    currentWinStreak: number;
    killCount: number;
  }): boolean {
    const { matchesWon, matchesPlayed, level, currentWinStreak, killCount } = stats;

    if (matchesPlayed === 0) return true;

    const winRate = (matchesWon / matchesPlayed) * 100;

    // Trigger 1: Impossible win rate (>90% win rate across more than 30 matches indicates cheat botting)
    if (matchesPlayed > 30 && winRate > 90) {
      this.logSecurityEvent("IMPOSSIBLE_WIN_RATE_ALERT", `WinRate: ${winRate}% in ${matchesPlayed} games`, true);
      return false;
    }

    // Trigger 2: Impossible kill density (Average kills per match > 15 is mathematically impossible in Ludo boards)
    const killDensity = killCount / matchesPlayed;
    if (matchesPlayed > 15 && killDensity > 15) {
      this.logSecurityEvent("IMPOSSIBLE_KILL_RATE_ALERT", `Kill Density: ${killDensity} per match`, true);
      return false;
    }

    // Trigger 3: Level mismatch stats (Level 5 player with 50,000 matches)
    if (level < 10 && matchesPlayed > 5000) {
      this.logSecurityEvent("LEVEL_MATCH_MISMATCH_ALERT", `Level ${level} has ${matchesPlayed} matches`, true);
      return false;
    }

    // Trigger 4: Win streak anomalies
    if (currentWinStreak > 45) {
      this.logSecurityEvent("IMPOSSIBLE_WIN_STREAK", `Streak: ${currentWinStreak}`, true);
      return false;
    }

    return true;
  }

  public static getAuditLogs(): SecurityEventLog[] {
    return this.auditLogs;
  }

  public static isBanned(): boolean {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return false;
    }
    return this.systemBanned;
  }

  public static liftBan(): void {
    this.systemBanned = false;
  }

  private static logSecurityEvent(eventType: string, payload: string, isViolation: boolean): void {
    const log: SecurityEventLog = {
      timestamp: new Date().toISOString(),
      eventType,
      payload,
      isViolation
    };
    this.auditLogs.push(log);
    
    // Maintain maximum 100 history logs in memory
    if (this.auditLogs.length > 100) {
      this.auditLogs.shift();
    }
  }
}
export default ValidationEngine;
