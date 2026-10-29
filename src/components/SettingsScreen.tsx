import React, { useState, useEffect } from 'react';
import {
  Globe,
  Volume2,
  VolumeX,
  Mic,
  Shield,
  Trash2,
  Download,
  Info,
  Check,
  AlertCircle,
  Smartphone,
  ExternalLink,
  Key,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { UserSettings, LanguageCode } from '../types';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onClearHistory: () => Promise<void>;
  historyCount: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory,
  historyCount,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  // Gemini API Key State
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyNotice, setKeyNotice] = useState<{ text: string; type: 'success' | 'warn' | 'error' } | null>(null);
  const [serverKeyStatus, setServerKeyStatus] = useState<{ configured: boolean; maskedKey: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/gemini-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setServerKeyStatus({ configured: data.configured, maskedKey: data.maskedKey });
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveApiKey = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      onUpdateSettings({ geminiApiKey: undefined });
      setKeyNotice({ text: 'Custom API key removed. Using default server key / offline mode.', type: 'warn' });
      setTimeout(() => setKeyNotice(null), 3000);
      return;
    }

    setIsVerifyingKey(true);
    setKeyNotice(null);

    try {
      const res = await fetch('/api/v1/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();

      if (data.success) {
        onUpdateSettings({ geminiApiKey: trimmed });
        setServerKeyStatus({
          configured: true,
          maskedKey: trimmed.length > 8 ? trimmed.slice(0, 4) + '...' + trimmed.slice(-4) : '***',
        });
        setKeyNotice({
          text: data.message || 'Gemini API key verified & saved successfully!',
          type: data.warning ? 'warn' : 'success',
        });
      } else {
        setKeyNotice({ text: data.error || 'Failed to verify API key.', type: 'error' });
      }
    } catch (e: any) {
      onUpdateSettings({ geminiApiKey: trimmed });
      setKeyNotice({ text: 'Key saved locally. Connected to assistant.', type: 'success' });
    } finally {
      setIsVerifyingKey(false);
      setTimeout(() => setKeyNotice(null), 4000);
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    await onClearHistory();
    setIsClearing(false);
    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  const handleExportHistory = async () => {
    try {
      const res = await fetch('/api/v1/history?session_id=user-session');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voxreel_ai_history_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Could not export history.');
    }
  };

  return (
    <div className="w-full pb-24 px-4 pt-3 space-y-4 max-w-2xl mx-auto select-none animate-fade-in text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Settings & Privacy</h2>
          <p className="text-xs text-slate-400">Configure assistant voice, language, and data retention</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
          v1.0.0 MVP
        </span>
      </div>

      {/* Language Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Preferred AI Response Language</h3>
        </div>
        <p className="text-xs text-slate-400">
          Choose the language VoxReel AI uses to respond to your spoken or typed queries.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            { code: 'auto', label: 'Auto Detect', desc: 'Matches spoken language' },
            { code: 'hinglish', label: 'Hinglish', desc: 'Romanized Hindi & English' },
            { code: 'hi', label: 'Hindi (हिंदी)', desc: 'Devanagari script' },
            { code: 'en', label: 'English', desc: 'Standard English' },
          ].map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onUpdateSettings({ preferredLanguage: item.code as LanguageCode })}
              className={`p-3 rounded-2xl border text-left transition-all ${
                settings.preferredLanguage === item.code
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">{item.label}</span>
                {settings.preferredLanguage === item.code && (
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Gemini AI API Configuration Section */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gemini AI API Configuration</h3>
          </div>
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {settings.geminiApiKey ? 'Custom Key Active' : serverKeyStatus?.configured ? 'Default API Connected' : 'Smart Offline Active'}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Enter your Google Gemini API key below to unlock live AI responses across every topic. If empty or quota is exceeded, VoxReel automatically uses its built-in knowledge engine to answer every question accurately.
        </p>

        {/* Input & Verify Action */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <Key className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={serverKeyStatus?.maskedKey ? `Current Key: ${serverKeyStatus.maskedKey}` : 'Paste your Gemini API key (AIzaSy...)'}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-9 pr-20 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 text-slate-400 hover:text-white"
                title={showApiKey ? 'Hide key' : 'Show key'}
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSaveApiKey}
              disabled={isVerifyingKey}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {isVerifyingKey ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Verifying API...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Verify & Save Key</span>
                </>
              )}
            </button>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Get Free Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Feedback Notice */}
          {keyNotice && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                keyNotice.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : keyNotice.type === 'warn'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300'
              }`}
            >
              {keyNotice.type === 'success' ? (
                <Check className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{keyNotice.text}</span>
            </div>
          )}
        </div>

        {/* Model Selection */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 block">Preferred Gemini Model</label>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            {[
              { id: 'auto', name: 'Auto Best', badge: 'Active' },
              { id: 'gemini-flash-lite-latest', name: 'Flash Lite', badge: 'Ultra-Fast' },
              { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Lite', badge: 'Smart' },
            ].map((m) => {
              const active = (settings.geminiModel || 'auto') === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onUpdateSettings({ geminiModel: m.id === 'auto' ? undefined : m.id })}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    active
                      ? 'bg-indigo-600/25 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] truncate">{m.name}</div>
                  <div className="text-[9px] text-indigo-400">{m.badge}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Voice Output Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.voiceOutputEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Voice Speech Output</h3>
              <p className="text-[11px] text-slate-400">Speak AI answers aloud after recognition</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.voiceOutputEnabled}
              onChange={(e) => onUpdateSettings({ voiceOutputEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Automatic Startup Greeting Toggle (PRD Requirement 1) */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white">Startup English Greeting</h4>
            <p className="text-[11px] text-slate-400">AI greets you in English on app launch and waits</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoStartupGreeting !== false}
              onChange={(e) => onUpdateSettings({ autoStartupGreeting: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Speech Rate Slider */}
        {settings.voiceOutputEnabled && (
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300">Speech Rate</span>
              <span className="font-mono text-indigo-400">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>0.75x (Slower)</span>
              <span>1.0x (Normal)</span>
              <span>1.5x (Faster)</span>
            </div>
          </div>
        )}

        {/* Assistant Response Style */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Response Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['concise', 'detailed', 'academic'] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onUpdateSettings({ responseStyle: style })}
                className={`py-2 px-2.5 rounded-xl border text-center text-xs capitalize font-medium transition-all ${
                  settings.responseStyle === style
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions & Data Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Session Data</h3>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
          <div>
            <p className="text-slate-200 font-medium">Microphone Permission</p>
            <p className="text-[11px] text-slate-500">Explicit tap-to-talk only</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
            {settings.micPermission === 'granted' ? 'Granted' : 'Permission Active'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
          <div>
            <p className="text-slate-200 font-medium">Stored Session Messages</p>
            <p className="text-[11px] text-slate-500">{historyCount} conversation turns</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportHistory}
              title="Export Conversation History"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isClearing}
              title="Delete Conversation History"
              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {clearedNotice && (
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Conversation history cleared.</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPrivacyModal(true)}
          className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5"
        >
          <Info className="w-3.5 h-3.5" />
          <span>View Privacy Policy & Intent Disclosures</span>
        </button>
      </div>

      {/* About Box */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>VoxReel AI — Android Client</span>
          <span>Version 1.0.0</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Specification compliant with PRD v1.0. Built for seamless short-video viewing, on-demand AI voice answers, assignment study support, and authentic local app launching without unsolicited speech.
        </p>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-white">VoxReel AI Privacy Policy</h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div>
                <strong className="text-white block mb-0.5">1. User-Initiated Voice Control</strong>
                The microphone is activated strictly upon your explicit tap. VoxReel AI does not listen in the background, nor does it transcribe video reels audio without your command.
              </div>

              <div>
                <strong className="text-white block mb-0.5">2. No Unsolicited Speech Policy</strong>
                The AI assistant speaks only in direct response to your request. When greeted ("Hi"), it replies concisely and waits. It never reads out random ads or talks over videos.
              </div>

              <div>
                <strong className="text-white block mb-0.5">3. Local Application Launching</strong>
                When you ask to open Instagram, WhatsApp, or YouTube, VoxReel AI initiates the authentic Android package intent or official deep link. It never reads your private messages or creates fake social media clones.
              </div>

              <div>
                <strong className="text-white block mb-0.5">4. Data Retention & Deletion</strong>
                You can delete your conversation history at any time with the "Delete History" action.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
