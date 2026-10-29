import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { routeCommand } from './src/utils/commandRouter.js';
import { getIntelligentReply } from './src/utils/knowledgeEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory conversation history store (session based)
interface StoredMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  timestamp: string;
  intent?: string;
  appTarget?: string;
}

const messageHistory: StoredMessage[] = [];

// Initialize Gemini SDK with provided API key (from env or user-supplied key)
let currentApiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KMqVK3Z8CKwPgqc4mNM7YitPFUH34ZHXfcsqwRyDQ2KQ';

function createGenAIClient(apiKeyString?: string): GoogleGenAI | null {
  const key = apiKeyString || currentApiKey;
  if (!key) return null;
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('[VoxReel AI] Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

let aiClient: GoogleGenAI | null = createGenAIClient();
if (aiClient) {
  console.log('[VoxReel AI] GoogleGenAI client initialized successfully.');
}

// PRD System Prompt - Optimized for fast, accurate, multi-lingual answers
const SYSTEM_INSTRUCTION = `You are VoxReel AI, an intelligent, helpful voice bot and multimodal assistant.
You provide accurate, smart, friendly, and direct responses to every question the user asks.

Guidelines:
1. Language:
   - If the user speaks or asks in Hindi (e.g., "पटना कहाँ है?"), respond in clear Hindi.
   - If the user speaks in Hinglish (e.g., "where is patna", "instagram kholo", "binary search samjhao"), respond in natural, friendly Hinglish or English.
   - If the user asks in English, respond in fluent, concise English.
2. Answering Style:
   - Provide direct, factually accurate answers (2-4 sentences max for voice clarity).
   - For educational / coding questions (DSA, C++, Python, Math): explain concepts clearly with logic and code where relevant.
   - For general knowledge (geography, history, facts): answer clearly and directly with interesting context.
   - When the user asks to open an app (e.g. Instagram, WhatsApp), acknowledge warmly that the app is opening in English (e.g. "Opening Instagram.", "Opening WhatsApp.").
3. Always be helpful, respectful, and fast.`;

// 1. Health check endpoint (PRD 10.1)
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!aiClient,
    model: 'gemini-flash-lite-latest',
  });
});

// Gemini status check endpoint
app.get('/api/v1/gemini-status', (_req: Request, res: Response) => {
  const isKeyConfigured = !!currentApiKey;
  const maskedKey = currentApiKey
    ? currentApiKey.length > 8
      ? currentApiKey.slice(0, 4) + '...' + currentApiKey.slice(-4)
      : '***'
    : '';

  res.json({
    success: true,
    configured: isKeyConfigured,
    maskedKey,
    hasClient: !!aiClient,
    availableModels: [
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite',
      'gemma-4-26b-a4b-it',
      'gemini-3.5-flash',
      'gemini-flash-latest',
    ],
  });
});

// Gemini custom key registration & verification endpoint
app.post('/api/v1/gemini-key', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
    return res.status(400).json({ success: false, error: 'A valid Gemini API Key is required.' });
  }

  const trimmedKey = apiKey.trim();
  const testClient = createGenAIClient(trimmedKey);
  if (!testClient) {
    return res.status(400).json({ success: false, error: 'Failed to initialize Google Gen AI client.' });
  }

  // Test models in sequence
  let validatedModel = '';
  let pingError = '';
  const testModels = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemma-4-26b-a4b-it', 'gemini-3.5-flash'];

  for (const model of testModels) {
    try {
      const ping = await Promise.race([
        testClient.models.generateContent({
          model,
          contents: 'Say OK',
        }),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)),
      ]);
      if ((ping as any)?.text) {
        validatedModel = model;
        break;
      }
    } catch (err: any) {
      pingError = err?.message || String(err);
    }
  }

  // Update current key and client
  currentApiKey = trimmedKey;
  aiClient = testClient;

  if (validatedModel) {
    return res.json({
      success: true,
      message: `Gemini API key successfully connected with model: ${validatedModel}!`,
      activeModel: validatedModel,
    });
  } else {
    return res.json({
      success: true,
      warning: true,
      message: `Gemini API key saved! (Note: ${pingError.slice(0, 140)}). VoxReel high-intelligence offline responder is also active.`,
      activeModel: 'offline-smart-engine',
    });
  }
});

// Startup greeting endpoint
app.get('/api/v1/startup-greeting', (_req: Request, res: Response) => {
  res.json({
    success: true,
    greeting: "Hello! Welcome to VoxReel AI. How can I help you today?",
    language: "en"
  });
});

// 2. Command classification endpoint (PRD 10.5)
app.post('/api/v1/classify-command', (req: Request, res: Response) => {
  const { command } = req.body;
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command text is required' });
  }

  const result = routeCommand(command);
  return res.json({
    success: true,
    intent: result.intent,
    app: result.target,
    languageHint: result.languageHint,
    confidence: result.confidence,
    explanation: result.explanation,
  });
});

// 3. AI Chat endpoint (PRD 10.2)
app.post('/api/v1/chat', async (req: Request, res: Response) => {
  try {
    const {
      message,
      language = 'auto',
      session_id = 'default-session',
      mode = 'assistant',
      apiKey: customApiKey,
      model: customModel,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const commandRouting = routeCommand(message);

    // Save user message to history
    const userMsgId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    messageHistory.push({
      id: userMsgId,
      sessionId: session_id,
      role: 'user',
      content: message,
      language,
      timestamp: new Date().toISOString(),
      intent: commandRouting.intent,
      appTarget: commandRouting.target,
    });

    let replyText = '';
    let responseLanguage = commandRouting.languageHint;

    // Fast-path handling according to user requirements
    if (commandRouting.intent === 'open_app') {
      const appName = commandRouting.target ? commandRouting.target.charAt(0).toUpperCase() + commandRouting.target.slice(1) : 'application';
      replyText = `Opening ${appName}.`;
      responseLanguage = 'en';
    } else if (commandRouting.intent === 'stop_speaking') {
      replyText = commandRouting.languageHint === 'hi' ? 'आवाज़ बंद कर दी गई है।' : 'Voice stopped.';
    } else if (commandRouting.intent === 'cancel') {
      replyText = commandRouting.languageHint === 'hi' ? 'रद्द कर दिया गया।' : 'Cancelled.';
    } else {
      // Determine active AI client (custom key if provided by user, else default)
      const targetClient = customApiKey ? createGenAIClient(customApiKey) : aiClient;

      if (targetClient) {
        const promptLangDirective = language !== 'auto'
          ? `Respond in ${language}.`
          : `Respond in the user's language (${commandRouting.languageHint}).`;

        const modeDirective = mode === 'study'
          ? 'Focus on student education, step-by-step logic, assignment clarity, and code examples.'
          : 'Be concise, accurate, helpful, and direct (2-3 sentences max).';

        const fullPrompt = `${SYSTEM_INSTRUCTION}\n\n[Context: ${modeDirective} ${promptLangDirective}]\n\nUser Question: ${message}`;

        // Cascade candidate models in order of availability and quota
        const candidateModels = customModel
          ? [customModel, 'gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemma-4-26b-a4b-it', 'gemini-3.5-flash', 'gemini-flash-latest']
          : ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemma-4-26b-a4b-it', 'gemini-3.5-flash', 'gemini-flash-latest'];

        for (const modelName of candidateModels) {
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Gemini API call timed out')), 8000)
            );

            const geminiCall = targetClient.models.generateContent({
              model: modelName,
              contents: fullPrompt,
            });

            const geminiRes: any = await Promise.race([geminiCall, timeoutPromise]);
            const candidateText = geminiRes.text?.trim();
            if (candidateText) {
              replyText = candidateText;
              break;
            }
          } catch (err: any) {
            console.warn(`[VoxReel AI] Model ${modelName} call failed:`, err?.status || err?.message || err);
          }
        }
      }

      // If Gemini was unavailable, timed out, or quota exceeded (429), use comprehensive knowledge engine
      if (!replyText) {
        replyText = generateFallbackResponse(message, commandRouting);
      }
    }

    if (!replyText) {
      replyText = generateFallbackResponse(message, commandRouting);
    }

    // Save assistant reply to history
    const botMsgId = 'msg-' + (Date.now() + 1) + '-' + Math.random().toString(36).substring(2, 7);
    messageHistory.push({
      id: botMsgId,
      sessionId: session_id,
      role: 'assistant',
      content: replyText,
      language: responseLanguage,
      timestamp: new Date().toISOString(),
      intent: commandRouting.intent,
      appTarget: commandRouting.target,
    });

    return res.json({
      success: true,
      reply: replyText,
      language: responseLanguage,
      intent: commandRouting.intent,
      app: commandRouting.target,
      sessionId: session_id,
    });
  } catch (error: any) {
    console.error('Error in /api/v1/chat:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing the request.',
    });
  }
});

// 4. Conversation History (PRD 10.3)
app.get('/api/v1/history', (req: Request, res: Response) => {
  const sessionId = (req.query.session_id as string) || 'default-session';
  const history = messageHistory.filter((m) => m.sessionId === sessionId);
  return res.json({
    success: true,
    sessionId,
    count: history.length,
    messages: history,
  });
});

// 5. Delete Conversation History (PRD 10.4)
app.delete('/api/v1/history', (req: Request, res: Response) => {
  const sessionId = (req.query.session_id as string) || 'default-session';
  const initialLength = messageHistory.length;
  for (let i = messageHistory.length - 1; i >= 0; i--) {
    if (messageHistory[i].sessionId === sessionId) {
      messageHistory.splice(i, 1);
    }
  }
  const deletedCount = initialLength - messageHistory.length;
  return res.json({
    success: true,
    deletedCount,
    message: `History for session ${sessionId} successfully cleared.`,
  });
});

// Comprehensive, intelligent knowledge responder
function generateFallbackResponse(message: string, routing: any): string {
  return getIntelligentReply(message, routing.languageHint);
}

// Development and production Vite server setup
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VoxReel AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
