import React from 'react';
import { Files, BookOpen, SearchCheck, CheckCircle2 } from 'lucide-react';

interface StatsCardsProps {
  totalDocs: number;
  totalPages: number;
  totalSearches: number;
  totalMatchesFound: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalDocs,
  totalPages,
  totalSearches,
  totalMatchesFound,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="p-4 bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Documentos PDF</span>
          <Files className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {totalDocs}
        </div>
        <p className="text-xs text-slate-500 mt-1">Carregados e indexados</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Páginas Lidas</span>
          <BookOpen className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {totalPages}
        </div>
        <p className="text-xs text-slate-500 mt-1">Camada de texto e OCR</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Pesquisas Feitas</span>
          <SearchCheck className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {totalSearches}
        </div>
        <p className="text-xs text-slate-500 mt-1">Consultas no acervo</p>
      </div>

      <div className="p-4 bg-white border border-slate-200 rounded-lg">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Ocorrências</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 font-mono tabular-nums">
          {totalMatchesFound}
        </div>
        <p className="text-xs text-slate-500 mt-1">Trechos identificados</p>
      </div>
    </div>
  );
};
