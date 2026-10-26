import React, { useState } from 'react';
import { STYLE_PRESETS } from '../data/presets';
import { Sliders, Sparkles, Edit3 } from 'lucide-react';

interface StyleSelectorProps {
  currentStyle: string;
  onStyleChange: (newStyle: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  currentStyle,
  onStyleChange,
}) => {
  const [isCustom, setIsCustom] = useState(false);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Estilo y Tono de Locución</span>
        </label>
        <button
          type="button"
          onClick={() => setIsCustom(!isCustom)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
        >
          <Edit3 className="w-3 h-3" />
          <span>{isCustom ? 'Ver opciones predefinidas' : 'Personalizar estilo'}</span>
        </button>
      </div>

      {!isCustom ? (
        <div className="flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = currentStyle === preset.prompt;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onStyleChange(preset.prompt)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={currentStyle}
            onChange={(e) => onStyleChange(e.target.value)}
            placeholder="Describe el estilo: ej. Locutor eufórico de fútbol, susurro misterioso, tono infantil alegre..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Gemini adaptará la respiración, modulación e inflexión según tu descripción.</span>
          </div>
        </div>
      )}
    </div>
  );
};
