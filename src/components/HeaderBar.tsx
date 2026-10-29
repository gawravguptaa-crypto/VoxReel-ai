import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Mic, MicOff, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderBarProps {
  settings: UserSettings;
  isMobileFramed: boolean;
  onToggleFrame: () => void;
  onOpenVoice: () => void;
  isListening: boolean;
  isHandsFreeActive?: boolean;
  onToggleHandsFree?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  settings,
  isMobileFramed,
  onToggleFrame,
  onOpenVoice,
  isListening,
  isHandsFreeActive = true,
  onToggleHandsFree,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-200 select-none z-30 sticky top-0 transition-all">
      {/* Android System Status Bar Simulation */}
      <div className="flex items-center justify-between px-4 py-1.5 text-xs text-slate-400 border-b border-slate-800/60 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-200">{time || '12:30'}</span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-sans font-medium">
            Android 15
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleFrame}
            title={isMobileFramed ? "Switch to Expanded View" : "Switch to Mobile Device Frame"}
            aria-label={isMobileFramed ? "Switch to Expanded View" : "Switch to Mobile Device Frame"}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
          >
            {isMobileFramed ? (
              <>
                <Monitor className="w-3 h-3 text-indigo-400" />
                <span>Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          <span className="text-[10px] text-slate-400">5G</span>
          <Wifi className="w-3 h-3 text-slate-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* App Branding & Quick Status */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-extrabold text-white text-base tracking-tighter">VR</span>
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-white text-base tracking-tight leading-none">VoxReel AI</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">Short-Videos & Voice AI</p>
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center gap-2">
          {/* Hands-Free Bot Status Pill */}
          {onToggleHandsFree && (
            <button
              type="button"
              onClick={onToggleHandsFree}
              title={isHandsFreeActive ? "Hands-Free Voice Bot is Active (Listening)" : "Hands-Free Voice Bot is Paused"}
              className={`px-2 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                isHandsFreeActive
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isHandsFreeActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="hidden sm:inline">{isHandsFreeActive ? 'Bot: Active' : 'Bot: Paused'}</span>
              <span className="sm:hidden">Bot</span>
            </button>
          )}

          {/* Voice Output Status */}
          <div
            title={settings.voiceOutputEnabled ? "Voice Output Active" : "Voice Output Disabled"}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
              settings.voiceOutputEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
          >
            {settings.voiceOutputEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] hidden sm:inline">
              {settings.voiceOutputEnabled ? 'Audio On' : 'Audio Off'}
            </span>
          </div>

          {/* Mic Trigger */}
          <button
            type="button"
            onClick={onOpenVoice}
            aria-label="Activate Voice Assistant"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-3.5 h-3.5 animate-bounce" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Voice AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
