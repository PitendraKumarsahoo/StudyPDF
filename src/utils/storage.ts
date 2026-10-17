import { Bookmark, DocumentMetadata, Highlight, Note, ThemeMode } from '../types';

const RECENT_DOCS_KEY = 'studypdf_recent_docs';
const THEME_KEY = 'studypdf_theme';
const LAST_ACTIVE_DOC_KEY = 'studypdf_last_active_doc_id';

// IndexedDB database for PDF binary files
const DB_NAME = 'StudyPdfStorage';
const DB_VERSION = 1;
const STORE_PDF_BUFFERS = 'pdf_buffers';

function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PDF_BUFFERS)) {
        db.createObjectStore(STORE_PDF_BUFFERS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storePdfBuffer(id: string, buffer: ArrayBuffer, fileName: string): Promise<void> {
  try {
    const db = await openPdfDb();
    const tx = db.transaction(STORE_PDF_BUFFERS, 'readwrite');
    const store = tx.objectStore(STORE_PDF_BUFFERS);
    store.put({ id, buffer, fileName, savedAt: Date.now() });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not cache PDF buffer in IndexedDB:', err);
  }
}

export async function getPdfBuffer(id: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openPdfDb();
    const tx = db.transaction(STORE_PDF_BUFFERS, 'readonly');
    const store = tx.objectStore(STORE_PDF_BUFFERS);
    const request = store.get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (request.result && request.result.buffer) {
          resolve(request.result.buffer);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not read PDF buffer from IndexedDB:', err);
    return null;
  }
}

export async function removePdfBuffer(id: string): Promise<void> {
  try {
    const db = await openPdfDb();
    const tx = db.transaction(STORE_PDF_BUFFERS, 'readwrite');
    tx.objectStore(STORE_PDF_BUFFERS).delete(id);
  } catch (err) {
    console.warn('Could not remove PDF buffer from IndexedDB:', err);
  }
}

export const INITIAL_SAMPLE_DOCS: DocumentMetadata[] = [
  {
    id: 'sample-cs410-distributed-systems',
    title: 'CS410_Distributed_Systems_Exam_Revision.pdf',
    fileName: 'CS410_Distributed_Systems_Exam_Revision.pdf',
    fileSize: 142000,
    pageCount: 5,
    currentPage: 2,
    highestPageRead: 2,
    lastOpened: Date.now() - 2 * 3600 * 1000, // 2h ago
    bookmarksCount: 2,
    notesCount: 3,
    highlightsCount: 4,
  },
  {
    id: 'sample-crime-evidence-analysis',
    title: 'Crime-Evidence-Analysis-system---...',
    fileName: 'Crime-Evidence-Analysis-system-v2.pdf',
    fileSize: 480000,
    pageCount: 21,
    currentPage: 1,
    highestPageRead: 1,
    lastOpened: Date.now() - 23 * 3600 * 1000, // 23h ago
    bookmarksCount: 1,
    notesCount: 0,
    highlightsCount: 2,
  },
];

// LocalStorage helpers for metadata
export function getRecentDocuments(): DocumentMetadata[] {
  try {
    const raw = localStorage.getItem(RECENT_DOCS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Seed initial sample documents if first visit
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(INITIAL_SAMPLE_DOCS));
    return INITIAL_SAMPLE_DOCS;
  } catch {
    return INITIAL_SAMPLE_DOCS;
  }
}

export function saveRecentDocument(doc: DocumentMetadata): void {
  try {
    const docs = getRecentDocuments();
    const existingIndex = docs.findIndex((d) => d.id === doc.id);
    if (existingIndex >= 0) {
      docs[existingIndex] = { ...docs[existingIndex], ...doc, lastOpened: Date.now() };
    } else {
      docs.unshift({ ...doc, lastOpened: Date.now() });
    }
    // Limit to 20 recent documents
    const trimmed = docs.slice(0, 20);
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(trimmed));
    localStorage.setItem(LAST_ACTIVE_DOC_KEY, doc.id);
  } catch (err) {
    console.warn('Failed to save recent document:', err);
  }
}

export function removeRecentDocument(id: string): void {
  try {
    const docs = getRecentDocuments().filter((d) => d.id !== id);
    localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(docs));
    removePdfBuffer(id);
    localStorage.removeItem(`studypdf_bookmarks_${id}`);
    localStorage.removeItem(`studypdf_notes_${id}`);
    localStorage.removeItem(`studypdf_highlights_${id}`);
    if (localStorage.getItem(LAST_ACTIVE_DOC_KEY) === id) {
      localStorage.removeItem(LAST_ACTIVE_DOC_KEY);
    }
  } catch (err) {
    console.warn('Failed to remove recent document:', err);
  }
}

export function updateDocumentProgress(docId: string, currentPage: number, highestPageRead: number): void {
  try {
    const docs = getRecentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index >= 0) {
      docs[index].currentPage = currentPage;
      docs[index].highestPageRead = Math.max(docs[index].highestPageRead || 1, highestPageRead);
      docs[index].lastOpened = Date.now();
      localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('Failed to update doc progress:', err);
  }
}

// Bookmarks
export function getBookmarks(docId: string): Bookmark[] {
  try {
    const raw = localStorage.getItem(`studypdf_bookmarks_${docId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(docId: string, bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(`studypdf_bookmarks_${docId}`, JSON.stringify(bookmarks));
    // update count
    const docs = getRecentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index >= 0) {
      docs[index].bookmarksCount = bookmarks.length;
      localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('Failed to save bookmarks:', err);
  }
}

// Notes
export function getNotes(docId: string): Note[] {
  try {
    const raw = localStorage.getItem(`studypdf_notes_${docId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotes(docId: string, notes: Note[]): void {
  try {
    localStorage.setItem(`studypdf_notes_${docId}`, JSON.stringify(notes));
    // update count
    const docs = getRecentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index >= 0) {
      docs[index].notesCount = notes.length;
      localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('Failed to save notes:', err);
  }
}

// Highlights
export function getHighlights(docId: string): Highlight[] {
  try {
    const raw = localStorage.getItem(`studypdf_highlights_${docId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHighlights(docId: string, highlights: Highlight[]): void {
  try {
    localStorage.setItem(`studypdf_highlights_${docId}`, JSON.stringify(highlights));
    // update count
    const docs = getRecentDocuments();
    const index = docs.findIndex((d) => d.id === docId);
    if (index >= 0) {
      docs[index].highlightsCount = highlights.length;
      localStorage.setItem(RECENT_DOCS_KEY, JSON.stringify(docs));
    }
  } catch (err) {
    console.warn('Failed to save highlights:', err);
  }
}

// Theme
export function getStoredTheme(): ThemeMode {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'dark' || t === 'sepia' || t === 'light') return t;
  } catch {}
  return 'light';
}

export function storeTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {}
}

export function getLastActiveDocId(): string | null {
  try {
    return localStorage.getItem(LAST_ACTIVE_DOC_KEY);
  } catch {
    return null;
  }
}
