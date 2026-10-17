import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '← / →', desc: 'Previous or next page' },
    { key: '+ / -', desc: 'Zoom in or zoom out' },
    { key: '0', desc: 'Reset zoom to 100%' },
    { key: 'Ctrl + F', desc: 'Search text inside PDF' },
    { key: 'B', desc: 'Bookmark current page' },
    { key: 'L', desc: 'Listen / Read aloud (Cute voice)' },
    { key: 'F', desc: 'Toggle fullscreen mode' },
    { key: 'Ctrl + Shift + S', desc: 'Toggle distraction-free Study Mode' },
    { key: 'T', desc: 'Toggle page thumbnails sidebar' },
    { key: 'N', desc: 'Toggle notes and study sidebar' },
    { key: 'Esc', desc: 'Close search, dialogs or study mode' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-white sepia:bg-[#FFFDF9] dark:bg-[#1F1A15] border border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] shadow-2xl overflow-hidden ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#261F1A]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-600 sepia:text-[#8B6B4A]" />
            <h3 className="text-xs font-bold text-slate-900 sepia:text-[#241B14] dark:text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 sepia:hover:text-[#241B14] dark:hover:text-white hover:bg-slate-200/60 sepia:hover:bg-[#EAE8E3]/60 dark:hover:bg-[#281F1A] rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-1.5 border-b border-slate-100 sepia:border-[#EFE6DA] dark:border-white/5 last:border-0 text-xs"
            >
              <span className="text-slate-600 sepia:text-[#5C4C3E] dark:text-[#A8A29E]">{item.desc}</span>
              <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-100 sepia:bg-[#EFE6DA] border border-slate-200 sepia:border-[#E0D4C4] dark:border-[#3A3127] text-slate-800 sepia:text-[#241B14] dark:text-[#F7F7F5] rounded-md shadow-2xs font-semibold">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 sepia:bg-[#F6EFE6] dark:bg-[#201B16] border-t border-slate-200 sepia:border-[#E6DCD0] dark:border-[#332B23] text-right">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] transition-all shadow-xs cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
