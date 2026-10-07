import { StoredDocument, SearchHistoryEntry } from '../types';

const DB_NAME = 'docufinder_db';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const HISTORY_STORE = 'search_history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocument(doc: StoredDocument): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    const store = tx.objectStore(DOCS_STORE);

    try {
      store.put(doc);
    } catch (putErr) {
      console.warn('Direct store.put failed, storing document text without binary buffer:', putErr);
      const { fileData, ...docWithoutBuffer } = doc;
      store.put(docWithoutBuffer);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        console.error('Failed to commit document save:', tx.error);
        reject(tx.error);
      };
    });
  } catch (err) {
    console.error('Failed to save document in IndexedDB:', err);
    // Fallback: try saving without buffer if the transaction failed
    try {
      const db = await openDB();
      const tx = db.transaction(DOCS_STORE, 'readwrite');
      const store = tx.objectStore(DOCS_STORE);
      const { fileData, ...docWithoutBuffer } = doc;
      store.put(docWithoutBuffer);
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (fallbackErr) {
      console.error('Critical: fallback save failed:', fallbackErr);
    }
  }
}

export async function getAllDocuments(): Promise<StoredDocument[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readonly');
    const store = tx.objectStore(DOCS_STORE);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get documents from IndexedDB:', err);
    return [];
  }
}

export async function getDocumentById(id: string): Promise<StoredDocument | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readonly');
    const store = tx.objectStore(DOCS_STORE);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get document by id:', err);
    return null;
  }
}

export async function deleteDocument(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    const store = tx.objectStore(DOCS_STORE);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete document:', err);
  }
}

export async function clearAllDocuments(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(DOCS_STORE, 'readwrite');
    const store = tx.objectStore(DOCS_STORE);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear documents:', err);
  }
}

export async function saveSearchHistory(entry: SearchHistoryEntry): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.put(entry);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to save history entry:', err);
  }
}

export async function getSearchHistory(): Promise<SearchHistoryEntry[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(HISTORY_STORE, 'readonly');
    const store = tx.objectStore(HISTORY_STORE);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const list = request.result || [];
        // sort by newest
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get search history:', err);
    return [];
  }
}

export async function clearSearchHistory(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear search history:', err);
  }
}

export async function deleteSearchHistoryItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete search history item:', err);
  }
}

export async function resetAllAppData(): Promise<void> {
  await clearAllDocuments();
  await clearSearchHistory();
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('docufinder_recent_query');
  }
}


