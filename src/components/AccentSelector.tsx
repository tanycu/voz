import React from 'react';
import { ACCENT_OPTIONS } from '../data/presets';
import { Globe, Check } from 'lucide-react';

interface AccentSelectorProps {
  selectedAccent: string;
  onSelectAccent: (accentId: string, directive: string) => void;
}

export const AccentSelector: React.FC<AccentSelectorProps> = ({
  selectedAccent,
  onSelectAccent,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>Variante y Acento Regional</span>
        </label>
        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          🇪🇸 Optimizado para Español de España
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ACCENT_OPTIONS.map((opt) => {
          const isSelected = selectedAccent === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectAccent(opt.id, opt.promptDirective)}
              className={`p-2.5 rounded-xl border text-left transition flex items-start justify-between gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{opt.flag}</span>
                  <span className="text-xs font-semibold text-slate-100 truncate">
                    {opt.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {isSelected && (
                <div className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
