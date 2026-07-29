import React from 'react';

interface CreateAccountProps {
  isRegister?: boolean;
  onToggle: () => void;
}

export const CreateAccount: React.FC<CreateAccountProps> = ({ isRegister = false, onToggle }) => {
  return (
    <div className="text-center text-[14px] font-semibold text-purple-200">
      {isRegister ? (
        <span>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onToggle}
            className="text-amber-400 font-black hover:text-amber-300 hover:underline underline-offset-2 transition-colors ml-1"
          >
            Sign In
          </button>
        </span>
      ) : (
        <span>
          New Player?{' '}
          <button
            type="button"
            onClick={onToggle}
            className="text-amber-400 font-black hover:text-amber-300 hover:underline underline-offset-2 transition-colors ml-1 drop-shadow-sm"
          >
            Create Account
          </button>
        </span>
      )}
    </div>
  );
};
