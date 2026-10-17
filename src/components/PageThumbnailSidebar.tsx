import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { Bookmark, MessageSquare, Search, X } from 'lucide-react';

interface PageThumbnailSidebarProps {
  pdfDoc: PDFDocumentProxy;
  pageCount: number;
  currentPage: number;
  bookmarks: { page: number }[];
  notes: { page: number }[];
  onSelectPage: (pageNumber: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const PageThumbnailSidebar: React.FC<PageThumbnailSidebarProps> = ({
  pdfDoc,
  pageCount,
  currentPage,
  bookmarks,
  notes,
  onSelectPage,
  onClose,
  isOpen,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbnailRef.current && isOpen) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentPage, isOpen]);

  if (!isOpen) return null;

  const bookmarkedPages = new Set(bookmarks.map((b) => b.page));
  const notedPages = new Set(notes.map((n) => n.page));

  const pageNumbers = Array.from({ length: pageCount }, (_, i) => i + 1).filter((num) => {
    if (!filterQuery.trim()) return true;
    return num.toString().includes(filterQuery.trim());
  });

  return (
    <aside className="w-64 h-full border-r border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-slate-50/90 sepia:bg-[#FAF5ED] dark:bg-[#1A1612] flex flex-col shrink-0 z-20 transition-all select-none shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 sepia:text-[#241B14] dark:text-[#F8F3ED]">
            Thumbnails
          </span>
          <span className="text-[11px] font-mono text-blue-600 sepia:text-[#8B6B4A] font-bold tabular-nums bg-slate-100 sepia:bg-[#EFE6DA] dark:bg-[#2C211B] px-1.5 py-0.5 rounded-md">
            {pageCount}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white hover:bg-slate-100 sepia:hover:bg-[#EAE8E3]/70 dark:hover:bg-[#281F1A] rounded-lg transition-colors cursor-pointer"
          title="Close thumbnails (T)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search / Filter Input */}
      <div className="p-2.5 border-b border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 sepia:text-[#8A7868]" />
          <input
            type="text"
            placeholder="Filter page number..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] rounded-lg text-slate-900 sepia:text-[#241B14] dark:text-white placeholder-slate-400 sepia:placeholder-[#8A7868] focus:outline-none focus:border-blue-600 sepia:focus:border-[#8B6B4A] focus:ring-2 focus:ring-blue-500/20 sepia:focus:ring-[#8B6B4A]/20"
          />
        </div>
      </div>

      {/* Clickable Page Thumbnails Grid */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {pageNumbers.map((pageNum) => {
          const isActive = pageNum === currentPage;
          const isBookmarked = bookmarkedPages.has(pageNum);
          const hasNotes = notedPages.has(pageNum);

          return (
            <button
              key={pageNum}
              ref={isActive ? activeThumbnailRef : null}
              type="button"
              onClick={() => onSelectPage(pageNum)}
              className={`w-full group text-left p-1.5 rounded-xl border transition-all duration-200 flex flex-col items-center cursor-pointer ${
                isActive
                  ? 'border-2 border-blue-600 sepia:border-[#8B6B4A] bg-white sepia:bg-[#FFFDF9] dark:bg-[#241E18] shadow-sm ring-2 ring-blue-500/20 sepia:ring-[#8B6B4A]/20'
                  : 'border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-white sepia:bg-[#FFFDF9] dark:bg-[#201B16] hover:border-blue-400 sepia:hover:border-[#8B6B4A]/50 hover:shadow-2xs'
              }`}
            >
              {/* Thumbnail Canvas Frame */}
              <div className="w-full flex items-center justify-center p-0.5">
                <ThumbnailCanvas
                  pdfDoc={pdfDoc}
                  pageNumber={pageNum}
                  isActive={isActive}
                />
              </div>

              {/* Bottom Info Bar */}
              <div className="w-full flex items-center justify-between px-2 pt-1.5 pb-0.5 text-[11px]">
                <span
                  className={`font-mono tabular-nums ${
                    isActive
                      ? 'font-bold text-blue-600 sepia:text-[#8B6B4A]'
                      : 'text-slate-600 sepia:text-[#6B5B4D] dark:text-[#A8A29E] group-hover:text-slate-900 sepia:group-hover:text-[#241B14] dark:group-hover:text-white'
                  }`}
                >
                  Page {pageNum}
                </span>

                <div className="flex items-center gap-1.5">
                  {isBookmarked && (
                    <span title="Bookmarked">
                      <Bookmark className="w-3.5 h-3.5 text-blue-600 sepia:text-[#8B6B4A] fill-current" />
                    </span>
                  )}
                  {hasNotes && (
                    <span title="Has notes">
                      <MessageSquare className="w-3.5 h-3.5 text-teal-600 sepia:text-teal-700 fill-current" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {pageNumbers.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-400 sepia:text-[#8A7868] dark:text-[#A8A29E]">
            No page #{filterQuery}
          </div>
        )}
      </div>
    </aside>
  );
};

// Mini canvas renderer with high fidelity
const ThumbnailCanvas: React.FC<{
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  isActive: boolean;
}> = ({ pdfDoc, pageNumber, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderThumbnail() {
      if (!canvasRef.current || !pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 0.24 });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderParams: any = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderParams).promise;

        if (!cancelled) setRendered(true);
      } catch (err) {
        // Handled silently
      }
    }

    renderThumbnail();
    return () => {
      cancelled = true;
    };
  }, [pdfDoc, pageNumber]);

  return (
    <div
      className={`relative w-full aspect-[1/1.29] max-w-[145px] bg-white sepia:bg-[#FCF6E9] dark:bg-[#1A1612] rounded-lg border overflow-hidden flex items-center justify-center transition-all ${
        isActive
          ? 'border-blue-600 sepia:border-[#8B6B4A] shadow-2xs'
          : 'border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23]'
      }`}
    >
      <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
      {!rendered && (
        <span className="text-[10px] font-mono text-slate-400 sepia:text-[#8A7868] dark:text-[#A8A29E]">
          #{pageNumber}
        </span>
      )}
    </div>
  );
};
