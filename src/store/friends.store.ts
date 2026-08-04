import { create } from 'zustand';
import { GLOBAL_PLAYER_DATABASE } from './player-database.store';

export interface Friend {
  id: string;
  name: string;
  status: 'Online' | 'Offline';
  isOnline: boolean;
  isFB: boolean;
  avatarUrl?: string;
  equippedFrame?: string;
  coins: number;
  level: number;
}

export interface FriendRequest {
  id: string;
  senderName: string;
  senderAvatar?: string;
  senderLevel: number;
  senderFrame?: string;
  time: string;
}

export interface GameInvite {
  id: string;
  senderName: string;
  senderAvatar?: string;
  mode: string;
  time: string;
}

interface FriendsState {
  friendsList: Friend[];
  incomingRequests: FriendRequest[];
  incomingInvites: GameInvite[];
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  acceptRequest: (requestId: string) => void;
  declineRequest: (requestId: string) => void;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  sendRequest: (targetName: string) => void;
  addFriendRequest: (req: FriendRequest) => void;
  addGameInvite: (invite: GameInvite) => void;
}

const STORAGE_KEY_FRIENDS = 'ludo_friends_list_v4';
const STORAGE_KEY_REQUESTS = 'ludo_incoming_requests_v4';
const STORAGE_KEY_INVITES = 'ludo_incoming_invites_v4';

const getInitialFriends = (): Friend[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FRIENDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
};

const getInitialRequests = (): FriendRequest[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
};

const getInitialInvites = (): GameInvite[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
  }
  return [];
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friendsList: getInitialFriends(),
  incomingRequests: getInitialRequests(),
  incomingInvites: getInitialInvites(),

  addFriend: (friend) => {
    set((state) => {
      if (state.friendsList.some(f => f.id === friend.id)) return state;
      const updated = [...state.friendsList, friend];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updated));
      }
      return { friendsList: updated };
    });
  },

  removeFriend: (friendId) => {
    set((state) => {
      const updated = state.friendsList.filter(f => f.id !== friendId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updated));
      }
      return { friendsList: updated };
    });
  },

  acceptRequest: (requestId) => {
    set((state) => {
      const req = state.incomingRequests.find(r => r.id === requestId);
      if (!req) return state;

      const newFriend: Friend = {
        id: req.id,
        name: req.senderName,
        status: 'Online',
        isOnline: true,
        isFB: false,
        avatarUrl: req.senderAvatar,
        equippedFrame: req.senderFrame,
        coins: 50000,
        level: req.senderLevel
      };

      const updatedFriends = [...state.friendsList, newFriend];
      const updatedRequests = state.incomingRequests.filter(r => r.id !== requestId);

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updatedFriends));
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedRequests));
      }

      return {
        friendsList: updatedFriends,
        incomingRequests: updatedRequests
      };
    });
  },

  declineRequest: (requestId) => {
    set((state) => {
      const updatedRequests = state.incomingRequests.filter(r => r.id !== requestId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updatedRequests));
      }
      return { incomingRequests: updatedRequests };
    });
  },

  acceptInvite: (inviteId) => {
    set((state) => {
      const updatedInvites = state.incomingInvites.filter(i => i.id !== inviteId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_INVITES, JSON.stringify(updatedInvites));
      }
      return { incomingInvites: updatedInvites };
    });
  },

  declineInvite: (inviteId) => {
    set((state) => {
      const updatedInvites = state.incomingInvites.filter(i => i.id !== inviteId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_INVITES, JSON.stringify(updatedInvites));
      }
      return { incomingInvites: updatedInvites };
    });
  },

  sendRequest: (targetName) => {
    // If we click "Add Friend" on someone (e.g. from Search or profile view), we simulate success
    console.log(`Friend request sent to ${targetName}`);
  },

  addFriendRequest: (req) => {
    set((state) => {
      if (state.incomingRequests.some(r => r.id === req.id || r.senderName === req.senderName)) return state;
      const updated = [...state.incomingRequests, req];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(updated));
      }
      return { incomingRequests: updated };
    });
  },

  addGameInvite: (invite) => {
    set((state) => {
      if (state.incomingInvites.some(i => i.id === invite.id)) return state;
      const updated = [...state.incomingInvites, invite];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_INVITES, JSON.stringify(updated));
      }
      return { incomingInvites: updated };
    });
  }
}));
