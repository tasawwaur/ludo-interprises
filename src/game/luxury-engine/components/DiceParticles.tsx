import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface DiceParticlesProps {
  size: number;
  animatedStyle: any;
}

export const DiceParticles: React.FC<DiceParticlesProps> = ({ size, animatedStyle }) => {
  return (
    <Animated.View
      style={[
        styles.shineBar,
        {
          width: size * 0.3,
          height: size * 2,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.75)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientFill}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  shineBar: {
    position: 'absolute',
    top: -50,
    transform: [{ rotate: '45deg' }],
  },
  gradientFill: {
    width: '100%',
    height: '100%',
  },
});
