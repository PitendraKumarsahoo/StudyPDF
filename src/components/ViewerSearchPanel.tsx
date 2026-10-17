import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ListFilter,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { SearchMatch } from '../types';
import { PageTextCache, searchInExtractedPages } from '../utils/pdfSearch';

interface ViewerSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pagesCache: PageTextCache[];
  isExtractingText: boolean;
  onSelectResult: (pageNumber: number) => void;
  currentPage: number;
}

export const ViewerSearchPanel: React.FC<ViewerSearchPanelProps> = ({
  isOpen,
  onClose,
  pagesCache,
  isExtractingText,
  onSelectResult,
  currentPage,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);
  const [showSnippetsList, setShowSnippetsList] = useState<boolean>(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setActiveMatchIndex(0);
      return;
    }

    const matches = searchInExtractedPages(pagesCache, query, 100);
    setResults(matches);

    if (matches.length > 0) {
      const idxOnCurrent = matches.findIndex((m) => m.page >= currentPage);
      setActiveMatchIndex(idxOnCurrent >= 0 ? idxOnCurrent : 0);
    } else {
      setActiveMatchIndex(0);
    }
  }, [query, pagesCache, currentPage]);

  const handleNextMatch = () => {
    if (results.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % results.length;
    setActiveMatchIndex(nextIdx);
    onSelectResult(results[nextIdx].page);
  };

  const handlePrevMatch = () => {
    if (results.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + results.length) % results.length;
    setActiveMatchIndex(prevIdx);
    onSelectResult(results[prevIdx].page);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const renderHighlightedSnippet = (snippet: string, targetQuery: string) => {
    if (!targetQuery) return snippet;
    const parts = snippet.split(new RegExp(`(${targetQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === targetQuery.toLowerCase() ? (
        <mark key={i} className="bg-[#F4D77D] text-[#171411] font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="absolute top-14 right-4 sm:right-8 z-40 w-96 max-w-[92vw] animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="rounded-2xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#1F1A15] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] shadow-2xl overflow-hidden flex flex-col text-slate-900 sepia:text-[#241B14] dark:text-[#F7F7F5]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A]">
          <Search className="w-4 h-4 text-blue-600 sepia:text-[#8B6B4A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search text in document..."
            className="flex-1 text-xs bg-transparent border-none outline-none text-slate-900 sepia:text-[#241B14] dark:text-white placeholder-slate-400 sepia:placeholder-[#8A7868]"
          />

          {isExtractingText && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 sepia:text-[#8A7868]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 sepia:text-[#8B6B4A]" />
            </div>
          )}

          {query.trim().length >= 2 && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-blue-600 sepia:text-[#8B6B4A] font-bold tabular-nums shrink-0">
              {results.length > 0 ? (
                <span>
                  {activeMatchIndex + 1}/{results.length}
                </span>
              ) : (
                <span className="text-red-500 font-sans font-medium">0 found</span>
              )}
            </div>
          )}

          <div className="flex items-center border-l border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] pl-1.5 ml-1 gap-1">
            <button
              type="button"
              onClick={handlePrevMatch}
              disabled={results.length === 0}
              className="p-1 text-slate-500 sepia:text-[#6B5B4D] hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white hover:bg-slate-200/60 sepia:hover:bg-[#EAE8E3]/70 dark:hover:bg-[#2D211A] rounded-lg disabled:opacity-30 cursor-pointer"
              title="Previous match (Shift+Enter)"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMatch}
              disabled={results.length === 0}
              className="p-1 text-slate-500 sepia:text-[#6B5B4D] hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white hover:bg-slate-200/60 sepia:hover:bg-[#EAE8E3]/70 dark:hover:bg-[#2D211A] rounded-lg disabled:opacity-30 cursor-pointer"
              title="Next match (Enter)"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowSnippetsList(!showSnippetsList)}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                showSnippetsList
                  ? 'text-blue-700 bg-blue-100 sepia:text-[#241B14] sepia:bg-[#EAE8E3] dark:text-white dark:bg-[#332B23]'
                  : 'text-slate-400 sepia:text-[#8A7868] hover:text-slate-900 sepia:hover:text-[#241B14]'
              }`}
              title="Toggle snippets list"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 sepia:text-[#8A7868] hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white rounded-lg ml-0.5 cursor-pointer"
              title="Close search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Matching Snippets List */}
        {showSnippetsList && results.length > 0 && (
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 sepia:divide-[#EFE6DA] dark:divide-[#332B23] p-1.5 space-y-1 bg-white sepia:bg-[#FFFDF9] dark:bg-[#1F1A15]">
            {results.map((res, idx) => {
              const isActive = idx === activeMatchIndex;
              return (
                <button
                  key={`${res.page}-${res.matchIndex}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveMatchIndex(idx);
                    onSelectResult(res.page);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 sepia:bg-[#F6EFE6] dark:bg-[#2A231C] ring-1 ring-blue-500/50 sepia:ring-[#8B6B4A]/50'
                      : 'hover:bg-slate-50 sepia:hover:bg-[#FAF5ED] dark:hover:bg-[#241E18]'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#1E3A8A] text-white tabular-nums shrink-0">
                    p. {res.page}
                  </span>
                  <div className="text-[11px] text-slate-700 sepia:text-[#3D2F21] dark:text-[#C4BCB3] leading-snug line-clamp-2">
                    {renderHighlightedSnippet(res.snippet, query)}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {query.trim().length >= 2 && results.length === 0 && !isExtractingText && (
          <div className="py-5 text-center text-xs text-slate-400 sepia:text-[#8A7868]">
            No matches found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};
