import React, { useState } from 'react';
import { useFriendsStore, FriendRequest, GameInvite } from '../../store/friends.store';
import { useUserStore } from '../../user/user.store';
import confetti from 'canvas-confetti';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptGameInvite?: (invite: GameInvite) => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({ isOpen, onClose, onAcceptGameInvite }) => {
  const { incomingRequests, incomingInvites, acceptRequest, declineRequest, declineInvite } = useFriendsStore();
  const { user, updateUser } = useUserStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated gifts list
  const [gifts, setGifts] = useState<Array<{ id: string; sender: string; amount: number; claimed: boolean }>>([
    { id: 'gift_1', sender: 'Aman', amount: 500, claimed: false },
    { id: 'gift_2', sender: 'Roxana', amount: 1000, claimed: false }
  ]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleClaimGift = (giftId: string, amount: number, sender: string) => {
    const currentCoins = user?.coins || 0;
    updateUser({ coins: currentCoins + amount });
    setGifts(prev => prev.map(g => g.id === giftId ? { ...g, claimed: true } : g));
    confetti({ particleCount: 30, spread: 45, colors: ['#FFD700', '#FFA500'] });
    triggerToast(`💰 Claimed ${amount} coins from ${sender}!`);
  };

  const totalItems = incomingRequests.length + incomingInvites.length + gifts.filter(g => !g.claimed).length;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      {/* Toast Overlay */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 bg-slate-900 border border-amber-400 rounded-xl text-xs font-black text-amber-300 shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Card with luxury gold border */}
      <div 
        className="w-full max-w-[340px] bg-gradient-to-b from-[#250F3E] via-[#12061F] to-[#0A0314] rounded-[32px] border-2 border-yellow-500/30 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative text-white flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gradient-to-b from-red-500 to-rose-600 border-2 border-yellow-400 rounded-xl flex items-center justify-center text-white font-black text-sm hover:brightness-110 active:scale-95 transition-transform z-50 shadow-md"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center border-b border-purple-500/20 pb-3 mb-4 flex-shrink-0">
          <h2 className="text-lg font-black text-amber-400 tracking-wider uppercase drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)]">
            ✉️ Inbox & Requests
          </h2>
          <p className="text-[10px] text-purple-200/70 font-semibold uppercase tracking-wider mt-0.5">
            {totalItems} New Message{totalItems !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Scrollable Messages Area */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar flex flex-col gap-3">
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">📭</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Inbox is Empty</span>
              <span className="text-[9px] text-slate-500 max-w-[200px]">You have no new notifications, friend requests, or match invites.</span>
            </div>
          ) : (
            <>
              {/* 1. Game Invites (High Priority) */}
              {incomingInvites.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest block pl-1">Match Invitations</span>
                  {incomingInvites.map((invite) => (
                    <div 
                      key={invite.id}
                      className="bg-purple-950/40 border border-amber-400/25 p-3 rounded-2xl flex flex-col gap-2.5 shadow-inner"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {invite.senderAvatar ? (
                            <img src={invite.senderAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-amber-300">{invite.senderName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-white truncate">{invite.senderName}</span>
                          <span className="text-[9px] text-purple-300 leading-none">Invited you to play {invite.mode}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => {
                            if (onAcceptGameInvite) {
                              onAcceptGameInvite(invite);
                            }
                            declineInvite(invite.id);
                            onClose();
                          }}
                          className="flex-1 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-white border border-emerald-300 font-black text-[10px] uppercase rounded-xl transition-all cursor-pointer shadow-md"
                        >
                          ✔️ Play Game
                        </button>
                        <button
                          onClick={() => {
                            declineInvite(invite.id);
                            triggerToast("Invitation declined");
                          }}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-gray-400 border border-slate-700 font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. Friend Requests */}
              {incomingRequests.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block pl-1">Friend Requests</span>
                  {incomingRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="bg-black/35 border border-purple-500/15 p-2.5 rounded-2xl flex items-center justify-between shadow-inner"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-purple-500/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {request.senderAvatar ? (
                            <img src={request.senderAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-purple-300">{request.senderName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-white truncate">{request.senderName}</span>
                          <span className="text-[8px] text-purple-300">Level {request.senderLevel}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            acceptRequest(request.id);
                            confetti({ particleCount: 20, spread: 30 });
                            triggerToast(`Accepted friend request from ${request.senderName}!`);
                          }}
                          className="w-7 h-7 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center rounded-lg active:scale-90 transition-transform cursor-pointer"
                          title="Accept"
                        >
                          ✔️
                        </button>
                        <button
                          onClick={() => {
                            declineRequest(request.id);
                            triggerToast(`Declined request from ${request.senderName}`);
                          }}
                          className="w-7 h-7 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 flex items-center justify-center rounded-lg active:scale-90 transition-transform cursor-pointer"
                          title="Decline"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Gifts from Friends */}
              {gifts.some(g => !g.claimed) && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block pl-1">Claimable Gifts</span>
                  {gifts.filter(g => !g.claimed).map((gift) => (
                    <div 
                      key={gift.id}
                      className="bg-black/35 border border-purple-500/15 p-2.5 rounded-2xl flex items-center justify-between shadow-inner"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎁</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-white">{gift.sender} sent you Coins!</span>
                          <span className="text-[9px] text-amber-300 font-extrabold">+ {gift.amount.toLocaleString()} Coins</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimGift(gift.id, gift.amount, gift.sender)}
                        className="px-2.5 py-1.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 border border-amber-300 font-black text-[9px] text-black uppercase rounded-lg transition-transform cursor-pointer"
                      >
                        Claim
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
