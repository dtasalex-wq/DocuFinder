/**
 * Generates a minimal, valid PDF 1.4 binary for demo/sample documents
 * so they can be viewed with PDF.js and native PDF viewers just like real uploaded files.
 */
export function generateMinimalPdf(title: string, pagesData: Array<{ pageNumber: number; text: string }>): Blob {
  const objects: string[] = [];
  const xref: number[] = [];

  // Helper to add PDF object
  function addObject(content: string): number {
    const objNum = objects.length + 1;
    objects.push(`${objNum} 0 obj\n${content}\nendobj\n`);
    return objNum;
  }

  // 1. Catalog (placeholder, will create)
  // Let's build page objects first
  const pageObjNums: number[] = [];

  // Font object
  const fontObj = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  pagesData.forEach((p) => {
    // Sanitize text for PDF text stream
    const lines = p.text.split('\n').filter((l) => l.trim().length > 0);
    
    // Header for official look
    let streamText = `BT\n/F1 14 Tf\n50 780 Td\n(${sanitizeForPdf(title.toUpperCase())}) Tj\nET\n`;
    streamText += `BT\n/F1 9 Tf\n50 762 Td\n(DOCUMENTO OFICIAL - PAGINA ${p.pageNumber}) Tj\nET\n`;
    streamText += `0.5 w\n50 755 m\n550 755 l\nS\n`; // divider line

    let yOffset = 730;
    streamText += `BT\n/F1 10 Tf\n`;
    for (const line of lines) {
      if (yOffset < 60) break;
      const cleanLine = sanitizeForPdf(line);
      // wrap long lines
      const chunks = cleanLine.match(/.{1,85}/g) || [cleanLine];
      for (const chunk of chunks) {
        streamText += `50 ${yOffset} Td\n(${chunk}) Tj\n-50 -${yOffset} Td\n`;
        yOffset -= 15;
      }
      yOffset -= 6;
    }
    streamText += `ET\n`;

    const contentObj = addObject(`<< /Length ${streamText.length} >>\nstream\n${streamText}\nendstream`);
    const pageObj = addObject(`<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 ${fontObj} 0 R >> >> /MediaBox [0 0 595 842] /Contents ${contentObj} 0 R >>`);
    pageObjNums.push(pageObj);
  });

  // Pages tree object (obj 2)
  const kidsStr = pageObjNums.map((num) => `${num} 0 R`).join(' ');
  const pagesTreeObj = addObject(`<< /Type /Pages /Kids [${kidsStr}] /Count ${pageObjNums.length} >>`);

  // Catalog object
  const catalogObj = addObject(`<< /Type /Catalog /Pages ${pagesTreeObj} 0 R >>`);

  let pdfString = `%PDF-1.4\n`;
  let currentOffset = pdfString.length;

  xref.push(0);
  for (const obj of objects) {
    xref.push(currentOffset);
    pdfString += obj;
    currentOffset = pdfString.length;
  }

  const xrefOffset = currentOffset;
  pdfString += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(xref[i]).padStart(10, '0');
    pdfString += `${offsetStr} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

function sanitizeForPdf(str: string): string {
  return str
    .replace(/[^\x20-\x7E]/g, ' ') // keep ascii for Type1 Helvetica
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}
