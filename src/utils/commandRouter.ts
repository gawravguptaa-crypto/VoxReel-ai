export type CommandIntent =
  | 'open_app'
  | 'greeting'
  | 'study_mode'
  | 'study_query'
  | 'media_control'
  | 'stop_speaking'
  | 'cancel'
  | 'general_query';

export interface RouteResult {
  intent: CommandIntent;
  target?: string;
  normalizedQuery: string;
  originalQuery: string;
  languageHint: 'en' | 'hi' | 'hinglish';
  confidence: number;
  explanation: string;
}

export interface AppDefinition {
  id: string;
  name: string;
  packageName: string;
  deepLink: string;
  webUrl: string;
  category: 'social' | 'communication' | 'utility' | 'entertainment';
  keywords: string[];
}

export const SUPPORTED_APPS: Record<string, AppDefinition> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    packageName: 'com.instagram.android',
    deepLink: 'instagram://app',
    webUrl: 'https://www.instagram.com',
    category: 'social',
    keywords: ['instagram', 'insta', 'instragram', 'इंस्टाग्राम', 'इन्स्टा'],
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    packageName: 'com.whatsapp',
    deepLink: 'whatsapp://send',
    webUrl: 'https://web.whatsapp.com',
    category: 'communication',
    keywords: ['whatsapp', 'whats app', 'whats-app', "what's app", 'व्हाट्सएप', 'व्हाट्सऐप', 'wa'],
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    packageName: 'com.google.android.youtube',
    deepLink: 'vnd.youtube://',
    webUrl: 'https://www.youtube.com',
    category: 'entertainment',
    keywords: ['youtube', 'यूट्यूब', 'yt'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    packageName: 'com.facebook.katana',
    deepLink: 'fb://facewebmodal/f?href=https://www.facebook.com',
    webUrl: 'https://www.facebook.com',
    category: 'social',
    keywords: ['facebook', 'फेसबुक', 'fb'],
  },
  chrome: {
    id: 'chrome',
    name: 'Google Chrome',
    packageName: 'com.android.chrome',
    deepLink: 'googlechrome://',
    webUrl: 'https://www.google.com',
    category: 'utility',
    keywords: ['chrome', 'क्रोम', 'browser', 'ब्राउज़र', 'google chrome', 'google', 'गूगल'],
  },
  maps: {
    id: 'maps',
    name: 'Google Maps',
    packageName: 'com.google.android.apps.maps',
    deepLink: 'geo:0,0',
    webUrl: 'https://maps.google.com',
    category: 'utility',
    keywords: ['maps', 'google maps', 'गूगल मैप्स', 'मैप्स', 'map'],
  },
  camera: {
    id: 'camera',
    name: 'Camera',
    packageName: 'com.android.camera',
    deepLink: 'content://media/external/images/media',
    webUrl: '#camera',
    category: 'utility',
    keywords: ['camera', 'कैमरा', 'photo', 'फोटो'],
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    packageName: 'com.google.android.calculator',
    deepLink: 'calculator://',
    webUrl: '#calculator',
    category: 'utility',
    keywords: ['calculator', 'कैलकुलेटर', 'calc'],
  },
};

/**
 * Detect language hint based on script and common Hinglish/Hindi markers
 */
export function detectLanguage(text: string): 'en' | 'hi' | 'hinglish' {
  // Check for Devanagari script
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }

  const hinglishMarkers = [
    'kholo', 'khol', 'karo', 'karun', 'kare', 'samjhao', 'batao',
    'kaise', 'kya', 'kyun', 'hai', 'hain', 'mein', 'mera', 'meri',
    'chup', 'shant', 'aawaz', 'agli', 'pichhli', 'chalao', 'ruko',
    'padhai', 'mujhe', 'hum'
  ];

  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const hasHinglish = words.some(w => hinglishMarkers.includes(w));

  if (hasHinglish) {
    return 'hinglish';
  }

  return 'en';
}

/**
 * Classifies a user command into structured intent
 */
export function routeCommand(rawInput: string): RouteResult {
  const originalQuery = rawInput.trim();
  const normalized = originalQuery.toLowerCase().replace(/[?!.,]/g, '').trim();
  const lang = detectLanguage(originalQuery);

  if (!normalized) {
    return {
      intent: 'general_query',
      normalizedQuery: '',
      originalQuery,
      languageHint: lang,
      confidence: 0.1,
      explanation: 'Empty command received',
    };
  }

  // 1. Control / Cancel / Stop speaking
  const stopKeywords = [
    'stop speaking', 'stop talking', 'be quiet', 'shut up',
    'chup raho', 'chup ho jao', 'shant ho jao', 'aawaz band karo', 'bolna band karo',
    'stop'
  ];
  if (stopKeywords.some(k => normalized === k || normalized.startsWith(k + ' '))) {
    return {
      intent: 'stop_speaking',
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.95,
      explanation: 'User requested to stop voice synthesis',
    };
  }

  const cancelKeywords = ['cancel', 'radd karo', 'cancel karo', 'dismiss'];
  if (cancelKeywords.some(k => normalized === k)) {
    return {
      intent: 'cancel',
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.95,
      explanation: 'User requested to cancel current operation',
    };
  }

  // 2. Greetings
  const greetings = [
    'hi', 'hello', 'hey', 'namaste', 'namaskar', 'pranam', 'kem cho',
    'salam', 'kaisa hai', 'kaise ho', 'good morning', 'good evening', 'good afternoon'
  ];
  if (greetings.includes(normalized) || /^hi\b|^hello\b|^hey\b/i.test(normalized) && normalized.split(' ').length <= 2) {
    return {
      intent: 'greeting',
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.98,
      explanation: 'User sent a standard greeting',
    };
  }

  // 3. Media Controls (Next video, Pause, Play, Mute)
  const isNext = /^(next|next video|agli video|skip video|swipe up|agla video)$/i.test(normalized);
  const isPrev = /^(prev|previous|previous video|pichhli video|pichla video)$/i.test(normalized);
  const isPause = /^(pause|pause video|ruko|rok do|stop video)$/i.test(normalized);
  const isPlay = /^(play|play video|chalao|resume|continue video)$/i.test(normalized);
  const isMute = /^(mute|unmute|mute video|mute audio|aawaz band)$/i.test(normalized);

  if (isNext || isPrev || isPause || isPlay || isMute) {
    let action = 'next';
    if (isPrev) action = 'prev';
    if (isPause) action = 'pause';
    if (isPlay) action = 'play';
    if (isMute) action = 'mute';

    return {
      intent: 'media_control',
      target: action,
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.9,
      explanation: `Feed media control action: ${action}`,
    };
  }

  // 4. App Launching ("Open Instagram", "WhatsApp kholo", "Launch YouTube")
  const openActionRegex = /(open|launch|start|run|kholo|khol|khol do|chalao|laga do|chalu karo)\s+([a-z0-9\s]+)/i;
  const matchAfterOpen = normalized.match(openActionRegex);

  const reverseOpenRegex = /([a-z0-9\s]+)\s+(kholo|khol|khol do|open karo|launch karo|chalao|laga do|chalu karo)/i;
  const matchBeforeOpen = normalized.match(reverseOpenRegex);

  let candidateAppString = '';
  if (matchAfterOpen && matchAfterOpen[2]) {
    candidateAppString = matchAfterOpen[2].trim();
  } else if (matchBeforeOpen && matchBeforeOpen[1]) {
    candidateAppString = matchBeforeOpen[1].trim();
  }

  // Match apps with priority to longest keyword (e.g. "google maps" before "google")
  let bestMatch: { appKey: string; appDef: AppDefinition; keywordLength: number } | null = null;

  for (const [appKey, appDef] of Object.entries(SUPPORTED_APPS)) {
    for (const kw of appDef.keywords) {
      let isMatch = false;
      if (candidateAppString && (candidateAppString === kw || candidateAppString.includes(kw))) {
        isMatch = true;
      } else if (
        normalized.includes(kw) && (
          normalized.includes('open') ||
          normalized.includes('launch') ||
          normalized.includes('kholo') ||
          normalized.includes('khol') ||
          normalized.includes('chalao') ||
          normalized === kw
        )
      ) {
        isMatch = true;
      }

      if (isMatch) {
        if (!bestMatch || kw.length > bestMatch.keywordLength) {
          bestMatch = { appKey, appDef, keywordLength: kw.length };
        }
      }
    }
  }

  if (bestMatch) {
    return {
      intent: 'open_app',
      target: bestMatch.appKey,
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.95,
      explanation: `Application launch requested for ${bestMatch.appDef.name}`,
    };
  }

  // 5. Study Mode / Assignment / Academic topics
  const studyKeywords = [
    'assignment', 'study mode', 'padhai', 'homework', 'exam',
    'explain', 'samjhao', 'batao', 'how does', 'what is', 'code for',
    'function overloading', 'recursion', 'binary search', 'polymorphism',
    'inheritance', 'data structure', 'algorithm', 'c++', 'python', 'java'
  ];

  const isStudy = studyKeywords.some(kw => normalized.includes(kw));
  if (
    normalized.includes('assignment') ||
    normalized.includes('study mode') ||
    normalized.includes('padhai karni hai')
  ) {
    return {
      intent: 'study_mode',
      target: 'study_hub',
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.92,
      explanation: 'User requested Study Mode or assignment assistance',
    };
  }

  if (isStudy) {
    return {
      intent: 'study_query',
      normalizedQuery: normalized,
      originalQuery,
      languageHint: lang,
      confidence: 0.88,
      explanation: 'Educational question or concept explanation requested',
    };
  }

  // 6. Default to general AI query
  return {
    intent: 'general_query',
    normalizedQuery: normalized,
    originalQuery,
    languageHint: lang,
    confidence: 0.75,
    explanation: 'General query routed to AI assistant',
  };
}
