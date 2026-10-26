import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Volume2,
  Mic2,
  FileText,
  Upload,
  ClipboardPaste,
  Trash2,
  Wand2,
  BookOpen,
  Headphones,
  AlertCircle,
  Loader2,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { GeminiVoiceId, AudioRecord, DialogueTurn } from './types/tts';
import { GEMINI_VOICES, PRESET_SAMPLES, STYLE_PRESETS, ACCENT_OPTIONS } from './data/presets';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceSelector } from './components/VoiceSelector';
import { AccentSelector } from './components/AccentSelector';
import { StyleSelector } from './components/StyleSelector';
import { DialogueEditor } from './components/DialogueEditor';
import { BrowserSpeechEngine } from './components/BrowserSpeechEngine';
import { HistoryDrawer } from './components/HistoryDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'dialogue' | 'browser'>('single');
  const [text, setText] = useState<string>(PRESET_SAMPLES[0].text);
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoiceId>('Kore');
  const [selectedAccent, setSelectedAccent] = useState<string>(ACCENT_OPTIONS[0].id);
  const [selectedAccentDirective, setSelectedAccentDirective] = useState<string>(
    ACCENT_OPTIONS[0].promptDirective
  );
  const [currentStyle, setCurrentStyle] = useState<string>(STYLE_PRESETS[0].prompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<{
    url: string;
    voiceName: string;
    title: string;
  } | null>(null);
  const [history, setHistory] = useState<AudioRecord[]>([]);
  const [enhancedSuccess, setEnhancedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vozgen_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveRecord = (record: AudioRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev.slice(0, 19)]; // Keep last 20
      try {
        localStorage.setItem('vozgen_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('vozgen_history');
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      try {
        localStorage.setItem('vozgen_history', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Convert single text to audio via backend Gemini TTS
  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setErrorMessage('Por favor ingresa o pega algún texto para convertir a audio.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          style: currentStyle,
          language: 'es',
          accent: selectedAccent,
          accentDirective: selectedAccentDirective,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ocurrió un error al sintetizar la voz.');
      }

      // Convert base64 audio to Blob URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const words = text.trim().split(/\s+/).length;
      const voiceInfo = GEMINI_VOICES.find((v) => v.id === selectedVoice);
      const voiceName = voiceInfo?.name || selectedVoice;

      const newRecord: AudioRecord = {
        id: `rec-${Date.now()}`,
        text: text.trim(),
        voiceId: selectedVoice,
        voiceName,
        style: currentStyle,
        accent: selectedAccent,
        createdAt: Date.now(),
        audioUrl,
        duration: data.estimatedDurationSec || Math.round(words / 2.5),
        wordCount: words,
        engine: 'gemini',
      };

      saveRecord(newRecord);
      setCurrentAudio({
        url: audioUrl,
        voiceName,
        title: text.slice(0, 45) + (text.length > 45 ? '...' : ''),
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Error al conectar con el servidor.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Dialogue mode audio generator
  const handleGenerateDialogue = async (turns: DialogueTurn[]) => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: turns.map((t) => ({
            speaker: t.speaker,
            voice: t.voice,
            text: t.text,
            style: t.style,
          })),
          speaker1: { name: turns[0]?.speaker || 'Personaje 1', voice: turns[0]?.voice || 'Kore' },
          speaker2: { name: turns[1]?.speaker || 'Personaje 2', voice: turns[1]?.voice || 'Puck' },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al generar diálogo.');
      }

      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const fullDialogueText = turns.map((t) => `${t.speaker}: ${t.text}`).join(' ');
      const words = fullDialogueText.split(/\s+/).length;

      const newRecord: AudioRecord = {
        id: `dialogue-${Date.now()}`,
        text: `[Diálogo] ${turns[0]?.speaker} y ${turns[1]?.speaker || 'interlocutor'}`,
        voiceId: 'multi',
        voiceName: 'Dúo Multi-Voz',
        style: 'Diálogo teatral',
        createdAt: Date.now(),
        audioUrl,
        duration: Math.round(words / 2.5),
        wordCount: words,
        engine: 'gemini',
      };

      saveRecord(newRecord);
      setCurrentAudio({
        url: audioUrl,
        voiceName: 'Dúo Multi-Voz',
        title: `Diálogo: ${turns.length} intervenciones`,
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhance text with AI for natural speech pauses & cadence
  const handleEnhanceText = async () => {
    if (!text.trim() || isEnhancing) return;
    setIsEnhancing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, locale: selectedAccent }),
      });
      const data = await res.json();
      if (data.success && data.enhancedText) {
        setText(data.enhancedText);
        setEnhancedSuccess(true);
        setTimeout(() => setEnhancedSuccess(false), 3000);
      }
    } catch (err: unknown) {
      console.warn('Could not enhance text:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText((prev) => (prev ? `${prev}\n\n${clipText}` : clipText));
      }
    } catch (err) {
      console.warn('Clipboard read failed', err);
    }
  };

  // File upload reader (.txt or .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Word and time calculations
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 2.5));
  const estimatedReadingTime =
    estimatedSeconds < 60
      ? `~${estimatedSeconds} seg`
      : `~${Math.floor(estimatedSeconds / 60)} min ${estimatedSeconds % 60} seg`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white">
                  VozGen
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <span>🇪🇸</span>
                  <span>Español de España</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Texto a Audio con pronunciación castellana peninsular y voces de IA
              </p>
            </div>
          </div>

          {/* Navigation Mode Tabs */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'single'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Narrador Único</span>
            </button>
            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'dialogue'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modo Diálogo</span>
            </button>
            <button
              onClick={() => setActiveTab('browser')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'browser'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Navegador</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Active Player Card (Always prominent when audio is ready) */}
        {currentAudio && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <AudioPlayer
              audioUrl={currentAudio.url}
              voiceName={currentAudio.voiceName}
              title={currentAudio.title}
            />
          </section>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold">{errorMessage}</p>
              <p className="text-rose-300/80">
                Puedes probar cambiando la voz o utilizar la pestaña de Síntesis del Navegador
                para escuchar el texto al instante.
              </p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-rose-400 hover:text-rose-200 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area based on Selected Tab */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Text Editor & Presets */}
            <div className="lg:col-span-8 space-y-5">
              {/* Presets Bar */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Textos de Ejemplo en Español</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Carga rápida con 1 clic</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => {
                        setText(sample.text);
                        setSelectedVoice(sample.voice);
                        setCurrentStyle(sample.style);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 transition flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Texto a Convertir</span>
                  </label>

                  {/* Text Utilities Toolbar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="Pegar del portapapeles"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pegar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      title="Cargar archivo .txt o .md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Archivo</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={handleEnhanceText}
                      disabled={isEnhancing || !text.trim()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 text-xs font-medium transition disabled:opacity-50"
                      title="Ajusta pausas, comas y puntuación para que suene perfecto al hablar"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : enhancedSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                      )}
                      <span>{isEnhancing ? 'Pulir...' : 'Pulir locución'}</span>
                    </button>

                    {text && (
                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Borrar texto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={7}
                    placeholder="Escribe o pega aquí el texto que deseas transformar en audio..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-y transition font-normal"
                  />
                </div>

                {/* Counter & Reading time footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                  <div className="flex items-center gap-3">
                    <span>{wordCount} palabras</span>
                    <span>•</span>
                    <span>{charCount} caracteres</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Duración estimada: {estimatedReadingTime}</span>
                  </div>
                </div>
              </div>

              {/* Accent & Dialect Selector (Español de España) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
                <AccentSelector
                  selectedAccent={selectedAccent}
                  onSelectAccent={(id, directive) => {
                    setSelectedAccent(id);
                    setSelectedAccentDirective(directive);
                  }}
                />
              </div>

              {/* Voice Selector */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onSelectVoice={(v) => setSelectedVoice(v)}
                />
              </div>

              {/* Style & Emotion Selector */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
                <StyleSelector
                  currentStyle={currentStyle}
                  onStyleChange={(s) => setCurrentStyle(s)}
                />
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateAudio}
                  disabled={isGenerating || !text.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-base rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all active:scale-[0.99] cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generando audio realista con IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Convertir Texto a Audio</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-normal">
                        WAV 24kHz
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 4 Cols: History & Voice Details */}
            <div className="lg:col-span-4 space-y-5">
              {/* History Drawer */}
              <HistoryDrawer
                records={history}
                onSelectRecord={(rec) => {
                  setCurrentAudio({
                    url: rec.audioUrl,
                    voiceName: rec.voiceName,
                    title: rec.text.slice(0, 40) + '...',
                  });
                }}
                onClearHistory={handleClearHistory}
                onDeleteRecord={handleDeleteRecord}
              />

              {/* Audio Specifications Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  <span>Especificaciones de Voz</span>
                </h4>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Modelo IA:</span>
                    <span className="text-slate-200 font-mono">gemini-3.8-flash-lite-tts</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Formato de salida:</span>
                    <span className="text-slate-200 font-mono">WAV (RIFF Header)</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Frecuencia de muestreo:</span>
                    <span className="text-slate-200 font-mono">24,000 Hz (24kHz)</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span>Canales:</span>
                    <span className="text-slate-200 font-mono">Mono 16-bit PCM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Idioma optimizado:</span>
                    <span className="text-indigo-400 font-medium">Español nativo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Dialogue Tab */}
        {activeTab === 'dialogue' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <DialogueEditor
                onGenerateDialogue={handleGenerateDialogue}
                isGenerating={isGenerating}
              />
            </div>
            <div className="lg:col-span-4 space-y-5">
              <HistoryDrawer
                records={history}
                onSelectRecord={(rec) => {
                  setCurrentAudio({
                    url: rec.audioUrl,
                    voiceName: rec.voiceName,
                    title: rec.text.slice(0, 40) + '...',
                  });
                }}
                onClearHistory={handleClearHistory}
                onDeleteRecord={handleDeleteRecord}
              />
            </div>
          </div>
        )}

        {/* Browser Speech Tab */}
        {activeTab === 'browser' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Texto para el Motor del Navegador</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="Escribe o pega aquí el texto para reproducir con la voz del navegador..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y"
                />
              </div>

              <BrowserSpeechEngine text={text} />
            </div>

            <div className="lg:col-span-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
                <h4 className="font-semibold text-slate-200">
                  ¿Por qué usar la voz del navegador?
                </h4>
                <p>
                  El motor Web Speech funciona 100% de manera local en tu navegador. Es ideal
                  para lecturas inmediatas sin necesidad de conexión o llamadas al servidor.
                </p>
                <p className="text-emerald-400 pt-1">
                  Para audios descargables con calidad de estudio y modulación humana, utiliza el
                  modo <strong>Narrador Único</strong> impulsado por Gemini TTS.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 mt-8 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>VozGen • Transforma texto a audio con voces de IA de Google Gemini</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Powered by</span>
            <span className="font-semibold text-indigo-400">gemini-3.8-flash-lite-tts</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
