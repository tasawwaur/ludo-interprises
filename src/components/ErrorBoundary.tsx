import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error in UI:", error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem("ludo_sl_engine_state");
    localStorage.removeItem("ludo_active_match_session");
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#090214] text-white flex flex-col items-center justify-center p-6 z-[9999]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            ⚠️
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent uppercase tracking-wider mb-2">
            Something Went Wrong
          </h1>
          <p className="text-xs text-gray-400 text-center max-w-xs mb-6">
            An unexpected glitch occurred. Don't worry, your progress can be restored.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg border border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            🏠 Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
