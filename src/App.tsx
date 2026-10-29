import React, { useState, useEffect } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav } from './components/BottomNav';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeScreen } from './components/HomeScreen';
import { VideoFeedScreen } from './components/VideoFeedScreen';
import { StudyModeScreen } from './components/StudyModeScreen';
import { AppLauncherScreen } from './components/AppLauncherScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { HandsFreeBotBar } from './components/HandsFreeBotBar';
import { ErrorModal, ErrorType } from './components/ErrorModal';
import { INITIAL_VIDEOS, INITIAL_APPS } from './data/mockFeed';
import { AppTab, UserSettings, LanguageCode, LauncherApp } from './types';
import { speechService } from './utils/speech';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_SETTINGS = 'voxreel_user_settings_v1';

export default function App() {
  // Check for ?autostart=1 to bypass splash/onboarding during automated verification
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isAutoStart = urlParams?.get('autostart') === '1';

  // State Management
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [showSplash, setShowSplash] = useState(!isAutoStart);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobileFramed, setIsMobileFramed] = useState(true);
  const [isHandsFreeBotActive, setIsHandsFreeBotActive] = useState(true);

  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      preferredLanguage: 'auto',
      voiceOutputEnabled: true,
      speechRate: 1.0,
      responseStyle: 'concise',
      micPermission: 'prompt',
      storeHistory: true,
      theme: 'dark',
      hasCompletedOnboarding: isAutoStart,
      autoStartupGreeting: true,
    };
  });

  const [installedApps, setInstalledApps] = useState<LauncherApp[]>(INITIAL_APPS);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState<string | undefined>(undefined);
  const [historyCount, setHistoryCount] = useState(4);

  // Errors & Toasts
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [errorDetails, setErrorDetails] = useState<{ appName?: string; packageName?: string; message?: string } | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Track if startup greeting has occurred
  const hasGreetedRef = React.useRef(false);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Automatic startup greeting: When app opens, AI greets user in English and waits for request
  useEffect(() => {
    if (!showSplash && !showOnboarding && !hasGreetedRef.current) {
      hasGreetedRef.current = true;
      const greeting = "Hello! Welcome to VoxReel AI. How can I help you today?";
      showToast(`AI Greeting: "${greeting}"`);
      if (settings.voiceOutputEnabled && settings.autoStartupGreeting !== false) {
        speechService.speak(greeting, { language: 'en' });
      }
    }
  }, [showSplash, showOnboarding, settings.voiceOutputEnabled, settings.autoStartupGreeting]);

  // Handle Splash Dismiss
  const handleDismissSplash = () => {
    setShowSplash(false);
    if (!settings.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  // Handle Onboarding Completion
  const handleCompleteOnboarding = (language: LanguageCode, micGranted: boolean) => {
    setSettings((prev) => ({
      ...prev,
      preferredLanguage: language,
      micPermission: micGranted ? 'granted' : 'denied',
      hasCompletedOnboarding: true,
    }));
    setShowOnboarding(false);
    showToast(`Welcome! Language set to ${language.toUpperCase()}.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Launch App handler (PRD 8.5)
  const handleLaunchApp = (appId: string) => {
    const target = installedApps.find((a) => a.id.toLowerCase() === appId.toLowerCase());

    if (!target) {
      setErrorType('app_not_installed');
      setErrorDetails({
        appName: appId.charAt(0).toUpperCase() + appId.slice(1),
        packageName: `com.${appId}.android`,
      });
      return;
    }

    if (!target.isInstalled) {
      // PRD Requirement: Speak or display "WhatsApp is not installed on this device"
      const missingMsg = `${target.name} is not installed on this device.`;
      if (settings.voiceOutputEnabled) {
        speechService.speak(missingMsg, { language: settings.preferredLanguage });
      }
      setErrorType('app_not_installed');
      setErrorDetails({
        appName: target.name,
        packageName: target.packageName,
      });
      return;
    }

    // Authentic Android package intent / deep link execution
    showToast(`[Android Intent] Opening ${target.name} (${target.packageName})`);

    // In a browser environment, open the deep link or web fallback
    try {
      if (target.webUrl && target.webUrl !== '#camera' && target.webUrl !== '#calculator') {
        window.open(target.webUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast(`Launched local Android utility: ${target.name}`);
      }
    } catch (e) {
      console.warn('Intent launch notice:', e);
    }
  };

  // Toggle installation state to verify PRD acceptance criteria
  const handleToggleInstallState = (appId: string) => {
    setInstalledApps((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const nextState = !a.isInstalled;
          showToast(`${a.name} is now simulated as ${nextState ? 'INSTALLED' : 'UNINSTALLED'}.`);
          return { ...a, isInstalled: nextState };
        }
        return a;
      })
    );
  };

  // In-app media action
  const handleMediaAction = (action: string) => {
    showToast(`Media control: ${action.toUpperCase()}`);
    if (currentTab !== 'feed') {
      setCurrentTab('feed');
    }
  };

  // Voice assistant trigger
  const handleOpenVoiceWithQuery = (query?: string) => {
    setVoiceQuery(query);
    setIsVoiceModalOpen(true);
  };

  // Settings update
  const handleUpdateSettings = (updated: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
    showToast('Settings saved.');
  };

  // Clear history API call (PRD 10.4)
  const handleClearHistory = async () => {
    try {
      await fetch('/api/v1/history?session_id=user-session', { method: 'DELETE' });
      setHistoryCount(0);
      showToast('Conversation history cleared.');
    } catch (e) {
      showToast('Failed to clear server history.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-start select-none font-sans overflow-x-hidden">
      {/* Container Frame (Mobile Frame vs Desktop Responsive) */}
      <div
        className={`w-full transition-all duration-300 flex flex-col min-h-screen ${
          isMobileFramed
            ? 'max-w-md my-0 sm:my-4 sm:rounded-[40px] sm:border-[8px] sm:border-slate-800 shadow-2xl sm:overflow-hidden bg-slate-950 relative'
            : 'max-w-5xl bg-slate-950'
        }`}
      >
        {/* Android Camera Notch & Speaker Ear on Mobile Frame */}
        {isMobileFramed && (
          <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-slate-900 border-b border-slate-800/80">
            <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center gap-2 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        )}

        {/* Header Bar */}
        <HeaderBar
          settings={settings}
          isMobileFramed={isMobileFramed}
          onToggleFrame={() => setIsMobileFramed(!isMobileFramed)}
          onOpenVoice={() => handleOpenVoiceWithQuery()}
          isListening={isVoiceModalOpen}
          isHandsFreeActive={isHandsFreeBotActive}
          onToggleHandsFree={() => setIsHandsFreeBotActive((prev) => !prev)}
        />

        {/* Hands-Free Voice Bot Bar (Always listening touch-free) */}
        {!showSplash && !showOnboarding && !isVoiceModalOpen && (
          <HandsFreeBotBar
            settings={settings}
            installedApps={installedApps}
            onLaunchApp={handleLaunchApp}
            onMediaAction={handleMediaAction}
            onNavigateTab={setCurrentTab}
            onOpenFullVoiceModal={handleOpenVoiceWithQuery}
            showToast={showToast}
            isHandsFreeActive={isHandsFreeBotActive}
            onToggleHandsFree={() => setIsHandsFreeBotActive((prev) => !prev)}
          />
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 inset-x-4 z-40 max-w-sm mx-auto bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 text-white text-xs px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium truncate">{toastMessage}</span>
          </div>
        )}

        {/* Active Screen View */}
        <main className="flex-1 w-full overflow-y-auto">
          {currentTab === 'home' && (
            <HomeScreen
              settings={settings}
              onTabChange={setCurrentTab}
              onOpenVoiceWithQuery={handleOpenVoiceWithQuery}
              isListening={isVoiceModalOpen}
              installedApps={installedApps}
            />
          )}

          {currentTab === 'feed' && (
            <VideoFeedScreen
              videos={INITIAL_VIDEOS}
              settings={settings}
              onOpenVoiceWithQuery={handleOpenVoiceWithQuery}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'study' && (
            <StudyModeScreen
              settings={settings}
              onOpenVoiceWithQuery={handleOpenVoiceWithQuery}
            />
          )}

          {currentTab === 'launcher' && (
            <AppLauncherScreen
              apps={installedApps}
              onLaunchApp={handleLaunchApp}
              onOpenVoiceWithQuery={handleOpenVoiceWithQuery}
              onToggleInstallState={handleToggleInstallState}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearHistory}
              historyCount={historyCount}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onOpenVoice={() => handleOpenVoiceWithQuery()}
          isListening={isVoiceModalOpen}
        />
      </div>

      {/* Screen 1: Splash Screen */}
      {showSplash && <SplashScreen onDismiss={handleDismissSplash} />}

      {/* Screen 2: Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          settings={settings}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Screen 4: Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        settings={settings}
        installedApps={installedApps}
        initialQuery={voiceQuery}
        onLaunchApp={handleLaunchApp}
        onMediaAction={handleMediaAction}
        onNavigateTab={setCurrentTab}
      />

      {/* Screen 9: Error Modal */}
      <ErrorModal
        errorType={errorType}
        details={errorDetails}
        onClose={() => setErrorType(null)}
        onAction={() => {
          setErrorType(null);
          setIsVoiceModalOpen(true);
        }}
      />
    </div>
  );
}
