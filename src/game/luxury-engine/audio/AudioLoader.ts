import { Audio } from 'expo-av';
import { SOUND_ASSET_MAP } from '../constants/GameConstants';

export class AudioLoader {
  /**
   * Preloads an audio asset using Expo AV Sound objects.
   */
  public static async loadAsset(soundVal: string): Promise<Audio.Sound | null> {
    const soundObject = new Audio.Sound();
    try {
      // Load local sound file from assets
      await soundObject.loadAsync(
        { uri: `assets/sounds/${soundVal}.mp3` },
        { shouldPlay: false }
      );
      return soundObject;
    } catch (e) {
      // Return null on loading failures or browser environments
      return null;
    }
  }
}
