import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialise Gemini SDK with mandatory telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const SUPPORTED_VOICES = [
  { id: 'Kore', name: 'Kore', gender: 'Femenina', tone: 'Cálida, clara y natural', recommendedFor: 'Audiolibros, explicaciones y locuciones' },
  { id: 'Puck', name: 'Puck', gender: 'Masculina', tone: 'Joven, enérgica y dinámica', recommendedFor: 'Podcasts, tutoriales y redes sociales' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Masculina', tone: 'Profunda, solemne y autoritaria', recommendedFor: 'Documentales, trailers y dramatizaciones' },
  { id: 'Charon', name: 'Charon', gender: 'Masculina', tone: 'Serena, reflexiva y madura', recommendedFor: 'Artículos de opinión, ensayos y noticias' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Femenina', tone: 'Suave, melódica y calmante', recommendedFor: 'Meditación, bienestar e historias para dormir' },
];

// Health and capability check
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedVoices: SUPPORTED_VOICES,
    timestamp: new Date().toISOString(),
  });
});

// Single-speaker TTS endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      text,
      voice = 'Kore',
      style = 'Natural, clara y fluida',
      language = 'es',
      accent = 'es-ES-standard',
      accentDirective,
    } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El texto es obligatorio para generar el audio.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        success: false,
        error: 'No se encontró la clave GEMINI_API_KEY configurada en el servidor. Puedes utilizar la síntesis vocal integrada del navegador.',
        fallbackToBrowser: true,
      });
      return;
    }

    // Determine regional Spanish accent directive
    const regionalDirective =
      accentDirective ||
      (accent.startsWith('es-ES')
        ? 'Idioma: Español de España (castellano peninsular). Fonética: distinción clara entre "z/c" (sonido /θ/) y "s" (/s/). Entonación y acento peninsular europeo natural de España.'
        : 'Idioma: Español neutro internacional.');

    const stylePrompt = `${regionalDirective} Estilo y modulación: ${style}. Ritmo fluido, dicción precisa y pausas expresivas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.trim(),
              speechMetadata: {
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((part) => part.inlineData?.data);

    if (!audioPart || !audioPart.inlineData?.data) {
      const textMessage = candidate?.content?.parts?.find((part) => part.text)?.text;
      res.status(502).json({
        success: false,
        error: textMessage || 'El modelo no retornó datos de audio. Por favor intenta nuevamente.',
      });
      return;
    }

    const base64Audio = audioPart.inlineData.data;
    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

    // Calculate approximate duration based on word count
    const words = text.trim().split(/\s+/).length;
    const estimatedDurationSec = Math.max(1, Math.round(words / 2.5));

    res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType,
      voice,
      textLength: text.length,
      wordCount: words,
      estimatedDurationSec,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating TTS:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Error inesperado al generar el audio.',
      fallbackToBrowser: true,
    });
  }
});

// Dual-speaker dialogue TTS endpoint using gemini-3.8-flash-tts
app.post('/api/tts/dialogue', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      turns,
      speaker1 = { name: 'Voz 1', voice: 'Kore' },
      speaker2 = { name: 'Voz 2', voice: 'Puck' },
      overallStyle = 'Conversación fluida, dinámica y natural en español',
    } = req.body;

    if (!Array.isArray(turns) || turns.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Se requiere una lista de turnos de diálogo.',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        success: false,
        error: 'No se encontró la clave GEMINI_API_KEY configurada en el servidor.',
        fallbackToBrowser: true,
      });
      return;
    }

    const parts = turns.map((turn: { speaker: string; text: string; style?: string }) => ({
      text: `${turn.speaker}: ${turn.text}`,
      speechMetadata: {
        speaker: turn.speaker,
        style: turn.style || overallStyle,
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: speaker1.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker1.voice },
                },
              },
              {
                speaker: speaker2.name,
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: speaker2.voice },
                },
              },
            ],
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((part) => part.inlineData?.data);

    if (!audioPart || !audioPart.inlineData?.data) {
      res.status(502).json({
        success: false,
        error: 'El modelo no retornó datos de audio para el diálogo.',
      });
      return;
    }

    res.json({
      success: true,
      audioBase64: audioPart.inlineData.data,
      mimeType: audioPart.inlineData.mimeType || 'audio/wav',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating dialogue TTS:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Error inesperado al generar el audio de diálogo.',
    });
  }
});

// Prompt improvement assistant endpoint (optimizes raw text with pauses, phonetic hints or dialogue formatting)
app.post('/api/enhance-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, locale = 'es-ES' } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ success: false, error: 'Texto requerido' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ success: false, error: 'API Key no disponible' });
      return;
    }

    const isSpain = locale.startsWith('es-ES');
    const prompt = `Actúa como un experto en oratoria, doblaje y locución en ${isSpain ? 'español de España (castellano peninsular)' : 'español'}. 
Mejora el siguiente texto para que al ser leído por un motor de texto a voz (Text to Speech) suene mucho más natural, expresivo y con la entonación y pausas propias de una locución humana profesional${isSpain ? ' en España' : ''}.
Ajusta la puntuación (comas, puntos y pausas expresivas) para favorecer una respiración natural durante la síntesis vocal. Conserva fielmente el significado y la intención del texto.
Devuelve ÚNICAMENTE el texto mejorado, sin explicaciones ni comillas adicionales.

Texto original:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      enhancedText: response.text?.trim() || text,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ success: false, error: err.message });
  }
});

// Setup dev server with Vite or production static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TTS Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
