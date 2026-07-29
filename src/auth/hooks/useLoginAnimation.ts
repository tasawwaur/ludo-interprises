import { useMemo } from 'react';

export const useLoginAnimation = () => {
  const logoVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.8, y: -20 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      },
    }),
    []
  );

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 40, scale: 0.92 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 220, damping: 24, delay: 0.15 },
      },
    }),
    []
  );

  const floatParticleVariants = useMemo(
    () => ({
      animate: {
        y: [0, -12, 0],
        rotate: [0, 8, -8, 0],
        transition: {
          duration: 3.5,
          repeat: Infinity,
          repeatType: 'reverse' as const,
          ease: 'easeInOut',
        },
      },
    }),
    []
  );

  return {
    logoVariants,
    cardVariants,
    floatParticleVariants,
  };
};
