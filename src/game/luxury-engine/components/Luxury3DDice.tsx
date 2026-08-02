import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { DiceShadow } from './DiceShadow';
import { DiceGlow } from './DiceGlow';
import { DiceParticles } from './DiceParticles';

interface Luxury3DDiceProps {
  value: number | null;
  isActiveTurn: boolean;
  onRollComplete: () => void;
  size?: number;
}

export const Luxury3DDice: React.FC<Luxury3DDiceProps> = ({
  value,
  isActiveTurn,
  onRollComplete,
  size = 70,
}) => {
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const rotationZ = useSharedValue(0);
  const diceScale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const shadowScale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.4);
  const glowOpacity = useSharedValue(0);
  const shineTranslateX = useSharedValue(-size * 1.5);

  useEffect(() => {
    if (value !== null) {
      triggerPhysicsRoll(value);
    }
  }, [value]);

  const triggerPhysicsRoll = (targetValue: number) => {
    // Reset glow and shine
    glowOpacity.value = withTiming(0, { duration: 100 });
    shineTranslateX.value = -size * 1.5;

    // Determine target rotation based on face orientations
    let targetX = 0;
    let targetY = 0;
    
    switch (targetValue) {
      case 1: targetX = 0; targetY = 0; break;
      case 2: targetX = 0; targetY = Math.PI / 2; break;
      case 3: targetX = -Math.PI / 2; targetY = 0; break;
      case 4: targetX = Math.PI / 2; targetY = 0; break;
      case 5: targetX = 0; targetY = -Math.PI / 2; break;
      case 6: targetX = Math.PI; targetY = 0; break;
    }

    // 1. Roll physics animations (Simulate 360 degree spin and throw torque)
    rotationX.value = withTiming(targetX + Math.PI * 4, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    rotationY.value = withTiming(targetY + Math.PI * 4, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    rotationZ.value = withTiming(Math.PI * 2, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // 2. Bounce mechanics
    bounceY.value = withSequence(
      withTiming(-size * 0.8, { duration: 200, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 200, easing: Easing.bounce }),
      withTiming(-size * 0.2, { duration: 150, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 150, easing: Easing.bounce })
    );

    // 3. Shadow scaling mapping to bounces
    shadowScale.value = withSequence(
      withTiming(0.5, { duration: 200 }),
      withTiming(1, { duration: 200 }),
      withTiming(0.8, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );

    shadowOpacity.value = withSequence(
      withTiming(0.1, { duration: 200 }),
      withTiming(0.4, { duration: 200 }),
      withTiming(0.2, { duration: 150 }),
      withTiming(0.4, { duration: 150 })
    );

    // 4. Gold Glow and Crystal Shine triggers on complete
    const totalDuration = 800;
    setTimeout(() => {
      // Glow and Shine effects
      glowOpacity.value = withTiming(1.0, { duration: 300 });
      shineTranslateX.value = withTiming(size * 1.5, {
        duration: 500,
        easing: Easing.linear,
      });
      onRollComplete();
    }, totalDuration);
  };

  const animatedDiceStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: bounceY.value },
        { scale: diceScale.value },
        { rotateX: `${rotationX.value}rad` },
        { rotateY: `${rotationY.value}rad` },
        { rotateZ: `${rotationZ.value}rad` },
      ],
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: shadowScale.value }],
      opacity: shadowOpacity.value,
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: withTiming(glowOpacity.value === 1 ? 1.3 : 1, { duration: 300 }) }],
    };
  });

  const animatedShineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shineTranslateX.value }],
    };
  });

  // Render dice face dots
  const renderDots = (faceVal: number) => {
    const dots: JSX.Element[] = [];
    for (let i = 0; i < faceVal; i++) {
      dots.push(<View key={i} style={[styles.dot, { width: size * 0.14, height: size * 0.14, borderRadius: size * 0.07 }]} />);
    }
    return (
      <View style={[styles.faceContainer, { padding: size * 0.15 }]}>
        <View style={styles.dotsWrapper}>{dots}</View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { width: size * 1.6, height: size * 2.2 }]}>
      {/* Golden Glow Effect beneath Dice */}
      <DiceGlow size={size} animatedStyle={animatedGlowStyle} />

      {/* Shadow layer */}
      <DiceShadow size={size} animatedStyle={animatedShadowStyle} />

      {/* 3D Dice Body */}
      <Animated.View style={[styles.diceBody, { width: size, height: size, borderRadius: size * 0.15 }, animatedDiceStyle]}>
        {/* Luxury Gold Border Frame */}
        <LinearGradient
          colors={['#FBBF24', '#D97706', '#FBBF24']}
          style={[styles.gradientBorder, { borderRadius: size * 0.15 }]}
        >
          <View style={[styles.crystalOverlay, { borderRadius: size * 0.12 }]}>
            {value ? renderDots(value) : renderDots(1)}
            
            {/* Crystal Shine Ray */}
            <DiceParticles size={size} animatedStyle={animatedShineStyle} />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  diceBody: {
    backgroundColor: '#1E1B4B', // Luxury Midnight Indigo Body
    zIndex: 3,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  gradientBorder: {
    padding: 3, // Border width
    width: '100%',
    height: '100%',
  },
  crystalOverlay: {
    flex: 1,
    backgroundColor: '#111827',
    position: 'relative',
    overflow: 'hidden',
  },
  faceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    backgroundColor: '#F59E0B', // Gold Amber Dots
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
