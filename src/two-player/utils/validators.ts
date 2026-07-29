import { isValidRoomCode } from '../room/room-code';

export const validateRoomCode = (code: string): { valid: boolean; error?: string } => {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: 'Room code cannot be empty.' };
  }
  if (!isValidRoomCode(code.trim().toUpperCase())) {
    return { valid: false, error: 'Room code must be 6 alphanumeric characters.' };
  }
  return { valid: true };
};

export const validateEntryFee = (
  fee: number,
  available: number
): { valid: boolean; error?: string } => {
  if (fee <= 0) return { valid: false, error: 'Entry fee must be greater than zero.' };
  if (fee > available) return { valid: false, error: 'Not enough coins for this entry fee.' };
  return { valid: true };
};

export const validatePlayerName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters.' };
  }
  if (name.trim().length > 20) {
    return { valid: false, error: 'Name cannot exceed 20 characters.' };
  }
  return { valid: true };
};
