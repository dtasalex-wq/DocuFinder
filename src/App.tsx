import React, { useState, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import {
  StoredDocument,
  SearchOccurrence,
  SearchFilters,
  SearchHistoryEntry,
  AppUser,
} from './types';
import {
  getAllDocuments,
  saveDocument,
  deleteDocument,
  clearAllDocuments,
  getSearchHistory,
  saveSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
} from './utils/storage';
import { DEMO_DOCUMENTS } from './utils/demoData';
import { parseSearchTerms, searchInDocuments } from './utils/textSearch';
import { getCurrentSession, logoutUser } from './utils/auth';
import { LoginScreen } from './components/LoginScreen';
import { TopBar } from './components/TopBar';
import { StatsCards } from './components/StatsCards';
import { SearchPanel } from './components/SearchPanel';
import { ResultsList } from './components/ResultsList';
import { DocumentManager } from './components/DocumentManager';
import { HistoryPanel } from './components/HistoryPanel';
import { MetricsDashboard } from './components/MetricsDashboard';
import { UploadModal } from './components/UploadModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { UserAccountModal } from './components/UserAccountModal';
import { UserManager } from './components/UserManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'documents' | 'history' | 'metrics' | 'users'>('search');
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  
  // Search state - zeroed out
  const [query, setQuery] = useState<string>('');
  const [searchedTerms, setSearchedTerms] = useState<string[]>([]);
  const [occurrences, setOccurrences] = useState<SearchOccurrence[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [filters, setFilters] = useState<SearchFilters>({
    docIds: [],
    exactMatch: false,
    caseSensitive: false,
    ignoreAccents: true,
    contextSize: 'medium',
    sortBy: 'relevance',
  });

  // Modals & Viewer
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [viewerDoc, setViewerDoc] = useState<StoredDocument | null>(null);
  const [viewerPage, setViewerPage] = useState<number>(1);
  const [viewerTerm, setViewerTerm] = useState<string>('');

  // User Profile & Authentication Session
  const [user, setUser] = useState<AppUser | null>(() => getCurrentSession());

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  // Always load and persist uploaded documents and history
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await getAllDocuments();
        setDocuments(stored || []);
        const savedHistory = await getSearchHistory();
        setHistory(savedHistory || []);
      } catch (err) {
        console.error('Failed to load stored documents:', err);
      }
    }

    loadData();
  }, []);

  // Total reset action (only triggered when user explicitly clicks "Zerar Dados")
  const handleResetAllData = async () => {
    await clearAllDocuments();
    await clearSearchHistory();
    setDocuments([]);
    setHistory([]);
    setQuery('');
    setOccurrences([]);
    setSearchedTerms([]);
    setHasSearched(false);
    setViewerDoc(null);
  };

  // Execute search
  const handleSearch = async (customQuery?: string) => {
    const searchText = customQuery !== undefined ? customQuery : query;
    if (!searchText.trim()) return;

    setIsSearching(true);
    const parsedTerms = parseSearchTerms(searchText);
    setSearchedTerms(parsedTerms);

    // Give UI a tiny tick for smooth feedback
    await new Promise((r) => setTimeout(r, 60));

    const matches = searchInDocuments(documents, parsedTerms, filters);
    setOccurrences(matches);
    setHasSearched(true);
    setIsSearching(false);
    setActiveTab('search');

    // Save to history
    const historyEntry: SearchHistoryEntry = {
      id: `hist_${Date.now()}`,
      query: searchText,
      terms: parsedTerms,
      timestamp: new Date().toISOString(),
      totalMatches: matches.length,
      docsCount: new Set(matches.map((m) => m.docId)).size,
      filters: { ...filters },
    };

    await saveSearchHistory(historyEntry);
    setHistory((prev) => [historyEntry, ...prev.filter((h) => h.id !== historyEntry.id)]);
  };

  // Re-run search from history
  const handleRerunSearch = (entry: SearchHistoryEntry) => {
    setQuery(entry.query);
    if (entry.filters) {
      setFilters((prev) => ({ ...prev, ...entry.filters }));
    }
    handleSearch(entry.query);
  };

  // Open PDF Viewer at specific page
  const handleOpenPdfAtPage = (docId: string, pageNumber: number = 1, term?: string) => {
    const target = documents.find((d) => d.id === docId);
    if (target) {
      setViewerDoc(target);
      setViewerPage(pageNumber);
      setViewerTerm(term || (searchedTerms.length > 0 ? searchedTerms[0] : ''));
    }
  };

  // Document management handlers
  const handleDocumentAdded = async (newDoc: StoredDocument) => {
    try {
      await saveDocument(newDoc);
    } catch (e) {
      console.warn('Could not save to IndexedDB directly, continuing with state:', e);
    }
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === newDoc.id);
      const updated = exists
        ? prev.map((d) => (d.id === newDoc.id ? newDoc : d))
        : [newDoc, ...prev];

      if (query.trim()) {
        const parsedTerms = parseSearchTerms(query);
        const matches = searchInDocuments(updated, parsedTerms, filters);
        setOccurrences(matches);
        setHasSearched(true);
      }
      return updated;
    });
  };

  const handleDeleteDocument = async (docId: string) => {
    await deleteDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setOccurrences((prev) => prev.filter((o) => o.docId !== docId));
  };

  const handleClearAllDocs = async () => {
    await clearAllDocuments();
    setDocuments([]);
    setOccurrences([]);
  };

  const handleLoadDemoDocs = async () => {
    for (const doc of DEMO_DOCUMENTS) {
      await saveDocument(doc);
    }
    const updated = await getAllDocuments();
    setDocuments(updated);
    handleSearch();
  };

  const handleFilterByDoc = (docId: string) => {
    setFilters((prev) => ({ ...prev, docIds: [docId] }));
    setActiveTab('search');
    handleSearch();
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteSearchHistoryItem(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || d.pages.length || 0), 0);

  // Occurrences in the currently viewed document for the sidebar
  const occurrencesInCurrentDoc = viewerDoc
    ? occurrences.filter((o) => o.docId === viewerDoc.id)
    : [];

  if (!user) {
    return <LoginScreen onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Bar with 3-zone contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        user={user}
        onOpenAccount={() => setIsAccountOpen(true)}
        onResetAll={handleResetAllData}
        onLogout={handleLogout}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metric stats row */}
        <StatsCards
          totalDocs={documents.length}
          totalPages={totalPages}
          totalSearches={history.length}
          totalMatchesFound={occurrences.length}
        />

        {/* Tab 1: Search Workspace */}
        {activeTab === 'search' && (
          <div>
            <SearchPanel
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              filters={filters}
              setFilters={setFilters}
              documents={documents}
              isSearching={isSearching}
            />

            {documents.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  Nenhum documento cadastrado
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                  Todas as informações do aplicativo foram zeradas. Envie um ou vários arquivos PDF do seu computador para começar a pesquisar palavras-chave e extrair trechos com o número da página.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Enviar Arquivos PDF</span>
                  </button>
                  <button
                    onClick={handleLoadDemoDocs}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Carregar Documentos de Teste</span>
                  </button>
                </div>
              </div>
            ) : (
              hasSearched && (
                <ResultsList
                  occurrences={occurrences}
                  searchedTerms={searchedTerms}
                  onOpenPdfAtPage={handleOpenPdfAtPage}
                />
              )
            )}
          </div>
        )}

        {/* Tab 2: Document Management */}
        {activeTab === 'documents' && (
          <DocumentManager
            documents={documents}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenViewer={(id, p) => handleOpenPdfAtPage(id, p)}
            onDeleteDocument={handleDeleteDocument}
            onFilterByDocument={handleFilterByDoc}
            onLoadDemoDocs={handleLoadDemoDocs}
            onClearAll={handleClearAllDocs}
          />
        )}

        {/* Tab 3: Search History */}
        {activeTab === 'history' && (
          <HistoryPanel
            history={history}
            onRerunSearch={handleRerunSearch}
            onClearHistory={handleClearHistory}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        )}

        {/* Tab 4: Dashboard & Metrics */}
        {activeTab === 'metrics' && (
          <MetricsDashboard
            documents={documents}
            history={history}
            totalMatches={occurrences.length}
          />
        )}

        {/* Tab 5: User Management & Metrics */}
        {activeTab === 'users' && (
          <UserManager currentUser={user} />
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentAdded={handleDocumentAdded}
      />

      {/* Embedded PDF Viewer Modal */}
      {viewerDoc && (
        <PdfViewerModal
          document={viewerDoc}
          initialPage={viewerPage}
          highlightTerm={viewerTerm}
          occurrencesInDoc={occurrencesInCurrentDoc}
          onClose={() => setViewerDoc(null)}
        />
      )}

      {/* SaaS User Account Modal */}
      <UserAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={user}
        onUpdateUser={setUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
