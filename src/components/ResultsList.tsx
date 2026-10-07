import React, { useState } from 'react';
import { SearchOccurrence } from '../types';
import { FileText, ExternalLink, Copy, Check, Download, LayoutList, TableProperties } from 'lucide-react';

interface ResultsListProps {
  occurrences: SearchOccurrence[];
  searchedTerms: string[];
  lastSearchTime?: string;
  onOpenPdfAtPage: (docId: string, pageNumber: number, matchedTerm?: string) => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  occurrences,
  searchedTerms,
  lastSearchTime,
  onOpenPdfAtPage,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    if (!occurrences.length) return;
    const headers = ['Documento', 'Página', 'Termo', 'Ocorrência', 'Total na Página', 'Trecho'];
    const rows = occurrences.map((o) => [
      `"${o.docName.replace(/"/g, '""')}"`,
      o.pageNumber,
      `"${o.matchedTerm.replace(/"/g, '""')}"`,
      o.occurrenceIndexOnPage,
      o.totalOccurrencesOnPage,
      `"${o.snippet.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pesquisa_docufinder_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (occurrences.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">
          Nenhuma ocorrência encontrada
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Tente buscar termos mais amplos, desativar a busca exata, verificar variações ou certificar-se de que os documentos foram lidos com sucesso.
        </p>
      </div>
    );
  }

  // Count unique documents matched
  const matchedDocsCount = new Set(occurrences.map((o) => o.docId)).size;

  return (
    <div className="space-y-4">
      {/* Header bar with counter, terms, export and view switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-900 font-mono tabular-nums text-sm">
            {occurrences.length}
          </span>
          <span>{occurrences.length === 1 ? 'ocorrência encontrada' : 'ocorrências encontradas'}</span>
          <span aria-hidden="true">·</span>
          <span>em {matchedDocsCount} {matchedDocsCount === 1 ? 'documento' : 'documentos'}</span>
          {searchedTerms.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">Termos:</span>
              <span className="font-medium text-slate-800">
                {searchedTerms.map((t) => `"${t}"`).join(', ')}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Cartões"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização em Tabela"
            >
              <TableProperties className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="space-y-3">
          {occurrences.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{item.docName}</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <span>
                    Página: <strong className="text-slate-800 font-mono">{item.pageNumber}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Ocorrência:{' '}
                    <strong className="text-slate-800 font-mono">
                      {item.occurrenceIndexOnPage} de {item.totalOccurrencesOnPage}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Termo: <strong className="text-indigo-600 font-medium">{item.matchedTerm}</strong>
                  </span>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(item.snippet, item.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
                    title="Copiar trecho"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => onOpenPdfAtPage(item.docId, item.pageNumber, item.matchedTerm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir PDF na página {item.pageNumber}</span>
                  </button>
                </div>
              </div>

              {/* Snippet display with highlight */}
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs leading-relaxed text-slate-700">
                <span className="text-slate-400 font-mono text-[11px] block mb-1">Trecho:</span>
                <p className="font-sans">
                  {item.prefixSnippet}
                  <mark className="bg-amber-200 text-amber-950 font-semibold px-1 rounded-xs">
                    {item.matchSnippet}
                  </mark>
                  {item.suffixSnippet}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-3 text-center">Página</th>
                  <th className="py-3 px-3">Termo</th>
                  <th className="py-3 px-4">Trecho Encontrado</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {occurrences.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-[180px] truncate" title={item.docName}>
                      {item.docName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-800">
                      {item.pageNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-indigo-700 whitespace-nowrap">
                      {item.matchedTerm}
                    </td>
                    <td className="py-3 px-4 max-w-md">
                      <p className="line-clamp-2">
                        {item.prefixSnippet}
                        <mark className="bg-amber-200 text-amber-950 font-semibold px-0.5 rounded-xs">
                          {item.matchSnippet}
                        </mark>
                        {item.suffixSnippet}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenPdfAtPage(item.docId, item.pageNumber, item.matchedTerm)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                      >
                        <span>Pág. {item.pageNumber}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
