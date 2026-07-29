import { PlayerProfile } from './player-one';

export const PLAYER_TWO_DEFAULT: PlayerProfile = {
  id: 'npc_opponent',
  name: 'OPPONENT',
  color: 'GREEN',
  isNpc: true,
};

// NPC player names pool for simulated games
export const NPC_NAMES = [
  'Alok', 'Roxana', 'Govind', 'Sarah', 'Pranav', 'Zoe', 'Aditya', 'Priya',
];

export const getRandomNpcProfile = (): PlayerProfile => {
  const name = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
  return {
    id: `npc_${Math.random().toString(36).substring(2, 6)}`,
    name,
    color: 'GREEN',
    isNpc: true,
  };
};
