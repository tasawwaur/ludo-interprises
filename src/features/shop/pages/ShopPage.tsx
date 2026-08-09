import React, { useState } from "react";
import { useUserStore } from "../../../user/user.store";
import { useFriendsStore } from "../../../store/friends.store";
import { useCosmeticsStore, getFrameSrc } from "../../../store/cosmetics.store";
import { RAW_NAMES_LIST } from "../../../store/player-database.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { TermsPolicyModal } from "../../../components/modal/TermsPolicyModal";
import confetti from "canvas-confetti";

interface ShopPageProps {
  onBack?: () => void;
}

export type ShopTab =
  | "COINS"
  | "DIAMONDS"
  | "CROWNS"
  | "TOKEN"
  | "SNAKE_BOARD"
  | "LUDO_BOARD"
  | "AVATAR_FRAME"
  | "NAME_FRAME"
  | "MSG_FRAME"
  | "TITLE_BADGE"
  | "GIFT";

export const ShopPage: React.FC<ShopPageProps> = ({ onBack }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const [activeTab, setActiveTab] = useState<ShopTab>("COINS");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyInitialTab, setPolicyInitialTab] = useState<'TERMS' | 'REFUND' | 'PRIVACY'>('TERMS');

  // Loaded quantities
  const currentCoins = user?.coins ?? 1000;
  const currentGems = user?.gems ?? 30;
  const currentCrowns = user?.crowns ?? 2;

  // Category Tab Options
  const categoryTabs: { id: ShopTab; label: string; icon: string }[] = [
    { id: "COINS", label: "Coins", icon: "🪙" },
    { id: "DIAMONDS", label: "Gems", icon: "💎" },
    { id: "CROWNS", label: "Crowns", icon: "👑" },
    { id: "TOKEN", label: "Tokens", icon: "♟️" },
    { id: "SNAKE_BOARD", label: "Snake Board", icon: "🐍" },
    { id: "LUDO_BOARD", label: "Ludo Board", icon: "🎲" },
    { id: "AVATAR_FRAME", label: "Avatar Frame", icon: "🖼️" },
    { id: "NAME_FRAME", label: "Name Frame", icon: "📛" },
    { id: "MSG_FRAME", label: "Msg Frame", icon: "💬" },
    { id: "TITLE_BADGE", label: "Title Badge", icon: "🎖️" },
    { id: "GIFT", label: "Gifts", icon: "🎁" },
  ];

  // Coin packages (purchased via real INR money)
  const coinPacks = [
    { id: "c1", label: "Pouch of Coins", amount: 10000, displayAmt: "10K", price: "₹30.00", img: "/assets/images/icons/icon_coin.png", isPopular: false, offerText: null, multiplier: 1.0 },
    { id: "c2", label: "Pile of Gold", amount: 50000, displayAmt: "50K", price: "₹150.00", img: "/assets/images/icons/icon_coin.png", isPopular: true, offerText: "100% OFF (DOUBLE)", multiplier: 2.0 },
    { id: "c3", label: "Treasure Chest", amount: 250000, displayAmt: "250K", price: "₹600.00", img: "/assets/images/icons/luxury_chest.png", isPopular: false, offerText: "120% OFF (2.2x)", multiplier: 2.2 },
    { id: "c4", label: "Pharaoh Vault", amount: 1000000, displayAmt: "1M", price: "₹2000.00", img: "/assets/images/icons/luxury_chest.png", isPopular: false, isBest: true, offerText: "150% OFF (2.5x)", multiplier: 2.5 },
  ];

  // Diamond packages (purchased via real INR money)
  const diamondPacks = [
    { id: "d1", label: "Handful of Gems", amount: 100, displayAmt: "100", price: "₹30.00", img: "/assets/images/icons/icon_diamond.png", isPopular: false, offerText: null, multiplier: 1.0 },
    { id: "d2", label: "Diamond Cache", amount: 500, displayAmt: "500", price: "₹150.00", img: "/assets/images/icons/icon_diamond.png", isPopular: true, offerText: "100% OFF (DOUBLE)", multiplier: 2.0 },
    { id: "d3", label: "Royal Satchel", amount: 2500, displayAmt: "2.5K", price: "₹600.00", img: "/assets/images/icons/icon_diamond.png", isPopular: false, offerText: "120% OFF (2.2x)", multiplier: 2.2 },
    { id: "d4", label: "Emperor Vault", amount: 10000, displayAmt: "10K", price: "₹2000.00", img: "/assets/images/icons/icon_diamond.png", isPopular: false, isBest: true, offerText: "150% OFF (2.5x)", multiplier: 2.5 },
  ];

  // Crowns packages (purchased via real INR money)
  const crownPacks = [
    { id: "cr1", label: "Starter Crowns Pack", amount: 50, price: "₹50.00", img: "/assets/images/icons/icon_gem.png", filter: "hue-rotate-[15deg] brightness-[0.7] sepia-[0.5]", isPopular: false, offerText: null, multiplier: 1.0 },
    { id: "cr2", label: "Standard Crowns Pack", amount: 500, price: "₹500.00", img: "/assets/images/icons/icon_gem.png", filter: "saturate-[0.1] brightness-[1.3]", isPopular: false, offerText: null, multiplier: 1.0 },
    { id: "cr3", label: "Elite Crowns Pack", amount: 1000, price: "₹950.00", img: "/assets/images/icons/icon_gem.png", filter: "brightness-[1.1] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]", isPopular: true, offerText: "5% OFF", multiplier: 1.0 },
    { id: "cr4", label: "Imperial Crowns Vault", amount: 5000, price: "₹4500.00", img: "/assets/images/icons/icon_gem.png", filter: "hue-rotate-[130deg] brightness-[1.2] drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]", isPopular: false, isBest: true, offerText: "10% OFF", multiplier: 1.0 },
  ];

  // Custom Item Catalog Definitions
  interface CustomShopItem {
    id: string;
    name: string;
    cost: string;
    currency: "COIN" | "GEM" | "CROWN";
    val: number;
    badge: string;
    icon: string;
    imgPreview?: string;
    gifAnimation?: string;
    description?: string;
    duration?: string;
  }

  const customCatalogs: Record<string, CustomShopItem[]> = {
    TOKEN: [
      { id: "t1", name: "Royal Golden Pawn", cost: "2,000 Coins", currency: "COIN", val: 2000, badge: "HOT", icon: "♟️" },
      { id: "t2", name: "Cyber Neon Token", cost: "50 Gems", currency: "GEM", val: 50, badge: "NEW", icon: "🔮" },
      { id: "t3", name: "Imperial Ruby Token", cost: "5 Crowns", currency: "CROWN", val: 5, badge: "VIP", icon: "👑" },
      { id: "t4", name: "Pharaoh Dragon Token", cost: "10,000 Coins", currency: "COIN", val: 10000, badge: "BEST", icon: "🐉" },
    ],
    SNAKE_BOARD: [
      { id: "sb1", name: "Classic Jungle Board", cost: "3,000 Coins", currency: "COIN", val: 3000, badge: "POPULAR", icon: "🐍" },
      { id: "sb2", name: "Pharaoh Gold Arena", cost: "15,000 Coins", currency: "COIN", val: 15000, badge: "RARE", icon: "🏺" },
      { id: "sb3", name: "Neon Matrix Snakes", cost: "100 Gems", currency: "GEM", val: 100, badge: "EPIC", icon: "⚡" },
      { id: "sb4", name: "Royal Kingdom Realm", cost: "20 Crowns", currency: "CROWN", val: 20, badge: "LEGENDARY", icon: "🏰" },
    ],
    LUDO_BOARD: [
      { id: "lb1", name: "Marble Palace Arena", cost: "5,000 Coins", currency: "COIN", val: 5000, badge: "POPULAR", icon: "🏛️" },
      { id: "lb2", name: "Golden Galaxy Board", cost: "20,000 Coins", currency: "COIN", val: 20000, badge: "RARE", icon: "✨" },
      { id: "lb3", name: "Cyberpunk Glow Realm", cost: "150 Gems", currency: "GEM", val: 150, badge: "EPIC", icon: "🌐" },
      { id: "lb4", name: "Diamond Throne Board", cost: "30 Crowns", currency: "CROWN", val: 30, badge: "LEGENDARY", icon: "💎" },
    ],
    AVATAR_FRAME: [
      {
        id: "frame_default",
        name: "Classic Gold Profile Frame",
        cost: "Free",
        currency: "COIN",
        val: 0,
        badge: "CLASSIC",
        icon: "DEFAULT_FRAME",
        imgPreview: "/assets/images/icons/profile_frame_v3.png",
        description: "Original Classic Gold Home Profile Avatar Frame",
        duration: "Forever"
      },
      {
        id: "royal_vip_frame",
        name: "Royal VIP Crown Frame",
        cost: "100,000 Coins",
        currency: "COIN",
        val: 100000,
        badge: "EXCLUSIVE VIP",
        icon: "CROWN_FRAME",
        imgPreview: "/assets/images/shop/luxury_avatar_frame.svg",
        description: "Regal 24K Gold Braided Ring with Imperial Wings, Amethyst Gems, and Royal VIP Medallion",
        duration: "Forever"
      },
      {
        id: "imperial_crown_frame",
        name: "3D Imperial Gold Crown Frame",
        cost: "100,000 Coins",
        currency: "COIN",
        val: 100000,
        badge: "ULTRA VIP",
        icon: "IMPERIAL_CROWN",
        imgPreview: "/assets/images/shop/user_crown_frame_transparent.png",
        description: "Original 3D Imperial Gold Crown Frame with Corner Diamonds and Carved Gold Filigree",
        duration: "Forever"
      }
    ],
    NAME_FRAME: [
      { id: "nf1", name: "Golden Banner Plate", cost: "2,000 Coins", currency: "COIN", val: 2000, badge: "POPULAR", icon: "📜" },
      { id: "nf2", name: "Neon Cyber Tag", cost: "100 Gems", currency: "GEM", val: 100, badge: "EPIC", icon: "🏷️" },
      { id: "nf3", name: "Emperor Gold Crest", cost: "25 Crowns", currency: "CROWN", val: 25, badge: "LEGENDARY", icon: "🏅" },
      { id: "nf4", name: "Royal Velvet Banner", cost: "12,000 Coins", currency: "COIN", val: 12000, badge: "RARE", icon: "🎖️" },
    ],
    MSG_FRAME: [
      { id: "mf1", name: "Golden Chat Bubble", cost: "1,000 Coins", currency: "COIN", val: 1000, badge: "HOT", icon: "💬" },
      { id: "mf2", name: "Neon Cyber Bubble", cost: "50 Gems", currency: "GEM", val: 50, badge: "NEW", icon: "💭" },
      { id: "mf3", name: "Crown Emperor Chat", cost: "10 Crowns", currency: "CROWN", val: 10, badge: "VIP", icon: "👑" },
      { id: "mf4", name: "Fire Spark Bubble", cost: "6,000 Coins", currency: "COIN", val: 6000, badge: "POPULAR", icon: "💥" },
    ],
    TITLE_BADGE: [
      { id: "tb1", name: "Ludo Master Badge", cost: "5,000 Coins", currency: "COIN", val: 5000, badge: "POPULAR", icon: "🥇" },
      { id: "tb2", name: "Unstoppable Warlord", cost: "200 Gems", currency: "GEM", val: 200, badge: "EPIC", icon: "⚡" },
      { id: "tb3", name: "King of Ludo Title", cost: "50 Crowns", currency: "CROWN", val: 50, badge: "LEGENDARY", icon: "👑" },
      { id: "tb4", name: "Supreme Champion", cost: "25,000 Coins", currency: "COIN", val: 25000, badge: "BEST", icon: "🏆" },
    ],
    GIFT: [],
  };

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const initiatePayment = async (pack: { label: string; amount: number; price: string; multiplier: number; offerText: string | null }, type: "COINS" | "DIAMONDS" | "CROWNS") => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      const priceNumeric = parseFloat(pack.price.replace(/[^\d.]/g, ""));
      if (isNaN(priceNumeric) || priceNumeric <= 0) {
        triggerToast("❌ Invalid pack price!");
        setIsProcessingPayment(false);
        return;
      }

      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        triggerToast("❌ Failed to load payment gateway SDK!");
        setIsProcessingPayment(false);
        return;
      }

      // 2. Create order on backend
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: priceNumeric,
          packageName: pack.label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order on server");
      }

      const orderData = await response.json();

      // 3. Open Razorpay payment sheet
      const options = {
        key: orderData.keyId,
        amount: Math.round(priceNumeric * 100), // in paise
        currency: orderData.currency || "INR",
        name: "LUDO Enterprise",
        description: `Purchase: ${pack.label}`,
        order_id: orderData.orderId,
        handler: async function (paymentRes: any) {
          triggerToast("🔄 Verifying payment...");
          try {
            const verifyRes = await fetch("/api/payments/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId: paymentRes.razorpay_payment_id,
                orderId: paymentRes.razorpay_order_id,
                signature: paymentRes.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              const finalAmt = Math.round(pack.amount * pack.multiplier);
              // 4. Update state upon successful verification
              if (type === "COINS") {
                updateUser({ coins: currentCoins + finalAmt });
                confetti({ particleCount: 50, spread: 60, colors: ["#FFD700", "#FFA500"] });
                triggerToast(`✅ ${pack.label} purchased! +${finalAmt.toLocaleString()} Coins`);
              } else if (type === "DIAMONDS") {
                updateUser({ gems: currentGems + finalAmt });
                confetti({ particleCount: 50, spread: 60, colors: ["#818CF8", "#6366F1"] });
                triggerToast(`✅ ${pack.label} purchased! +${finalAmt.toLocaleString()} Gems`);
              } else if (type === "CROWNS") {
                updateUser({ crowns: currentCrowns + finalAmt });
                confetti({ particleCount: 50, spread: 60, colors: ["#FFD700", "#FFA500", "#9333EA"] });
                triggerToast(`✅ ${pack.label} purchased! +${finalAmt.toLocaleString()} Crowns 👑`);
              }
            } else {
              triggerToast("❌ Payment verification failed!");
            }
          } catch (err: any) {
            console.error(err);
            triggerToast("❌ Verification error: " + err.message);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.displayName || user?.username || "Ludo Player",
          email: user?.email || "player@ludolegends.com",
        },
        theme: {
          color: "#D97706",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            triggerToast("⚠️ Payment cancelled.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failRes: any) {
        console.error("Payment failed:", failRes.error);
        triggerToast("❌ Payment failed: " + (failRes.error.description || "Transaction failed"));
        setIsProcessingPayment(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      triggerToast("❌ Error initiating payment: " + err.message);
      setIsProcessingPayment(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBuyCoins = (amount: number, label: string) => {
    const pack = coinPacks.find((p) => p.label === label);
    if (pack) {
      initiatePayment(pack, "COINS");
    } else {
      confetti({ particleCount: 40, spread: 60, colors: ['#FFD700', '#FFA500'] });
      updateUser({ coins: currentCoins + amount });
      triggerToast(`✅ ${label} purchased! +${amount.toLocaleString()} Coins`);
    }
  };

  const handleBuyDiamonds = (amount: number, label: string) => {
    const pack = diamondPacks.find((p) => p.label === label);
    if (pack) {
      initiatePayment(pack, "DIAMONDS");
    } else {
      confetti({ particleCount: 40, spread: 60, colors: ['#818CF8', '#6366F1'] });
      updateUser({ gems: currentGems + amount });
      triggerToast(`✅ ${label} purchased! +${amount.toLocaleString()} Gems`);
    }
  };

  const handleBuyCrowns = (amount: number, label: string) => {
    const pack = crownPacks.find((p) => p.label === label);
    if (pack) {
      initiatePayment({
        label: pack.label,
        amount: pack.amount,
        price: pack.price,
        multiplier: 1.0,
        offerText: pack.offerText
      }, "CROWNS");
    } else {
      confetti({ particleCount: 50, spread: 70, colors: ['#FFD700', '#FFA500', '#9333EA'] });
      updateUser({ crowns: currentCrowns + amount });
      triggerToast(`✅ ${label} purchased! +${amount.toLocaleString()} Crowns 👑`);
    }
  };

  const [showCarAnimationModal, setShowCarAnimationModal] = useState(false);

  const handleBuyCustomItem = (item: CustomShopItem) => {
    if (item.currency === "COIN") {
      if (currentCoins < item.val) {
        triggerToast("❌ Insufficient Coins balance!");
        return;
      }
      updateUser({ coins: currentCoins - item.val });
    } else if (item.currency === "GEM") {
      if (currentGems < item.val) {
        triggerToast("❌ Insufficient Gems balance!");
        return;
      }
      updateUser({ gems: currentGems - item.val });
    } else if (item.currency === "CROWN") {
      if (currentCrowns < item.val) {
        triggerToast("❌ Insufficient Crowns balance!");
        return;
      }
      updateUser({ crowns: currentCrowns - item.val });
    }

    if (activeTab === "AVATAR_FRAME" || item.id === "royal_vip_frame") {
      updateUser({ equippedFrame: item.id });
      useCosmeticsStore.getState().equipItem(item.id, "FRAME");
    }

    confetti({ particleCount: 60, spread: 80, colors: ["#FFD700", "#F59E0B", "#8B5CF6", "#38BDF8"] });
    triggerToast(`🎉 Unlocked & Equipped ${item.name} Permanently!`);
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Shop Background */}
      <LudoPageBackground variant="shop" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-xl font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text flex items-center gap-1.5">
            <span>🛒</span> VIP SHOP
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* ── EXPANDED CURRENCY BAR PILLS (Coins, Gems, and Crowns) ── */}
        <div className="grid grid-cols-3 gap-2 mb-3 bg-black/30 p-2 rounded-2xl border border-purple-500/10 shadow-inner flex-shrink-0">
          {/* Coins balance */}
          <div className="flex items-center gap-1 bg-black/60 border border-amber-500/40 pl-1.5 pr-2.5 py-1.5 rounded-xl shadow-md flex-1">
            <img src="/assets/images/icons/icon_coin.png" className="w-[18px] h-[18px] object-contain" alt="Coins" />
            <span className="text-[9px] font-black text-amber-400 tracking-wider truncate font-mono">
              {currentCoins.toLocaleString()}
            </span>
          </div>

          {/* Diamonds balance */}
          <div className="flex items-center gap-1 bg-black/60 border border-blue-500/40 pl-1.5 pr-2.5 py-1.5 rounded-xl shadow-md flex-1">
            <img src="/assets/images/icons/icon_diamond.png" className="w-[18px] h-[18px] object-contain" alt="Gems" />
            <span className="text-[9px] font-black text-blue-400 tracking-wider truncate font-mono">
              {currentGems.toLocaleString()}
            </span>
          </div>

          {/* Crowns balance */}
          <div className="flex items-center gap-1 bg-black/60 border border-purple-500/40 pl-1.5 pr-2.5 py-1.5 rounded-xl shadow-md flex-1">
            <img src="/assets/images/icons/icon_gem.png" className="w-[18px] h-[18px] object-contain" alt="Crowns" />
            <span className="text-[9px] font-black text-purple-300 tracking-wider truncate font-mono">
              {currentCrowns.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── SCROLLABLE LUXURY CATEGORY TABS (11 CATEGORIES) ── */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-black/60 border border-purple-500/30 mb-4 flex-shrink-0 shadow-2xl">
          {categoryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-[9.5px] font-black tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200 scale-[1.03]"
                    : "bg-purple-950/40 text-gray-300 hover:text-white border border-purple-500/20 hover:bg-purple-900/40"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Packs / Items Grid List */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* COINS SECTION */}
          {activeTab === "COINS" &&
            coinPacks.map((p) => (
              <div
                key={p.id}
                onClick={() => handleBuyCoins(p.amount, p.label)}
                className="bg-purple-950/60 border-2 border-amber-500/30 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-lg hover:border-amber-400 active:scale-95 transition-all cursor-pointer group"
              >
                {p.offerText && (
                  <span className="absolute -top-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full border border-orange-300 shadow animate-pulse z-30">
                    {p.offerText}
                  </span>
                )}
                {!p.offerText && p.isPopular && (
                  <span className="absolute -top-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                    POPULAR
                  </span>
                )}
                {!p.offerText && p.isBest && (
                  <span className="absolute -top-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300 shadow">
                    BEST VALUE
                  </span>
                )}
                
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest mt-1 block leading-none">
                  {p.label}
                </span>

                <div className="w-20 h-20 flex items-center justify-center my-3 relative">
                  <div className="absolute inset-0 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
                  <img
                    src={p.img}
                    alt={p.label}
                    className="w-[64px] h-[64px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-float-mid"
                  />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white font-mono leading-none">
                    +{p.amount.toLocaleString()} 🪙
                  </span>
                  {p.multiplier > 1.0 && (
                    <span className="text-[8.5px] font-bold text-green-400 font-mono leading-none">
                      +{Math.round(p.amount * (p.multiplier - 1.0)).toLocaleString()} Bonus
                    </span>
                  )}
                  <button className="w-full py-2 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] rounded-2xl shadow border border-yellow-200 mt-1 uppercase">
                    {p.price}
                  </button>
                </div>
              </div>
            ))}

          {/* DIAMONDS SECTION */}
          {activeTab === "DIAMONDS" &&
            diamondPacks.map((p) => (
              <div
                key={p.id}
                onClick={() => handleBuyDiamonds(p.amount, p.label)}
                className="bg-purple-950/60 border-2 border-blue-500/30 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-lg hover:border-blue-400 active:scale-95 transition-all cursor-pointer group"
              >
                {p.offerText && (
                  <span className="absolute -top-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-full border border-orange-300 shadow animate-pulse z-30">
                    {p.offerText}
                  </span>
                )}
                {!p.offerText && p.isPopular && (
                  <span className="absolute -top-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                    POPULAR
                  </span>
                )}
                {!p.offerText && p.isBest && (
                  <span className="absolute -top-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300 shadow">
                    BEST VALUE
                  </span>
                )}
                
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1 block leading-none">
                  {p.label}
                </span>

                <div className="w-20 h-20 flex items-center justify-center my-3 relative">
                  <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                  <img
                    src={p.img}
                    alt={p.label}
                    className="w-[64px] h-[64px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-float-mid"
                  />
                </div>

                <div className="w-full flex flex-col gap-1">
                  <span className="text-[10px] font-black text-white font-mono leading-none">
                    +{p.amount.toLocaleString()} 💎
                  </span>
                  {p.multiplier > 1.0 && (
                    <span className="text-[8.5px] font-bold text-green-400 font-mono leading-none">
                      +{Math.round(p.amount * (p.multiplier - 1.0)).toLocaleString()} Bonus
                    </span>
                  )}
                  <button className="w-full py-2 bg-gradient-to-r from-blue-400 via-indigo-600 to-blue-500 text-white font-black text-[11px] rounded-2xl shadow border border-blue-300 mt-1 uppercase">
                    {p.price}
                  </button>
                </div>
              </div>
            ))}

          {/* CROWNS SECTION */}
          {activeTab === "CROWNS" && (
            <>
              <div className="col-span-2 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-2 border-amber-500/40 p-3 rounded-2xl text-center mb-1 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest block">👑 CROWN CONVERSION VALUE 👑</span>
                <span className="text-[11px] font-black text-white block mt-0.5">1 Crown = ₹1.00 INR Cash Reward</span>
              </div>
              
              {crownPacks.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleBuyCrowns(p.amount, p.label)}
                  className="bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-lg hover:border-purple-400 active:scale-95 transition-all cursor-pointer group"
                >
                  {p.isPopular && (
                    <span className="absolute -top-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                      POPULAR
                    </span>
                  )}
                  {p.isBest && (
                    <span className="absolute -top-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-300 shadow">
                      ELITE VIP
                    </span>
                  )}
                  
                  <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest mt-1 block leading-none">
                    {p.label}
                  </span>

                  <div className="w-20 h-20 flex items-center justify-center my-3 relative">
                    <div className="absolute inset-0 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
                    <img
                      src={p.img}
                      alt={p.label}
                      className={`w-[60px] h-[60px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] animate-float-mid ${p.filter}`}
                    />
                  </div>

                  <div className="w-full flex flex-col gap-1">
                    <span className="text-[10px] font-black text-amber-200 uppercase tracking-wide leading-none">
                      Unlocks {p.amount} 👑
                    </span>
                    <span className="text-[8.5px] font-bold text-green-400 leading-none">
                      Value: ₹{p.amount}.00
                    </span>
                    <button className="w-full py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-black text-[10px] rounded-2xl shadow border border-purple-500 mt-1 uppercase">
                      {p.price}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* CUSTOM CATEGORY ITEMS SECTION (TOKEN, SNAKE_BOARD, LUDO_BOARD, AVATAR_FRAME, NAME_FRAME, MSG_FRAME, TITLE_BADGE, GIFT) */}
          {activeTab !== "COINS" && activeTab !== "DIAMONDS" && activeTab !== "CROWNS" && customCatalogs[activeTab] && (
            customCatalogs[activeTab].length > 0 ? (
              customCatalogs[activeTab].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleBuyCustomItem(item)}
                  className="bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-lg hover:border-amber-400 active:scale-95 transition-all cursor-pointer group"
                >
                  <span className="absolute -top-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-yellow-200 shadow">
                    {item.badge}
                  </span>

                  <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider mt-1.5 block leading-none">
                    {item.name}
                  </span>

                  <div className="w-24 h-24 flex items-center justify-center my-2 relative">
                    <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors"></div>
                    {item.imgPreview || item.gifAnimation ? (
                      <img
                        src={item.gifAnimation || item.imgPreview}
                        alt={item.name}
                        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-110 duration-200"
                      />
                    ) : item.icon === "CAR_HYPER" ? (
                      <div className="scale-90 transition-transform group-hover:scale-105 duration-200">
                        {/* ── REALISTIC ANIMATED LUXURY HYPERCAR ── */}
                        <div className="relative w-[130px] h-[64px] flex items-center justify-center select-none pointer-events-none">
                          {/* Ground Neon Underglow */}
                          <div className="absolute bottom-1 left-2 right-2 h-3 bg-gradient-to-r from-amber-500/40 via-cyan-400/60 to-yellow-500/40 blur-md animate-pulse"></div>

                          {/* Speed lines on ground */}
                          <div className="absolute bottom-0 left-0 right-0 flex gap-2 justify-between opacity-70">
                            <span className="w-4 h-[1.5px] bg-amber-400/80 animate-ping"></span>
                            <span className="w-6 h-[1.5px] bg-cyan-300/80 animate-ping" style={{ animationDelay: '0.3s' }}></span>
                            <span className="w-3 h-[1.5px] bg-yellow-400/80 animate-ping" style={{ animationDelay: '0.6s' }}></span>
                          </div>

                          {/* SVG Hypercar Body */}
                          <svg className="w-full h-full drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] overflow-visible" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFF099" />
                                <stop offset="35%" stopColor="#F59E0B" />
                                <stop offset="70%" stopColor="#78350F" />
                                <stop offset="100%" stopColor="#1E1B4B" />
                              </linearGradient>
                              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#0369A1" stopOpacity="0.6" />
                              </linearGradient>
                              <linearGradient id="chromeRim" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="50%" stopColor="#F59E0B" />
                                <stop offset="100%" stopColor="#451A03" />
                              </linearGradient>
                            </defs>

                            {/* Headlight Beam Cone extending forward */}
                            <polygon points="195,68 245,50 245,86" fill="url(#glassGrad)" opacity="0.35" className="animate-pulse" />
                            <line x1="195" y1="68" x2="245" y2="68" stroke="#38BDF8" strokeWidth="3" />

                            {/* Exhaust Flame Tail */}
                            <polygon points="12,74 -18,70 -12,74 -22,78 -8,75" fill="#EF4444" className="animate-ping" />
                            <polygon points="10,74 -12,72 -8,74 -16,76" fill="#F59E0B" className="animate-pulse" />

                            {/* Hypercar Chassis Contour Body */}
                            <path
                              d="M 15 75 Q 25 55 45 45 L 85 30 Q 120 20 155 35 L 180 50 Q 205 58 215 68 L 218 78 L 10 78 Z"
                              fill="url(#bodyGrad)"
                              stroke="#FCD34D"
                              strokeWidth="1.5"
                            />

                            {/* Aerodynamic Cockpit Glass Canopy */}
                            <path
                              d="M 68 40 L 95 28 Q 125 22 145 34 L 155 46 Z"
                              fill="url(#glassGrad)"
                              stroke="#7DD3FC"
                              strokeWidth="1.2"
                            />

                            {/* Side Air Intake Vent & Accents */}
                            <path d="M 125 50 L 148 48 L 140 65 L 118 64 Z" fill="#0F172A" opacity="0.85" stroke="#F59E0B" strokeWidth="0.8" />
                            <line x1="30" y1="60" x2="190" y2="60" stroke="#FDE047" strokeWidth="1" strokeDasharray="6 3" />

                            {/* Rear Wing Spoiler */}
                            <path d="M 8 50 L 28 42 L 32 46 L 14 54 Z" fill="#F59E0B" stroke="#FFF" strokeWidth="0.8" />
                            <line x1="18" y1="54" x2="18" y2="70" stroke="#78350F" strokeWidth="2" />

                            {/* Rear Wheel Arch */}
                            <circle cx="52" cy="76" r="23" fill="#090514" stroke="#F59E0B" strokeWidth="1.5" />
                            {/* Front Wheel Arch */}
                            <circle cx="172" cy="76" r="23" fill="#090514" stroke="#F59E0B" strokeWidth="1.5" />

                            {/* ── ROTATING REAR ALLOY WHEEL ── */}
                            <g transform="translate(52, 76)">
                              <g className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '0.6s' }}>
                                <circle cx="0" cy="0" r="18" fill="#1E293B" stroke="url(#chromeRim)" strokeWidth="3" />
                                <circle cx="0" cy="0" r="6" fill="#F59E0B" />
                                <line x1="0" y1="-18" x2="0" y2="18" stroke="#FDE047" strokeWidth="2.5" />
                                <line x1="-17" y1="-6" x2="17" y2="6" stroke="#FDE047" strokeWidth="2.5" />
                                <line x1="-11" y1="14" x2="11" y2="-14" stroke="#FDE047" strokeWidth="2.5" />
                              </g>
                            </g>

                            {/* ── ROTATING FRONT ALLOY WHEEL ── */}
                            <g transform="translate(172, 76)">
                              <g className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '0.6s' }}>
                                <circle cx="0" cy="0" r="18" fill="#1E293B" stroke="url(#chromeRim)" strokeWidth="3" />
                                <circle cx="0" cy="0" r="6" fill="#F59E0B" />
                                <line x1="0" y1="-18" x2="0" y2="18" stroke="#FDE047" strokeWidth="2.5" />
                                <line x1="-17" y1="-6" x2="17" y2="6" stroke="#FDE047" strokeWidth="2.5" />
                                <line x1="-11" y1="14" x2="11" y2="-14" stroke="#FDE047" strokeWidth="2.5" />
                              </g>
                            </g>
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <span className="text-4xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform group-hover:scale-125 duration-200">
                        {item.icon}
                      </span>
                    )}
                  </div>

                  <div className="w-full flex flex-col gap-1 mt-1">
                    <span className="text-[9.5px] font-black text-purple-200 font-mono leading-none">
                      {item.cost}
                    </span>
                    {user?.equippedFrame === item.id ? (
                      <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-[10px] rounded-2xl shadow border border-emerald-300 uppercase flex items-center justify-center gap-1">
                        <span>EQUIPPED</span>
                        <span>✓</span>
                      </button>
                    ) : (
                      <button className={`w-full py-2 font-black text-[10px] rounded-2xl shadow border uppercase transition-all ${
                        item.val === 0 || item.cost === "Free"
                          ? "bg-gradient-to-r from-emerald-400 to-green-500 text-slate-950 border-green-200 hover:brightness-110"
                          : "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 border-yellow-200 hover:brightness-110"
                      }`}>
                        {item.val === 0 || item.cost === "Free" ? "EQUIP FREE 🆓" : "BUY & EQUIP"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-10 flex flex-col items-center justify-center text-center bg-purple-950/40 border border-purple-500/20 rounded-3xl p-4">
                <span className="text-3xl mb-2">🎁</span>
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">No Gifts Available</span>
                <span className="text-[10px] font-bold text-gray-400 mt-1">Please provide the new gifts list to add them here!</span>
              </div>
            )
          )}
        </div>

        {/* Policy Footer Links for Razorpay Compliance */}
        <div className="w-full flex items-center justify-center gap-4 py-4 mt-auto border-t border-purple-500/10 text-[9px] font-black uppercase tracking-wider text-purple-300/40 relative z-20">
          <span onClick={() => { setPolicyInitialTab('TERMS'); setShowPolicyModal(true); }} className="hover:text-amber-400 cursor-pointer transition-colors">Terms of Service</span>
          <span>•</span>
          <span onClick={() => { setPolicyInitialTab('REFUND'); setShowPolicyModal(true); }} className="hover:text-amber-400 cursor-pointer transition-colors">Refund Policy</span>
          <span>•</span>
          <span onClick={() => { setPolicyInitialTab('PRIVACY'); setShowPolicyModal(true); }} className="hover:text-amber-400 cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </div>

      {/* ── FLOATING TOAST BAR ── */}
      {toastMessage && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[200] px-4 py-2 bg-gradient-to-r from-purple-800 to-indigo-900 border-2 border-amber-400 rounded-xl shadow-lg animate-bounce">
          <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase select-none">
            ✨ {toastMessage}
          </span>
        </div>
      )}

      {/* Terms and Refund Policy Modal */}
      <TermsPolicyModal
        isOpen={showPolicyModal}
        initialTab={policyInitialTab}
        onClose={() => setShowPolicyModal(false)}
      />
    </div>
  );
};
