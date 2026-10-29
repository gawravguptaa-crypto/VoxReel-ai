import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Download,
  Info,
  CheckCircle,
  Smartphone,
  Mic,
  Search,
} from 'lucide-react';
import { LauncherApp } from '../types';

interface AppLauncherScreenProps {
  apps: LauncherApp[];
  onLaunchApp: (appId: string) => void;
  onOpenVoiceWithQuery: (query?: string) => void;
  onToggleInstallState: (appId: string) => void;
}

export const AppLauncherScreen: React.FC<AppLauncherScreenProps> = ({
  apps,
  onLaunchApp,
  onOpenVoiceWithQuery,
  onToggleInstallState,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'social' | 'communication' | 'utility' | 'entertainment'>('all');

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = activeCategory === 'all' || app.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full pb-24 px-4 pt-3 space-y-4 max-w-2xl mx-auto select-none animate-fade-in text-left">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Android App Launcher</h2>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Package Intent Engine
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          VoxReel AI uses genuine Android package intents and deep links to launch your installed applications. No simulated or fake interfaces.
        </p>

        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <span>Voice trigger example:</span>
          <button
            type="button"
            onClick={() => onOpenVoiceWithQuery('Open Instagram')}
            className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
          >
            <Mic className="w-3 h-3" />
            <span>“Open Instagram”</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search installed applications or package names..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {(['all', 'social', 'communication', 'utility', 'entertainment'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xl capitalize font-medium shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Installed Apps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shadow-md font-bold text-sm uppercase`}>
                    {app.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{app.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                      {app.packageName}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-end">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      app.isInstalled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {app.isInstalled ? (
                      <>
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>Installed</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span>Not Installed</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-snug mb-3">
                {app.description}
              </p>
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              {/* Dev/Testing Simulator toggle */}
              <button
                type="button"
                onClick={() => onToggleInstallState(app.id)}
                title="Toggle installation status to test missing-app error handling"
                className="text-[10px] text-slate-400 hover:text-slate-200 underline decoration-dotted"
              >
                {app.isInstalled ? 'Simulate Uninstalled' : 'Simulate Installed'}
              </button>

              <button
                type="button"
                onClick={() => onLaunchApp(app.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                  app.isInstalled
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {app.isInstalled ? (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Get App</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Android Security & Launching Guidelines Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <p className="text-slate-200 font-semibold mb-1">Android Package Visibility & Intent Rules:</p>
          Target applications are launched through legitimate Android `Intent.ACTION_VIEW` and official platform deep link URIs. VoxReel AI never accesses private notifications, messages, or ungranted external application data.
        </div>
      </div>
    </div>
  );
};
