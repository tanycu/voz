import React from 'react';
import { GEMINI_VOICES } from '../data/presets';
import { GeminiVoiceId } from '../types/tts';
import { User, Mic2, Sparkles, Check } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: GeminiVoiceId;
  onSelectVoice: (voiceId: GeminiVoiceId) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Mic2 className="w-4 h-4 text-indigo-400" />
          <span>Voces en Español de España (Castellano Peninsular)</span>
        </label>
        <span className="text-xs text-amber-300/90 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          🇪🇸 Fonética peninsular (z/c distinción)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {GEMINI_VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVoice(v.id)}
              className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full bg-gradient-to-tr ${v.avatarColor} flex items-center justify-center text-white shadow-sm`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-white leading-tight">
                        {v.name}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {v.gender}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 font-medium mb-1 line-clamp-2">
                  {v.tone}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 mt-2">
                <span className="text-[10px] text-indigo-300 line-clamp-1 block">
                  {v.recommendedFor}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
