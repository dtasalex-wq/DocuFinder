import React from 'react';
import { StoredDocument, SearchHistoryEntry } from '../types';
import {
  FileText,
  Search,
  CheckCircle2,
  HardDrive,
  Cpu,
  Sparkles,
  Layers,
} from 'lucide-react';

interface MetricsDashboardProps {
  documents: StoredDocument[];
  history: SearchHistoryEntry[];
  totalMatches: number;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  documents,
  history,
  totalMatches,
}) => {
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || d.pages.length || 0), 0);
  const totalBytes = documents.reduce((acc, d) => acc + (d.size || 0), 0);
  const scannedDocs = documents.filter((d) => d.isScanned).length;
  const nativeDocs = documents.length - scannedDocs;

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Find most frequent searched terms from history
  const termCounts: { [term: string]: number } = {};
  history.forEach((h) => {
    h.terms.forEach((t) => {
      termCounts[t] = (termCounts[t] || 0) + 1;
    });
  });

  const topTerms = Object.entries(termCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* SaaS Infrastructure Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">Métricas do Sistema SaaS</h2>
        <p className="text-xs text-slate-500 mb-6">
          Visão consolidada do processamento de documentos, armazenamento e atividade de busca.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Capacidade de Armazenamento</span>
              <HardDrive className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {formatFileSize(totalBytes)}{' '}
              <span className="text-xs font-normal text-slate-400">/ 5.0 GB</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.max(3, (totalBytes / (5 * 1024 * 1024 * 1024)) * 100))}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Camadas de Extração</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {nativeDocs}{' '}
              <span className="text-xs font-normal text-slate-500">nativos</span> · {scannedDocs}{' '}
              <span className="text-xs font-normal text-slate-500">OCR</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Detecção inteligente de páginas escaneadas ativa
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Motor de Leitura</span>
              <Cpu className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-indigo-600 font-mono tabular-nums">
              PDF.js + OCR
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Indexação no cliente em milissegundos
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Searched Terms */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-600" />
            Termos Mais Consultados
          </h3>
          {topTerms.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              Realize buscas para visualizar os termos frequentes.
            </p>
          ) : (
            <div className="space-y-2">
              {topTerms.map(([term, count]) => (
                <div
                  key={term}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs"
                >
                  <span className="font-medium text-slate-800">"{term}"</span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {count} {count === 1 ? 'consulta' : 'consultas'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Use Cases Supported */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Casos de Uso Otimizados
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Diários Oficiais:</strong> Busca de publicações de atos, decretos, portarias e nomeações.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Licitações & Editais:</strong> Localização de exigências técnicas, prazos e atas de pregão.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Contratos & Convênios:</strong> Rastreamento de CNPJs, nomes de empresas e valores contratados.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Processos Administrativos:</strong> Pesquisa documental veloz sem necessidade de internet constante.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
