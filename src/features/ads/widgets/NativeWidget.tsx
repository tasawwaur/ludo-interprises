import React from 'react';
import NativeAd from '../components/Native/NativeAd';

export const NativeWidget: React.FC = () => {
  return (
    <div className="w-full">
      <NativeAd placementId="matchmaker_loading" />
    </div>
  );
};
export default NativeWidget;
