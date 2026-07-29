import { RoundStructure } from '../types/bracket.types';

export const INITIAL_8P_BRACKET: RoundStructure[] = [
  {
    roundNumber: 1,
    name: 'Quarterfinals',
    matches: [
      {
        id: 'match_q1',
        roundNumber: 1,
        player1: { id: 'user_1', name: 'TASAVVUR', isNpc: false },
        player2: { id: 'npc_1', name: 'Alok', isNpc: true },
        status: 'PENDING',
      },
      {
        id: 'match_q2',
        roundNumber: 1,
        player1: { id: 'npc_2', name: 'Roxana', isNpc: true },
        player2: { id: 'npc_3', name: 'Govind', isNpc: true },
        status: 'COMPLETED',
        score1: 4,
        score2: 1,
        winnerId: 'npc_2',
      },
      {
        id: 'match_q3',
        roundNumber: 1,
        player1: { id: 'npc_4', name: 'Aditya', isNpc: true },
        player2: { id: 'npc_5', name: 'Sarah', isNpc: true },
        status: 'COMPLETED',
        score1: 2,
        score2: 3,
        winnerId: 'npc_5',
      },
      {
        id: 'match_q4',
        roundNumber: 1,
        player1: { id: 'npc_6', name: 'Pranav', isNpc: true },
        player2: { id: 'npc_7', name: 'Zoe', isNpc: true },
        status: 'COMPLETED',
        score1: 5,
        score2: 3,
        winnerId: 'npc_6',
      },
    ],
  },
  {
    roundNumber: 2,
    name: 'Semifinals',
    matches: [
      {
        id: 'match_s1',
        roundNumber: 2,
        player1: null, // Winner of Q1
        player2: { id: 'npc_2', name: 'Roxana', isNpc: true },
        status: 'PENDING',
      },
      {
        id: 'match_s2',
        roundNumber: 2,
        player1: { id: 'npc_5', name: 'Sarah', isNpc: true },
        player2: { id: 'npc_6', name: 'Pranav', isNpc: true },
        status: 'PENDING',
      },
    ],
  },
  {
    roundNumber: 3,
    name: 'Finals',
    matches: [
      {
        id: 'match_f1',
        roundNumber: 3,
        player1: null,
        player2: null,
        status: 'PENDING',
      },
    ],
  },
];
