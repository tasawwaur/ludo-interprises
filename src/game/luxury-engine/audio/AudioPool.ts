import { Audio } from 'expo-av';

export class AudioPool {
  private pool: Map<string, Audio.Sound[]> = new Map();
  private maxPoolSize = 3;

  /**
   * Recycles or creates an Audio.Sound object to play concurrent overlapping sounds.
   */
  public async getSound(
    soundId: string,
    uriPath: string,
    volume: number
  ): Promise<Audio.Sound | null> {
    if (!this.pool.has(soundId)) {
      this.pool.set(soundId, []);
    }

    const instances = this.pool.get(soundId)!;
    
    // Find an idle sound instance or instantiate a new one
    for (const sound of instances) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !status.isPlaying) {
        await sound.setVolumeAsync(volume);
        return sound;
      }
    }

    if (instances.length < this.maxPoolSize) {
      const newSound = new Audio.Sound();
      try {
        await newSound.loadAsync({ uri: uriPath }, { shouldPlay: false, volume });
        instances.push(newSound);
        return newSound;
      } catch {
        return null;
      }
    }

    // Fallback: reuse the oldest loaded sound instance
    return instances[0] || null;
  }
}
