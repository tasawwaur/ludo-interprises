import React from 'react';

interface UserInfoProps {
  displayName: string;
  userId?: string;
  league?: string;
  country?: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  displayName,
  userId = '93847283',
  league = 'Diamond II',
  country = '🇮🇳',
}) => {
  return (
    <div className="flex flex-col text-left">
      {/* Username 22px bold white */}
      <h2 className="text-[22px] font-black text-white leading-tight truncate max-w-[170px] drop-shadow-md">
        {displayName}
      </h2>

      {/* User ID & Country */}
      <span className="text-xs font-bold text-purple-200 mt-0.5 flex items-center gap-1.5">
        <span>ID : {userId}</span>
        <span>{country}</span>
      </span>

      {/* League Badge */}
      <span className="text-xs font-black text-blue-400 mt-1 flex items-center gap-1">
        <span>🏆 League : {league}</span>
      </span>
    </div>
  );
};
