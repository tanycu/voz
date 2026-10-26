import React, { useState, useEffect } from 'react';
import { Volume2, Play, Square, Pause, Settings2 } from 'lucide-react';

interface BrowserSpeechEngineProps {
  text: string;
}

export const BrowserSpeechEngine: React.FC<BrowserSpeechEngineProps> = ({ text }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      
      const isSpain = (v: SpeechSynthesisVoice) =>
        v.lang === 'es-ES' ||
        v.lang === 'es_ES' ||
        v.name.toLowerCase().includes('spain') ||
        v.name.toLowerCase().includes('españa') ||
        v.name.toLowerCase().includes('castilian');

      const isOtherSpanish = (v: SpeechSynthesisVoice) =>
        v.lang.startsWith('es') && !isSpain(v);

      const spainVoices = allVoices.filter(isSpain);
      const otherSpanishVoices = allVoices.filter(isOtherSpanish);
      const nonSpanish = allVoices.filter((v) => !v.lang.startsWith('es'));

      const sorted = [...spainVoices, ...otherSpanishVoices, ...nonSpanish];
      setVoices(sorted);

      if (sorted.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(sorted[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!text.trim() || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoiceURI) {
      const chosen = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (chosen) utterance.voice = chosen;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Síntesis Vocal del Navegador (Web Speech)
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Sin límite • Instantáneo
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
            Voz del Sistema
          </label>
          <select
            value={selectedVoiceURI}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            {voices.map((v) => {
              const isSpainVoice =
                v.lang === 'es-ES' ||
                v.lang === 'es_ES' ||
                v.name.toLowerCase().includes('spain') ||
                v.name.toLowerCase().includes('españa');
              return (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {isSpainVoice ? '🇪🇸 [España] ' : ''}
                  {v.name} ({v.lang})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Velocidad</span>
            <span className="font-mono">{rate}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Tono (Pitch)</span>
            <span className="font-mono">{pitch}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleSpeak}
          disabled={!text.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow transition"
        >
          {isPaused ? (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Reanudar</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Reproducir con Navegador</span>
            </>
          )}
        </button>

        {isSpeaking && (
          <button
            onClick={handlePause}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition"
            title="Pausar"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}

        {(isSpeaking || isPaused) && (
          <button
            onClick={handleStop}
            className="p-2 bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/40 text-rose-300 rounded-lg text-xs transition"
            title="Detener"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        )}
      </div>
    </div>
  );
};
