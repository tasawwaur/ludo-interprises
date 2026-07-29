import React, { useState, useRef } from 'react';
import { useUserStore } from '../../user/user.store';
import { Card, Button, Title, Subtitle, Flex, Toast } from '../ui';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRIES = ['🇮🇳', '🇺🇸', '🇬🇧', '🇪🇸', '🇸🇦', '🇴🇲', '🇦🇪', '🇨🇦', '🇦🇺', '🇩🇪'];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);

  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || 'Guest');
  const [avatar, setAvatar] = useState<string | undefined>(user?.avatar);
  const [country, setCountry] = useState(user?.country || '🇮🇳');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !user) return null;

  // Validate Name (3 to 20 chars, alphanumeric + spaces + underscores)
  const validateName = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setErrorMsg('Display Name must be at least 3 characters.');
      return false;
    }
    if (trimmed.length > 20) {
      setErrorMsg('Display Name cannot exceed 20 characters.');
      return false;
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
      setErrorMsg('Only letters, numbers, spaces, and underscores allowed.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayName(val);
    validateName(val);
  };

  // Image Upload & 1:1 Circle Canvas Compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 180;
        canvas.height = 180;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.arc(90, 90, 90, 0, Math.PI * 2);
          ctx.clip();

          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 180, 180);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setAvatar(compressedBase64);
          setToastMsg('Profile photo updated!');
          setTimeout(() => setToastMsg(null), 2000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isChanged =
    displayName.trim() !== (user.displayName || user.username) ||
    avatar !== user.avatar ||
    country !== user.country;

  const isValid = validateName(displayName);

  const handleSave = () => {
    const trimmedName = displayName.trim();
    if (!validateName(trimmedName)) return;

    updateUser({
      displayName: trimmedName,
      avatar,
      country,
    });

    setToastMsg('Profile Settings saved successfully!');
    setTimeout(() => {
      setToastMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <Card variant="solid" className="max-w-md w-full p-6 border-2 border-purple-500/50 shadow-2xl bg-slate-900/95 relative overflow-hidden">
        <Title className="text-2xl text-amber-300 font-black mb-1 text-center">⚙️ PROFILE SETTINGS</Title>
        <Subtitle className="text-purple-200 text-xs mb-6 text-center">Customize your avatar, display name, and country flag</Subtitle>

        {/* Avatar Upload with Camera Button Overlay */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl bg-slate-800 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              {avatar ? (
                <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover transition-opacity duration-500 animate-in fade-in" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>

            {/* Camera Overlay Icon */}
            <button
              type="button"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-slate-900 text-slate-950 font-bold flex items-center justify-center shadow-lg hover:scale-125 transition-transform"
            >
              📷
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <span className="text-[11px] text-slate-400 font-bold mt-2">Tap photo to upload from Gallery</span>
        </div>

        {/* Display Name Input */}
        <div className="mb-4">
          <label className="text-xs font-bold text-amber-300 block mb-1 uppercase tracking-wider">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={handleNameChange}
            maxLength={20}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white font-extrabold text-sm focus:outline-none focus:border-amber-400 shadow-inner"
            placeholder="Enter display name..."
          />
          {errorMsg ? (
            <span className="text-xs text-rose-400 font-bold block mt-1">{errorMsg}</span>
          ) : (
            <span className="text-[10px] text-slate-400 block mt-1">3–20 characters. Letters, numbers, spaces, and underscores.</span>
          )}
        </div>

        {/* Country Flag Selector */}
        <div className="mb-6">
          <label className="text-xs font-bold text-amber-300 block mb-1 uppercase tracking-wider">Country Flag</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {COUNTRIES.map((flag) => (
              <button
                key={flag}
                type="button"
                onClick={() => setCountry(flag)}
                className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center transition-all ${
                  country === flag
                    ? 'bg-amber-400/30 border-2 border-amber-400 scale-110 shadow-lg'
                    : 'bg-slate-950 border border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <Flex className="gap-3">
          <Button variant="glass" size="lg" className="w-1/2" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="neon"
            size="lg"
            className="w-1/2 font-extrabold"
            disabled={!isChanged || !isValid}
            onClick={handleSave}
          >
            Save Profile
          </Button>
        </Flex>
      </Card>

      {toastMsg && <Toast message={toastMsg} type="success" onClose={() => setToastMsg(null)} />}
    </div>
  );
};
