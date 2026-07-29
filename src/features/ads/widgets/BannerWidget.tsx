import React from 'react';
import BannerAd from '../components/Banner/BannerAd';

export const BannerWidget: React.FC = () => {
  return (
    <div className="w-full">
      <BannerAd placementId="home_banner" />
    </div>
  );
};
export default BannerWidget;
