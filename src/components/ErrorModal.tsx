import React from 'react';
import { AlertCircle, AlertTriangle, Download, X, RefreshCw, MessageSquare } from 'lucide-react';

export type ErrorType = 'app_not_installed' | 'mic_denied' | 'network_error' | null;

interface ErrorModalProps {
  errorType: ErrorType;
  details?: {
    appName?: string;
    packageName?: string;
    message?: string;
  };
  onClose: () => void;
  onAction?: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  errorType,
  details,
  onClose,
  onAction,
}) => {
  if (!errorType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-left relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. App Not Installed (PRD 8.5 & 14) */}
        {errorType === 'app_not_installed' && (
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {details?.appName || 'Application'} Not Installed
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                <strong className="text-white">{details?.appName || 'The application'}</strong> is not currently installed on this device or emulator. VoxReel AI only opens authentic installed packages.
              </p>
            </div>

            {details?.packageName && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-400">
                Package: <span className="text-amber-300">{details.packageName}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <a
                href={`https://play.google.com/store/apps/details?id=${details?.packageName || ''}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open Google Play</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 2. Microphone Permission Denied (PRD 14) */}
        {errorType === 'mic_denied' && (
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Microphone Access Required
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Voice input was not granted. You can still use VoxReel AI completely through keyboard typing or preset command chips.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction?.();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Use Text Input</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 3. Network or Backend Error */}
        {errorType === 'network_error' && (
          <div className="space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Connection Issue
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {details?.message || 'Unable to communicate with the VoxReel AI service. Please verify network connectivity.'}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction?.();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <span>Retry</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
