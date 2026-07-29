export interface NativeAdContent {
  title: string;
  body: string;
  callToAction: string;
  iconUrl?: string;
  imageUrl?: string;
}

export const loadNativeAdContent = async (placementId: string): Promise<NativeAdContent> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: 'Ludo Pro Dice Upgrades',
        body: 'Upgrade your classic dice to unlock extra gold and win stars multipliers now!',
        callToAction: 'UPGRADE NOW',
        iconUrl: '/assets/images/icons/icon_gold_dice.png',
      });
    }, 200);
  });
};
