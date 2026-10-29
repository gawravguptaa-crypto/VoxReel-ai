import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Cpu,
  Calculator,
  Send,
  Mic,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { UserSettings } from '../types';
import { getIntelligentReply } from '../utils/knowledgeEngine';

interface StudyModeScreenProps {
  settings: UserSettings;
  onOpenVoiceWithQuery: (query?: string) => void;
}

interface StudyThreadItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  codeSnippet?: string;
  language?: string;
  timestamp: string;
}

export const StudyModeScreen: React.FC<StudyModeScreenProps> = ({
  settings,
  onOpenVoiceWithQuery,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<'cpp' | 'dsa' | 'math' | 'python'>('cpp');
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const [thread, setThread] = useState<StudyThreadItem[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Welcome to VoxReel Study Mode! 🎓\n\nI am configured for Indian engineering and school students. Ask me anything about assignments, algorithms, or code examples in Hindi, Hinglish, or English.`,
      timestamp: 'Just now',
    },
  ]);

  const sampleQuestions: Record<string, string[]> = {
    cpp: [
      'Explain function overloading in C++ with code',
      'What is virtual destructor in C++?',
      'Differences between pointers and references',
      'Explain Polymorphism in C++ with real example',
    ],
    dsa: [
      'Binary search samjhao with time complexity',
      'How does recursion work? Give factorial code',
      'Explain Dijkstra shortest path algorithm',
      'QuickSort vs MergeSort comparison',
    ],
    python: [
      'List comprehensions and generators in Python',
      'Explain Python decorators with simple example',
      'Difference between is and == in Python',
      'File handling in Python with context manager',
    ],
    math: [
      'What is the geometrical meaning of derivative?',
      'Explain eigenvalues and eigenvectors simply',
      'Bayes theorem intuition and formula',
      'Taylor series expansion basics',
    ],
  };

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    const userItem: StudyThreadItem = {
      id: 'u-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setThread((prev) => [...prev, userItem]);
    setQueryInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          language: settings.preferredLanguage,
          session_id: 'study-session',
          mode: 'study',
          apiKey: settings.geminiApiKey || undefined,
          model: settings.geminiModel || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        // Parse possible code snippet
        const codeMatch = data.reply.match(/```([a-z]*)\n([\s\S]*?)```/);
        const codeSnippet = codeMatch ? codeMatch[2].trim() : undefined;
        const codeLang = codeMatch ? codeMatch[1] : undefined;

        const aiItem: StudyThreadItem = {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: data.reply,
          codeSnippet,
          language: codeLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setThread((prev) => [...prev, aiItem]);
      } else {
        throw new Error('Study Mode response unavailable');
      }
    } catch (err) {
      const langHint = settings.preferredLanguage === 'hi' ? 'hi' : settings.preferredLanguage === 'hinglish' ? 'hinglish' : 'en';
      const fallbackAns = getIntelligentReply(q, langHint);
      const codeMatch = fallbackAns.match(/```([a-z]*)\n([\s\S]*?)```/);
      const codeSnippet = codeMatch ? codeMatch[2].trim() : undefined;
      const codeLang = codeMatch ? codeMatch[1] : undefined;

      setThread((prev) => [
        ...prev,
        {
          id: 'ai-fb-' + Date.now(),
          sender: 'ai',
          text: fallbackAns,
          codeSnippet,
          language: codeLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="w-full h-[calc(100vh-130px)] max-w-2xl mx-auto flex flex-col p-4 select-none animate-fade-in text-left">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-3.5 mb-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">VoxReel Study Mode</h2>
            <p className="text-[11px] text-slate-400">Assignment Guidance & Concept Explanations</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenVoiceWithQuery('Help me with my assignment')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Help</span>
        </button>
      </div>

      {/* Subject Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        <button
          type="button"
          onClick={() => setSelectedSubject('cpp')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-all ${
            selectedSubject === 'cpp'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>C++ & OOP</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('dsa')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-all ${
            selectedSubject === 'dsa'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>DSA & Algorithms</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('python')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-all ${
            selectedSubject === 'python'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Python</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject('math')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold shrink-0 transition-all ${
            selectedSubject === 'math'
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Mathematics</span>
        </button>
      </div>

      {/* Suggested Questions Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 mb-2 text-[11px]">
        {sampleQuestions[selectedSubject]?.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(item)}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 shrink-0 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Main Conversation Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
        {thread.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-indigo-300">
                  {msg.sender === 'user' ? 'You' : 'VoxReel AI Study Coach'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

              {/* Code Snippet Card with Copy */}
              {msg.codeSnippet && (
                <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px]">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
                    <span>{msg.language || 'code'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300"
                    >
                      {copiedCodeId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 overflow-x-auto text-emerald-300 leading-normal">
                    {msg.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-indigo-400 max-w-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Formulating step-by-step academic explanation...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(queryInput);
        }}
        className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800"
      >
        <button
          type="button"
          onClick={() => onOpenVoiceWithQuery()}
          title="Speak your question"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="Ask an assignment question or programming concept..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={!queryInput.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-md shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
