import React, { useState } from 'react';

interface TermsPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'TERMS' | 'REFUND' | 'PRIVACY';
}

export const TermsPolicyModal: React.FC<TermsPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'TERMS',
}) => {
  const [activeTab, setActiveTab] = useState<'TERMS' | 'REFUND' | 'PRIVACY'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      {/* Outer Card with luxury golden border background */}
      <div 
        className="w-full max-w-[380px] h-[520px] bg-gradient-to-b from-[#1D0933]/95 via-[#12061F]/98 to-[#0D0A1C]/99 rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white relative animate-in fade-in zoom-in-95 duration-200 p-6 pt-8 border border-yellow-500/25 flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 bg-gradient-to-b from-red-500 to-rose-600 border-[2px] border-yellow-400 rounded-xl flex items-center justify-center text-white font-black text-lg hover:brightness-110 active:scale-95 transition-transform z-[1010] shadow-md shadow-black/50"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-4 flex-shrink-0">
          <h2 className="text-sm font-black tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent uppercase">
            ⚖️ Legal Documents
          </h2>
          <p className="text-[8px] text-purple-300 uppercase tracking-widest mt-0.5">Ludo Legends Policy Hub</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-black/40 border border-purple-900/35 p-1 rounded-2xl mb-4 flex-shrink-0">
          {(['TERMS', 'REFUND', 'PRIVACY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md'
                  : 'text-purple-300/80 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'TERMS' ? 'Terms' : tab === 'REFUND' ? 'Refund' : 'Privacy'}
            </button>
          ))}
        </div>

        {/* Scrollable Contents Pane */}
        <div className="flex-1 overflow-y-auto pr-1 no-scrollbar text-gray-200 text-[10px] space-y-3 leading-relaxed">
          {activeTab === 'TERMS' && (
            <div className="animate-in fade-in duration-200 space-y-3">
              <h3 className="font-extrabold text-amber-300 text-xs uppercase">1. Acceptance of Terms</h3>
              <p>By registering or using the Ludo Legends platform, you agree to these Terms of Service. If you do not agree, do not use the services.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">2. User Account</h3>
              <p>You must maintain the security of your guest credentials, linked email, or authentication tokens. Any action performed under your account ID is your responsibility.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">3. Fair Play Policy</h3>
              <p>Cheating, using third-party mods, abusing bugs, or attempting to hack game files is strictly prohibited. Violation will result in permanent account ban and forfeiture of balances.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">4. Virtual Currencies</h3>
              <p>Coins, Gems, and Crowns are virtual game items. They hold no real-world monetary value except under our official reward redemption guidelines.</p>
            </div>
          )}

          {activeTab === 'REFUND' && (
            <div className="animate-in fade-in duration-200 space-y-3">
              <h3 className="font-extrabold text-amber-300 text-xs uppercase">1. Digital Purchases</h3>
              <p>All in-app purchases of virtual items (Coins, Gems, Crowns) are instant, final, and non-refundable once successfully delivered to your game account wallet.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">2. Failed Transactions</h3>
              <p>If your money is deducted from your bank/UPI but the coins/gems/crowns are not added, Razorpay will automatically refund the transaction to your source account within 5-7 business days.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">3. Disputes</h3>
              <p>For any transaction issues, please email our support team at <span className="text-yellow-400 font-mono">support@ludolegends.com</span> with your Payment ID and Registered Player ID.</p>
            </div>
          )}

          {activeTab === 'PRIVACY' && (
            <div className="animate-in fade-in duration-200 space-y-3">
              <h3 className="font-extrabold text-amber-300 text-xs uppercase">1. Information We Collect</h3>
              <p>We store basic account details: username, link credentials, game progress (XP, level), match history, and transaction records to enable multiplayer services.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">2. Security of Data</h3>
              <p>Your user profile statistics, friends list, and coin balances are saved securely in your browser cache (localStorage) and synchronized with our Node.js game lobby database.</p>

              <h3 className="font-extrabold text-amber-300 text-xs uppercase">3. Zero Selling Policy</h3>
              <p>We do not sell, rent, or trade your personal details with third-party marketing brokers. All data is strictly used for game matchmaking and streaming features.</p>
            </div>
          )}
        </div>

        {/* Bottom Agree Action Button */}
        <div className="mt-4 pt-3 border-t border-purple-500/20 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-105 active:scale-95 text-slate-950 font-black text-xs uppercase rounded-2xl border border-yellow-300 tracking-wider shadow-lg shadow-yellow-500/10"
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
export default TermsPolicyModal;
