import React from 'react';
import { StoredDocument } from '../types';
import {
  FileText,
  Trash2,
  ExternalLink,
  UploadCloud,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';

interface DocumentManagerProps {
  documents: StoredDocument[];
  onOpenUpload: () => void;
  onOpenViewer: (docId: string, pageNumber?: number) => void;
  onDeleteDocument: (docId: string) => void;
  onFilterByDocument: (docId: string) => void;
  onLoadDemoDocs: () => void;
  onClearAll: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onOpenUpload,
  onOpenViewer,
  onDeleteDocument,
  onFilterByDocument,
  onLoadDemoDocs,
  onClearAll,
}) => {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Gerenciador de Documentos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Documentos PDF indexados para busca textual rápida e extração de trechos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onLoadDemoDocs}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Carrega Diário Oficial, Edital e Contrato de exemplo"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Exemplos Prontos</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Adicionar PDFs</span>
          </button>

          {documents.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Zerar todos os documentos (Ação administrativa protegida por senha master)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Nenhum documento cadastrado
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Envie arquivos PDF do seu computador ou carregue os exemplos oficiais de teste.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Enviar Primeiro PDF
            </button>
            <button
              onClick={onLoadDemoDocs}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Carregar Amostras
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nome do Arquivo</th>
                  <th className="py-3 px-3 text-center">Páginas</th>
                  <th className="py-3 px-3">Tamanho</th>
                  <th className="py-3 px-3">Leitura</th>
                  <th className="py-3 px-3">Data de Envio</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="truncate max-w-xs sm:max-w-md" title={doc.name}>
                        {doc.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-800">
                      {doc.pageCount}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="py-3.5 px-3">
                      {doc.isScanned ? (
                        <span className="text-amber-700 font-medium">Digitalizado (OCR)</span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Texto Nativo</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onFilterByDocument(doc.id)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Pesquisar apenas neste documento"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenViewer(doc.id, 1)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Abrir no Visualizador PDF"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir documento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
