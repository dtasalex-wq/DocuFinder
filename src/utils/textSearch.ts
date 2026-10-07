import { StoredDocument, SearchOccurrence, SearchFilters } from '../types';

/**
 * Remove diacritics / accents for comparison
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parse a search query string into individual tokens/phrases.
 * Supports:
 * - Quoted phrases: "empresa XYZ"
 * - Comma separated: licitação, contratação
 * - Space separated if not comma separated: licitação contrato
 */
export function parseSearchTerms(query: string): string[] {
  if (!query || !query.trim()) return [];

  const raw = query.trim();
  const terms: string[] = [];

  // Match quoted strings or comma separated items
  if (raw.includes('"')) {
    const regex = /"([^"]+)"|([^,]+)/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      const term = (match[1] || match[2] || '').trim();
      if (term.length > 0) {
        terms.push(term);
      }
    }
  } else if (raw.includes(',')) {
    raw.split(',').forEach((t) => {
      const trimmed = t.trim();
      if (trimmed.length > 0) terms.push(trimmed);
    });
  } else {
    // If user enters multiple words without quotes or commas,
    // let's treat the full phrase first, and if multiple words allow either phrase or words
    terms.push(raw);
  }

  // Deduplicate and filter out empty
  return Array.from(new Set(terms.filter((t) => t.length > 0)));
}

/**
 * Find occurrences of terms inside documents
 */
export function searchInDocuments(
  docs: StoredDocument[],
  terms: string[],
  filters: SearchFilters
): SearchOccurrence[] {
  if (!docs.length || !terms.length) return [];

  const contextWindow =
    filters.contextSize === 'short' ? 90 : filters.contextSize === 'long' ? 240 : 150;

  const targetDocs =
    filters.docIds && filters.docIds.length > 0
      ? docs.filter((d) => filters.docIds.includes(d.id))
      : docs;

  const occurrences: SearchOccurrence[] = [];

  for (const doc of targetDocs) {
    for (const page of doc.pages) {
      const originalText = page.text || '';
      if (!originalText) continue;

      let searchText = originalText;
      let preparedTerms = terms;

      if (!filters.caseSensitive) {
        searchText = searchText.toLowerCase();
        preparedTerms = preparedTerms.map((t) => t.toLowerCase());
      }

      if (filters.ignoreAccents) {
        searchText = removeAccents(searchText);
        preparedTerms = preparedTerms.map((t) => removeAccents(t));
      }

      // Track all match intervals on this page to avoid duplicates
      const pageMatches: Array<{
        startIndex: number;
        endIndex: number;
        matchedTerm: string;
      }> = [];

      for (let tIdx = 0; tIdx < terms.length; tIdx++) {
        const displayTerm = terms[tIdx];
        const termToFind = preparedTerms[tIdx];
        if (!termToFind) continue;

        // Exact match regex
        let searchRegex: RegExp;
        try {
          const escaped = termToFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // If exactMatch is true or word is an isolated keyword, check word boundaries
          if (filters.exactMatch) {
            searchRegex = new RegExp(`\\b${escaped}\\b`, 'g');
          } else {
            searchRegex = new RegExp(escaped, 'g');
          }
        } catch {
          continue;
        }

        let match;
        while ((match = searchRegex.exec(searchText)) !== null) {
          pageMatches.push({
            startIndex: match.index,
            endIndex: match.index + match[0].length,
            matchedTerm: displayTerm,
          });

          // Avoid infinite loops with 0-length matches
          if (match.index === searchRegex.lastIndex) {
            searchRegex.lastIndex++;
          }
        }
      }

      // Sort matches by position on page
      pageMatches.sort((a, b) => a.startIndex - b.startIndex);

      const totalOnPage = pageMatches.length;

      pageMatches.forEach((m, idx) => {
        // Extract surrounding context from original text
        const snippetStart = Math.max(0, m.startIndex - contextWindow);
        const snippetEnd = Math.min(originalText.length, m.endIndex + contextWindow);

        const prefix =
          (snippetStart > 0 ? '...' : '') +
          originalText.substring(snippetStart, m.startIndex);

        const exactMatchText = originalText.substring(m.startIndex, m.endIndex);

        const suffix =
          originalText.substring(m.endIndex, snippetEnd) +
          (snippetEnd < originalText.length ? '...' : '');

        const fullSnippet = `${prefix}${exactMatchText}${suffix}`
          .replace(/\s+/g, ' ')
          .trim();

        occurrences.push({
          id: `${doc.id}_p${page.pageNumber}_m${idx}_${Date.now()}`,
          docId: doc.id,
          docName: doc.name,
          pageNumber: page.pageNumber,
          matchedTerm: m.matchedTerm,
          snippet: fullSnippet,
          prefixSnippet: prefix.replace(/\s+/g, ' '),
          matchSnippet: exactMatchText,
          suffixSnippet: suffix.replace(/\s+/g, ' '),
          occurrenceIndexOnPage: idx + 1,
          totalOccurrencesOnPage: totalOnPage,
        });
      });
    }
  }

  // Sorting
  if (filters.sortBy === 'page') {
    occurrences.sort((a, b) => a.pageNumber - b.pageNumber);
  } else if (filters.sortBy === 'doc') {
    occurrences.sort((a, b) => a.docName.localeCompare(b.docName));
  } else if (filters.sortBy === 'date') {
    const docMap = new Map(docs.map((d) => [d.id, d.uploadDate]));
    occurrences.sort((a, b) => {
      const dateA = docMap.get(a.docId) || '';
      const dateB = docMap.get(b.docId) || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  } else {
    // Default 'relevance': rank pages with higher occurrence density higher
    occurrences.sort((a, b) => b.totalOccurrencesOnPage - a.totalOccurrencesOnPage);
  }

  return occurrences;
}
