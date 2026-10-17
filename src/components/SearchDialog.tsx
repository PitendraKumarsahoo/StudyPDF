import React, { useEffect, useRef, useState } from 'react';
import { Search, X, ChevronRight, Loader2 } from 'lucide-react';
import { SearchMatch } from '../types';
import { PageTextCache, searchInExtractedPages } from '../utils/pdfSearch';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pagesCache: PageTextCache[];
  isExtractingText: boolean;
  onSelectResult: (pageNumber: number) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  pagesCache,
  isExtractingText,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const matches = searchInExtractedPages(pagesCache, query, 60);
    setResults(matches);
  }, [query, pagesCache]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1F1A15] border border-[#E6E3DE] dark:border-[#332B23] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E6E3DE] dark:border-[#332B23] gap-2.5 bg-[#FAFAF9] dark:bg-[#261F1A]">
          <Search className="w-4 h-4 text-[#8B6B4A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in this PDF..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-[#171717] dark:text-white placeholder-[#858585]"
          />

          {isExtractingText && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#858585]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Indexing...</span>
            </div>
          )}

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#858585] hover:text-[#171717] dark:hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs text-[#626262] dark:text-[#A8A29E] hover:text-[#171717] hover:bg-[#EAE8E3]/60 dark:hover:bg-[#332921] rounded-lg cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Search Results Summary */}
        <div className="px-4 py-2 bg-[#F7F7F5] dark:bg-[#201B16] border-b border-[#E6E3DE] dark:border-[#332B23] text-[11px] text-[#626262] dark:text-[#A8A29E] flex items-center justify-between">
          <span>
            {query.length >= 2
              ? `${results.length} result${results.length === 1 ? '' : 's'} found`
              : 'Type at least 2 characters to search'}
          </span>
          <span className="font-mono">{pagesCache.length} pages indexed</span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {results.map((res, index) => (
            <button
              key={`${res.page}-${res.matchIndex}-${index}`}
              type="button"
              onClick={() => {
                onSelectResult(res.page);
                onClose();
              }}
              className="w-full text-left p-3 rounded-xl hover:bg-[#F7F7F5] dark:hover:bg-[#281F1A] border border-transparent hover:border-[#E6E3DE] dark:hover:border-[#3A3127] transition-all group flex items-start justify-between gap-3 cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono font-bold text-[#8B6B4A] tabular-nums">
                    Page {res.page}
                  </span>
                </div>
                <p className="text-xs text-[#626262] dark:text-[#B5ADA4] line-clamp-2 leading-relaxed">
                  {res.snippet}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-[#858585] group-hover:text-[#171717] dark:group-hover:text-white shrink-0 self-center transition-colors" />
            </button>
          ))}

          {query.length >= 2 && results.length === 0 && !isExtractingText && (
            <div className="py-12 text-center text-xs text-[#858585]">
              No matching text found for "{query}"
            </div>
          )}

          {query.length < 2 && (
            <div className="py-10 text-center text-xs text-[#858585]">
              Search words, formulas, chapters or key definitions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
