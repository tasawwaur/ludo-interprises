import { Audio } from 'expo-av';
import { SOUND_ASSET_MAP } from '../constants/GameConstants';
import { AudioLoader } from './AudioLoader';

export class SoundManager {
  private static instance: SoundManager | null = null;
  private soundObjects: Map<string, Audio.Sound> = new Map();
  private isMuted = false;
  private masterVolume = 1.0;

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!this.instance) {
      this.instance = new SoundManager();
    }
    return this.instance;
  }

  /**
   * Preloads all gameplay sound effects into hardware memory.
   * Utilizes AudioLoader.
   */
  public async preloadSounds(): Promise<void> {
    try {
      // Configure audio categories for high-fidelity casino feel on mobile devices
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldRouteThroughEarpieceIOS: false,
      });

      const loaders = Object.entries(SOUND_ASSET_MAP).map(async ([key, val]) => {
        const soundObject = await AudioLoader.loadAsset(val);
        if (soundObject) {
          this.soundObjects.set(key, soundObject);
        }
      });

      await Promise.all(loaders);
    } catch {
      // Native audio modules missing or web compile fallback
    }
  }

  /**
   * Plays a preloaded sound effect instantly with configured volume.
   */
  public async play(soundKey: keyof typeof SOUND_ASSET_MAP): Promise<void> {
    if (this.isMuted) return;

    const sound = this.soundObjects.get(soundKey);
    if (sound) {
      try {
        await sound.setVolumeAsync(this.masterVolume);
        await sound.replayAsync();
      } catch {
        // Native audio player fallback
      }
    }
  }

  public setMute(mute: boolean): void {
    this.isMuted = mute;
  }

  public getMute(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0.0, Math.min(1.0, vol));
    this.soundObjects.forEach(async (sound) => {
      try {
        await sound.setVolumeAsync(this.masterVolume);
      } catch {
        // Safe check
      }
    });
  }

  public getVolume(): number {
    return this.masterVolume;
  }
}
