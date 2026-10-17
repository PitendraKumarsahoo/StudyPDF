export type ThemeMode = 'light' | 'dark' | 'sepia';

export type ViewMode = 'continuous' | 'single';

export interface DocumentMetadata {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  currentPage: number;
  highestPageRead: number;
  lastOpened: number;
  bookmarksCount: number;
  notesCount: number;
  highlightsCount: number;
}

export interface Bookmark {
  id: string;
  docId: string;
  page: number;
  title: string;
  createdAt: number;
}

export interface Note {
  id: string;
  docId: string;
  page: number;
  content: string;
  createdAt: number;
  updatedAt: number;
  color?: 'default' | 'amber' | 'blue' | 'emerald';
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface HighlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Highlight {
  id: string;
  docId: string;
  page: number;
  text: string;
  color: HighlightColor;
  createdAt: number;
  rects?: HighlightRect[];
}

export interface SearchMatch {
  page: number;
  snippet: string;
  matchIndex: number;
}

export interface PdfDocumentState {
  id: string;
  file: File | null;
  arrayBuffer: ArrayBuffer | null;
  fileName: string;
  fileSize: number;
  pageCount: number;
  currentPage: number;
  highestPageRead: number;
}
