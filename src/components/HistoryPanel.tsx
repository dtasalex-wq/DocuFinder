import React, { useState } from 'react';
import { SearchHistoryEntry } from '../types';
import { History, Play, Trash2, Calendar, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface HistoryPanelProps {
  history: SearchHistoryEntry[];
  onRerunSearch: (entry: SearchHistoryEntry) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem?: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onRerunSearch,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleConfirmClear = () => {
    onClearHistory();
    setIsConfirmingClear(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Histórico de Pesquisas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro automático das palavras-chave pesquisadas e seus resultados nos PDFs.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {isConfirmingClear ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span className="text-red-700 font-medium">Limpar todo o histórico?</span>
                <button
                  type="button"
                  onClick={handleConfirmClear}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Sim, limpar
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Nenhuma pesquisa gravada
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            O histórico está limpo. Assim que você realizar consultas nos documentos PDF, as buscas e métricas ficarão salvas aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    "{item.query}"
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">
                    {item.terms.length > 1 ? `${item.terms.length} termos` : '1 termo'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="font-mono text-[11px]">{formatDate(item.timestamp)}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="font-mono tabular-nums font-semibold text-slate-800">
                      {item.totalMatches}
                    </span>{' '}
                    {item.totalMatches === 1 ? 'ocorrência' : 'ocorrências'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>em {item.docsCount} {item.docsCount === 1 ? 'doc' : 'docs'}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => onRerunSearch(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Repetir Busca</span>
                </button>

                {onDeleteHistoryItem && (
                  <button
                    type="button"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                    title="Remover do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
