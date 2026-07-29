import { useInventoryStore } from '../store/inventory.store';

export const InventoryService = {
  getOwnedDice: () => {
    return useInventoryStore.getState().getOwnedDice();
  },

  getLockedDice: () => {
    return useInventoryStore.getState().getLockedDice();
  },

  getFavoriteDice: () => {
    return useInventoryStore.getState().getFavoriteDice();
  },

  getOwnedSkins: () => {
    return useInventoryStore.getState().getOwnedSkins();
  },
};
export default InventoryService;
