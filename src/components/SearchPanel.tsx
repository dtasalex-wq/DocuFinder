import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Sparkles, Filter } from 'lucide-react';
import { StoredDocument, SearchFilters } from '../types';

interface SearchPanelProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (customQuery?: string) => void;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  documents: StoredDocument[];
  isSearching: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  query,
  setQuery,
  onSearch,
  filters,
  setFilters,
  documents,
  isSearching,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sampleQuickQueries = [
    'empresa XYZ',
    'licitação',
    'contratação',
    'pregão eletrônico',
    'Lei nº 14.133',
    'CNPJ',
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleQuickClick = (term: string) => {
    setQuery(term);
    onSearch(term);
  };

  const handleDocToggle = (docId: string) => {
    setFilters((prev) => {
      const exists = prev.docIds.includes(docId);
      if (exists) {
        return { ...prev, docIds: prev.docIds.filter((id) => id !== docId) };
      } else {
        return { ...prev, docIds: [...prev.docIds, docId] };
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite palavras-chave, frases ou termos exatos entre aspas (ex: licitação, contratação, &quot;empresa XYZ&quot;)..."
            className="w-full pl-11 pr-28 py-3.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onSearch()}
              disabled={isSearching || !query.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {isSearching ? 'Buscando...' : 'Pesquisar'}
            </button>
          </div>
        </div>

        {/* Suggestion Chips & Filter Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-500">
            {documents.length > 0 ? (
              <>
                <span className="font-medium text-slate-600">Sugestões rápidas:</span>
                {sampleQuickQueries.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickClick(term)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </>
            ) : (
              <span className="text-slate-400 italic">
                Nenhum documento carregado. Envie arquivos PDF para iniciar a busca textual.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              showAdvanced || filters.docIds.length > 0 || filters.exactMatch || !filters.ignoreAccents
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros Avançados</span>
            {(filters.docIds.length > 0 || filters.exactMatch) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 ml-1"></span>
            )}
          </button>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Matching Rules */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Regras de Correspondência
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.ignoreAccents}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, ignoreAccents: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ignorar acentos (ex: licitacao = licitação)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.caseSensitive}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, caseSensitive: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Diferenciar maiúsculas/minúsculas</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.exactMatch}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, exactMatch: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Busca exata de palavra inteira (\b)</span>
                  </label>
                </div>
              </div>

              {/* Context snippet size & sorting */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Tamanho do Trecho e Ordenação
                </label>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Contexto ao redor:</span>
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      {(['short', 'medium', 'long'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, contextSize: size }))}
                          className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
                            filters.contextSize === size
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {size === 'short' ? 'Curto (90c)' : size === 'medium' ? 'Médio (150c)' : 'Amplo (240c)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Ordenar resultados por:</span>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))
                      }
                      className="w-full text-xs p-1.5 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="relevance">Mais Relevantes (nº de ocorrências)</option>
                      <option value="page">Número da Página (crescente)</option>
                      <option value="doc">Nome do Documento (A-Z)</option>
                      <option value="date">Data de Upload (mais recentes)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filter by Document */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Filtrar por Documento
                  </label>
                  {filters.docIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, docIds: [] }))}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Ver todos ({documents.length})
                    </button>
                  )}
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1.5 border border-slate-200 rounded-lg p-2 bg-slate-50">
                  {documents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum documento carregado.</p>
                  ) : (
                    documents.map((doc) => {
                      const isSelected =
                        filters.docIds.length === 0 || filters.docIds.includes(doc.id);
                      return (
                        <label
                          key={doc.id}
                          className="flex items-center gap-2 text-xs text-slate-700 hover:bg-white p-1 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleDocToggle(doc.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="truncate flex-1" title={doc.name}>
                            {doc.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
