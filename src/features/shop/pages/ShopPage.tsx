import React, { useState } from "react";
import { useUserStore } from "../../../user/user.store";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import confetti from "canvas-confetti";

interface ShopPageProps {
  onBack?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onBack }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const [activeTab, setActiveTab] = useState<"COINS" | "DIAMONDS" | "CROWNS">("COINS");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Loaded quantities
  const currentCoins = user?.coins ?? 1000;
  const currentGems = user?.gems ?? 30;
  const currentCrowns = user?.crowns ?? 2;

  // Coin packages (purchased via real INR money)
  const coinPacks = [
    { id: "c1", label: "Pouch of Coins", amount: 10000, displayAmt: "10K", price: "₹30.00", img: "/assets/images/icons/icon_coin.png", isPopular: false },
    { id: "c2", label: "Pile of Gold", amount: 50000, displayAmt: "50K", price: "₹150.00", img: "/assets/images/icons/icon_coin.png", isPopular: true },
    { id: "c3", label: "Treasure Chest", amount: 250000, displayAmt: "250K", price: "₹600.00", img: "/assets/images/icons/luxury_chest.png", isPopular: false },
    { id: "c4", label: "Pharaoh Vault", amount: 1000000, displayAmt: "1M", price: "₹2000.00", img: "/assets/images/icons/luxury_chest.png", isPopular: false, isBest: true },
  ];

  // Diamond packages (purchased via real INR money)
  const diamondPacks = [
    { id: "d1", label: "Handful of Gems", amount: 100, displayAmt: "100", price: "₹30.00", img: "/assets/images/icons/icon_diamond.png", isPopular: false },
    { id: "d2", label: "Diamond Cache", amount: 500, displayAmt: "500", price: "₹150.00", img: "/assets/images/icons/icon_diamond.png", isPopular: true },
    { id: "d3", label: "Royal Satchel", amount: 2500, displayAmt: "2.5K", price: "₹600.00", img: "/assets/images/icons/icon_diamond.png", isPopular: false },
    { id: "d4", label: "Emperor Vault", amount: 10000, displayAmt: "10K", price: "₹2000.00", img: "/assets/images/icons/icon_diamond.png", isPopular: false, isBest: true },
  ];

  // Crowns packages (purchased via Coins or Diamonds)
  const crownPacks = [
    { id: "cr1", label: "Bronze Crown", costType: "COINS" as const, costAmount: 5000, displayCost: "5,000 Coins", img: "/assets/images/icons/icon_gem.png", filter: "hue-rotate-[15deg] brightness-[0.7] sepia-[0.5]", isPopular: false },
    { id: "cr2", label: "Silver Crown", costType: "COINS" as const, costAmount: 25000, displayCost: "25,000 Coins", img: "/assets/images/icons/icon_gem.png", filter: "saturate-[0.1] brightness-[1.3]", isPopular: true },
    { id: "cr3", label: "Gold Crown", costType: "DIAMONDS" as const, costAmount: 500, displayCost: "500 Gems", img: "/assets/images/icons/icon_gem.png", filter: "brightness-[1.1] drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]", isPopular: false },
    { id: "cr4", label: "Royal Crown", costType: "DIAMONDS" as const, costAmount: 2500, displayCost: "2,500 Gems", img: "/assets/images/icons/icon_gem.png", filter: "hue-rotate-[130deg] brightness-[1.2] drop-shadow-[0_0_10px_rgba(239,68,68,0.7)]", isPopular: false, isBest: true },
  ];

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

  const initiatePayment = async (pack: { label: string; amount: number; price: string }, type: "COINS" | "DIAMONDS") => {
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
              // 4. Update state upon successful verification
              if (type === "COINS") {
                updateUser({ coins: currentCoins + pack.amount });
                confetti({ particleCount: 50, spread: 60, colors: ["#FFD700", "#FFA500"] });
                triggerToast(`✅ ${pack.label} purchased! +${pack.amount.toLocaleString()} Coins`);
              } else {
                updateUser({ gems: currentGems + pack.amount });
                confetti({ particleCount: 50, spread: 60, colors: ["#818CF8", "#6366F1"] });
                triggerToast(`✅ ${pack.label} purchased! +${pack.amount.toLocaleString()} Gems`);
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

  const handleUnlockCrown = (costType: "COINS" | "DIAMONDS", costAmount: number, label: string) => {
    if (costType === "COINS") {
      if (currentCoins < costAmount) {
        triggerToast("❌ Insufficient Coins to purchase this Crown!");
        return;
      }
      updateUser({
        coins: currentCoins - costAmount,
        crowns: currentCrowns + 1
      });
    } else {
      if (currentGems < costAmount) {
        triggerToast("❌ Insufficient Gems to purchase this Crown!");
        return;
      }
      updateUser({
        gems: currentGems - costAmount,
        crowns: currentCrowns + 1
      });
    }
    confetti({ particleCount: 50, spread: 70, colors: ['#FFD700', '#FFA500', '#9333EA'] });
    triggerToast(`✅ ${label} unlocked! 👑`);
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Shop Background */}
      <LudoPageBackground variant="shop" />

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3 overflow-y-auto no-scrollbar">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
        <div className="grid grid-cols-3 gap-2 mb-4 bg-black/30 p-2 rounded-2xl border border-purple-500/10 shadow-inner">
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

        {/* Tabs: COINS / GEMS / CROWNS */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-5 shadow-2xl flex-shrink-0 text-center font-black">
          <button
            onClick={() => setActiveTab("COINS")}
            className={`flex-1 py-2.5 rounded-xl text-[10px] tracking-wider uppercase transition-all ${
              activeTab === "COINS"
                ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <img src="/assets/images/icons/icon_coin.png" className="w-[12px] h-[12px] object-contain" alt="Coins" />
              Coins
            </span>
          </button>
          <button
            onClick={() => setActiveTab("DIAMONDS")}
            className={`flex-1 py-2.5 rounded-xl text-[10px] tracking-wider uppercase transition-all ${
              activeTab === "DIAMONDS"
                ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white shadow-lg border border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <img src="/assets/images/icons/icon_diamond.png" className="w-[12px] h-[12px] object-contain" alt="Gems" />
              Gems
            </span>
          </button>
          <button
            onClick={() => setActiveTab("CROWNS")}
            className={`flex-1 py-2.5 rounded-xl text-[10px] tracking-wider uppercase transition-all ${
              activeTab === "CROWNS"
                ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white shadow-lg border border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <img src="/assets/images/icons/icon_gem.png" className="w-[12px] h-[12px] object-contain" alt="Crowns" />
              Crowns
            </span>
          </button>
        </div>

        {/* Packs grid list */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* COINS SECTION */}
          {activeTab === "COINS" &&
            coinPacks.map((p) => (
              <div
                key={p.id}
                onClick={() => handleBuyCoins(p.amount, p.label)}
                className="bg-purple-950/60 border-2 border-amber-500/30 rounded-3xl p-3 flex flex-col items-center justify-between text-center relative shadow-lg hover:border-amber-400 active:scale-95 transition-all cursor-pointer group"
              >
                {p.isPopular && (
                  <span className="absolute -top-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                    POPULAR
                  </span>
                )}
                {p.isBest && (
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
                  <span className="text-[11px] font-black text-white font-mono leading-none">
                    +{p.amount.toLocaleString()} 🪙
                  </span>
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
                {p.isPopular && (
                  <span className="absolute -top-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                    POPULAR
                  </span>
                )}
                {p.isBest && (
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
                  <span className="text-[11px] font-black text-white font-mono leading-none">
                    +{p.amount.toLocaleString()} 💎
                  </span>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-400 via-indigo-600 to-blue-500 text-white font-black text-[11px] rounded-2xl shadow border border-blue-300 mt-1 uppercase">
                    {p.price}
                  </button>
                </div>
              </div>
            ))}

          {/* CROWNS SECTION */}
          {activeTab === "CROWNS" &&
            crownPacks.map((p) => (
              <div
                key={p.id}
                onClick={() => handleUnlockCrown(p.costType, p.costAmount, p.label)}
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
                    Unlocks 👑
                  </span>
                  <button className="w-full py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white font-black text-[10px] rounded-2xl shadow border border-purple-500 mt-1 uppercase">
                    {p.displayCost}
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
};
