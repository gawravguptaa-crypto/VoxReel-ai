import React from 'react';
import { Home, PlaySquare, GraduationCap, LayoutGrid, Settings, Mic } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenVoice: () => void;
  isListening: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenVoice,
  isListening,
}) => {
  return (
    <nav aria-label="Bottom Navigation" className="w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 select-none z-30 sticky bottom-0">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          aria-label="Home tab"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">Home</span>
        </button>

        {/* Tab 2: Video Feed */}
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          aria-label="Video Feed tab"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'feed'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlaySquare className={`w-5 h-5 ${currentTab === 'feed' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">Reels</span>
        </button>

        {/* Central Floating Voice AI Button */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            type="button"
            onClick={onOpenVoice}
            aria-label="Open Voice Assistant"
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/50 scale-105 animate-pulse'
                : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:opacity-95 shadow-indigo-600/40'
            }`}
          >
            <Mic className={`w-6 h-6 text-white ${isListening ? 'animate-bounce' : ''}`} />
          </button>
          <span className="text-[10px] font-bold text-slate-300 mt-0.5 tracking-tight">Voice AI</span>
        </div>

        {/* Tab 3: Study Mode */}
        <button
          type="button"
          onClick={() => onTabChange('study')}
          aria-label="Study Mode tab"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'study'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className={`w-5 h-5 ${currentTab === 'study' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">Study</span>
        </button>

        {/* Tab 4: App Launcher */}
        <button
          type="button"
          onClick={() => onTabChange('launcher')}
          aria-label="App Launcher tab"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'launcher'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className={`w-5 h-5 ${currentTab === 'launcher' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">Apps</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          type="button"
          onClick={() => onTabChange('settings')}
          aria-label="Settings tab"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'settings'
              ? 'text-indigo-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className={`w-5 h-5 ${currentTab === 'settings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
