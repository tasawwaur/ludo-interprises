import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

interface DiceShadowProps {
  size: number;
  animatedStyle: any;
}

export const DiceShadow: React.FC<DiceShadowProps> = ({ size, animatedStyle }) => {
  return (
    <Animated.View
      style={[
        styles.shadow,
        {
          width: size * 0.9,
          height: size * 0.2,
          bottom: size * 0.15,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    backgroundColor: '#000000',
    borderRadius: 50,
    zIndex: 2,
  },
});
