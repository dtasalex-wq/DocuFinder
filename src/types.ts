export interface DocumentPage {
  pageNumber: number;
  text: string;
  isOcr?: boolean;
}

export interface StoredDocument {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  pageCount: number;
  pages: DocumentPage[];
  isScanned: boolean;
  hasOcrProcessed?: boolean;
  fileData?: Blob | ArrayBuffer | Uint8Array; // stored in IndexedDB
}

export interface SearchOccurrence {
  id: string;
  docId: string;
  docName: string;
  pageNumber: number;
  matchedTerm: string;
  snippet: string;
  prefixSnippet: string;
  matchSnippet: string;
  suffixSnippet: string;
  occurrenceIndexOnPage: number;
  totalOccurrencesOnPage: number;
}

export interface SearchFilters {
  docIds: string[];
  exactMatch: boolean;
  caseSensitive: boolean;
  ignoreAccents: boolean;
  contextSize: 'short' | 'medium' | 'long';
  sortBy: 'relevance' | 'page' | 'doc' | 'date';
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  terms: string[];
  timestamp: string;
  totalMatches: number;
  docsCount: number;
  filters: Partial<SearchFilters>;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  company: string;
  plan: 'Profissional' | 'Empresarial';
  role?: 'admin' | 'analista' | 'membro';
  avatarUrl?: string;
  createdAt?: string;
  isSuperuser?: boolean;
}
