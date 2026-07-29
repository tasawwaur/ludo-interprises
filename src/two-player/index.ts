// Two-Player Module — main entry point
// Re-exports all public APIs for the two-player feature

export * from './room/room-code';
export * from './room/room-settings';
export * from './room/create-room';
export * from './room/join-room';
export * from './room/leave-room';
export * from './room/private-room';

export * from './matchmaking/matchmaking';
export * from './matchmaking/quick-match';
export * from './matchmaking/ranked-match';
export * from './matchmaking/custom-match';
export * from './matchmaking/reconnect';

export * from './gameplay/dice';
export * from './gameplay/movement';
export * from './gameplay/token-manager';
export * from './gameplay/turn-manager';
export * from './gameplay/timer';
export * from './gameplay/pause';
export * from './gameplay/surrender';
export * from './gameplay/gameplay';

export * from './players/player-one';
export * from './players/player-two';
export * from './players/player-stats';
export * from './players/player-status';
export * from './players/player-sync';

export * from './results/match-summary';
export * from './results/winner';
export * from './results/loser';
export * from './results/history';
export * from './results/statistics';

export * from './rewards/rewards';
export * from './rewards/coins';
export * from './rewards/diamonds';
export * from './rewards/xp';
export * from './rewards/achievements';

export * from './utils/formatter';
export * from './utils/validators';
export * from './utils/calculations';
export * from './utils/mapper';
export * from './utils/helpers';

export * from './two-player.types';
export * from './two-player.constants';
export * from './two-player.events';
