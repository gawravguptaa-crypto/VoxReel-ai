import React, { useState } from 'react';
import { Mic, ShieldCheck, Check, Globe } from 'lucide-react';
import { LanguageCode, UserSettings } from '../types';

interface OnboardingModalProps {
  settings: UserSettings;
  onComplete: (language: LanguageCode, micGranted: boolean) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  settings,
  onComplete,
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(settings.preferredLanguage || 'auto');
  const [permissionRequested, setPermissionRequested] = useState(false);

  const languages: { code: LanguageCode; label: string; sub: string; sample: string }[] = [
    { code: 'auto', label: 'Auto Detect', sub: 'Matches whatever language you speak', sample: '“Open Instagram” or “Explain recursion”' },
    { code: 'hinglish', label: 'Hinglish (हिंग्लिश)', sub: 'Romanized Hindi & English mix', sample: '“Hi! How can I help?” or “Kaise help karun?”' },
    { code: 'hi', label: 'Hindi (हिंदी)', sub: 'Devanagari script responses', sample: '“नमस्ते! क्या सहायता चाहिए?”' },
    { code: 'en', label: 'English', sub: 'Standard technical & conversational English', sample: '“Opening Instagram for you.”' },
  ];

  const handleAllowMic = async () => {
    setPermissionRequested(true);
    let granted = false;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        granted = true;
      } else {
        // Fallback Web Speech recognition permission check
        granted = true;
      }
    } catch (e) {
      console.warn('Microphone permission not granted or dismissed:', e);
      granted = false;
    }
    onComplete(selectedLang, granted);
  };

  const handleContinueWithoutMic = () => {
    onComplete(selectedLang, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-left select-none my-auto">
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome to VoxReel AI</h2>
            <p className="text-xs text-slate-400">Set up your voice assistant preferences</p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 mb-5 space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              <strong className="text-white">Strict User Control:</strong> The assistant will <span className="text-emerald-300 font-medium">never initiate conversations</span> or speak over your videos without your explicit tap.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300">
              <strong className="text-white">Device Privacy:</strong> No SMS, contacts, or private chats are ever accessed. Only genuine app intents and educational queries are handled.
            </p>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Choose Preferred Assistant Language
          </label>
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedLang === lang.code
                    ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">{lang.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{lang.sub}</p>
                  <p className="text-[10px] text-indigo-300/80 font-mono mt-0.5">{lang.sample}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                    selectedLang === lang.code
                      ? 'border-indigo-400 bg-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  {selectedLang === lang.code && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleAllowMic}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <Mic className="w-4 h-4" />
            <span>Enable Voice Interaction (Recommended)</span>
          </button>

          <button
            type="button"
            onClick={handleContinueWithoutMic}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors text-center"
          >
            Continue Without Voice Input (Text Only)
          </button>
        </div>

        <p className="text-[10px] text-slate-500 text-center mt-3">
          You can toggle microphone access and voice speech output anytime in Settings.
        </p>
      </div>
    </div>
  );
};
