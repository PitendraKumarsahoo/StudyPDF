import React from 'react';
import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Expand,
  HelpCircle,
  Maximize2,
  Minimize2,
  Moon,
  PanelLeft,
  PanelRight,
  Search,
  Sun,
  ZoomIn,
  ZoomOut,
  Volume2,
  Square,
} from 'lucide-react';
import { ThemeMode } from '../types';

interface PdfToolbarProps {
  fileName: string;
  currentPage: number;
  pageCount: number;
  scale: number;
  theme: ThemeMode;
  isBookmarked: boolean;
  isStudyMode: boolean;
  isFullscreen: boolean;
  isReadingAloud?: boolean;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  isSearchOpen: boolean;
  onBack: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onJumpToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onToggleTheme: (theme: ThemeMode) => void;
  onToggleBookmark: () => void;
  onToggleStudyMode: () => void;
  onToggleFullscreen: () => void;
  onToggleReadAloud?: () => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}

export const PdfToolbar: React.FC<PdfToolbarProps> = ({
  fileName,
  currentPage,
  pageCount,
  scale,
  theme,
  isBookmarked,
  isStudyMode,
  isFullscreen,
  isReadingAloud = false,
  isLeftSidebarOpen,
  isRightSidebarOpen,
  isSearchOpen,
  onBack,
  onPrevPage,
  onNextPage,
  onJumpToPage,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitWidth,
  onFitPage,
  onToggleTheme,
  onToggleBookmark,
  onToggleStudyMode,
  onToggleFullscreen,
  onToggleReadAloud,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  onOpenSearch,
  onOpenShortcuts,
}) => {
  const [pageInput, setPageInput] = React.useState(currentPage.toString());

  React.useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= pageCount) {
      onJumpToPage(p);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const getThemeNext = () => {
    if (theme === 'light') return 'sepia';
    if (theme === 'sepia') return 'dark';
    return 'light';
  };

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 transition-all text-xs select-none shadow-sm ${
        theme === 'dark'
          ? 'bg-[#0F1D3D] text-white border-b border-[#1E293B]'
          : 'bg-[#1E3A8A] text-white border-b border-[#183269]'
      }`}
    >
      {/* Left Zone: Back, Thumbnails Toggle, File Name */}
      <div className="flex items-center gap-2 max-w-[34%] sm:max-w-[28%] truncate">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="Back to library"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {!isStudyMode && (
          <button
            type="button"
            onClick={onToggleLeftSidebar}
            className={`p-1.5 rounded-lg transition-all hidden md:flex shrink-0 cursor-pointer ${
              isLeftSidebarOpen
                ? 'bg-white/20 text-white ring-1 ring-white/30'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle thumbnails sidebar (T)"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        <span
          className="font-bold text-white truncate tracking-tight text-[13px]"
          title={fileName}
        >
          {fileName}
        </span>
      </div>

      {/* Center Zone: Page Navigation Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Previous page (Left Arrow)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1.5">
          <input
            type="text"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputSubmit}
            className="w-10 sm:w-12 text-center py-1 text-xs font-mono font-bold bg-white/15 hover:bg-white/20 focus:bg-white/25 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/40 tabular-nums shadow-2xs"
          />
          <span className="text-white/70 font-mono text-[11px] tabular-nums font-semibold">
            / {pageCount}
          </span>
        </form>

        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= pageCount}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Next page (Right Arrow)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right Zone: Search, Zoom, Theme, Bookmarks, Study Mode */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Search in PDF */}
        <button
          type="button"
          onClick={onOpenSearch}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            isSearchOpen
              ? 'bg-white/25 text-white ring-1 ring-white/30'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title="Search in PDF (Ctrl+F)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center gap-0.5 px-1 py-0.5 bg-white/10 rounded-lg border border-white/15 shadow-2xs">
          <button
            type="button"
            onClick={onZoomOut}
            className="p-1 text-white/80 hover:text-white rounded cursor-pointer"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-white tabular-nums"
            title="Reset to 100%"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            className="p-1 text-white/80 hover:text-white rounded cursor-pointer"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Fit Width */}
        <button
          type="button"
          onClick={onFitWidth}
          className="hidden xl:flex p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title="Fit Width"
        >
          <Expand className="w-3.5 h-3.5" />
        </button>

        {/* Theme mode: Direct Light / Sepia / Dark on md+, compact toggle on mobile */}
        <div className="hidden md:flex items-center p-0.5 bg-white/10 rounded-lg border border-white/15">
          <button
            type="button"
            onClick={() => onToggleTheme('light')}
            className={`p-1 rounded cursor-pointer transition-all ${
              theme === 'light' ? 'bg-white text-[#1E3A8A] shadow-2xs' : 'text-white/80 hover:text-white'
            }`}
            title="Switch to Light Theme"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme('sepia')}
            className={`p-1 rounded cursor-pointer transition-all ${
              theme === 'sepia' ? 'bg-[#FAF2E6] text-[#7A4B1A] shadow-2xs' : 'text-white/80 hover:text-white'
            }`}
            title="Switch to Sepia Paper Theme"
          >
            <Coffee className="w-3.5 h-3.5 text-amber-300" />
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme('dark')}
            className={`p-1 rounded cursor-pointer transition-all ${
              theme === 'dark' ? 'bg-[#0F1D3D] text-sky-200 ring-1 ring-white/20' : 'text-white/80 hover:text-white'
            }`}
            title="Switch to Dark Theme"
          >
            <Moon className="w-3.5 h-3.5 text-sky-200" />
          </button>
        </div>

        {/* Mobile theme toggle */}
        <button
          type="button"
          onClick={() => onToggleTheme(getThemeNext())}
          className="md:hidden p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          title={`Switch Theme (Current: ${theme})`}
        >
          {theme === 'sepia' ? (
            <Coffee className="w-4 h-4 text-amber-200" />
          ) : theme === 'dark' ? (
            <Moon className="w-4 h-4 text-sky-200" />
          ) : (
            <Sun className="w-4 h-4 text-amber-300" />
          )}
        </button>

        {/* Bookmark Current Page */}
        <button
          type="button"
          onClick={onToggleBookmark}
          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
            isBookmarked
              ? 'text-amber-300 bg-white/20 ring-1 ring-amber-300/40'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title={isBookmarked ? `Bookmarked (Page ${currentPage})` : 'Bookmark Page (B)'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-300' : ''}`} />
        </button>

        {/* Listen / Read Aloud Toggle Button */}
        {onToggleReadAloud && (
          <button
            type="button"
            onClick={onToggleReadAloud}
            className={`h-8 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isReadingAloud
                ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300 font-bold animate-pulse'
                : 'text-white/90 hover:text-white hover:bg-white/10 border border-white/20'
            }`}
            title={isReadingAloud ? 'Stop Audio Reading (Esc)' : 'Listen / Read Aloud PDF in Cute Voice'}
          >
            {isReadingAloud ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current text-slate-900" />
                <span className="hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-cyan-300" />
                <span className="hidden sm:inline">Listen</span>
              </>
            )}
          </button>
        )}

        {/* Study Mode Toggle (Emerald Green matching mockup) */}
        <button
          type="button"
          onClick={onToggleStudyMode}
          className={`h-8 px-3 text-xs font-semibold rounded-[8px] transition-all hidden sm:flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isStudyMode
              ? 'bg-white text-[#1E3A8A]'
              : 'bg-[#059669] hover:bg-[#047857] text-white'
          }`}
          title="Toggle Distraction-free Study Mode (Ctrl+Shift+S)"
        >
          <span>Study Mode</span>
        </button>

        {/* Browser Fullscreen Toggle (Always visible on all screen sizes) */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={`p-1.5 rounded-lg transition-all flex items-center cursor-pointer ${
            isFullscreen
              ? 'bg-white/20 text-white ring-1 ring-white/40'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          title={isFullscreen ? 'Exit Fullscreen Mode (Esc or F)' : 'Enter Fullscreen Mode (F)'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-amber-300" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Help / Shortcuts */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:flex cursor-pointer"
          title="Keyboard Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Right Sidebar Toggle */}
        {!isStudyMode && (
          <button
            type="button"
            onClick={onToggleRightSidebar}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isRightSidebarOpen
                ? 'bg-white/20 text-white ring-1 ring-white/30'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Notes & Bookmarks"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
