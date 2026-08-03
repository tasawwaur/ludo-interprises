import React, { useState } from "react";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useCosmeticsStore, CosmeticItem } from "../../../store/cosmetics.store";
import { useDiceStore } from "../../dice/store/dice.store";
import { useUserStore } from "../../../user/user.store";
import confetti from "canvas-confetti";
import { PremiumTokenSvg } from "../../../components/ui/PremiumTokenSvg";
import { PremiumProfileFrame } from "../../../components/ui/PremiumProfileFrame";
import { DiceFace } from "../../gameplay/components/DiceFace";
import { getBoardTheme } from "../../../utils/cosmeticStyles";

interface InventoryPageProps {
  onBack?: () => void;
  onOpenDiceWorkshop?: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onBack, onOpenDiceWorkshop }) => {
  const [activeTab, setActiveTab] = useState<"TOKENS" | "FRAMES" | "BOARDS" | "DICES">("TOKENS");
  const [limit, setLimit] = useState(30);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const user = useUserStore((s) => s.user);
  const userCoins = user?.coins ?? 0;
  const userGems = user?.gems ?? 0;

  const {
    tokens,
    frames,
    boards,
    equippedTokenId,
    equippedFrameId,
    equippedBoardId,
    unlockItem,
    equipItem
  } = useCosmeticsStore();

  const {
    diceItems,
    equippedDiceId,
    unlockDice,
    equipDice
  } = useDiceStore();

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUnlockCosmetic = (id: string, type: 'TOKEN' | 'FRAME' | 'BOARD', item: CosmeticItem) => {
    const costCoins = item.costCoins || 0;
    const costGems = item.costGems || 0;

    if (userCoins < costCoins || userGems < costGems) {
      triggerToast("❌ Insufficient Coins or Gems!");
      return;
    }

    const success = unlockItem(id, type);
    if (success) {
      confetti({ particleCount: 40, spread: 60, colors: ['#A855F7', '#6366F1'] });
      triggerToast(`✅ ${item.name} Unlocked!`);
    } else {
      triggerToast("❌ Failed to unlock item.");
    }
  };

  const handleEquipCosmetic = (id: string, type: 'TOKEN' | 'FRAME' | 'BOARD', name: string) => {
    const success = equipItem(id, type);
    if (success) {
      triggerToast(`✨ Equipped: ${name}`);
    }
  };

  const handleTabChange = (tab: "TOKENS" | "FRAMES" | "BOARDS" | "DICES") => {
    setActiveTab(tab);
    setLimit(30);
  };

  const renderList = () => {
    if (activeTab === "TOKENS") {
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {tokens.slice(0, limit).map((t) => {
              const isEquipped = t.id === equippedTokenId;
              return (
                <div
                  key={t.id}
                  className={`bg-purple-950/80 border-2 rounded-3xl p-2.5 flex flex-col items-center justify-between text-center relative transition-all shadow-lg hover:scale-102 ${
                    isEquipped ? "border-amber-400 glow-gold-border" : "border-purple-500/35"
                  }`}
                >
                  <span className="absolute top-1.5 right-2 text-[7.5px] font-black tracking-wide text-purple-300 uppercase">
                    {t.rarity}
                  </span>

                  <div className="w-12 h-12 flex items-center justify-center mt-2.5 mb-2 animate-float-mid">
                    <PremiumTokenSvg tokenId={t.id} size={44} />
                  </div>
                  <span className="text-[10px] font-black text-white mb-2 leading-tight line-clamp-2 h-7 flex items-center justify-center">
                    {t.name}
                  </span>

                  {t.isUnlocked ? (
                    isEquipped ? (
                      <span className="w-full text-center text-[7.5px] font-black text-amber-400 uppercase bg-black/50 py-1.5 rounded-xl border border-amber-400/40">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquipCosmetic(t.id, 'TOKEN', t.name)}
                        className="w-full py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:brightness-110 text-white border border-purple-500 text-[8.5px] font-black uppercase rounded-xl active:scale-95 transition-all shadow"
                      >
                        EQUIP
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleUnlockCosmetic(t.id, 'TOKEN', t)}
                      className="w-full py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:brightness-110 text-black text-[8px] font-bold uppercase rounded-xl active:scale-95 transition-all shadow"
                    >
                      {t.costCoins ? `🪙 ${t.costCoins.toLocaleString()}` : `💎 ${t.costGems}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {tokens.length > limit && (
            <button
              onClick={() => setLimit((prev) => prev + 30)}
              className="w-full py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-purple-500/30 transition-all active:scale-[0.98]"
            >
              Load More (+30 of {tokens.length - limit} remaining)
            </button>
          )}
        </div>
      );
    }

    if (activeTab === "FRAMES") {
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {frames.slice(0, limit).map((f) => {
              const isEquipped = f.id === equippedFrameId;
              return (
                <div
                  key={f.id}
                  className={`bg-purple-950/80 border-2 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative transition-all shadow-lg hover:scale-102 ${
                    isEquipped ? "border-amber-400 glow-gold-border" : "border-purple-500/35"
                  }`}
                >
                  <span className="absolute top-2 right-2.5 text-[7.5px] font-black tracking-wide text-purple-300 uppercase">
                    {f.rarity}
                  </span>

                  <div className="w-16 h-16 relative my-3 flex items-center justify-center">
                    <PremiumProfileFrame frameId={f.id} className="w-full h-full">
                      <span className="text-xl">👤</span>
                    </PremiumProfileFrame>
                  </div>

                  <span className="text-[10px] font-black text-white mb-2 leading-tight line-clamp-1 h-4">
                    {f.name}
                  </span>

                  {f.isUnlocked ? (
                    isEquipped ? (
                      <span className="w-full text-center text-[7.5px] font-black text-amber-400 uppercase bg-black/50 py-1.5 rounded-xl border border-amber-400/40">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquipCosmetic(f.id, 'FRAME', f.name)}
                        className="w-full py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:brightness-110 text-white border border-purple-500 text-[8.5px] font-black uppercase rounded-xl active:scale-95 transition-all shadow"
                      >
                        EQUIP
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleUnlockCosmetic(f.id, 'FRAME', f)}
                      className="w-full py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:brightness-110 text-black text-[8.5px] font-bold uppercase rounded-xl active:scale-95 transition-all shadow"
                    >
                      {f.costCoins ? `🪙 ${f.costCoins.toLocaleString()}` : `💎 ${f.costGems}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {frames.length > limit && (
            <button
              onClick={() => setLimit((prev) => prev + 30)}
              className="w-full py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-purple-500/30 transition-all active:scale-[0.98]"
            >
              Load More (+30 of {frames.length - limit} remaining)
            </button>
          )}
        </div>
      );
    }

    if (activeTab === "BOARDS") {
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {boards.slice(0, limit).map((b) => {
              const isEquipped = b.id === equippedBoardId;
              return (
                <div
                  key={b.id}
                  className={`bg-purple-950/80 border-2 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative transition-all shadow-lg hover:scale-102 ${
                    isEquipped ? "border-amber-400 glow-gold-border" : "border-purple-500/35"
                  }`}
                >
                  <span className="absolute top-2 right-2.5 text-[7.5px] font-black tracking-wide text-purple-300 uppercase">
                    {b.rarity}
                  </span>

                  {(() => {
                    const theme = getBoardTheme(b.id);
                    return (
                      <div className="w-24 h-16 rounded-xl border border-white/20 overflow-hidden mt-3 mb-2 shadow-2xl relative grid grid-cols-3 grid-rows-3 p-1 gap-1" style={{ backgroundColor: theme.boardBg }}>
                        <div className="rounded" style={{ background: `linear-gradient(135deg, ${theme.redFill[0]}, ${theme.redFill[1]})` }}></div>
                        <div className="rounded" style={{ background: `linear-gradient(135deg, ${theme.greenFill[0]}, ${theme.greenFill[1]})` }}></div>
                        <div className="rounded flex items-center justify-center bg-white/20 border border-white/10">
                          <span className="text-[6px] font-black text-amber-400">👑</span>
                        </div>
                        <div className="rounded" style={{ background: `linear-gradient(135deg, ${theme.blueFill[0]}, ${theme.blueFill[1]})` }}></div>
                        <div className="rounded" style={{ background: `linear-gradient(135deg, ${theme.yellowFill[0]}, ${theme.yellowFill[1]})` }}></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6.5px] font-black text-amber-400 uppercase tracking-wider whitespace-nowrap">
                          {theme.themeName} BOARD
                        </span>
                      </div>
                    );
                  })()}

                  <span className="text-[10px] font-black text-white mb-2 leading-tight line-clamp-1 h-4">
                    {b.name}
                  </span>

                  {b.isUnlocked ? (
                    isEquipped ? (
                      <span className="w-full text-center text-[7.5px] font-black text-amber-400 uppercase bg-black/50 py-1.5 rounded-xl border border-amber-400/40">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquipCosmetic(b.id, 'BOARD', b.name)}
                        className="w-full py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:brightness-110 text-white border border-purple-500 text-[8.5px] font-black uppercase rounded-xl active:scale-95 transition-all shadow"
                      >
                        EQUIP
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleUnlockCosmetic(b.id, 'BOARD', b)}
                      className="w-full py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:brightness-110 text-black text-[8.5px] font-bold uppercase rounded-xl active:scale-95 transition-all shadow"
                    >
                      {b.costCoins ? `🪙 ${b.costCoins.toLocaleString()}` : `💎 ${b.costGems}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {boards.length > limit && (
            <button
              onClick={() => setLimit((prev) => prev + 30)}
              className="w-full py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-purple-500/30 transition-all active:scale-[0.98]"
            >
              Load More (+30 of {boards.length - limit} remaining)
            </button>
          )}
        </div>
      );
    }

    if (activeTab === "DICES") {
      return (
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-3xl p-4 flex flex-col items-center text-center shadow-lg">
            <span className="text-3xl mb-2 animate-bounce">🎲</span>
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-widest">DICE WORKSHOP</h3>
            <p className="text-[9px] text-purple-200 mt-1 max-w-[280px] leading-relaxed">
              Roll, upgrade, configure visual effects, and change audio presets in the active Dice Arena.
            </p>
            <button
              onClick={onOpenDiceWorkshop}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-transform"
            >
              Open Workshop ⚙️
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {diceItems.slice(0, 10).map((d) => {
              const isEquipped = d.id === equippedDiceId;
              return (
                <div
                  key={d.id}
                  className={`bg-purple-950/80 border-2 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-lg ${
                    isEquipped ? "border-amber-400 glow-gold-border" : "border-purple-500/35"
                  }`}
                >
                  <div className="my-2.5">
                    <DiceFace value={6} size={48} diceId={d.id} />
                  </div>
                  <span className="text-[10px] font-black text-white mb-2 truncate w-full">{d.name}</span>
                  <span className="text-[8px] font-black text-purple-300 uppercase bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-500/20 mb-2">
                    {d.rarity}
                  </span>

                  {d.isUnlocked ? (
                    isEquipped ? (
                      <span className="w-full text-center text-[7.5px] font-black text-amber-400 uppercase bg-black/50 py-1.5 rounded-xl border border-amber-400/40">
                        EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          equipDice(d.id);
                          triggerToast(`✨ Equipped: ${d.name}`);
                        }}
                        className="w-full py-1.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:brightness-110 text-white border border-purple-500 text-[8.5px] font-black uppercase rounded-xl active:scale-95 transition-all shadow"
                      >
                        EQUIP
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => {
                        const success = unlockDice(d.id);
                        if (success) {
                          confetti({ particleCount: 40, spread: 60, colors: ['#FFD700', '#FFA500'] });
                          triggerToast(`✅ Unlocked: ${d.name}`);
                        } else {
                          triggerToast("❌ Insufficient Funds!");
                        }
                      }}
                      className="w-full py-1.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:brightness-110 text-black text-[8.5px] font-bold uppercase rounded-xl active:scale-95 transition-all shadow"
                    >
                      {d.cost.coins ? `🪙 ${d.cost.coins.toLocaleString()}` : `💎 ${d.cost.gems}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="profile" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            INVENTORY
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Global currency display */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-black/30 p-2 rounded-2xl border border-purple-500/10 shadow-inner flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-black/60 border border-amber-500/40 pl-2 pr-3 py-1.5 rounded-xl shadow-md">
            <img src="/assets/images/icons/icon_coin.png" className="w-[16px] h-[16px] object-contain" alt="Coins" />
            <span className="text-[10px] font-black text-amber-400 tracking-wider truncate font-mono">
              {userCoins.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 border border-blue-500/40 pl-2 pr-3 py-1.5 rounded-xl shadow-md">
            <img src="/assets/images/icons/icon_diamond.png" className="w-[16px] h-[16px] object-contain" alt="Gems" />
            <span className="text-[10px] font-black text-blue-400 tracking-wider truncate font-mono">
              {userGems.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tabs: TOKENS / FRAMES / BOARDS / DICES */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl flex-shrink-0">
          {(["TOKENS", "FRAMES", "BOARDS", "DICES"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white shadow-lg border border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List render */}
        <div className="flex-1 pb-6">{renderList()}</div>
      </div>

      {/* Floating toast */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[200] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 rounded-xl shadow-lg animate-bounce text-center min-w-[200px]">
          <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase select-none">
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
};
export default InventoryPage;
