import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface DiceGlowProps {
  size: number;
  animatedStyle: any;
}

export const DiceGlow: React.FC<DiceGlowProps> = ({ size, animatedStyle }) => {
  return (
    <Animated.View
      style={[
        styles.glowRing,
        {
          width: size * 1.4,
          height: size * 1.4,
          borderRadius: size * 0.7,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={['rgba(250, 204, 21, 0.8)', 'rgba(251, 191, 36, 0.2)', 'transparent']}
        style={styles.gradientFill}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    bottom: '20%',
    zIndex: 1,
  },
  gradientFill: {
    width: '100%',
    height: '100%',
  },
});
