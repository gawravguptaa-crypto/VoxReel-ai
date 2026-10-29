import React from 'react';
import {
  Mic,
  PlaySquare,
  GraduationCap,
  LayoutGrid,
  Settings,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  Code2,
  Compass,
} from 'lucide-react';
import { AppTab, UserSettings, LauncherApp } from '../types';

interface HomeScreenProps {
  settings: UserSettings;
  onTabChange: (tab: AppTab) => void;
  onOpenVoiceWithQuery: (query?: string) => void;
  isListening: boolean;
  installedApps: LauncherApp[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  settings,
  onTabChange,
  onOpenVoiceWithQuery,
  isListening,
  installedApps,
}) => {
  const quickCommands = [
    { label: 'Open Instagram', query: 'Open Instagram', icon: '📱', badge: 'App' },
    { label: 'Open WhatsApp', query: 'Open WhatsApp', icon: '💬', badge: 'App' },
    { label: 'Where is Patna?', query: 'Where is Patna', icon: '📍', badge: 'GK' },
    { label: 'Explain Polymorphism', query: 'Explain polymorphism in C++', icon: '💻', badge: 'Study' },
    { label: 'Explain Binary Search', query: 'Explain binary search', icon: '🔍', badge: 'DSA' },
    { label: 'Next Video', query: 'Next video', icon: '▶️', badge: 'Feed' },
    { label: 'Hello / Greeting', query: 'Hello', icon: '👋', badge: 'AI' },
  ];

  return (
    <div className="w-full pb-24 px-4 pt-3 space-y-4 text-left select-none animate-fade-in">
      {/* Automatic Startup Greeting Banner (PRD Requirement 1) */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/30 rounded-2xl p-3.5 flex items-start gap-3 shadow-lg">
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-pink-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              Startup Greeting • English
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Waiting for request
            </span>
          </div>
          <p className="text-xs text-white font-semibold mt-0.5">
            “Hello! Welcome to VoxReel AI. How can I help you today?”
          </p>
          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Fast Answers Mode: Active</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">Concise 2-sentence explanations</span>
          </div>
        </div>
      </div>

      {/* Hero Voice AI Activation Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 p-5 shadow-2xl shadow-indigo-950/50">
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[11px] text-indigo-300 font-medium mb-3">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>On-Demand Voice Control</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl mb-1">
            How can VoxReel help today?
          </h2>
          <p className="text-xs text-slate-300 max-w-xs mb-5">
            Tap the mic to launch installed apps, explain code assignments, or navigate reels in Hindi, Hinglish, or English.
          </p>

          {/* Primary Voice Mic Button */}
          <div className="relative flex items-center justify-center my-2">
            {/* Animated Pulse Rings */}
            <div className={`absolute w-28 h-28 rounded-full border border-indigo-500/30 animate-ping opacity-40 ${isListening ? 'border-red-500' : ''}`} />
            <div className={`absolute w-24 h-24 rounded-full bg-indigo-600/15 ${isListening ? 'bg-red-500/20' : ''}`} />

            <button
              type="button"
              onClick={() => onOpenVoiceWithQuery()}
              aria-label="Tap to speak with VoxReel AI"
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 to-rose-500 shadow-red-500/50 scale-105'
                  : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 hover:scale-105 shadow-indigo-500/40'
              }`}
            >
              <Mic className={`w-8 h-8 text-white ${isListening ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-bold text-white mt-0.5 uppercase tracking-wider">
                {isListening ? 'Listening' : 'Tap to Speak'}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Language: <strong className="text-slate-200 capitalize">{settings.preferredLanguage}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${settings.voiceOutputEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              Audio Reply: <strong className="text-slate-200">{settings.voiceOutputEnabled ? 'ON' : 'OFF'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Voice Commands */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Try Voice Commands</h3>
          </div>
          <span className="text-[10px] text-slate-400">Tap to execute</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {quickCommands.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenVoiceWithQuery(item.query)}
              className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group flex items-start gap-2.5 active:scale-98"
            >
              <span className="text-base shrink-0 p-1 rounded-xl bg-slate-800/80 border border-slate-700/50 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                    {item.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate group-hover:text-indigo-300 transition-colors">
                  {item.label}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Feature Navigation Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 px-1">
          Explore VoxReel
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Video Feed */}
          <button
            type="button"
            onClick={() => onTabChange('feed')}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-pink-500/40 text-left transition-all active:scale-95 group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <PlaySquare className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Reels Feed</p>
              <p className="text-[10px] text-slate-400">Tech & Shorts</p>
            </div>
          </button>

          {/* Card 2: Study Mode */}
          <button
            type="button"
            onClick={() => onTabChange('study')}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left transition-all active:scale-95 group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">Study Mode</p>
              <p className="text-[10px] text-slate-400">Code & Math</p>
            </div>
          </button>

          {/* Card 3: App Launcher */}
          <button
            type="button"
            onClick={() => onTabChange('launcher')}
            className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/40 text-left transition-all active:scale-95 group flex flex-col justify-between h-28"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-white">App Launcher</p>
              <p className="text-[10px] text-slate-400">Insta, WA, YT</p>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Launch Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-white">Installed Android Apps</h4>
          </div>
          <button
            type="button"
            onClick={() => onTabChange('launcher')}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          {installedApps.slice(0, 5).map((app) => (
            <button
              key={app.id}
              type="button"
              onClick={() => onOpenVoiceWithQuery(`Open ${app.name}`)}
              className="flex flex-col items-center gap-1.5 min-w-[56px] text-center group"
            >
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                <span className="font-bold text-xs uppercase">{app.name.substring(0, 2)}</span>
              </div>
              <span className="text-[10px] text-slate-300 font-medium truncate max-w-[54px]">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Assurance & Principles Card */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800/60 p-3.5 flex items-start gap-3">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <span className="text-slate-200 font-semibold">User-Authoritative AI:</span> Silent unless tapped. Authentic Android package intents and official links without fake simulated app interfaces.
        </div>
      </div>
    </div>
  );
};
