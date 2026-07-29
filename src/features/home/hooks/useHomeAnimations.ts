import { useMemo } from 'react';

export const useHomeAnimations = () => {
  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.1,
        },
      },
    }),
    []
  );

  const headerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: -30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      },
    }),
    []
  );

  const profileVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 240, damping: 22 },
      },
    }),
    []
  );

  const heroVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.85, y: 20 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 220, damping: 18 },
      },
    }),
    []
  );

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 25 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 200, damping: 20 },
      },
    }),
    []
  );

  const bottomNavVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 50 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 250, damping: 22, delay: 0.2 },
      },
    }),
    []
  );

  return {
    containerVariants,
    headerVariants,
    profileVariants,
    heroVariants,
    cardVariants,
    bottomNavVariants,
  };
};
