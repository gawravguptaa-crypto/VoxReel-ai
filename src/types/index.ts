export type AppTab = 'home' | 'feed' | 'study' | 'launcher' | 'settings';

export type LanguageCode = 'auto' | 'hi' | 'hinglish' | 'en';

export interface UserSettings {
  preferredLanguage: LanguageCode;
  voiceOutputEnabled: boolean;
  speechRate: number;
  responseStyle: 'concise' | 'detailed' | 'academic';
  micPermission: 'prompt' | 'granted' | 'denied';
  storeHistory: boolean;
  theme: 'dark' | 'light';
  hasCompletedOnboarding: boolean;
  autoStartupGreeting: boolean;
  geminiApiKey?: string;
  geminiModel?: string;
}

export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  creator: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    isFollowed: boolean;
  };
  tags: string[];
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  audioTitle: string;
  category: 'coding' | 'tech' | 'campus' | 'science' | 'ai';
  comments: CommentItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
  intent?: string;
  appTarget?: string;
  status?: 'speaking' | 'idle' | 'error';
}

export interface LauncherApp {
  id: string;
  name: string;
  packageName: string;
  deepLink: string;
  webUrl: string;
  category: 'social' | 'communication' | 'utility' | 'entertainment';
  icon: string;
  color: string;
  description: string;
  isInstalled: boolean;
}
