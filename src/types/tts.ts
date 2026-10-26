export type GeminiVoiceId = 'Kore' | 'Puck' | 'Fenrir' | 'Charon' | 'Zephyr';

export interface VoiceOption {
  id: GeminiVoiceId;
  name: string;
  gender: 'Femenina' | 'Masculina';
  badge: string;
  tone: string;
  recommendedFor: string;
  avatarColor: string;
}

export interface AccentOption {
  id: string;
  name: string;
  flag: string;
  description: string;
  promptDirective: string;
}

export interface AudioRecord {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  style: string;
  accent?: string;
  createdAt: number;
  audioUrl: string; // Blob URL or data URL
  duration: number; // in seconds
  wordCount: number;
  engine: 'gemini' | 'browser';
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  voice: GeminiVoiceId;
  text: string;
  style?: string;
}

export interface PresetSample {
  id: string;
  title: string;
  category: 'Audiolibro' | 'Podcast' | 'Noticias' | 'Meditación' | 'Publicidad' | 'Cuento';
  voice: GeminiVoiceId;
  style: string;
  text: string;
}
