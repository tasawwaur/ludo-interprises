import { Audio } from 'expo-av';

export class MusicManager {
  private currentTrack: Audio.Sound | null = null;
  private volume = 0.5;

  /**
   * Plays a background music loop and fades it in.
   */
  public async playMusic(uriPath: string): Promise<void> {
    if (this.currentTrack) {
      await this.currentTrack.stopAsync();
      await this.currentTrack.unloadAsync();
    }

    this.currentTrack = new Audio.Sound();
    try {
      await this.currentTrack.loadAsync(
        { uri: uriPath },
        { shouldPlay: true, isLooping: true, volume: this.volume }
      );
    } catch {
      this.currentTrack = null;
    }
  }

  public async setVolume(vol: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentTrack) {
      await this.currentTrack.setVolumeAsync(this.volume);
    }
  }

  public async stop(): Promise<void> {
    if (this.currentTrack) {
      await this.currentTrack.stopAsync();
    }
  }
}
