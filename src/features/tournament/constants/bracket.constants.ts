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

export const INITIAL_16P_BRACKET: RoundStructure[] = [
  {
    roundNumber: 1,
    name: 'Round of 16',
    matches: [
      { id: 'match_16_1', roundNumber: 1, player1: { id: 'user_1', name: 'TASAVVUR', isNpc: false }, player2: { id: 'npc_1', name: '𓆩𝐋𝐮𝐜𝐢𝐟𝐞𝐫𓆪', isNpc: true }, status: 'PENDING' },
      { id: 'match_16_2', roundNumber: 1, player1: { id: 'npc_2', name: '꧁༺𝐀𝐧𝐠𝐞𝐥༻꧂', isNpc: true }, player2: { id: 'npc_3', name: '『𝐒𝐭𝐚𝐫𝐍𝐢𝐜𝐤』', isNpc: true }, status: 'COMPLETED', score1: 4, score2: 2, winnerId: 'npc_2' },
      { id: 'match_16_3', roundNumber: 1, player1: { id: 'npc_4', name: '么𝐏𝐚𝐫𝐢么', isNpc: true }, player2: { id: 'npc_5', name: '꧁༒𝐒𝐡𝐢𝐯𝐚༒꧂', isNpc: true }, status: 'COMPLETED', score1: 1, score2: 4, winnerId: 'npc_5' },
      { id: 'match_16_4', roundNumber: 1, player1: { id: 'npc_6', name: 'Queen', isNpc: true }, player2: { id: 'npc_7', name: 'Sultan', isNpc: true }, status: 'COMPLETED', score1: 4, score2: 3, winnerId: 'npc_6' },
      { id: 'match_16_5', roundNumber: 1, player1: { id: 'npc_8', name: 'Odin', isNpc: true }, player2: { id: 'npc_9', name: 'Zeus', isNpc: true }, status: 'COMPLETED', score1: 4, score2: 1, winnerId: 'npc_8' },
      { id: 'match_16_6', roundNumber: 1, player1: { id: 'npc_10', name: 'Thor', isNpc: true }, player2: { id: 'npc_11', name: 'Kabir', isNpc: true }, status: 'COMPLETED', score1: 2, score2: 4, winnerId: 'npc_11' },
      { id: 'match_16_7', roundNumber: 1, player1: { id: 'npc_12', name: 'Aarav', isNpc: true }, player2: { id: 'npc_13', name: 'Ishaan', isNpc: true }, status: 'COMPLETED', score1: 4, score2: 0, winnerId: 'npc_12' },
      { id: 'match_16_8', roundNumber: 1, player1: { id: 'npc_14', name: 'Vihaan', isNpc: true }, player2: { id: 'npc_15', name: 'Reyansh', isNpc: true }, status: 'COMPLETED', score1: 3, score2: 4, winnerId: 'npc_15' },
    ]
  },
  {
    roundNumber: 2,
    name: 'Quarterfinals',
    matches: [
      { id: 'match_16_q1', roundNumber: 2, player1: null, player2: { id: 'npc_2', name: '꧁༺𝐀𝐧𝐠𝐞𝐥༻꧂', isNpc: true }, status: 'PENDING' },
      { id: 'match_16_q2', roundNumber: 2, player1: { id: 'npc_5', name: '꧁༒𝐒𝐡𝐢𝐯𝐚༒꧂', isNpc: true }, player2: { id: 'npc_6', name: 'Queen', isNpc: true }, status: 'COMPLETED', score1: 4, score2: 1, winnerId: 'npc_5' },
      { id: 'match_16_q3', roundNumber: 2, player1: { id: 'npc_8', name: 'Odin', isNpc: true }, player2: { id: 'npc_11', name: 'Kabir', isNpc: true }, status: 'COMPLETED', score1: 1, score2: 4, winnerId: 'npc_11' },
      { id: 'match_16_q4', roundNumber: 2, player1: { id: 'npc_12', name: 'Aarav', isNpc: true }, player2: { id: 'npc_15', name: 'Reyansh', isNpc: true }, status: 'COMPLETED', score1: 4, score2: 2, winnerId: 'npc_12' },
    ]
  },
  {
    roundNumber: 3,
    name: 'Semifinals',
    matches: [
      { id: 'match_16_s1', roundNumber: 3, player1: null, player2: { id: 'npc_5', name: '꧁༒𝐒𝐡𝐢𝐯𝐚༒꧂', isNpc: true }, status: 'PENDING' },
      { id: 'match_16_s2', roundNumber: 3, player1: { id: 'npc_11', name: 'Kabir', isNpc: true }, player2: { id: 'npc_12', name: 'Aarav', isNpc: true }, status: 'PENDING' },
    ]
  },
  {
    roundNumber: 4,
    name: 'Finals',
    matches: [
      { id: 'match_16_f1', roundNumber: 4, player1: null, player2: null, status: 'PENDING' },
    ]
  }
];
