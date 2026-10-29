import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Square,
  Volume2,
  VolumeX,
  Send,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Radio,
  Power,
  RotateCcw,
} from 'lucide-react';
import { UserSettings, ChatMessage, LauncherApp } from '../types';
import { speechService } from '../utils/speech';
import { routeCommand } from '../utils/commandRouter';
import { getIntelligentReply } from '../utils/knowledgeEngine';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  installedApps: LauncherApp[];
  initialQuery?: string;
  onLaunchApp: (appId: string) => void;
  onMediaAction: (action: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  settings,
  installedApps,
  initialQuery,
  onLaunchApp,
  onMediaAction,
  onNavigateTab,
}) => {
  // Continuous conversation state: keeps listening and chatting until user ends it
  const [isContinuousMode, setIsContinuousMode] = useState(true);
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Audio wave visualizer bars
  const [waveHeights, setWaveHeights] = useState([12, 24, 40, 18, 32, 48, 20, 16]);
  const audioVisualizerInterval = useRef<any>(null);

  // Scroll to bottom of chat
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const isComponentOpenRef = useRef(isOpen);
  isComponentOpenRef.current = isOpen;

  const isContinuousModeRef = useRef(isContinuousMode);
  isContinuousModeRef.current = isContinuousMode;

  const conversationStateRef = useRef(conversationState);
  conversationStateRef.current = conversationState;

  const pendingTranscriptRef = useRef('');
  const silenceTimerRef = useRef<any>(null);
  const restartTimerRef = useRef<any>(null);

  // Waveform animation
  useEffect(() => {
    if (conversationState === 'listening' || conversationState === 'speaking') {
      audioVisualizerInterval.current = setInterval(() => {
        setWaveHeights([
          Math.floor(Math.random() * 32) + 8,
          Math.floor(Math.random() * 48) + 12,
          Math.floor(Math.random() * 56) + 16,
          Math.floor(Math.random() * 40) + 10,
          Math.floor(Math.random() * 52) + 14,
          Math.floor(Math.random() * 60) + 18,
          Math.floor(Math.random() * 44) + 12,
          Math.floor(Math.random() * 30) + 8,
        ]);
      }, 120);
    } else {
      if (audioVisualizerInterval.current) {
        clearInterval(audioVisualizerInterval.current);
      }
      setWaveHeights([8, 12, 16, 10, 14, 18, 12, 8]);
    }

    return () => {
      if (audioVisualizerInterval.current) {
        clearInterval(audioVisualizerInterval.current);
      }
    };
  }, [conversationState]);

  // Scroll down on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, conversationState]);

  // Handle open state
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setActionNotice(null);

      if (initialQuery) {
        setTranscript(initialQuery);
        executeCommand(initialQuery);
      } else {
        // Start continuous voice conversation immediately on open
        startListeningSession();
      }
    } else {
      stopAll();
    }
  }, [isOpen, initialQuery]);

  const stopAll = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    pendingTranscriptRef.current = '';
    speechService.stopListening();
    speechService.stopSpeaking();
    setConversationState('idle');
  };

  // Start speech recognition
  const startListeningSession = () => {
    setErrorMsg(null);
    setActionNotice(null);
    setTranscript('');
    pendingTranscriptRef.current = '';
    setConversationState('listening');

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    const started = speechService.startListening(settings.preferredLanguage, {
      onStart: () => {
        setConversationState('listening');
        setTranscript('Listening... Speak now');
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        pendingTranscriptRef.current = text;

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

        if (isFinal && text.trim()) {
          pendingTranscriptRef.current = '';
          speechService.stopListening();
          executeCommand(text);
        } else if (text.trim()) {
          // Debounce: if user finishes speaking and pauses, finalize and execute
          silenceTimerRef.current = setTimeout(() => {
            const spoken = pendingTranscriptRef.current.trim();
            if (spoken && conversationStateRef.current === 'listening') {
              pendingTranscriptRef.current = '';
              speechService.stopListening();
              executeCommand(spoken);
            }
          }, 1100);
        }
      },
      onError: (err) => {
        const isNetwork = err?.toLowerCase().includes('network');
        if (isNetwork) {
          // Do not crash or halt continuous mode on browser speech webservice drops
          setTranscript('Speech service reconnecting...');
          restartTimerRef.current = setTimeout(() => {
            if (isComponentOpenRef.current && isContinuousModeRef.current) {
              startListeningSession();
            }
          }, 800);
          return;
        }
        setConversationState('idle');
        setErrorMsg(err);
      },
      onEnd: () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const remaining = pendingTranscriptRef.current.trim();
        if (remaining && conversationStateRef.current === 'listening') {
          pendingTranscriptRef.current = '';
          executeCommand(remaining);
          return;
        }

        // If still in continuous mode, restart listening loop seamlessly
        if (isComponentOpenRef.current && isContinuousModeRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (
              isComponentOpenRef.current &&
              isContinuousModeRef.current &&
              conversationStateRef.current !== 'thinking' &&
              conversationStateRef.current !== 'speaking'
            ) {
              startListeningSession();
            }
          }, 500);
        }
      },
    });

    if (!started) {
      setConversationState('idle');
      setTranscript('Microphone unavailable. You can use preset commands or type below.');
    }
  };

  // Execute a command & keep continuous loop going
  const executeCommand = async (commandText: string) => {
    const query = commandText.trim();
    if (!query) return;

    setConversationState('thinking');
    setErrorMsg(null);
    speechService.stopSpeaking();

    // Append user message to thread
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, userMsg]);

    // 1. Client-side Route Command first
    const routing = routeCommand(query);

    // Stop command explicitly requested by user: end conversation!
    if (routing.intent === 'stop_speaking' || routing.intent === 'cancel') {
      stopAll();
      const exitMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: 'Voice conversation paused. Tap the microphone whenever you want to speak again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: routing.intent,
      };
      setChatHistory((prev) => [...prev, exitMsg]);
      return;
    }

    // In-app media control handled immediately
    if (routing.intent === 'media_control' && routing.target) {
      onMediaAction(routing.target);
      const actionText = `Media action executed: ${routing.target.toUpperCase()}. Video adjusted.`;
      setActionNotice(actionText);

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: actionText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: routing.intent,
      };
      setChatHistory((prev) => [...prev, botMsg]);

      handleAiReplyTurn(actionText, routing.languageHint);
      return;
    }

    // Study Mode switch command
    if (routing.intent === 'study_mode') {
      const notice = 'Opening Study Mode for your assignment.';
      setActionNotice(notice);

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: notice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: routing.intent,
      };
      setChatHistory((prev) => [...prev, botMsg]);

      if (settings.voiceOutputEnabled) {
        speechService.speak(notice, { language: routing.languageHint });
      }

      setTimeout(() => {
        onClose();
        onNavigateTab('study');
      }, 1000);
      return;
    }

    // 2. Query backend API for AI Chat / App intent
    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: settings.preferredLanguage,
          session_id: 'user-session',
          mode: routing.intent === 'study_query' ? 'study' : 'assistant',
          apiKey: settings.geminiApiKey || undefined,
          model: settings.geminiModel || undefined,
        }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const botReply: ChatMessage = {
          id: 'bot-' + Date.now(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: data.intent || routing.intent,
          appTarget: data.app || routing.target,
        };
        setChatHistory((prev) => [...prev, botReply]);

        // If intent is app launch, perform actual launch intent
        if (data.intent === 'open_app' && data.app) {
          onLaunchApp(data.app);
          setActionNotice(`Launching installed package for ${data.app}...`);
        }

        // Handle speech output & auto-continue listening loop!
        handleAiReplyTurn(data.reply, data.language || routing.languageHint);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (e: any) {
      console.warn('Backend call fallback in Voice Modal:', e);
      // Fallback using comprehensive intelligent engine
      let reply = '';
      if (routing.intent === 'open_app' && routing.target) {
        reply = `Opening ${routing.target}.`;
        onLaunchApp(routing.target);
      } else {
        reply = getIntelligentReply(query, routing.languageHint);
      }

      const botReply: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: routing.intent,
        appTarget: routing.target,
      };
      setChatHistory((prev) => [...prev, botReply]);
      handleAiReplyTurn(reply, routing.languageHint);
    }
  };

  /**
   * Continuous Conversation Turn Handler:
   * Speaks the response (if voice enabled), and when finished speaking,
   * AUTOMATICALLY resumes listening for the next question so user can keep chatting!
   */
  const handleAiReplyTurn = (replyText: string, lang: string) => {
    if (settings.voiceOutputEnabled && speechService.isSpeechOutputSupported()) {
      setConversationState('speaking');
      speechService.speak(replyText, {
        language: lang,
        rate: settings.speechRate,
        onEnd: () => {
          onTurnFinished();
        },
        onError: () => {
          onTurnFinished();
        },
      });
    } else {
      // Voice output is off: wait 1.2s so user can read, then resume listening if continuous
      setConversationState('idle');
      setTimeout(() => {
        onTurnFinished();
      }, 1200);
    }
  };

  const onTurnFinished = () => {
    if (!isComponentOpenRef.current) return;

    if (isContinuousMode) {
      // Automatic turn-taking: resume listening!
      setTranscript('Listening for your next question... Speak anytime');
      startListeningSession();
    } else {
      setConversationState('idle');
    }
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setConversationState('idle');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/85 backdrop-blur-md transition-all select-none">
      <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-indigo-500/30 rounded-t-3xl p-4 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Top Header with Continuous Mode Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${conversationState === 'listening'
                ? 'bg-red-500 animate-ping'
                : conversationState === 'speaking'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-indigo-500'
              }`} />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white tracking-tight">VoxReel AI Voice HUD</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase">
                  Continuous AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {conversationState === 'listening'
                  ? '🟢 Listening continuously...'
                  : conversationState === 'speaking'
                    ? '🔊 Speaking response...'
                    : conversationState === 'thinking'
                      ? '⏳ Thinking...'
                      : 'Idle'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* End Conversation / Stop Button */}
            {(conversationState === 'listening' || conversationState === 'speaking') && (
              <button
                type="button"
                onClick={handleStopSpeaking}
                className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-medium flex items-center gap-1 hover:bg-rose-500/30 transition-colors"
                title="Pause listening"
              >
                <Square className="w-2.5 h-2.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {/* Continuous Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsContinuousMode(!isContinuousMode)}
              className={`p-1.5 rounded-lg border text-[10px] font-medium flex items-center gap-1 transition-colors ${isContinuousMode
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              title={isContinuousMode ? "Continuous loop ON: AI listens again after answering" : "Single turn mode"}
            >
              <Radio className="w-3 h-3" />
              <span>{isContinuousMode ? 'Loop ON' : 'Loop OFF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopAll();
                onClose();
              }}
              aria-label="Close Voice Assistant"
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Notice (App Launch, etc.) */}
        {actionNotice && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Error Message if any (excluding transient network reconnects) */}
        {errorMsg && !errorMsg.toLowerCase().includes('network') && (
          <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Multi-turn Chat Thread */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[38vh] min-h-[160px] pr-1">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">Continuous AI Conversation Active</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Say “Open Instagram”, “Explain binary search”, or ask any assignment question. The assistant will answer and immediately listen for your next question!
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-sm'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-indigo-300">
                      {msg.role === 'user' ? 'You' : 'VoxReel AI'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span>{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-0.5 hover:text-white"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {msg.appTarget && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">App target:</span>
                      <button
                        type="button"
                        onClick={() => onLaunchApp(msg.appTarget!)}
                        className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Launch {msg.appTarget.toUpperCase()}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {conversationState === 'thinking' && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span>Formulating fast, concise answer...</span>
                <span className="text-[10px] text-amber-300 font-mono">⚡ Fast Response</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Central Audio Wave & Live Transcript */}
        <div className="py-2.5 px-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          {/* Animated Waveform */}
          <div className="flex items-center gap-1 h-8 shrink-0">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                style={{ height: `${Math.max(6, Math.min(32, h / 1.8))}px` }}
                className={`w-1 rounded-full transition-all duration-150 ${conversationState === 'listening'
                    ? 'bg-gradient-to-t from-red-500 to-rose-400'
                    : conversationState === 'speaking'
                      ? 'bg-gradient-to-t from-indigo-500 to-pink-500'
                      : 'bg-slate-700'
                  }`}
              />
            ))}
          </div>

          {/* Transcript / Spoken Status Text */}
          <p className="text-xs font-medium text-slate-300 italic truncate flex-1 text-left">
            {transcript || (conversationState === 'listening' ? 'Listening... Speak now' : 'Ready for question')}
          </p>

          {/* Mic Button to toggle listening */}
          <button
            type="button"
            onClick={conversationState === 'listening' ? handleStopSpeaking : startListeningSession}
            aria-label={conversationState === 'listening' ? "Pause listening" : "Start listening"}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 ${conversationState === 'listening'
                ? 'bg-red-500 text-white ring-2 ring-red-500/40 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
          >
            {conversationState === 'listening' ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Bottom Quick Chips (All English as requested by user) */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
          <button
            type="button"
            onClick={() => executeCommand('Open Instagram')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shrink-0 font-medium"
          >
            Open Instagram
          </button>
          <button
            type="button"
            onClick={() => executeCommand('Open WhatsApp')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shrink-0 font-medium"
          >
            Open WhatsApp
          </button>
          <button
            type="button"
            onClick={() => executeCommand('Explain binary search')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shrink-0 font-medium"
          >
            Explain Binary Search
          </button>
          <button
            type="button"
            onClick={() => executeCommand('Hello')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shrink-0 font-medium"
          >
            Hello
          </button>
          <button
            type="button"
            onClick={() => executeCommand('Where is Patna')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 shrink-0 font-medium"
          >
            Where is Patna
          </button>
          <button
            type="button"
            onClick={() => executeCommand('Next video')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 shrink-0 font-medium"
          >
            Next Video
          </button>
        </div>

        {/* Fallback Text Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (textInput.trim()) {
              executeCommand(textInput);
              setTextInput('');
            }
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your question or command (e.g. Open WhatsApp)..."
            aria-label="Type your question or command"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            aria-label="Send message"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
