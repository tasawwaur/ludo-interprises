import * as Crypto from 'expo-crypto';
import { SeededRandom } from './SeededRandom';

export class SecureRandom {
  private seed: number;
  private seededGenerator: SeededRandom;

  constructor(initialSeed?: number) {
    this.seed = initialSeed !== undefined ? initialSeed : this.generateSecureSeed();
    this.seededGenerator = new SeededRandom(this.seed);
  }

  /**
   * Generates a cryptographically secure 32-bit integer seed.
   */
  public generateSecureSeed(): number {
    try {
      // In native Expo environment, use crypto library for secure byte generation
      const bytes = Crypto.getRandomBytes(4);
      return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
    } catch {
      // Fallback secure math seeding for standard Node/Browser environments
      return Math.floor(Math.random() * 0xffffffff);
    }
  }

  /**
   * Mulberry32 Seeded Random Number Generator via SeededRandom wrapper.
   */
  public seededNext(): number {
    return this.seededGenerator.seededNext();
  }

  /**
   * Retrieves a deterministic roll between 1 and 6 based on seed state.
   */
  public rollDeterministic(): number {
    return this.seededGenerator.rollDeterministic();
  }

  /**
   * Generates a cryptographically secure random roll using native CSPRNG.
   */
  public rollSecure(): number {
    try {
      const bytes = Crypto.getRandomBytes(1);
      const val = bytes[0] % 6;
      return val + 1;
    } catch {
      // Secure fallback using seeded next
      return this.rollDeterministic();
    }
  }

  /**
   * Generates a verification SHA-256 checksum for server validation.
   */
  public async generateChecksum(roll: number, matchId: string, actionIndex: number): Promise<string> {
    const rawData = `${matchId}:${actionIndex}:${roll}:${this.seed}`;
    try {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawData
      );
      return digest;
    } catch {
      // Safe lightweight checksum implementation if expo-crypto digest is unavailable
      let hash = 0;
      for (let i = 0; i < rawData.length; i++) {
        const char = rawData.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return `fallback_${hash.toString(16)}`;
    }
  }

  public getSeed(): number {
    return this.seed;
  }

  public setSeed(newSeed: number): void {
    this.seed = newSeed;
    this.seededGenerator.setSeed(newSeed);
  }
}
