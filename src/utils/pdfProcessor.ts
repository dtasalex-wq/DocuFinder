import * as pdfjsLib from 'pdfjs-dist';
import { DocumentPage, StoredDocument } from '../types';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Use cdnjs/jsdelivr with matching version
  const pdfjsVersion = pdfjsLib.version || '4.10.38';
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;
}

export interface ParseProgress {
  currentPage: number;
  totalPages: number;
  stage: 'extracting' | 'ocr' | 'ready';
  ocrProgress?: number;
}

export async function parsePdfFile(
  file: File,
  enableOcr: boolean = false,
  onProgress?: (progress: ParseProgress) => void
): Promise<StoredDocument> {
  const arrayBuffer = await file.arrayBuffer();
  // Clone buffer so PDF.js worker does not detach our copy
  const pdfBufferForWorker = arrayBuffer.slice(0);
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBufferForWorker),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: DocumentPage[] = [];
  let isScannedDoc = false;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress?.({
      currentPage: pageNum,
      totalPages: numPages,
      stage: 'extracting',
    });

    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Combine text items preserving spaces
    const textPieces: string[] = [];
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      if ('str' in item) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          textPieces.push('\n');
        } else if (textPieces.length > 0 && !textPieces[textPieces.length - 1].endsWith(' ')) {
          textPieces.push(' ');
        }
        textPieces.push(item.str);
        lastY = item.transform[5];
      }
    }

    let extractedText = textPieces.join('').replace(/\s+/g, ' ').trim();
    let pageIsOcr = false;

    // Check if the page is scanned (less than 30 characters on full page)
    const isPageScanned = extractedText.length < 30;
    if (isPageScanned) {
      isScannedDoc = true;
    }

    // Run OCR if needed
    if ((isPageScanned || enableOcr) && typeof window !== 'undefined') {
      try {
        onProgress?.({
          currentPage: pageNum,
          totalPages: numPages,
          stage: 'ocr',
          ocrProgress: 0,
        });

        const ocrText = await runPageOcr(page, (progress) => {
          onProgress?.({
            currentPage: pageNum,
            totalPages: numPages,
            stage: 'ocr',
            ocrProgress: progress,
          });
        });

        if (ocrText && ocrText.trim().length > extractedText.length) {
          extractedText = ocrText.trim();
          pageIsOcr = true;
        }
      } catch (err) {
        console.warn(`OCR skipped or failed for page ${pageNum}:`, err);
      }
    }

    pages.push({
      pageNumber: pageNum,
      text: extractedText,
      isOcr: pageIsOcr,
    });
  }

  return {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: file.name,
    size: file.size,
    uploadDate: new Date().toISOString(),
    pageCount: numPages,
    pages,
    isScanned: isScannedDoc,
    hasOcrProcessed: enableOcr || pages.some((p) => p.isOcr),
    fileData: file, // Keep the exact original File/Blob object
  };
}

async function runPageOcr(
  page: any,
  onProgress?: (progress: number) => void
): Promise<string> {
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');

  if (!context) return '';

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // Dynamically import Tesseract to keep bundle light until needed
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('por'); // Portuguese support

  const ret = await worker.recognize(canvas);
  await worker.terminate();

  return ret.data.text || '';
}
