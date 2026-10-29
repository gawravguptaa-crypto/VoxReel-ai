import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Volume2,
  ExternalLink,
  CheckCircle2,
  Radio,
  ChevronUp,
  X,
  RefreshCw,
} from 'lucide-react';
import { UserSettings, LauncherApp } from '../types';
import { speechService } from '../utils/speech';
import { routeCommand } from '../utils/commandRouter';
import { getIntelligentReply } from '../utils/knowledgeEngine';

interface HandsFreeBotBarProps {
  settings: UserSettings;
  installedApps: LauncherApp[];
  onLaunchApp: (appId: string) => void;
  onMediaAction: (action: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenFullVoiceModal: (query?: string) => void;
  showToast: (msg: string) => void;
  isHandsFreeActive: boolean;
  onToggleHandsFree: () => void;
}

export const HandsFreeBotBar: React.FC<HandsFreeBotBarProps> = ({
  settings,
  installedApps,
  onLaunchApp,
  onMediaAction,
  onNavigateTab,
  onOpenFullVoiceModal,
  showToast,
  isHandsFreeActive,
  onToggleHandsFree,
}) => {
  const [botState, setBotState] = useState<'listening' | 'thinking' | 'speaking' | 'idle'>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [lastReply, setLastReply] = useState<string | null>(null);
  const [waveTicks, setWaveTicks] = useState([12, 24, 18, 30, 16]);

  const isHandsFreeActiveRef = useRef(isHandsFreeActive);
  isHandsFreeActiveRef.current = isHandsFreeActive;

  const retryTimerRef = useRef<any>(null);
  const waveTimerRef = useRef<any>(null);
  const pendingBotTranscriptRef = useRef('');
  const botSilenceTimerRef = useRef<any>(null);
  const botStateRef = useRef(botState);
  botStateRef.current = botState;

  // Animate sound wave bars when listening or speaking
  useEffect(() => {
    if (botState === 'listening' || botState === 'speaking') {
      waveTimerRef.current = setInterval(() => {
        setWaveTicks([
          Math.floor(Math.random() * 20) + 10,
          Math.floor(Math.random() * 28) + 12,
          Math.floor(Math.random() * 32) + 14,
          Math.floor(Math.random() * 24) + 10,
          Math.floor(Math.random() * 18) + 8,
        ]);
      }, 140);
    } else {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
      setWaveTicks([8, 12, 10, 14, 8]);
    }
    return () => {
      if (waveTimerRef.current) clearInterval(waveTimerRef.current);
    };
  }, [botState]);

  // Main hands-free continuous listening loop
  useEffect(() => {
    if (isHandsFreeActive) {
      startHandsFreeListening();
    } else {
      stopHandsFreeListening();
    }

    return () => {
      stopHandsFreeListening();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [isHandsFreeActive, settings.preferredLanguage]);

  const stopHandsFreeListening = () => {
    if (botSilenceTimerRef.current) clearTimeout(botSilenceTimerRef.current);
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    pendingBotTranscriptRef.current = '';
    speechService.stopListening();
    setBotState('idle');
    setLiveTranscript('');
  };

  const startHandsFreeListening = () => {
    if (!isHandsFreeActiveRef.current) return;

    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (botSilenceTimerRef.current) clearTimeout(botSilenceTimerRef.current);
    pendingBotTranscriptRef.current = '';

    setBotState('listening');
    setLiveTranscript('Bot listening... Speak anytime');

    const started = speechService.startListening(settings.preferredLanguage, {
      onStart: () => {
        if (!isHandsFreeActiveRef.current) return;
        setBotState('listening');
        setLiveTranscript('Bot listening... Speak anytime');
      },
      onResult: (text, isFinal) => {
        if (!isHandsFreeActiveRef.current) return;
        setLiveTranscript(text);
        pendingBotTranscriptRef.current = text;

        if (botSilenceTimerRef.current) clearTimeout(botSilenceTimerRef.current);

        if (isFinal && text.trim()) {
          pendingBotTranscriptRef.current = '';
          speechService.stopListening();
          executeBotVoiceCommand(text);
        } else if (text.trim()) {
          // Debounce: if user finished phrase and pauses, execute hands-free
          botSilenceTimerRef.current = setTimeout(() => {
            const spoken = pendingBotTranscriptRef.current.trim();
            if (spoken && botStateRef.current === 'listening') {
              pendingBotTranscriptRef.current = '';
              speechService.stopListening();
              executeBotVoiceCommand(spoken);
            }
          }, 1100);
        }
      },
      onError: (err) => {
        // Silently recover from network or transient speech glitches
        const isNetwork = err?.toLowerCase().includes('network');
        if (isNetwork) {
          setLiveTranscript('Reconnecting speech listener...');
        }
        // Auto-restart listening after short pause without bothering user
        if (isHandsFreeActiveRef.current) {
          retryTimerRef.current = setTimeout(() => {
            if (isHandsFreeActiveRef.current) {
              startHandsFreeListening();
            }
          }, 800);
        }
      },
      onEnd: () => {
        if (botSilenceTimerRef.current) clearTimeout(botSilenceTimerRef.current);
        const remaining = pendingBotTranscriptRef.current.trim();
        if (remaining && botStateRef.current === 'listening') {
          pendingBotTranscriptRef.current = '';
          executeBotVoiceCommand(remaining);
          return;
        }

        // Continue listening loop if still active and not currently thinking/speaking
        if (
          isHandsFreeActiveRef.current &&
          botStateRef.current !== 'thinking' &&
          botStateRef.current !== 'speaking'
        ) {
          retryTimerRef.current = setTimeout(() => {
            if (isHandsFreeActiveRef.current && botStateRef.current !== 'thinking' && botStateRef.current !== 'speaking') {
              startHandsFreeListening();
            }
          }, 400);
        }
      },
    });

    if (!started) {
      setBotState('idle');
      setLiveTranscript('Voice Bot standby (tap a command or mic to talk)');
    }
  };

  // Execute voice command touchlessly
  const executeBotVoiceCommand = async (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;

    setBotState('thinking');
    setLiveTranscript(`Processing: "${query}"`);
    speechService.stopSpeaking();

    const routing = routeCommand(query);

    // 1. Stop Speaking command
    if (routing.intent === 'stop_speaking' || routing.intent === 'cancel') {
      speechService.stopSpeaking();
      setLastAction('Voice stopped');
      setLastReply(null);
      setLiveTranscript('Voice stopped.');
      resumeListeningWithDelay(600);
      return;
    }

    // 2. Open App Intent (Hands-Free!)
    if (routing.intent === 'open_app' && routing.target) {
      const appTarget = routing.target;
      const targetApp = installedApps.find((a) => a.id.toLowerCase() === appTarget.toLowerCase());
      const appName = targetApp ? targetApp.name : appTarget.charAt(0).toUpperCase() + appTarget.slice(1);

      const announce = routing.languageHint === 'hi'
        ? `${appName} खोला जा रहा है।`
        : routing.languageHint === 'hinglish'
        ? `${appName} khol raha hoon.`
        : `Opening ${appName}.`;

      setLastAction(`Launched: ${appName}`);
      setLiveTranscript(`🚀 Opening ${appName}...`);
      showToast(`[Voice Bot] Executing intent: Opening ${appName}`);

      // Perform actual launch without any click needed!
      onLaunchApp(appTarget);

      if (settings.voiceOutputEnabled) {
        setBotState('speaking');
        speechService.speak(announce, {
          language: routing.languageHint,
          rate: settings.speechRate,
          onEnd: () => resumeListeningWithDelay(500),
          onError: () => resumeListeningWithDelay(500),
        });
      } else {
        resumeListeningWithDelay(1200);
      }
      return;
    }

    // 3. Media Controls (Next video, play, pause)
    if (routing.intent === 'media_control' && routing.target) {
      onMediaAction(routing.target);
      const actionNotice = `Media: ${routing.target.toUpperCase()}`;
      setLastAction(actionNotice);
      setLiveTranscript(`▶️ Executed: ${routing.target}`);

      if (settings.voiceOutputEnabled) {
        setBotState('speaking');
        const speechNotice = routing.target === 'next' ? 'Next video' : routing.target;
        speechService.speak(speechNotice, {
          language: 'en',
          onEnd: () => resumeListeningWithDelay(500),
          onError: () => resumeListeningWithDelay(500),
        });
      } else {
        resumeListeningWithDelay(800);
      }
      return;
    }

    // 4. Study Mode Switch
    if (routing.intent === 'study_mode') {
      onNavigateTab('study');
      const notice = 'Opening Study Mode.';
      setLastAction(notice);
      setLiveTranscript('📚 Switching to Study Mode...');

      if (settings.voiceOutputEnabled) {
        setBotState('speaking');
        speechService.speak(notice, {
          language: 'en',
          onEnd: () => resumeListeningWithDelay(500),
          onError: () => resumeListeningWithDelay(500),
        });
      } else {
        resumeListeningWithDelay(800);
      }
      return;
    }

    // 5. General Knowledge & Q&A (e.g. "Where is Patna", "Explain binary search")
    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: settings.preferredLanguage,
          session_id: 'handsfree-session',
          mode: routing.intent === 'study_query' ? 'study' : 'assistant',
          apiKey: settings.geminiApiKey || undefined,
          model: settings.geminiModel || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setLastReply(data.reply);
        setLastAction(`Answered: "${query}"`);
        setLiveTranscript(`💬 ${data.reply}`);

        // If app launch was detected server-side
        if (data.intent === 'open_app' && data.app) {
          onLaunchApp(data.app);
        }

        if (settings.voiceOutputEnabled) {
          setBotState('speaking');
          speechService.speak(data.reply, {
            language: data.language || routing.languageHint,
            rate: settings.speechRate,
            onEnd: () => resumeListeningWithDelay(600),
            onError: () => resumeListeningWithDelay(600),
          });
        } else {
          resumeListeningWithDelay(2500);
        }
      } else {
        throw new Error('No reply from assistant');
      }
    } catch (e) {
      console.warn('Voice Bot chat error:', e);
      const fallbackText = getIntelligentReply(query, routing.languageHint);
      setLastReply(fallbackText);
      setLiveTranscript(`💬 ${fallbackText}`);

      if (settings.voiceOutputEnabled) {
        setBotState('speaking');
        speechService.speak(fallbackText, {
          language: routing.languageHint,
          onEnd: () => resumeListeningWithDelay(500),
          onError: () => resumeListeningWithDelay(500),
        });
      } else {
        resumeListeningWithDelay(1500);
      }
    }
  };

  const resumeListeningWithDelay = (delayMs: number) => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      if (isHandsFreeActiveRef.current) {
        startHandsFreeListening();
      } else {
        setBotState('idle');
      }
    }, delayMs);
  };

  return (
    <div className="w-full bg-slate-900/95 border-b border-indigo-500/30 backdrop-blur-md px-3 py-2 text-left transition-all z-20 shadow-md">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Bot Status & Waveform */}
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {/* Animated Pulsing Bot Icon */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={onToggleHandsFree}
              title={isHandsFreeActive ? "Click to Pause Hands-Free Bot" : "Click to Start Hands-Free Bot"}
              aria-label={isHandsFreeActive ? "Pause Hands-Free Voice Bot" : "Start Hands-Free Voice Bot"}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isHandsFreeActive
                  ? botState === 'speaking'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40'
                    : botState === 'thinking'
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isHandsFreeActive ? (
                botState === 'speaking' ? (
                  <Volume2 className="w-4 h-4 animate-bounce" />
                ) : botState === 'thinking' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>
            {isHandsFreeActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-ping" />
            )}
          </div>

          {/* Transcript & Status Display */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isHandsFreeActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {isHandsFreeActive ? 'Hands-Free Bot' : 'Bot Paused'}
              </span>
              <span className="text-[10px] text-slate-500">•</span>
              <span className="text-[10px] text-indigo-300 font-medium capitalize">
                {botState}
              </span>
            </div>

            <p className="text-xs text-slate-100 font-medium truncate mt-0.5">
              {liveTranscript || 'Listening touch-free. Say "Open WhatsApp" or "Where is Patna"'}
            </p>
          </div>
        </div>

        {/* Right: Audio Waveform Visualizer & HUD Expand */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Animated Mini Wave */}
          {isHandsFreeActive && (
            <div className="flex items-center gap-0.5 h-6 px-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
              {waveTicks.map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${Math.max(6, Math.min(22, h))}px` }}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    botState === 'speaking'
                      ? 'bg-purple-400'
                      : botState === 'thinking'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Toggle Hands-Free Button */}
          <button
            type="button"
            onClick={onToggleHandsFree}
            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
              isHandsFreeActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isHandsFreeActive ? 'Auto ON' : 'Turn ON'}
          </button>

          {/* Open Full HUD */}
          <button
            type="button"
            onClick={() => onOpenFullVoiceModal()}
            title="Open Full Voice HUD"
            aria-label="Open Full Voice HUD"
            className="p-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] flex items-center gap-0.5"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Answer Preview Box (if bot just answered a question) */}
      {lastReply && (
        <div className="mt-1.5 p-2 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-xs text-slate-200 flex items-start justify-between gap-2 animate-fade-in">
          <div className="flex items-start gap-1.5 overflow-hidden">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed line-clamp-2">{lastReply}</p>
          </div>
          <button
            type="button"
            onClick={() => setLastReply(null)}
            className="text-slate-400 hover:text-white shrink-0 p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Quick Voice Command Triggers (Direct test without typing) */}
      <div className="mt-1.5 flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
        <span className="text-slate-400 shrink-0 font-medium">Say or tap:</span>
        <button
          type="button"
          onClick={() => executeBotVoiceCommand('Open WhatsApp')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 shrink-0 font-medium flex items-center gap-1"
        >
          <span>💬</span>
          <span>Open WhatsApp</span>
        </button>
        <button
          type="button"
          onClick={() => executeBotVoiceCommand('Open Instagram')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 shrink-0 font-medium flex items-center gap-1"
        >
          <span>📱</span>
          <span>Open Instagram</span>
        </button>
        <button
          type="button"
          onClick={() => executeBotVoiceCommand('Where is Patna')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-indigo-300 shrink-0 font-medium flex items-center gap-1"
        >
          <span>📍</span>
          <span>Where is Patna</span>
        </button>
        <button
          type="button"
          onClick={() => executeBotVoiceCommand('Explain Binary Search')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 shrink-0 font-medium flex items-center gap-1"
        >
          <span>🔍</span>
          <span>Binary Search</span>
        </button>
        <button
          type="button"
          onClick={() => executeBotVoiceCommand('Next video')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 shrink-0 font-medium flex items-center gap-1"
        >
          <span>▶️</span>
          <span>Next Video</span>
        </button>
      </div>
    </div>
  );
};
