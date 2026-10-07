import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { StoredDocument, SearchOccurrence } from '../types';
import { generateMinimalPdf } from '../utils/pdfGenerator';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  List,
  Search,
  FileText,
  Highlighter,
  ExternalLink,
  Eye,
  FileCode,
} from 'lucide-react';

interface PdfViewerModalProps {
  document: StoredDocument | null;
  initialPage?: number;
  highlightTerm?: string;
  occurrencesInDoc?: SearchOccurrence[];
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  document: doc,
  initialPage = 1,
  highlightTerm = '',
  occurrencesInDoc = [],
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomScale, setZoomScale] = useState<number>(1.25);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOccurrencesSidebar, setShowOccurrencesSidebar] = useState<boolean>(true);
  const [renderLoading, setRenderLoading] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'native' | 'ocr'>('original');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Sync initialPage when opening
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Load and prepare original PDF document
  useEffect(() => {
    let isCancelled = false;
    let createdUrl: string | null = null;

    async function loadPdf() {
      if (!doc) return;
      try {
        setRenderLoading(true);
        setRenderError(null);

        // Retrieve or prepare binary data
        let blob: Blob;
        if (doc.fileData instanceof Blob) {
          blob = doc.fileData;
        } else if (doc.fileData) {
          blob = new Blob([doc.fileData as any], { type: 'application/pdf' });
        } else {
          // Generate a standard PDF 1.4 binary for documents without raw buffer
          blob = generateMinimalPdf(doc.name, doc.pages || []);
        }

        createdUrl = URL.createObjectURL(blob);
        if (!isCancelled) {
          setPdfBlobUrl(createdUrl);
        }

        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        });

        const loadedPdf = await loadingTask.promise;
        if (!isCancelled) {
          pdfDocRef.current = loadedPdf;
          await renderCanvasPage(currentPage, loadedPdf);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to load original PDF:', err);
          setRenderError('Não foi possível renderizar o PDF original no canvas. Use a aba "Modo Nativo" ou "Texto OCR".');
        }
      } finally {
        if (!isCancelled) setRenderLoading(false);
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [doc]);

  // Re-render canvas on page change or zoom
  useEffect(() => {
    if (pdfDocRef.current && viewMode === 'original') {
      renderCanvasPage(currentPage, pdfDocRef.current);
    }
  }, [currentPage, zoomScale, viewMode]);

  const renderCanvasPage = async (pageNum: number, pdf: any) => {
    if (!canvasRef.current || !pdf) return;
    try {
      setRenderLoading(true);

      // Cancel ongoing render task before starting a new one
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }

      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Higher resolution device pixel ratio for sharp vector text and stamps
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const viewport = page.getViewport({ scale: zoomScale * dpr });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const renderTask = page.render({
        canvasContext: context,
        viewport,
      });
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;
      setRenderError(null);
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn('Canvas rendering issue:', err);
      }
    } finally {
      setRenderLoading(false);
    }
  };

  if (!doc) return null;

  const totalPages = doc.pageCount || doc.pages?.length || 1;
  const currentPageData = doc.pages?.find((p) => p.pageNumber === currentPage);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentPage < totalPages) setCurrentPage((p) => p + 1);
      if (e.key === 'ArrowLeft' && currentPage > 1) setCurrentPage((p) => p - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, onClose]);

  const handleDownload = () => {
    if (pdfBlobUrl) {
      const a = window.document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = doc.name;
      a.click();
    }
  };

  // Helper to highlight terms in transcribed text view
  const renderHighlightedText = (text: string, term: string) => {
    if (!term || !text) return text;
    try {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-amber-300 text-amber-950 font-bold px-1 py-0.5 rounded-xs ring-2 ring-amber-400"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-slate-900/85 backdrop-blur-xs transition-all ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4 md:p-6'
      }`}
    >
      <div className="bg-slate-900 text-slate-100 flex flex-col h-full rounded-xl overflow-hidden shadow-2xl border border-slate-700">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0 gap-3">
          {/* File Meta */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md" title={doc.name}>
                  {doc.name}
                </h2>
                <span className="text-[11px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-medium">
                  Arquivo Original
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Página {currentPage} de {totalPages}</span>
                {highlightTerm && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-300 flex items-center gap-1 font-medium">
                      <Highlighter className="w-3 h-3" /> Termo: "{highlightTerm}"
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mode Tabs Switcher */}
          <div className="flex items-center p-1 bg-slate-950/60 border border-slate-700 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('original')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'original'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>PDF Original</span>
            </button>
            <button
              onClick={() => setViewMode('native')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'native'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Modo Nativo</span>
            </button>
            <button
              onClick={() => setViewMode('ocr')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'ocr'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Texto OCR</span>
            </button>
          </div>

          {/* Navigation & Zoom Toolbar */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Page navigation */}
            <div className="flex items-center bg-slate-700/60 rounded-lg p-1 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1 hover:bg-slate-600 disabled:opacity-30 rounded transition-colors cursor-pointer"
                title="Página Anterior (←)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-2 font-mono tabular-nums flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
                  }}
                  className="w-10 bg-slate-800 text-center py-0.5 rounded border border-slate-600 text-xs font-semibold text-white focus:outline-none"
                />
                <span className="text-slate-400">/ {totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1 hover:bg-slate-600 disabled:opacity-30 rounded transition-colors cursor-pointer"
                title="Próxima Página (→)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls (Active in original canvas view) */}
            {viewMode === 'original' && (
              <div className="hidden sm:flex items-center bg-slate-700/60 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
                  className="p-1 hover:bg-slate-600 rounded transition-colors cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-[11px] text-slate-300">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
                  className="p-1 hover:bg-slate-600 rounded transition-colors cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Open Original PDF in Browser Tab */}
            {pdfBlobUrl && (
              <a
                href={`${pdfBlobUrl}#page=${currentPage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium transition-colors"
                title="Abrir o arquivo original diretamente no leitor do navegador na página consultada"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Abrir no Navegador (Pág. {currentPage})</span>
              </a>
            )}

            {/* Sidebar toggle */}
            {occurrencesInDoc.length > 0 && (
              <button
                onClick={() => setShowOccurrencesSidebar(!showOccurrencesSidebar)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  showOccurrencesSidebar
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title="Alternar painel de ocorrências"
              >
                <List className="w-4 h-4" />
              </button>
            )}

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Baixar arquivo original"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden md:flex p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Tela cheia"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors ml-1 cursor-pointer"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area with Canvas/Native Iframe/Text View and Occurrences Sidebar */}
        <div className="flex-1 flex overflow-hidden bg-slate-950">
          
          {/* Main Viewer Area */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
            
            {/* Mode 1: Original PDF Canvas (Sharp Vector Rendering) */}
            {viewMode === 'original' && (
              <div className="relative flex flex-col items-center max-w-full my-auto">
                {renderLoading && (
                  <div className="absolute top-4 bg-slate-800/90 text-slate-200 px-3.5 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-lg z-20">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Renderizando página original {currentPage}...</span>
                  </div>
                )}

                <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white">
                  <canvas ref={canvasRef} className="block max-w-full h-auto" />
                </div>
              </div>
            )}

            {/* Mode 2: Native Browser PDF Viewer (Iframe directly loaded with #page=X) */}
            {viewMode === 'native' && (
              <div className="w-full h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                {pdfBlobUrl ? (
                  <iframe
                    src={`${pdfBlobUrl}#page=${currentPage}&zoom=${Math.round(zoomScale * 100)}&view=FitH`}
                    className="w-full h-full border-0 bg-white"
                    title={`PDF Original - Página ${currentPage}`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Carregando arquivo original...
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Transcribed OCR Text Mode */}
            {viewMode === 'ocr' && (
              <div
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center' }}
                className="bg-white text-slate-900 rounded-sm shadow-2xl w-[680px] min-h-[880px] p-10 flex flex-col justify-between border border-slate-300 transition-transform my-4"
              >
                <div>
                  <div className="border-b border-slate-300 pb-4 mb-6 text-center">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      Camada de Texto Extraída / OCR
                    </p>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{doc.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Página {currentPage} de {totalPages}
                    </p>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif whitespace-pre-wrap selection:bg-amber-200">
                    {currentPageData ? (
                      renderHighlightedText(currentPageData.text, highlightTerm)
                    ) : (
                      <p className="text-slate-400 italic">
                        (Sem texto indexado nesta página)
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 mt-10 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                  <span>DocuFinder SaaS · Transcrição OCR</span>
                  <span className="font-mono">Página {currentPage}</span>
                </div>
              </div>
            )}

          </div>

          {/* Occurrences Sidebar */}
          {showOccurrencesSidebar && occurrencesInDoc.length > 0 && (
            <aside className="w-72 sm:w-80 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  Ocorrências neste PDF ({occurrencesInDoc.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Pág {currentPage}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {occurrencesInDoc.map((occ, idx) => {
                  const isActivePage = occ.pageNumber === currentPage;
                  return (
                    <button
                      key={occ.id || idx}
                      onClick={() => setCurrentPage(occ.pageNumber)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isActivePage
                          ? 'bg-indigo-950/60 border-indigo-600/70 text-slate-100 ring-1 ring-indigo-500'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-indigo-300 font-mono text-[11px]">
                          Página {occ.pageNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{occ.occurrenceIndexOnPage} de {occ.totalOccurrencesOnPage}
                        </span>
                      </div>
                      <p className="text-[11px] line-clamp-3 text-slate-300 font-sans leading-relaxed">
                        {occ.prefixSnippet}
                        <mark className="bg-amber-300 text-amber-950 font-semibold px-0.5 rounded-xs">
                          {occ.matchSnippet}
                        </mark>
                        {occ.suffixSnippet}
                      </p>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

        </div>
      </div>
    </div>
  );
};
