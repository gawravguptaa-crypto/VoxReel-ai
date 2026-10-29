import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 px-6 py-12 text-center select-none overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tagline */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-medium z-10 animate-fade-in">
        <Sparkles className="w-3.5 h-3.5 text-pink-400" />
        <span>Social Media • Short-Videos • AI Voice Assistant</span>
      </div>

      {/* Hero Brand Identity */}
      <div className="flex flex-col items-center my-auto z-10">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 transform hover:scale-105 transition-transform">
            <span className="font-black text-white text-4xl tracking-tighter">VR</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-indigo-500 to-pink-500 opacity-25 blur-lg -z-10 animate-pulse" />
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl mb-2">
          VoxReel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">AI</span>
        </h1>

        <p className="text-slate-300 text-sm max-w-xs leading-relaxed">
          On-demand voice control for Indian students & creators. Watch reels, launch apps, and learn without unsolicited interruptions.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">🗣️ Hindi & Hinglish</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">📱 Real App Launching</span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">🎓 Study Mode</span>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-xs z-10 space-y-3">
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-500">
          User-controlled audio • Strict no-unsolicited speech policy
        </p>
      </div>
    </div>
  );
};
