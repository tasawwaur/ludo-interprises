import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { SoundManager } from '../audio/SoundManager';

interface TokenAnimatorProps {
  tokenId: string;
  color: 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';
  pathCoords: Array<{ x: number; y: number }>; // Coordinates of path cells
  isAnimating: boolean;
  onAnimationComplete: () => void;
  size?: number;
}

export const TokenAnimator: React.FC<TokenAnimatorProps> = ({
  tokenId,
  color,
  pathCoords,
  isAnimating,
  onAnimationComplete,
  size = 28,
}) => {
  const positionX = useSharedValue(pathCoords[0]?.x || 0);
  const positionY = useSharedValue(pathCoords[0]?.y || 0);
  const scale = useSharedValue(1.0);
  const glowOpacity = useSharedValue(0.0);

  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    if (isAnimating && pathCoords.length > 1) {
      animateStepByStep(1);
    }
  }, [isAnimating]);

  /**
   * Quadratic Bezier Curve Path Interpolation.
   * Generates step-by-step landing animation with high-fidelity curves.
   */
  const animateStepByStep = (index: number) => {
    if (index >= pathCoords.length) {
      // Final landing bounce and glow trigger
      scale.value = withSequence(
        withTiming(1.3, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1.0, { duration: 150, easing: Easing.bounce })
      );
      
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0.0, { duration: 300, easing: Easing.linear })
      );

      // Trigger landing bell sound
      soundManager.play('GOLDEN_BELL');
      
      onAnimationComplete();
      return;
    }

    const nextCoord = pathCoords[index];
    const prevCoord = pathCoords[index - 1];

    // Compute midpoint control point for bezier curve height lift
    const midX = (prevCoord.x + nextCoord.x) / 2;
    const midY = (prevCoord.y + nextCoord.y) / 2 - size * 0.5; // Lift up by 50% size

    // Animate to control point then to destination
    positionX.value = withSequence(
      withTiming(midX, { duration: 90, easing: Easing.linear }),
      withTiming(nextCoord.x, { duration: 90, easing: Easing.linear })
    );

    positionY.value = withSequence(
      withTiming(midY, { duration: 90, easing: Easing.linear }),
      withTiming(nextCoord.y, { duration: 90, easing: Easing.linear }, (isFinished) => {
        if (isFinished) {
          runOnJS(playStepSound)();
          runOnJS(animateStepByStep)(index + 1);
        }
      })
    );
  };

  const playStepSound = () => {
    soundManager.play('MOVE_TICK');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positionX.value },
        { translateY: positionY.value },
        { scale: scale.value },
      ],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  const tokenAssetMap = {
    RED: require('../../../../assets/images/icons/token_red_3d.png'),
    GREEN: require('../../../../assets/images/icons/token_green_3d.png'),
    YELLOW: require('../../../../assets/images/icons/token_yellow_3d.png'),
    BLUE: require('../../../../assets/images/icons/token_blue_3d.png'),
  };

  return (
    <View style={styles.rootContainer}>
      {/* Golden/Glow Ring Indicator */}
      <Animated.View style={[
        styles.glowRing,
        {
          width: size * 1.5,
          height: size * 1.5,
          borderRadius: size * 0.75,
          borderColor: color === 'YELLOW' ? '#F59E0B' : color === 'GREEN' ? '#10B981' : color === 'BLUE' ? '#3B82F6' : '#EF4444',
        },
        animatedGlowStyle
      ]} />

      {/* 3D Token Image wrapper */}
      <Animated.View style={[animatedStyle, { width: size, height: size * 1.3 }]}>
        <Image
          source={tokenAssetMap[color]}
          style={styles.imageFill}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    alignSelf: 'center',
    top: -2,
    zIndex: 1,
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
});
