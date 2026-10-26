import React, { useState } from 'react';
import { DialogueTurn, GeminiVoiceId } from '../types/tts';
import { Plus, Trash2, Mic, Play, Loader2, Sparkles } from 'lucide-react';
import { GEMINI_VOICES } from '../data/presets';

interface DialogueEditorProps {
  onGenerateDialogue: (turns: DialogueTurn[]) => Promise<void>;
  isGenerating: boolean;
}

export const DialogueEditor: React.FC<DialogueEditorProps> = ({
  onGenerateDialogue,
  isGenerating,
}) => {
  const [turns, setTurns] = useState<DialogueTurn[]>([
    {
      id: 'turn-1',
      speaker: 'Carlos',
      voice: 'Puck',
      text: '¡Oye Lucía! ¿Has probado la síntesis de voz en español de España? La pronunciación de la z y la c suena clavadita a un doblaje de cine.',
      style: 'Español de España, entonación peninsular entusiasta y cercana',
    },
    {
      id: 'turn-2',
      speaker: 'Lucía',
      voice: 'Kore',
      text: '¡Es una auténtica pasada! Se nota muchísimo en las pausas y en la cadencia castellana. Ya no suena neutral ni artificial.',
      style: 'Español de España, tono cálido, sorprendido y natural',
    },
    {
      id: 'turn-3',
      speaker: 'Carlos',
      voice: 'Puck',
      text: 'Totalmente. Para preparar audiolibros, doblajes o piezas de radio aquí en España es perfecto.',
      style: 'Español peninsular, convincente y sonriente',
    },
  ]);

  const addTurn = (defaultSpeaker: string = 'Alex', defaultVoice: GeminiVoiceId = 'Puck') => {
    const lastTurn = turns[turns.length - 1];
    const nextSpeaker = lastTurn?.speaker === 'Alex' ? 'Sofía' : 'Alex';
    const nextVoice: GeminiVoiceId = nextSpeaker === 'Alex' ? 'Puck' : 'Kore';

    setTurns([
      ...turns,
      {
        id: `turn-${Date.now()}`,
        speaker: nextSpeaker,
        voice: nextVoice,
        text: '',
      },
    ]);
  };

  const removeTurn = (id: string) => {
    if (turns.length <= 1) return;
    setTurns(turns.filter((t) => t.id !== id));
  };

  const updateTurn = (id: string, updates: Partial<DialogueTurn>) => {
    setTurns(turns.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleGenerate = () => {
    const validTurns = turns.filter((t) => t.text.trim().length > 0);
    if (validTurns.length === 0) return;
    onGenerateDialogue(validTurns);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>Guion de Diálogo Multi-Voz (gemini-3.8-flash-tts)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Alterna entre dos personajes para crear podcasts, entrevistas o dramatizaciones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addTurn()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir línea</span>
        </button>
      </div>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {turns.map((turn, index) => {
          const isAlex = turn.speaker.toLowerCase().includes('alex') || turn.voice === 'Puck';
          return (
            <div
              key={turn.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isAlex
                  ? 'bg-slate-900/90 border-amber-500/30'
                  : 'bg-slate-900/90 border-pink-500/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={turn.speaker}
                    onChange={(e) => updateTurn(turn.id, { speaker: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs font-semibold text-white w-24 focus:outline-none focus:border-indigo-500"
                    placeholder="Personaje"
                  />
                  <select
                    value={turn.voice}
                    onChange={(e) =>
                      updateTurn(turn.id, { voice: e.target.value as GeminiVoiceId })
                    }
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    {GEMINI_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.gender})
                      </option>
                    ))}
                  </select>
                </div>

                {turns.length > 1 && (
                  <button
                    onClick={() => removeTurn(turn.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                    title="Eliminar línea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <textarea
                value={turn.text}
                onChange={(e) => updateTurn(turn.id, { text: e.target.value })}
                placeholder="Escribe lo que dice este personaje..."
                rows={2}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
              />
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || turns.every((t) => !t.text.trim())}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg transition active:scale-95"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando diálogo multi-voz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generar Audio de Diálogo Completo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
