import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { parsePdfFile, ParseProgress } from '../utils/pdfProcessor';
import { StoredDocument } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: StoredDocument) => void;
}

interface UploadingFileState {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'ocr' | 'completed' | 'error';
  progress: number;
  statusMessage: string;
  error?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAdded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [enableOcr, setEnableOcr] = useState(true);
  const [fileList, setFileList] = useState<UploadingFileState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formatError, setFormatError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | File[]) => {
    setFormatError(null);
    const validPdfFiles = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfFiles.length === 0) {
      setFormatError('Por favor, selecione arquivos válidos com extensão .pdf');
      return;
    }

    const newStates: UploadingFileState[] = validPdfFiles.map((file) => ({
      id: `${file.name}_${Date.now()}_${Math.random()}`,
      name: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
      statusMessage: 'Aguardando processamento...',
    }));

    setFileList((prev) => [...prev, ...newStates]);
    setIsProcessing(true);

    for (let i = 0; i < validPdfFiles.length; i++) {
      const file = validPdfFiles[i];
      const stateItem = newStates[i];

      setFileList((prev) =>
        prev.map((item) =>
          item.id === stateItem.id
            ? { ...item, status: 'processing', statusMessage: 'Iniciando leitura de páginas...' }
            : item
        )
      );

      try {
        const storedDoc = await parsePdfFile(file, enableOcr, (prog: ParseProgress) => {
          const percent = Math.round((prog.currentPage / Math.max(1, prog.totalPages)) * 100);
          setFileList((prev) =>
            prev.map((item) => {
              if (item.id !== stateItem.id) return item;
              if (prog.stage === 'ocr') {
                return {
                  ...item,
                  status: 'ocr',
                  progress: percent,
                  statusMessage: `Processando OCR na página ${prog.currentPage} de ${prog.totalPages}...`,
                };
              }
              return {
                ...item,
                status: 'processing',
                progress: percent,
                statusMessage: `Lendo página ${prog.currentPage} de ${prog.totalPages}...`,
              };
            })
          );
        });

        setFileList((prev) =>
          prev.map((item) =>
            item.id === stateItem.id
              ? {
                  ...item,
                  status: 'completed',
                  progress: 100,
                  statusMessage: `Indexado com sucesso (${storedDoc.pageCount} páginas).`,
                }
              : item
          )
        );

        onDocumentAdded(storedDoc);
      } catch (err: any) {
        console.error('Failed to parse PDF:', err);
        setFileList((prev) =>
          prev.map((item) =>
            item.id === stateItem.id
              ? {
                  ...item,
                  status: 'error',
                  statusMessage: 'Falha ao processar o arquivo.',
                  error: err.message || 'Erro desconhecido',
                }
              : item
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Upload de Arquivos PDF</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {formatError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between">
              <span>{formatError}</span>
              <button
                type="button"
                onClick={() => setFormatError(null)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
            />
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              Arraste e solte seus PDFs aqui ou clique para selecionar
            </p>
            <p className="text-xs text-slate-500">
              Suporta envio individual ou em lote de documentos (.pdf)
            </p>
          </div>

          {/* OCR Configuration */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="enableOcr"
              checked={enableOcr}
              onChange={(e) => setEnableOcr(e.target.checked)}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div className="text-xs">
              <label htmlFor="enableOcr" className="font-semibold text-slate-900 cursor-pointer">
                Reconhecimento Óptico de Caracteres (OCR Inteligente)
              </label>
              <p className="text-slate-500 mt-0.5">
                Detecta automaticamente páginas digitalizadas ou que sejam imagens escaneadas e extrai o texto em português.
              </p>
            </div>
          </div>

          {/* Upload Progress List */}
          {fileList.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">Fila de Processamento:</h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {fileList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium text-slate-900 truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({formatFileSize(item.size)})
                        </span>
                      </div>
                      <div className="shrink-0">
                        {item.status === 'completed' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {item.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        {(item.status === 'processing' || item.status === 'ocr') && (
                          <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1">
                      <div
                        className={`h-full transition-all duration-300 ${
                          item.status === 'error'
                            ? 'bg-red-500'
                            : item.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{item.statusMessage}</span>
                      <span className="font-mono tabular-nums">{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? 'Processando documentos...' : 'Concluir'}
          </button>
        </div>
      </div>
    </div>
  );
};
