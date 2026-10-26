import React from 'react';
import { AudioRecord } from '../types/tts';
import { History, Play, Download, Trash2, Copy, Check } from 'lucide-react';

interface HistoryDrawerProps {
  records: AudioRecord[];
  onSelectRecord: (record: AudioRecord) => void;
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  records,
  onSelectRecord,
  onClearHistory,
  onDeleteRecord,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const downloadAudio = (record: AudioRecord) => {
    const a = document.createElement('a');
    a.href = record.audioUrl;
    a.download = `vozgen_${record.voiceName.toLowerCase()}_${record.id.slice(0, 6)}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (records.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" />
        <p className="text-xs">No hay audios generados aún en esta sesión.</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Escribe o selecciona un texto y pulsa &ldquo;Convertir a Audio&rdquo; para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Historial de Audios ({records.length})
          </h4>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[11px] text-slate-500 hover:text-rose-400 transition"
        >
          Borrar todo
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl transition flex items-center justify-between gap-3 group"
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelectRecord(rec)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {rec.voiceName}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-[10px] text-slate-400">
                  • {rec.wordCount} palabras
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate font-normal">
                {rec.text}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onSelectRecord(rec)}
                className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition"
                title="Cargar y reproducir"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>

              <button
                onClick={() => downloadAudio(rec)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Descargar .wav"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => copyText(rec.id, rec.text)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Copiar texto"
              >
                {copiedId === rec.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => onDeleteRecord(rec.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition opacity-0 group-hover:opacity-100"
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
