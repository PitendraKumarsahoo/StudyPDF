import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfjsLib } from '../utils/pdfWorker';
import {
  Bookmark,
  DocumentMetadata,
  Highlight,
  HighlightColor,
  HighlightRect,
  Note,
  ThemeMode,
} from '../types';
import { PdfToolbar } from './PdfToolbar';
import { PdfPage } from './PdfPage';
import { PageThumbnailSidebar } from './PageThumbnailSidebar';
import { StudySidebar } from './StudySidebar';
import { ViewerSearchPanel } from './ViewerSearchPanel';
import { ShortcutsModal } from './ShortcutsModal';
import { HighlightPopover } from './HighlightPopover';
import { extractAllPageTexts, PageTextCache } from '../utils/pdfSearch';
import { Volume2, Square, Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ttsService } from '../utils/ttsService';
import {
  getBookmarks,
  getHighlights,
  getNotes,
  saveBookmarks,
  saveHighlights,
  saveNotes,
  updateDocumentProgress,
} from '../utils/storage';

interface PdfViewerProps {
  pdfBuffer: ArrayBuffer;
  metadata: DocumentMetadata;
  theme: ThemeMode;
  initialPage?: number;
  onBack: () => void;
  onToggleTheme: (theme: ThemeMode) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfBuffer,
  metadata,
  theme,
  initialPage = 1,
  onBack,
  onToggleTheme,
}) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.15);
  const [isStudyMode, setIsStudyMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Target page highlight flash state
  const [flashPageNumber, setFlashPageNumber] = useState<number | null>(null);

  // Annotations state
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getBookmarks(metadata.id));
  const [notes, setNotes] = useState<Note[]>(() => getNotes(metadata.id));
  const [highlights, setHighlights] = useState<Highlight[]>(() => getHighlights(metadata.id));

  // Search text cache
  const [pagesCache, setPagesCache] = useState<PageTextCache[]>([]);
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);

  // Floating highlight popover
  const [highlightPopover, setHighlightPopover] = useState<{
    position: { top: number; left: number; bottom?: number };
    text: string;
    page: number;
    rects: HighlightRect[];
  } | null>(null);

  // Text-To-Speech Document Reading Aloud state
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [readingPage, setReadingPage] = useState<number>(initialPage);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize browser fullscreen changes (e.g. Esc key or F11)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;

    async function loadDocument() {
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: pdfBuffer.slice(0),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);

        // Progressively extract page texts for instant search
        setIsExtractingText(true);
        extractAllPageTexts(doc)
          .then((cache) => {
            if (!isCancelled) {
              setPagesCache(cache);
              setIsExtractingText(false);
            }
          })
          .catch(() => setIsExtractingText(false));
      } catch (err) {
        console.error('Failed to load PDF in viewer:', err);
      }
    }

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [pdfBuffer]);

  // Jump to page helper with flash animation
  const jumpToPage = useCallback(
    (pageNum: number, smooth = true, triggerFlash = true) => {
      if (!pdfDoc) return;
      const target = Math.max(1, Math.min(pageNum, pdfDoc.numPages));
      setCurrentPage(target);

      if (triggerFlash) {
        setFlashPageNumber(target);
        setTimeout(() => setFlashPageNumber(null), 2500);
      }

      const pageEl = document.getElementById(`pdf-page-${target}`);
      if (pageEl) {
        pageEl.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'start',
        });
      }
    },
    [pdfDoc]
  );

  // Scroll to initial page on first load
  useEffect(() => {
    if (pdfDoc && initialPage > 1) {
      setTimeout(() => jumpToPage(initialPage, false, false), 150);
    }
  }, [pdfDoc, initialPage, jumpToPage]);

  // Observe page visibility to update reading progress
  const handlePageVisible = useCallback(
    (pageNum: number) => {
      setCurrentPage((prev) => {
        if (prev !== pageNum) {
          const highest = Math.max(metadata.highestPageRead || 1, pageNum);
          updateDocumentProgress(metadata.id, pageNum, highest);
          return pageNum;
        }
        return prev;
      });
    },
    [metadata.id, metadata.highestPageRead]
  );

  // Bookmark actions
  const handleToggleBookmark = useCallback(() => {
    const existing = bookmarks.find((b) => b.page === currentPage);
    let updated: Bookmark[];
    if (existing) {
      updated = bookmarks.filter((b) => b.id !== existing.id);
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        docId: metadata.id,
        page: currentPage,
        title: `Page ${currentPage}`,
        createdAt: Date.now(),
      };
      updated = [...bookmarks, newBm];
    }
    setBookmarks(updated);
    saveBookmarks(metadata.id, updated);
  }, [bookmarks, currentPage, metadata.id]);

  const handleAddBookmark = useCallback(
    (page: number, title?: string) => {
      if (bookmarks.some((b) => b.page === page)) return;
      const newBm: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        docId: metadata.id,
        page,
        title: title || `Page ${page}`,
        createdAt: Date.now(),
      };
      const updated = [...bookmarks, newBm];
      setBookmarks(updated);
      saveBookmarks(metadata.id, updated);
    },
    [bookmarks, metadata.id]
  );

  const handleRemoveBookmark = useCallback(
    (id: string) => {
      const updated = bookmarks.filter((b) => b.id !== id);
      setBookmarks(updated);
      saveBookmarks(metadata.id, updated);
    },
    [bookmarks, metadata.id]
  );

  const handleRenameBookmark = useCallback(
    (id: string, newTitle: string) => {
      const updated = bookmarks.map((b) => (b.id === id ? { ...b, title: newTitle } : b));
      setBookmarks(updated);
      saveBookmarks(metadata.id, updated);
    },
    [bookmarks, metadata.id]
  );

  // Note actions
  const handleAddNote = useCallback(
    (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newNote: Note = {
        ...noteData,
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      saveNotes(metadata.id, updated);
    },
    [metadata.id, notes]
  );

  const handleUpdateNote = useCallback(
    (id: string, content: string, color?: Note['color']) => {
      const updated = notes.map((n) =>
        n.id === id
          ? {
              ...n,
              content,
              color: color !== undefined ? color : n.color,
              updatedAt: Date.now(),
            }
          : n
      );
      setNotes(updated);
      saveNotes(metadata.id, updated);
    },
    [metadata.id, notes]
  );

  const handleDeleteNote = useCallback(
    (id: string) => {
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      saveNotes(metadata.id, updated);
    },
    [metadata.id, notes]
  );

  // Highlight actions
  const handleTextSelected = (
    selectedText: string,
    position: { top: number; left: number; bottom?: number },
    pageNumber: number,
    rects: HighlightRect[]
  ) => {
    setHighlightPopover({
      position,
      text: selectedText,
      page: pageNumber,
      rects,
    });
  };

  const handleAddHighlight = (color: HighlightColor) => {
    if (!highlightPopover) return;
    const newHighlight: Highlight = {
      id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      docId: metadata.id,
      page: highlightPopover.page,
      text: highlightPopover.text,
      color,
      rects: highlightPopover.rects,
      createdAt: Date.now(),
    };
    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    saveHighlights(metadata.id, updated);
    setHighlightPopover(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    saveHighlights(metadata.id, updated);
  };

  const handleAddNoteFromSelection = (text: string) => {
    if (!highlightPopover) return;
    handleAddNote({
      docId: metadata.id,
      page: highlightPopover.page,
      content: `"${text}"`,
      color: 'amber',
    });
    setHighlightPopover(null);
    setIsRightSidebarOpen(true);
    window.getSelection()?.removeAllRanges();
  };

  // Global selection and context menu listener to guarantee highlight popover shows ANY time text is selected
  useEffect(() => {
    const handleGlobalSelection = () => {
      requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length < 1) {
          return;
        }

        const range = selection.getRangeAt(0);
        let node: Node | null = range.commonAncestorContainer;
        let pageEl: HTMLElement | null = null;
        while (node && node !== document.body) {
          if (node instanceof HTMLElement && node.dataset?.pageNumber) {
            pageEl = node;
            break;
          }
          node = node.parentNode;
        }

        if (!pageEl && selection.anchorNode) {
          let aNode: Node | null = selection.anchorNode;
          while (aNode && aNode !== document.body) {
            if (aNode instanceof HTMLElement && aNode.dataset?.pageNumber) {
              pageEl = aNode;
              break;
            }
            aNode = aNode.parentNode;
          }
        }

        if (!pageEl && selection.focusNode) {
          let fNode: Node | null = selection.focusNode;
          while (fNode && fNode !== document.body) {
            if (fNode instanceof HTMLElement && fNode.dataset?.pageNumber) {
              pageEl = fNode;
              break;
            }
            fNode = fNode.parentNode;
          }
        }

        if (!pageEl) return;

        const pageNum = parseInt(pageEl.dataset.pageNumber || '1', 10);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const containerRect = pageEl.getBoundingClientRect();
        const clientRects = Array.from(range.getClientRects());
        const normalizedRects: HighlightRect[] = clientRects
          .filter((cr) => cr.width > 0 && cr.height > 0)
          .map((cr) => ({
            x: Math.max(0, Math.min(1, (cr.left - containerRect.left) / containerRect.width)),
            y: Math.max(0, Math.min(1, (cr.top - containerRect.top) / containerRect.height)),
            width: Math.max(0, Math.min(1, cr.width / containerRect.width)),
            height: Math.max(0, Math.min(1, cr.height / containerRect.height)),
          }));

        setHighlightPopover({
          position: {
            top: rect.top,
            left: rect.left + rect.width / 2,
            bottom: rect.bottom,
          },
          text: selectedText,
          page: pageNum,
          rects: normalizedRects.length > 0 ? normalizedRects : [
            {
              x: Math.max(0, (rect.left - containerRect.left) / containerRect.width),
              y: Math.max(0, (rect.top - containerRect.top) / containerRect.height),
              width: Math.min(1, rect.width / containerRect.width),
              height: Math.min(1, rect.height / containerRect.height),
            }
          ],
        });
      });
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('.highlight-popover-container')) {
        return;
      }
      handleGlobalSelection();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.shiftKey || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        handleGlobalSelection();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('.highlight-popover-container')) {
        return;
      }
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim().length >= 1) {
        if (target.closest('.textLayer') || target.closest('[data-page-number]')) {
          e.preventDefault();
          handleGlobalSelection();
        }
      }
    };

    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Zoom helpers
  const handleZoomIn = () => setScale((s) => Math.min(3.0, +(s + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale((s) => Math.max(0.4, +(s - 0.15).toFixed(2)));
  const handleResetZoom = () => setScale(1.0);

  const handleFitWidth = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 80;
    const computedScale = Math.max(0.6, Math.min(2.5, +(containerWidth / 612).toFixed(2)));
    setScale(computedScale);
  };

  const handleFitPage = () => {
    if (!containerRef.current) return;
    const containerHeight = containerRef.current.clientHeight - 80;
    const computedScale = Math.max(0.5, Math.min(2.0, +(containerHeight / 792).toFixed(2)));
    setScale(computedScale);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Text-To-Speech Document Reading Functions
  const readPageAloud = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc) return;
      const totalPages = pdfDoc.numPages;
      if (pageNum > totalPages) {
        setIsReadingAloud(false);
        setIsAudioPaused(false);
        ttsService.stop();
        return;
      }

      setReadingPage(pageNum);
      jumpToPage(pageNum, true, false);

      // Extract text for this page
      let textToRead = '';
      const cached = pagesCache.find((p) => p.pageNumber === pageNum);
      if (cached && cached.text.trim()) {
        textToRead = cached.text;
      } else {
        try {
          const page = await pdfDoc.getPage(pageNum);
          const content = await page.getTextContent();
          textToRead = content.items.map((it: any) => ('str' in it ? it.str : '')).join(' ');
        } catch (e) {
          console.warn('Failed to extract text for speech on page', pageNum, e);
        }
      }

      if (!textToRead.trim()) {
        textToRead = `Page ${pageNum}`;
      }

      setIsReadingAloud(true);
      setIsAudioPaused(false);

      ttsService.speakText(textToRead, {
        pitch: 1.18, // Cute, natural friendly tone
        rate: 0.98,
        onStart: () => {
          setIsReadingAloud(true);
          setIsAudioPaused(false);
        },
        onEnd: () => {
          // Advance to next page if more pages exist
          if (pageNum < totalPages) {
            readPageAloud(pageNum + 1);
          } else {
            setIsReadingAloud(false);
            setIsAudioPaused(false);
            ttsService.stop();
          }
        },
        onError: () => {
          setIsReadingAloud(false);
          setIsAudioPaused(false);
        },
      });
    },
    [pdfDoc, pagesCache, jumpToPage]
  );

  const handleToggleReadAloud = useCallback(() => {
    if (isReadingAloud) {
      ttsService.stop();
      setIsReadingAloud(false);
      setIsAudioPaused(false);
    } else {
      // Check if user has selected text
      const selection = window.getSelection();
      const selected = selection?.toString()?.trim();
      if (selected && selected.length >= 2) {
        setIsReadingAloud(true);
        setReadingPage(currentPage);
        ttsService.speakText(selected, {
          pitch: 1.18,
          rate: 0.98,
          onStart: () => setIsReadingAloud(true),
          onEnd: () => {
            setIsReadingAloud(false);
            setIsAudioPaused(false);
          },
          onError: () => {
            setIsReadingAloud(false);
            setIsAudioPaused(false);
          },
        });
      } else {
        readPageAloud(currentPage);
      }
    }
  }, [isReadingAloud, currentPage, readPageAloud]);

  const handlePauseResumeAudio = () => {
    if (isAudioPaused) {
      ttsService.resume();
      setIsAudioPaused(false);
    } else {
      ttsService.pause();
      setIsAudioPaused(true);
    }
  };

  const handleStopAudio = () => {
    ttsService.stop();
    setIsReadingAloud(false);
    setIsAudioPaused(false);
  };

  // Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsStudyMode((prev) => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        jumpToPage(currentPage - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        jumpToPage(currentPage + 1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleToggleBookmark();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleToggleReadAloud();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsRightSidebarOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setHighlightPopover(null);
        setIsSearchOpen(false);
        setIsShortcutsOpen(false);
        handleStopAudio();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, jumpToPage, handleToggleBookmark]);

  // Page background style depending on theme
  const getWorkspaceBg = () => {
    if (theme === 'dark') return 'bg-[#0B1120] text-[#F8FAFC] pdf-filter-dark';
    if (theme === 'sepia') return 'bg-[#EFE7DC] text-[#241B14] pdf-filter-sepia';
    return 'bg-[#F1F5F9] text-[#0F172A]';
  };

  const isCurrentBookmarked = bookmarks.some((b) => b.page === currentPage);
  const pageCount = pdfDoc ? pdfDoc.numPages : metadata.pageCount;

  return (
    <div className={`relative h-screen w-screen flex flex-col overflow-hidden ${getWorkspaceBg()}`}>
      {/* Top Sticky Glass Toolbar */}
      <PdfToolbar
        fileName={metadata.fileName}
        currentPage={currentPage}
        pageCount={pageCount}
        scale={scale}
        theme={theme}
        isBookmarked={isCurrentBookmarked}
        isStudyMode={isStudyMode}
        isFullscreen={isFullscreen}
        isReadingAloud={isReadingAloud}
        onToggleReadAloud={handleToggleReadAloud}
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightSidebarOpen={isRightSidebarOpen}
        isSearchOpen={isSearchOpen}
        onBack={onBack}
        onPrevPage={() => jumpToPage(currentPage - 1)}
        onNextPage={() => jumpToPage(currentPage + 1)}
        onJumpToPage={(p) => jumpToPage(p)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitWidth={handleFitWidth}
        onFitPage={handleFitPage}
        onToggleTheme={onToggleTheme}
        onToggleBookmark={handleToggleBookmark}
        onToggleStudyMode={() => setIsStudyMode(!isStudyMode)}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        onOpenSearch={() => setIsSearchOpen(!isSearchOpen)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Floating In-Viewer Search Panel */}
      <ViewerSearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pagesCache={pagesCache}
        isExtractingText={isExtractingText}
        currentPage={currentPage}
        onSelectResult={(p) => jumpToPage(p, true, true)}
      />

      {/* Main Study Desk Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Clickable Page Thumbnails Sidebar */}
        {!isStudyMode && pdfDoc && (
          <PageThumbnailSidebar
            pdfDoc={pdfDoc}
            pageCount={pageCount}
            currentPage={currentPage}
            bookmarks={bookmarks}
            notes={notes}
            onSelectPage={(p) => jumpToPage(p, true, true)}
            onClose={() => setIsLeftSidebarOpen(false)}
            isOpen={isLeftSidebarOpen}
          />
        )}

        {/* Center PDF Pages Canvas Area */}
        <main
          ref={containerRef}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('.highlight-popover-container')) {
              return;
            }
            requestAnimationFrame(() => {
              const selection = window.getSelection();
              if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
                if (highlightPopover) setHighlightPopover(null);
              }
            });
          }}
          className="flex-1 h-full overflow-y-auto overflow-x-auto p-4 sm:p-6 transition-all relative flex flex-col items-center"
        >
          {pdfDoc &&
            Array.from({ length: pageCount }, (_, i) => i + 1).map((pageNum) => (
              <PdfPage
                key={`page-${pageNum}`}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                scale={scale}
                theme={theme}
                highlights={highlights}
                isFlashTarget={flashPageNumber === pageNum}
                onPageVisible={handlePageVisible}
                onTextSelected={handleTextSelected}
              />
            ))}

          {!pdfDoc && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-400 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-neutral-400 border-t-neutral-800 animate-spin" />
              <p className="text-xs font-mono">Loading document pages...</p>
            </div>
          )}
        </main>

        {/* Right Study Sidebar (Notes, Bookmarks, Reading Progress) */}
        {!isStudyMode && (
          <StudySidebar
            metadata={metadata}
            currentPage={currentPage}
            bookmarks={bookmarks}
            notes={notes}
            highlights={highlights}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            onRenameBookmark={handleRenameBookmark}
            onAddNote={handleAddNote}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onDeleteHighlight={handleDeleteHighlight}
            onJumpToPage={(p) => jumpToPage(p, true, true)}
            isOpen={isRightSidebarOpen}
            onClose={() => setIsRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* Floating Highlight & Note Popover */}
      {highlightPopover && (
        <HighlightPopover
          position={highlightPopover.position}
          selectedText={highlightPopover.text}
          onHighlight={handleAddHighlight}
          onAddNote={handleAddNoteFromSelection}
          onClose={() => setHighlightPopover(null)}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Distraction-Free Study Mode Exit pill indicator */}
      {isStudyMode && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => setIsStudyMode(false)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#171411] hover:bg-[#2A211B] text-white rounded-full shadow-xl border border-white/10 transition-all cursor-pointer"
          >
            <span>Exit Study Mode</span>
            <span className="text-[10px] opacity-75 font-mono">(Esc or Ctrl+Shift+S)</span>
          </button>
        </div>
      )}

      {/* Floating Audio Reading Controller (Cute Voice Player) */}
      {isReadingAloud && (
        <div className={`fixed z-50 left-1/2 -translate-x-1/2 ${isStudyMode ? 'bottom-16' : 'bottom-6'} animate-in fade-in slide-in-from-bottom-3 duration-200`}>
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#0F172A]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 ring-1 ring-black/40 text-xs">
            {/* Cute voice waves */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700">
              <span className="flex items-end gap-0.5 h-4 w-4">
                <span className={`w-1 bg-cyan-400 rounded-full transition-all ${isAudioPaused ? 'h-1' : 'h-3 animate-pulse'}`} />
                <span className={`w-1 bg-amber-400 rounded-full transition-all ${isAudioPaused ? 'h-2' : 'h-4 animate-bounce'}`} />
                <span className={`w-1 bg-pink-400 rounded-full transition-all ${isAudioPaused ? 'h-1' : 'h-2 animate-pulse'}`} />
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-white tracking-wide flex items-center gap-1">
                  Cute Voice Audio
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Page {readingPage} of {pageCount}
                </span>
              </div>
            </div>

            {/* Skip Previous Page */}
            <button
              type="button"
              onClick={() => readPageAloud(Math.max(1, readingPage - 1))}
              disabled={readingPage <= 1}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pause / Resume Button */}
            <button
              type="button"
              onClick={handlePauseResumeAudio}
              className="p-2 bg-white text-slate-900 hover:bg-slate-100 rounded-full font-medium transition-transform active:scale-95 cursor-pointer shadow-md"
              title={isAudioPaused ? 'Resume Reading' : 'Pause Reading'}
            >
              {isAudioPaused ? (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
            </button>

            {/* Skip Next Page */}
            <button
              type="button"
              onClick={() => readPageAloud(Math.min(pageCount, readingPage + 1))}
              disabled={readingPage >= pageCount}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Stop Audio Button */}
            <button
              type="button"
              onClick={handleStopAudio}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-lg transition-colors font-medium ml-1 cursor-pointer"
              title="Stop Audio Reading (Esc)"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
