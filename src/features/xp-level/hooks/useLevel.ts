import { useLevelStore } from '../store/level.store';

export const useLevel = () => {
  const levelState = useLevelStore((s) => s.levelState);
  const showLevelUpModal = useLevelStore((s) => s.showLevelUpModal);
  const levelUpFrom = useLevelStore((s) => s.levelUpFrom);
  const levelUpTo = useLevelStore((s) => s.levelUpTo);
  const dismissLevelUpModal = useLevelStore((s) => s.dismissLevelUpModal);

  return {
    levelState,
    showLevelUpModal,
    levelUpFrom,
    levelUpTo,
    dismissLevelUpModal,
  };
};
export default useLevel;
